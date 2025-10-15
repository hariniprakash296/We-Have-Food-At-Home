# Advanced Real-Time Meeting Transcriber

## Detailed Architecture Documentation

### System Overview

The transcription system is built with a modular architecture that separates concerns into distinct components:

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│                  (Streamlit / Flask / CLI)                   │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────┐
│                    Transcription Engine                      │
│    - Session Management                                      │
│    - Buffer Management                                       │
│    - Whisper Integration                                     │
└────────────┬─────────────────────────────┬──────────────────┘
             │                             │
      ┌──────┴──────┐              ┌──────┴──────────┐
      │   Audio     │              │    Speaker      │
      │   Capture   │              │  Diarization    │
      └──────┬──────┘              └──────┬──────────┘
             │                             │
      ┌──────┴──────┐              ┌──────┴──────────┐
      │  Microphone │              │   PyAnnote      │
      │   System    │              │   Resemblyzer   │
      │   Audio     │              └─────────────────┘
      └─────────────┘
             │
      ┌──────┴──────────────────────────────────┐
      │        Error Correction                  │
      │    - Grammar Checking                    │
      │    - Spell Checking                      │
      │    - Punctuation                         │
      └──────┬───────────────────────────────────┘
             │
      ┌──────┴───────────────────────────────────┐
      │        Export Handler                     │
      │    - TXT / DOCX / PDF / JSON              │
      └───────────────────────────────────────────┘
```

### Component Details

#### 1. Audio Capture (`audio_capture.py`)

**Purpose:** Handles real-time audio input from various sources.

**Key Features:**
- Multi-device support (microphone, system audio)
- Thread-safe operation
- Buffered audio streaming
- Automatic device detection

**Technical Details:**
- Uses PyAudio for low-level audio access
- Implements non-blocking I/O with threading
- Normalizes audio to float32 format
- Queue-based architecture for smooth data flow

**Performance:**
- Chunk size: 1024 samples (configurable)
- Sample rate: 16kHz (Whisper standard)
- Latency: <100ms for audio capture

#### 2. Transcription Engine (`transcription_engine.py`)

**Purpose:** Core speech-to-text conversion using OpenAI Whisper.

**Key Features:**
- Real-time processing with configurable latency
- Multiple model sizes (tiny to large)
- GPU acceleration support
- Session management

**Technical Details:**
- Buffer accumulation strategy for latency control
- Asynchronous processing pipeline
- Thread-safe queue management
- Automatic model selection based on hardware

**Whisper Models:**

| Model  | Parameters | VRAM   | Speed  | Accuracy |
|--------|-----------|--------|--------|----------|
| tiny   | 39M       | ~1GB   | Fast   | Good     |
| base   | 74M       | ~1GB   | Fast   | Better   |
| small  | 244M      | ~2GB   | Medium | Great    |
| medium | 769M      | ~5GB   | Slow   | Excellent|
| large  | 1550M     | ~10GB  | Slower | Best     |

**Performance:**
- Target latency: 2.5 seconds (configurable)
- Accuracy: 90%+ on clean audio, 80%+ on noisy audio
- Throughput: Depends on model size and hardware

#### 3. Speaker Diarization (`speaker_diarization.py`)

**Purpose:** Identify and separate different speakers.

**Key Features:**
- Multi-speaker detection (up to 10 speakers)
- Voice fingerprinting
- Speaker change detection
- Speaker statistics

**Technical Details:**
- Uses PyAnnote Audio for state-of-the-art diarization
- Embedding-based speaker identification
- Cosine similarity for speaker matching
- Optional known speaker registration

**Limitations:**
- Requires good audio quality for best results
- May struggle with overlapping speech
- Some models require Hugging Face authentication

#### 4. Error Correction (`error_correction.py`)

**Purpose:** Post-process transcripts for improved quality.

**Key Features:**
- Grammar correction
- Spell checking
- Punctuation refinement
- Filler word removal
- Capitalization correction

**Technical Details:**
- Uses spaCy for NLP processing
- Optional transformer-based grammar correction
- Pattern-based filler word detection
- Context-aware corrections

**Processing Steps:**
1. Remove filler words (um, uh, like, etc.)
2. Fix capitalization using sentence detection
3. Add/correct punctuation
4. Apply grammar corrections
5. Clean whitespace

#### 5. Export Handler (`export_handler.py`)

**Purpose:** Generate transcripts in multiple formats.

**Supported Formats:**
- **TXT**: Plain text with timestamps
- **DOCX**: Formatted Word documents
- **PDF**: Professional PDF reports
- **JSON**: Structured data for integration

**Export Structure:**
```json
{
  "session_id": "session_20241015_112030",
  "start_time": "2024-10-15T11:20:30",
  "segments": [
    {
      "text": "Transcribed text",
      "timestamp": 1697374830.5,
      "speaker_id": "Speaker_1",
      "confidence": 0.95
    }
  ],
  "statistics": {
    "total_segments": 42,
    "total_duration": 125.7
  }
}
```

### Configuration System

The configuration system uses Pydantic for type-safe settings:

```python
from config import get_settings

settings = get_settings()

