"""
Speaker diarization module for identifying and separating speakers.
Uses PyAnnote Audio for state-of-the-art speaker detection.
"""

import numpy as np
from typing import List, Dict, Optional, Tuple
import logging
from dataclasses import dataclass

try:
    from pyannote.audio import Pipeline
    PYANNOTE_AVAILABLE = True
except ImportError:
    PYANNOTE_AVAILABLE = False
    logging.warning("PyAnnote Audio not available. Speaker diarization disabled.")

from config import get_settings

logger = logging.getLogger(__name__)


@dataclass
class SpeakerSegment:
    """Represents a segment spoken by a specific speaker."""
    speaker_id: str
    start_time: float
    end_time: float
    confidence: float = 1.0


class SpeakerDiarizer:
    """
    Handles speaker identification and diarization.
    
    Features:
    - Multi-speaker detection
    - Speaker change detection
    - Voice fingerprinting
    - Up to 10 speakers per session
    """
    
    def __init__(self):
        """Initialize the speaker diarizer."""
        self.settings = get_settings()
        self.pipeline: Optional[Pipeline] = None
        self.speaker_embeddings: Dict[str, np.ndarray] = {}
        
        if PYANNOTE_AVAILABLE:
            self._initialize_pipeline()
        else:
            logger.warning("Speaker diarization not available")
    
    def _initialize_pipeline(self):
        """Initialize the PyAnnote pipeline."""
        try:
            # Note: This requires a Hugging Face token for some models
            # Users should set HUGGINGFACE_TOKEN in environment
            self.pipeline = Pipeline.from_pretrained(
                "pyannote/speaker-diarization-3.1",
                use_auth_token=True  # Will look for HF_TOKEN env var
            )
            logger.info("Speaker diarization pipeline initialized")
        except Exception as e:
            logger.error(f"Failed to initialize diarization pipeline: {e}")
            logger.info("Speaker diarization will not be available")
    
    def diarize(
        self,
        audio_file: str,
        num_speakers: Optional[int] = None
    ) -> List[SpeakerSegment]:
        """
        Perform speaker diarization on an audio file.
        
        Args:
            audio_file: Path to audio file
            num_speakers: Expected number of speakers (None for automatic)
            
        Returns:
            List of speaker segments
        """
        if not PYANNOTE_AVAILABLE or not self.pipeline:
            logger.warning("Speaker diarization not available")
            return []
        
        try:
            # Run diarization
            diarization = self.pipeline(
                audio_file,
                min_speakers=self.settings.min_speakers,
                max_speakers=num_speakers or self.settings.max_speakers
            )
            
            # Convert to our format
            segments = []
            for turn, _, speaker in diarization.itertracks(yield_label=True):
                segment = SpeakerSegment(
                    speaker_id=speaker,
                    start_time=turn.start,
                    end_time=turn.end
                )
                segments.append(segment)
            
            logger.info(f"Diarized {len(segments)} speaker segments")
            return segments
            
        except Exception as e:
            logger.error(f"Diarization error: {e}")
            return []
    
    def identify_speaker(
        self,
        audio_data: np.ndarray,
        known_speakers: Optional[Dict[str, np.ndarray]] = None
    ) -> Tuple[str, float]:
        """
        Identify speaker from audio embedding.
        
        Args:
            audio_data: Audio samples
            known_speakers: Dictionary of known speaker embeddings
            
        Returns:
            Tuple of (speaker_id, confidence)
        """
        # This is a simplified implementation
        # In production, you'd extract embeddings and compare
        
        if not known_speakers:
            known_speakers = self.speaker_embeddings
        
        # Extract embedding (placeholder - would use actual model)
        embedding = self._extract_embedding(audio_data)
        
        if not known_speakers:
            # New speaker
            speaker_id = f"Speaker_{len(self.speaker_embeddings) + 1}"
            self.speaker_embeddings[speaker_id] = embedding
            return speaker_id, 1.0
        
        # Compare with known speakers
        best_match = None
        best_similarity = 0.0
        
        for speaker_id, known_embedding in known_speakers.items():
            similarity = self._compute_similarity(embedding, known_embedding)
            if similarity > best_similarity:
                best_similarity = similarity
                best_match = speaker_id
        
        # Threshold for new speaker
        if best_similarity < 0.7:
            speaker_id = f"Speaker_{len(self.speaker_embeddings) + 1}"
            self.speaker_embeddings[speaker_id] = embedding
            return speaker_id, 1.0
        
        return best_match, best_similarity
    
    def _extract_embedding(self, audio_data: np.ndarray) -> np.ndarray:
        """
        Extract speaker embedding from audio.
        
        Args:
            audio_data: Audio samples
            
        Returns:
            Speaker embedding vector
        """
        # Placeholder implementation
        # In production, use a proper embedding model (e.g., resemblyzer)
        return np.random.randn(256)  # Dummy embedding
    
    def _compute_similarity(
        self,
        embedding1: np.ndarray,
        embedding2: np.ndarray
    ) -> float:
        """
        Compute similarity between two embeddings.
        
        Args:
            embedding1: First embedding
            embedding2: Second embedding
            
        Returns:
            Similarity score (0-1)
        """
        # Cosine similarity
        dot_product = np.dot(embedding1, embedding2)
        norm1 = np.linalg.norm(embedding1)
        norm2 = np.linalg.norm(embedding2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return (dot_product / (norm1 * norm2) + 1) / 2  # Normalize to 0-1
    
    def add_known_speaker(
        self,
        speaker_name: str,
        audio_file: str
    ):
        """
        Add a known speaker from a reference audio file.
        
        Args:
            speaker_name: Name of the speaker
            audio_file: Path to reference audio file
        """
        # Load audio and extract embedding
        # This is a placeholder - would load actual audio
        embedding = np.random.randn(256)  # Dummy
        self.speaker_embeddings[speaker_name] = embedding
        logger.info(f"Added known speaker: {speaker_name}")
    
    def get_speaker_statistics(
        self,
        segments: List[SpeakerSegment]
    ) -> Dict[str, Dict[str, float]]:
        """
        Compute statistics for each speaker.
        
        Args:
            segments: List of speaker segments
            
        Returns:
            Dictionary with statistics per speaker
        """
        stats = {}
        
        for segment in segments:
            if segment.speaker_id not in stats:
                stats[segment.speaker_id] = {
                    'total_time': 0.0,
                    'num_segments': 0,
                    'avg_segment_length': 0.0
                }
            
            duration = segment.end_time - segment.start_time
            stats[segment.speaker_id]['total_time'] += duration
            stats[segment.speaker_id]['num_segments'] += 1
        
        # Calculate averages
        for speaker_id in stats:
            total_time = stats[speaker_id]['total_time']
            num_segments = stats[speaker_id]['num_segments']
            stats[speaker_id]['avg_segment_length'] = total_time / num_segments if num_segments > 0 else 0
        
        return stats
