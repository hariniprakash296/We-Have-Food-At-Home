"""
Basic smoke test to verify all modules can be imported.
This test ensures the module structure is correct and all imports work.
"""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))


def test_import_config():
    """Test importing config module."""
    from config import get_settings, TranscriptionSettings
    assert get_settings is not None
    assert TranscriptionSettings is not None


def test_import_audio_capture():
    """Test importing audio capture module."""
    from audio_capture import AudioCapture, AudioChunk
    assert AudioCapture is not None
    assert AudioChunk is not None


def test_import_transcription_engine():
    """Test importing transcription engine."""
    from transcription_engine import (
        TranscriptionEngine,
        TranscriptionSession,
        TranscriptSegment
    )
    assert TranscriptionEngine is not None
    assert TranscriptionSession is not None
    assert TranscriptSegment is not None


def test_import_speaker_diarization():
    """Test importing speaker diarization."""
    from speaker_diarization import SpeakerDiarizer, SpeakerSegment
    assert SpeakerDiarizer is not None
    assert SpeakerSegment is not None


def test_import_error_correction():
    """Test importing error correction."""
    from error_correction import ErrorCorrector
    assert ErrorCorrector is not None


def test_import_export_handler():
    """Test importing export handler."""
    from export_handler import ExportHandler
    assert ExportHandler is not None


def test_config_initialization():
    """Test basic config initialization."""
    from config import get_settings
    
    settings = get_settings()
    
    # Verify key settings exist
    assert hasattr(settings, 'whisper_model_size')
    assert hasattr(settings, 'sample_rate')
    assert hasattr(settings, 'enable_speaker_diarization')
    
    # Verify default values
    assert settings.sample_rate == 16000
    assert settings.channels == 1


if __name__ == "__main__":
    import pytest
    pytest.main([__file__, "-v"])
