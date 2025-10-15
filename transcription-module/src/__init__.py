"""
Transcription module for real-time meeting transcription.
"""

__version__ = "1.0.0"
__author__ = "We Have Food At Home Team"

from .transcription_engine import TranscriptionEngine, TranscriptionSession, TranscriptSegment
from .audio_capture import AudioCapture, AudioChunk
from .speaker_diarization import SpeakerDiarizer, SpeakerSegment
from .error_correction import ErrorCorrector
from .export_handler import ExportHandler
from .config import get_settings, TranscriptionSettings

__all__ = [
    'TranscriptionEngine',
    'TranscriptionSession',
    'TranscriptSegment',
    'AudioCapture',
    'AudioChunk',
    'SpeakerDiarizer',
    'SpeakerSegment',
    'ErrorCorrector',
    'ExportHandler',
    'get_settings',
    'TranscriptionSettings',
]
