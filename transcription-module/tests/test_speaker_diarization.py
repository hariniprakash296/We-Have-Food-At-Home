"""
Tests for speaker diarization.
"""

import pytest
import numpy as np

from src.speaker_diarization import SpeakerDiarizer, SpeakerSegment


class TestSpeakerSegment:
    """Test SpeakerSegment dataclass."""
    
    def test_create_segment(self):
        """Test creating a speaker segment."""
        segment = SpeakerSegment(
            speaker_id="Speaker_1",
            start_time=0.0,
            end_time=5.0,
            confidence=0.95
        )
        
        assert segment.speaker_id == "Speaker_1"
        assert segment.start_time == 0.0
        assert segment.end_time == 5.0
        assert segment.confidence == 0.95


class TestSpeakerDiarizer:
    """Test SpeakerDiarizer class."""
    
    @pytest.fixture
    def diarizer(self):
        """Create a speaker diarizer for testing."""
        return SpeakerDiarizer()
    
    def test_initialization(self, diarizer):
        """Test diarizer initialization."""
        assert diarizer is not None
        assert isinstance(diarizer.speaker_embeddings, dict)
    
    def test_identify_speaker(self, diarizer):
        """Test speaker identification."""
        # Create dummy audio data
        audio_data = np.random.randn(16000).astype(np.float32)
        
        # Should return a speaker ID and confidence
        speaker_id, confidence = diarizer.identify_speaker(audio_data)
        
        assert isinstance(speaker_id, str)
        assert 0.0 <= confidence <= 1.0
    
    def test_compute_similarity(self, diarizer):
        """Test similarity computation."""
        embedding1 = np.random.randn(256)
        embedding2 = np.random.randn(256)
        
        similarity = diarizer._compute_similarity(embedding1, embedding2)
        
        assert 0.0 <= similarity <= 1.0
    
    def test_get_speaker_statistics(self, diarizer):
        """Test getting speaker statistics."""
        segments = [
            SpeakerSegment("Speaker_1", 0.0, 5.0),
            SpeakerSegment("Speaker_1", 5.0, 10.0),
            SpeakerSegment("Speaker_2", 10.0, 15.0),
        ]
        
        stats = diarizer.get_speaker_statistics(segments)
        
        assert "Speaker_1" in stats
        assert "Speaker_2" in stats
        assert stats["Speaker_1"]["num_segments"] == 2
        assert stats["Speaker_2"]["num_segments"] == 1


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
