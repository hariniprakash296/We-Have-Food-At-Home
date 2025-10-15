# Advanced Real-Time Meeting Transcriber

A real-time transcription system that captures spoken content during in-person and online meetings with **2-3 seconds latency**, featuring high accuracy, speaker identification, and error correction.

## Features

- ✅ **Real-time transcription** with <3s latency
- 👥 **Multi-speaker support** with speaker diarization
- 🎤 **Noise-robust recognition** for varying audio qualities
- ✏️ **Error correction module** with contextual spell-check
- 🔊 **Speaker identification** via voice fingerprinting
- 📺 **Live display interface** for transcription streaming
- 📄 **Export formats**: TXT, DOCX, PDF, JSON

## Technology Stack

- **Language**: Python 3.9+
- **Speech Recognition**: OpenAI Whisper
- **Speaker Diarization**: PyAnnote Audio
- **Audio Input**: PyAudio / SoundDevice
- **UI Framework**: Streamlit (primary) / Flask (alternative)
- **NLP Processing**: spaCy, Transformers

## Installation

### Prerequisites

1. Python 3.9 or higher
2. FFmpeg (required by Whisper)
3. PortAudio (required by PyAudio)

#### Install FFmpeg

**macOS:**
```bash
brew install ffmpeg portaudio
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install ffmpeg portaudio19-dev
```

**Windows:**
Download from [FFmpeg website](https://ffmpeg.org/download.html)

### Setup

1. Navigate to the transcription module:
```bash
cd transcription-module
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Download spaCy language model:
```bash
python -m spacy download en_core_web_sm
```

5. Create a `.env` file (optional, for configuration):
```bash
cp .env.example .env
```

## Quick Start

### Using Streamlit UI (Recommended)

```bash
streamlit run src/streamlit_app.py
```

This will open a web browser with the live transcription interface.

### Using Python API

```python
from src.transcription_engine import TranscriptionEngine
from src.audio_capture import AudioCapture

# Initialize components
engine = TranscriptionEngine(model_size="base")
audio = AudioCapture(device_index=0)

# Start transcription
engine.start()
audio.start_capture(callback=engine.process_audio)

# Stop when done
audio.stop_capture()
engine.stop()

# Export results
engine.export_transcript("meeting_notes.docx", format="docx")
```

## Configuration

Edit `.env` file to customize settings:

```bash
# Whisper Model Size: tiny, base, small, medium, large
WHISPER_MODEL_SIZE=base

# Audio Settings
SAMPLE_RATE=16000
CHUNK_SIZE=1024

# Transcription Settings
LATENCY_TARGET=2.5
ENABLE_SPEAKER_DIARIZATION=true
ENABLE_ERROR_CORRECTION=true

# Export Settings
DEFAULT_EXPORT_FORMAT=docx
EXPORT_DIRECTORY=./exports
```

## Performance Requirements

- **Transcription latency**: ≤3 seconds
- **Accuracy**: ≥90% on clean audio, ≥80% on noisy audio
- **Scalability**: Handles up to 10 speakers per session
- **Language support**: English (initial), expandable to others

## Architecture

```
transcription-module/
├── src/
│   ├── transcription_engine.py    # Core transcription logic
│   ├── audio_capture.py           # Audio input handling
│   ├── speaker_diarization.py     # Speaker identification
│   ├── error_correction.py        # Post-processing & NLP
│   ├── export_handler.py          # Export to various formats
│   ├── streamlit_app.py          # Streamlit UI
│   ├── flask_app.py              # Flask alternative
│   └── config.py                 # Configuration management
├── tests/
│   ├── test_transcription.py
│   ├── test_audio_capture.py
│   └── test_speaker_diarization.py
├── exports/                       # Generated transcripts
├── docs/                         # Additional documentation
└── requirements.txt              # Python dependencies
```

## Usage Examples

### Example 1: Basic Transcription

```python
from src.transcription_engine import TranscriptionEngine

engine = TranscriptionEngine()
transcript = engine.transcribe_file("meeting_recording.wav")
print(transcript)
```

### Example 2: Real-time with Speaker Diarization

```python
from src.transcription_engine import TranscriptionEngine
from src.speaker_diarization import SpeakerDiarizer

engine = TranscriptionEngine(enable_diarization=True)
engine.start()

# Transcription happens automatically
# View results in real-time through the UI
```

### Example 3: Export to Multiple Formats

```python
engine.export_transcript("meeting.txt", format="txt")
engine.export_transcript("meeting.docx", format="docx")
engine.export_transcript("meeting.pdf", format="pdf")
engine.export_transcript("meeting.json", format="json")
```

## Security & Privacy

- **Local processing**: All transcription happens locally by default
- **No cloud dependencies**: Your audio never leaves your machine
- **Encrypted storage**: Transcripts can be encrypted at rest (optional)
- **Secure transmission**: SSL/TLS for any network-based features

## Troubleshooting

### Common Issues

**Issue: "No module named 'pyaudio'"**
Solution: Install PortAudio first, then reinstall PyAudio

**Issue: Slow transcription**
Solution: Use a smaller Whisper model (tiny or base) or enable GPU acceleration

**Issue: Poor speaker diarization**
Solution: Ensure speakers are speaking clearly and audio quality is good

## Development

### Running Tests

```bash
pytest tests/
```

### Code Formatting

```bash
black src/ tests/
```

### Type Checking

```bash
mypy src/
```

## Contributing

This module is part of the We-Have-Food-At-Home repository. Please follow the main repository's contribution guidelines.

## License

Same as the parent repository.

## Support

For issues and questions, please create an issue in the main repository.
