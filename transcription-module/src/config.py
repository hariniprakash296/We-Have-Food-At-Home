"""
Configuration management for the transcription system.
Uses pydantic for type-safe configuration with environment variable support.
"""

from typing import Literal
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class TranscriptionSettings(BaseSettings):
    """Main configuration for the transcription system."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    # Whisper Model Configuration
    whisper_model_size: Literal["tiny", "base", "small", "medium", "large"] = Field(
        default="base",
        description="Whisper model size - larger models are more accurate but slower"
    )
    
    # Audio Configuration
    sample_rate: int = Field(
        default=16000,
        description="Audio sample rate in Hz (Whisper expects 16kHz)"
    )
    
    chunk_size: int = Field(
        default=1024,
        description="Audio chunk size for processing"
    )
    
    channels: int = Field(
        default=1,
        description="Number of audio channels (1=mono, 2=stereo)"
    )
    
    # Performance Configuration
    latency_target: float = Field(
        default=2.5,
        description="Target latency in seconds"
    )
    
    use_gpu: bool = Field(
        default=True,
        description="Use GPU acceleration if available"
    )
    
    # Feature Flags
    enable_speaker_diarization: bool = Field(
        default=True,
        description="Enable speaker identification and diarization"
    )
    
    enable_error_correction: bool = Field(
        default=True,
        description="Enable NLP-based error correction and grammar refinement"
    )
    
    enable_vad: bool = Field(
        default=True,
        description="Enable Voice Activity Detection to reduce processing"
    )
    
    # Speaker Diarization Configuration
    max_speakers: int = Field(
        default=10,
        description="Maximum number of speakers to detect"
    )
    
    min_speakers: int = Field(
        default=1,
        description="Minimum number of speakers to detect"
    )
    
    # Export Configuration
    default_export_format: Literal["txt", "docx", "pdf", "json"] = Field(
        default="docx",
        description="Default export format"
    )
    
    export_directory: str = Field(
        default="./exports",
        description="Directory for exported transcripts"
    )
    
    # Language Configuration
    language: str = Field(
        default="en",
        description="Primary language for transcription (ISO 639-1 code)"
    )
    
    # Security Configuration
    encrypt_exports: bool = Field(
        default=False,
        description="Encrypt exported files"
    )
    
    local_processing_only: bool = Field(
        default=True,
        description="Process everything locally without cloud services"
    )


# Global settings instance
settings = TranscriptionSettings()


def get_settings() -> TranscriptionSettings:
    """Get the global settings instance."""
    return settings


def reload_settings() -> TranscriptionSettings:
    """Reload settings from environment variables."""
    global settings
    settings = TranscriptionSettings()
    return settings
