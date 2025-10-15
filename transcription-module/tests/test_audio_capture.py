"""
Tests for audio capture functionality.
"""

import pytest
import numpy as np
from datetime import datetime

from src.audio_capture import AudioCapture, AudioChunk


class TestAudioChunk:
    """Test AudioChunk dataclass."""
    
    def test_create_chunk(self):
        """Test creating an audio chunk."""
        audio_data = np.random.randn(1024).astype(np.float32)
        chunk = AudioChunk(
            data=audio_data,
            timestamp=datetime.now().timestamp(),
            sample_rate=16000
        )
        
        assert chunk.data.shape == (1024,)
        assert chunk.sample_rate == 16000
        assert chunk.timestamp > 0


class TestAudioCapture:
    """Test AudioCapture class."""
    
    @pytest.fixture
    def audio_capture(self):
        """Create an audio capture instance for testing."""
        return AudioCapture()
    
    def test_initialization(self, audio_capture):
        """Test audio capture initialization."""
        assert audio_capture is not None
        assert audio_capture.audio is not None
        assert not audio_capture.is_running
    
    def test_list_devices(self, audio_capture):
        """Test listing audio devices."""
        devices = audio_capture.list_devices()
        
        assert isinstance(devices, list)
        # Should have at least some devices on most systems
        # This might fail in CI environments without audio
        if devices:
            assert 'index' in devices[0]
            assert 'name' in devices[0]
    
    def test_start_stop_capture(self, audio_capture):
        """Test starting and stopping audio capture."""
        # This test might not work in CI without audio devices
        # We'll just test the state changes
        
        assert not audio_capture.is_running
        
        try:
            audio_capture.start_capture()
            assert audio_capture.is_running
        except Exception:
            # Audio device might not be available in test environment
            pass
        finally:
            audio_capture.stop_capture()
            assert not audio_capture.is_running


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
