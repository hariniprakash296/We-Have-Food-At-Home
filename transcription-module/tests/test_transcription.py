"""
Tests for the transcription engine.
"""

import pytest
import numpy as np
from datetime import datetime

from src.transcription_engine import (
    TranscriptionEngine,
    TranscriptionSession,
    TranscriptSegment
)
from src.audio_capture import AudioChunk


class TestTranscriptSegment:
    """Test TranscriptSegment dataclass."""
    
    def test_create_segment(self):
        """Test creating a transcript segment."""
        segment = TranscriptSegment(
            text="Hello world",
            timestamp=datetime.now().timestamp(),
            speaker_id="Speaker_1",
            confidence=0.95
        )
        
        assert segment.text == "Hello world"
        assert segment.speaker_id == "Speaker_1"
        assert segment.confidence == 0.95


class TestTranscriptionSession:
    """Test TranscriptionSession."""
    
    def test_create_session(self):
        """Test creating a transcription session."""
        session = TranscriptionSession(
            session_id="test_session",
            start_time=datetime.now()
        )
        
        assert session.session_id == "test_session"
        assert len(session.segments) == 0
    
    def test_add_segment(self):
        """Test adding segments to a session."""
        session = TranscriptionSession(
            session_id="test_session",
            start_time=datetime.now()
        )
        
        segment = TranscriptSegment(
            text="Test text",
            timestamp=datetime.now().timestamp()
        )
        
        session.add_segment(segment)
        
        assert len(session.segments) == 1
        assert session.segments[0].text == "Test text"
    
    def test_get_full_transcript(self):
        """Test getting full transcript."""
        session = TranscriptionSession(
            session_id="test_session",
            start_time=datetime.now()
        )
        
        session.add_segment(TranscriptSegment("First line", datetime.now().timestamp()))
        session.add_segment(TranscriptSegment("Second line", datetime.now().timestamp()))
        
        transcript = session.get_full_transcript()
        
        assert "First line" in transcript
        assert "Second line" in transcript


class TestTranscriptionEngine:
    """Test TranscriptionEngine."""
    
    @pytest.fixture
    def engine(self):
        """Create a transcription engine for testing."""
        return TranscriptionEngine(model_size="tiny")
    
    def test_engine_initialization(self, engine):
        """Test engine initialization."""
        assert engine is not None
        assert engine.model is not None
        assert not engine.is_running
    
    def test_start_session(self, engine):
        """Test starting a transcription session."""
        engine.start(session_id="test_session")
        
        assert engine.is_running
        assert engine.current_session is not None
        assert engine.current_session.session_id == "test_session"
        
        engine.stop()
    
    def test_stop_session(self, engine):
        """Test stopping a transcription session."""
        engine.start()
        assert engine.is_running
        
        engine.stop()
        assert not engine.is_running
    
    def test_process_audio(self, engine):
        """Test processing audio chunks."""
        engine.start()
        
        # Create dummy audio chunk
        audio_data = np.random.randn(16000).astype(np.float32)
        chunk = AudioChunk(
            data=audio_data,
            timestamp=datetime.now().timestamp(),
            sample_rate=16000
        )
        
        # Should not raise exception
        engine.process_audio(chunk)
        
        engine.stop()
    
    def test_get_segments(self, engine):
        """Test getting transcript segments."""
        engine.start()
        
        segments = engine.get_segments()
        assert isinstance(segments, list)
        
        engine.stop()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