# Access configuration
model_size = settings.whisper_model_size
sample_rate = settings.sample_rate
enable_diarization = settings.enable_speaker_diarization
```

Configuration can be set via:
1. Environment variables
2. `.env` file
3. Programmatic overrides

### Performance Optimization Tips

#### 1. Model Selection
- Use `tiny` or `base` for real-time transcription
- Use `small` or `medium` for better accuracy with acceptable latency
- Use `large` only for offline transcription

#### 2. GPU Acceleration
- Enable GPU with `USE_GPU=true` in `.env`
- Ensure CUDA is properly installed
- Monitor VRAM usage

#### 3. Buffer Management
- Adjust `LATENCY_TARGET` based on needs
- Lower values = faster updates, more processing
- Higher values = fewer updates, better context

#### 4. Speaker Diarization
- Disable if not needed to save resources
- Requires additional processing time
- May increase latency by 0.5-1 second

### Security Considerations

#### Local Processing
- All transcription happens locally by default
- No data sent to external servers
- Full privacy for sensitive meetings

#### Optional Cloud Features
- Can be extended to support cloud storage
- Implement encryption for stored transcripts
- Use secure transmission protocols

### Integration Examples

#### 1. Python Script Integration

```python
from src import TranscriptionEngine, AudioCapture

# Initialize
engine = TranscriptionEngine(model_size="base")
audio = AudioCapture()

# Start transcription
engine.start(session_id="my_meeting")
audio.start_capture(callback=engine.process_audio)

# Let it run...
import time
time.sleep(60)  # Record for 1 minute

# Stop and export
audio.stop_capture()
engine.stop()
engine.export_transcript("meeting.docx", format="docx")
```

#### 2. Streamlit Web App

```bash
streamlit run src/streamlit_app.py
```

Access at http://localhost:8501

#### 3. Flask REST API

```bash
python src/flask_app.py
```

Access at http://localhost:5000

API Endpoints:
- POST `/api/start` - Start transcription
- POST `/api/stop` - Stop transcription
- GET `/api/transcript` - Get current transcript
- POST `/api/clear` - Clear transcript
- GET `/api/export?format=docx` - Export transcript

### Troubleshooting Guide

#### Issue: "No module named 'pyaudio'"
**Solution:**
```bash
# macOS
brew install portaudio
pip install pyaudio

# Ubuntu/Debian
sudo apt-get install portaudio19-dev
pip install pyaudio

# Windows
pip install pipwin
pipwin install pyaudio
```

#### Issue: Slow transcription
**Solutions:**
1. Use a smaller model (tiny or base)
2. Enable GPU acceleration
3. Increase `LATENCY_TARGET` value
4. Disable speaker diarization if not needed

#### Issue: Poor accuracy
**Solutions:**
1. Use a larger model (medium or large)
2. Ensure good audio quality
3. Check microphone placement
4. Reduce background noise
5. Enable error correction

#### Issue: Speaker diarization not working
**Solutions:**
1. Set Hugging Face token: `export HF_TOKEN=your_token`
2. Check PyAnnote installation
3. Ensure audio has distinct speakers
4. Try increasing audio quality

### Advanced Usage

#### Custom Post-Processing

```python
from src import TranscriptionEngine, ErrorCorrector

engine = TranscriptionEngine()
corrector = ErrorCorrector()

# Start transcription
engine.start()

# Get segments and apply custom corrections
segments = engine.get_segments()
for segment in segments:
    corrected = corrector.correct_text(segment.text)
    # Apply custom logic
    print(corrected)
```

#### Batch Processing

```python
from src import TranscriptionEngine

engine = TranscriptionEngine(model_size="medium")

# Process multiple files
audio_files = ["meeting1.wav", "meeting2.wav", "meeting3.wav"]

for audio_file in audio_files:
    transcript = engine.transcribe_file(audio_file)
    output_file = audio_file.replace(".wav", ".txt")
    with open(output_file, 'w') as f:
        f.write(transcript)
```

#### Real-time Streaming with WebSockets

```python
# Example of extending for WebSocket support
from flask_socketio import SocketIO, emit

# In Flask app
socketio = SocketIO(app)

@socketio.on('start_transcription')
def handle_transcription():
    # Stream transcription updates via WebSocket
    while is_recording:
        segments = engine.get_segments()
        emit('transcript_update', {'segments': segments})
        time.sleep(1)
```

### Testing

Run tests with pytest:

```bash
# All tests
pytest tests/

# Specific test file
pytest tests/test_transcription.py

# With coverage
pytest --cov=src tests/

# Verbose output
pytest -v tests/
```

### Contributing

When extending the transcription module:

1. Follow the existing architecture patterns
2. Add type hints to all functions
3. Write tests for new functionality
4. Update documentation
5. Ensure code passes linting (black, mypy)

### Future Enhancements

Potential improvements for future versions:

1. **Multi-language support** - Extend beyond English
2. **Custom vocabulary** - Domain-specific terminology
3. **Real-time translation** - Translate while transcribing
4. **Emotion detection** - Detect speaker emotions
5. **Meeting summaries** - Auto-generate meeting summaries
6. **Action items** - Extract action items from transcripts
7. **Integration plugins** - Zoom, Teams, Google Meet
8. **Cloud sync** - Optional cloud backup
9. **Mobile app** - iOS/Android clients
10. **Voice commands** - Control via voice

### Resources

- [Whisper Documentation](https://github.com/openai/whisper)
- [PyAnnote Audio](https://github.com/pyannote/pyannote-audio)
- [spaCy Documentation](https://spacy.io/usage)
- [Streamlit Documentation](https://docs.streamlit.io/)
- [Flask Documentation](https://flask.palletsprojects.com/)
