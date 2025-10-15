# Real-Time Meeting Transcriber Module

## Overview

This directory contains a complete, self-contained **Real-Time Meeting Transcriber** system. This is a separate feature module added to the We-Have-Food-At-Home repository.

## About This Module

While the main repository is a Next.js-based recipe finder application, this module adds advanced meeting transcription capabilities as a standalone Python application. The module is intentionally kept separate and self-contained to allow independent usage and deployment.

## Why This Module?

This transcription system was implemented to provide:
- Real-time speech-to-text conversion for meetings
- Speaker identification and diarization
- High-quality transcripts with error correction
- Multiple export formats (TXT, DOCX, PDF, JSON)
- Local processing for privacy

## Module Location

```
We-Have-Food-At-Home/
├── app/                          # Next.js application
├── components/                   # React components
├── transcription-module/         # ← This module (self-contained)
│   ├── src/                      # Python source code
│   ├── tests/                    # Unit tests
│   ├── docs/                     # Documentation
│   └── README.md                 # Module documentation
└── README.md                     # Main repository README
```

## Quick Start

Navigate to the module directory and follow the setup:

```bash
cd transcription-module

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download language model
python -m spacy download en_core_web_sm

# Start Streamlit UI
streamlit run src/streamlit_app.py
```

## Documentation

- **[README.md](README.md)** - User documentation and quick start
- **[docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md)** - Detailed setup instructions
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Technical architecture and API reference

## Usage

### 1. Web Interface (Streamlit)

```bash
streamlit run src/streamlit_app.py
```

Opens at http://localhost:8501 with a user-friendly UI for real-time transcription.

### 2. Web Interface (Flask)

```bash
python src/flask_app.py
```

Opens at http://localhost:5000 with REST API endpoints.

### 3. Command Line Interface

```bash
# List audio devices
python run.py devices

# Real-time transcription
python run.py realtime --duration 60 --model base

# Transcribe audio file
python run.py transcribe meeting.wav transcript.docx
```

### 4. Python API

```python
from src import TranscriptionEngine, AudioCapture

engine = TranscriptionEngine(model_size="base")
audio = AudioCapture()

engine.start()
audio.start_capture(callback=engine.process_audio)

# Record for desired duration...

audio.stop_capture()
engine.stop()
engine.export_transcript("meeting.docx", format="docx")
```

## Features

✅ Real-time transcription with <3s latency  
✅ Multiple Whisper model sizes (tiny to large)  
✅ Speaker diarization (identify different speakers)  
✅ Error correction (grammar, spelling, punctuation)  
✅ Export to TXT, DOCX, PDF, JSON  
✅ GPU acceleration support  
✅ Privacy-focused (local processing)  
✅ Comprehensive test suite  

## System Requirements

- **Python**: 3.9 or higher
- **OS**: Windows 10+, macOS 10.15+, Ubuntu 20.04+
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB for models and dependencies
- **Audio**: Microphone or audio input device
- **GPU** (optional): NVIDIA GPU with CUDA for faster processing

## Key Dependencies

- OpenAI Whisper - Speech recognition
- PyTorch - Deep learning framework
- PyAnnote Audio - Speaker diarization
- PyAudio - Audio input/output
- Streamlit - Web UI framework
- spaCy - Natural language processing

## Integration with Main Application

This module is **standalone** and does not directly integrate with the main Next.js recipe application. However, future enhancements could include:

1. **Recipe dictation**: Use transcription for voice-based recipe input
2. **Cooking instructions**: Transcribe cooking videos or classes
3. **Meeting notes**: Document recipe planning meetings
4. **API integration**: Expose transcription as a microservice

## Development

### Running Tests

```bash
cd transcription-module
pytest tests/
```

### Code Quality

```bash
# Format code
black src/ tests/

# Type checking
mypy src/
```

## Support

For issues specific to this module:
1. Check [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md) for troubleshooting
2. Review [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for technical details
3. Create an issue in the main repository with the `transcription` label

## License

Same as the parent repository.

## Acknowledgments

Built with:
- OpenAI Whisper
- PyAnnote Audio
- Streamlit
- spaCy
- PyTorch

---

**Note**: This module is a separate feature addition and can be used independently of the main recipe finder application.
