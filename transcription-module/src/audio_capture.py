"""
Audio capture module for real-time audio input.
Supports both microphone input and system audio capture.
"""

import pyaudio
import numpy as np
from typing import Callable, Optional
import threading
import queue
from dataclasses import dataclass
import logging

from config import get_settings

logger = logging.getLogger(__name__)


@dataclass
class AudioChunk:
    """Represents a chunk of audio data."""
    data: np.ndarray
    timestamp: float
    sample_rate: int


class AudioCapture:
    """
    Handles real-time audio capture from microphone or system audio.
    
    Features:
    - Real-time audio streaming
    - Thread-safe operation
    - Automatic device selection
    - Buffer management
    """
    
    def __init__(self, device_index: Optional[int] = None):
        """
        Initialize audio capture.
        
        Args:
            device_index: Audio device index (None for default)
        """
        self.settings = get_settings()
        self.device_index = device_index
        self.audio = pyaudio.PyAudio()
        self.stream: Optional[pyaudio.Stream] = None
        self.is_running = False
        self.audio_queue = queue.Queue(maxsize=100)
        self.callback: Optional[Callable] = None
        
        logger.info(f"AudioCapture initialized with device {device_index}")
    
    def list_devices(self) -> list[dict]:
        """
        List available audio input devices.
        
        Returns:
            List of device information dictionaries
        """
        devices = []
        for i in range(self.audio.get_device_count()):
            info = self.audio.get_device_info_by_index(i)
            if info['maxInputChannels'] > 0:  # Input device
                devices.append({
                    'index': i,
                    'name': info['name'],
                    'channels': info['maxInputChannels'],
                    'sample_rate': int(info['defaultSampleRate'])
                })
        return devices
    
    def _audio_callback(self, in_data, frame_count, time_info, status):
        """Internal callback for audio stream."""
        if status:
            logger.warning(f"Audio callback status: {status}")
        
        # Convert bytes to numpy array
        audio_data = np.frombuffer(in_data, dtype=np.int16)
        
        # Normalize to float32 [-1, 1]
        audio_data = audio_data.astype(np.float32) / 32768.0
        
        # Create audio chunk
        chunk = AudioChunk(
            data=audio_data,
            timestamp=time_info['input_buffer_adc_time'],
            sample_rate=self.settings.sample_rate
        )
        
        # Add to queue (non-blocking)
        try:
            self.audio_queue.put_nowait(chunk)
        except queue.Full:
            logger.warning("Audio queue full, dropping frame")
        
        return (in_data, pyaudio.paContinue)
    
    def start_capture(self, callback: Optional[Callable] = None):
        """
        Start capturing audio.
        
        Args:
            callback: Optional callback function to process audio chunks
        """
        if self.is_running:
            logger.warning("Audio capture already running")
            return
        
        self.callback = callback
        
        # Open audio stream
        self.stream = self.audio.open(
            format=pyaudio.paInt16,
            channels=self.settings.channels,
            rate=self.settings.sample_rate,
            input=True,
            input_device_index=self.device_index,
            frames_per_buffer=self.settings.chunk_size,
            stream_callback=self._audio_callback
        )
        
        self.is_running = True
        self.stream.start_stream()
        
        # Start processing thread if callback provided
        if self.callback:
            self.processing_thread = threading.Thread(
                target=self._process_queue,
                daemon=True
            )
            self.processing_thread.start()
        
        logger.info("Audio capture started")
    
    def _process_queue(self):
        """Process audio chunks from the queue."""
        while self.is_running:
            try:
                chunk = self.audio_queue.get(timeout=1.0)
                if self.callback:
                    self.callback(chunk)
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"Error processing audio chunk: {e}")
    
    def stop_capture(self):
        """Stop capturing audio."""
        if not self.is_running:
            return
        
        self.is_running = False
        
        if self.stream:
            self.stream.stop_stream()
            self.stream.close()
            self.stream = None
        
        logger.info("Audio capture stopped")
    
    def get_chunk(self, timeout: float = 1.0) -> Optional[AudioChunk]:
        """
        Get an audio chunk from the queue.
        
        Args:
            timeout: Maximum time to wait for a chunk
            
        Returns:
            AudioChunk or None if timeout
        """
        try:
            return self.audio_queue.get(timeout=timeout)
        except queue.Empty:
            return None
    
    def __del__(self):
        """Cleanup resources."""
        self.stop_capture()
        if self.audio:
            self.audio.terminate()


class SystemAudioCapture(AudioCapture):
    """
    Extended audio capture for system audio (meetings, calls, etc.).
    
    Note: Requires additional system-specific configuration.
    On macOS, use BlackHole or similar virtual audio device.
    On Windows, use Stereo Mix or VB-Audio Cable.
    On Linux, use PulseAudio monitor.
    """
    
    def __init__(self):
        """Initialize system audio capture."""
        # Find system audio device
        device_index = self._find_system_audio_device()
        super().__init__(device_index=device_index)
    
    def _find_system_audio_device(self) -> Optional[int]:
        """
        Attempt to find system audio device automatically.
        
        Returns:
            Device index or None
        """
        devices = self.list_devices()
        
        # Search for common system audio device names
        system_audio_keywords = [
            'stereo mix', 'wave out', 'loopback', 
            'monitor', 'blackhole', 'vb-audio'
        ]
        
        for device in devices:
            name_lower = device['name'].lower()
            if any(keyword in name_lower for keyword in system_audio_keywords):
                logger.info(f"Found system audio device: {device['name']}")
                return device['index']
        
        logger.warning("System audio device not found, using default")
        return None
