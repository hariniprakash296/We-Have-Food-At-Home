"""
Core transcription engine using OpenAI Whisper.
Handles real-time speech-to-text conversion with <3s latency.
"""

import whisper
import torch
import numpy as np
from typing import Optional, List, Dict, Any
from dataclasses import dataclass, field
from datetime import datetime
import threading
import queue
import logging

from config import get_settings
from audio_capture import AudioChunk

logger = logging.getLogger(__name__)


@dataclass
class TranscriptSegment:
    """Represents a segment of transcribed text."""
    text: str
    timestamp: float
    speaker_id: Optional[str] = None
    confidence: float = 1.0
    start_time: Optional[float] = None
    end_time: Optional[float] = None


@dataclass
class TranscriptionSession:
    """Represents a complete transcription session."""
    session_id: str
    start_time: datetime
    segments: List[TranscriptSegment] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def add_segment(self, segment: TranscriptSegment):
        """Add a transcript segment to the session."""
        self.segments.append(segment)
    
    def get_full_transcript(self) -> str:
        """Get the complete transcript as a single string."""
        return "\n".join(seg.text for seg in self.segments)


class TranscriptionEngine:
    """
    Core transcription engine using OpenAI Whisper.
    
    Features:
    - Real-time transcription with <3s latency
    - Multiple model size support
    - GPU acceleration
    - Buffer management for continuous transcription
    """
    
    def __init__(
        self,
        model_size: Optional[str] = None,
        enable_diarization: bool = False
    ):
        """
        Initialize the transcription engine.
        
        Args:
            model_size: Whisper model size (tiny, base, small, medium, large)
            enable_diarization: Enable speaker diarization
        """
        self.settings = get_settings()
        self.model_size = model_size or self.settings.whisper_model_size
        self.enable_diarization = enable_diarization
        
        # Initialize Whisper model
        logger.info(f"Loading Whisper model: {self.model_size}")
        self.device = "cuda" if torch.cuda.is_available() and self.settings.use_gpu else "cpu"
        logger.info(f"Using device: {self.device}")
        
        self.model = whisper.load_model(self.model_size, device=self.device)
        
        # Transcription state
        self.is_running = False
        self.audio_buffer = []
        self.buffer_lock = threading.Lock()
        self.processing_queue = queue.Queue()
        
        # Current session
        self.current_session: Optional[TranscriptionSession] = None
        
        logger.info("TranscriptionEngine initialized")
    
    def start(self, session_id: Optional[str] = None):
        """
        Start a new transcription session.
        
        Args:
            session_id: Optional session identifier
        """
        if self.is_running:
            logger.warning("Transcription already running")
            return
        
        session_id = session_id or f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.current_session = TranscriptionSession(
            session_id=session_id,
            start_time=datetime.now()
        )
        
        self.is_running = True
        
        # Start processing thread
        self.processing_thread = threading.Thread(
            target=self._processing_loop,
            daemon=True
        )
        self.processing_thread.start()
        
        logger.info(f"Transcription session started: {session_id}")
    
    def stop(self):
        """Stop the current transcription session."""
        if not self.is_running:
            return
        
        self.is_running = False
        
        # Process remaining audio
        self._process_buffer()
        
        logger.info("Transcription session stopped")
    
    def process_audio(self, audio_chunk: AudioChunk):
        """
        Process an audio chunk.
        
        Args:
            audio_chunk: Audio data to process
        """
        if not self.is_running:
            logger.warning("Transcription not running")
            return
        
        # Add to buffer
        with self.buffer_lock:
            self.audio_buffer.append(audio_chunk.data)
            
            # Calculate buffer duration
            total_samples = sum(len(chunk) for chunk in self.audio_buffer)
            duration = total_samples / self.settings.sample_rate
            
            # Process if buffer exceeds latency target
            if duration >= self.settings.latency_target:
                self._process_buffer()
    
    def _process_buffer(self):
        """Process the accumulated audio buffer."""
        with self.buffer_lock:
            if not self.audio_buffer:
                return
            
            # Concatenate buffer
            audio_data = np.concatenate(self.audio_buffer)
            self.audio_buffer = []
        
        # Add to processing queue
        try:
            self.processing_queue.put_nowait(audio_data)
        except queue.Full:
            logger.warning("Processing queue full, dropping audio")
    
    def _processing_loop(self):
        """Main processing loop for transcription."""
        while self.is_running:
            try:
                # Get audio from queue
                audio_data = self.processing_queue.get(timeout=1.0)
                
                # Transcribe
                result = self._transcribe_audio(audio_data)
                
                if result:
                    # Create segment
                    segment = TranscriptSegment(
                        text=result['text'].strip(),
                        timestamp=datetime.now().timestamp(),
                        confidence=result.get('confidence', 1.0)
                    )
                    
                    # Add to session
                    if self.current_session:
                        self.current_session.add_segment(segment)
                    
                    logger.info(f"Transcribed: {segment.text}")
                
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"Error in processing loop: {e}")
    
    def _transcribe_audio(self, audio_data: np.ndarray) -> Optional[Dict[str, Any]]:
        """
        Transcribe audio data using Whisper.
        
        Args:
            audio_data: Audio samples as numpy array
            
        Returns:
            Transcription result dictionary
        """
        try:
            # Whisper expects float32 audio
            if audio_data.dtype != np.float32:
                audio_data = audio_data.astype(np.float32)
            
            # Transcribe
            result = self.model.transcribe(
                audio_data,
                language=self.settings.language,
                task="transcribe",
                fp16=self.device == "cuda"
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Transcription error: {e}")
            return None
    
    def transcribe_file(self, audio_file: str) -> str:
        """
        Transcribe an audio file.
        
        Args:
            audio_file: Path to audio file
            
        Returns:
            Transcribed text
        """
        logger.info(f"Transcribing file: {audio_file}")
        
        result = self.model.transcribe(
            audio_file,
            language=self.settings.language,
            task="transcribe",
            fp16=self.device == "cuda"
        )
        
        return result['text']
    
    def get_current_transcript(self) -> str:
        """Get the current session transcript."""
        if not self.current_session:
            return ""
        return self.current_session.get_full_transcript()
    
    def get_segments(self) -> List[TranscriptSegment]:
        """Get all transcript segments from current session."""
        if not self.current_session:
            return []
        return self.current_session.segments
    
    def export_transcript(self, filename: str, format: str = "txt"):
        """
        Export transcript to file.
        
        Args:
            filename: Output filename
            format: Export format (txt, docx, pdf, json)
        """
        from export_handler import ExportHandler
        
        if not self.current_session:
            logger.warning("No active session to export")
            return
        
        exporter = ExportHandler()
        exporter.export(self.current_session, filename, format)
        
        logger.info(f"Transcript exported to {filename}")
