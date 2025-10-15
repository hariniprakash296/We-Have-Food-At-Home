# Setup Guide - Real-Time Meeting Transcriber

Complete step-by-step setup guide for the transcription system.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Quick Start](#quick-start)
5. [Usage Examples](#usage-examples)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **OS**: Windows 10+, macOS 10.15+, Ubuntu 20.04+
- **Python**: 3.9 or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB for models and dependencies
- **Audio**: Microphone or audio input device

### Required Software

1. **Python 3.9+**
   ```bash
   python --version  # Should be 3.9 or higher
   ```

2. **FFmpeg** (Required by Whisper)
   
   **macOS:**
   ```bash
   brew install ffmpeg
   ```
   
   **Ubuntu/Debian:**
   ```bash
   sudo apt-get update
   sudo apt-get install ffmpeg
   ```
   
   **Windows:**
   - Download from https://ffmpeg.org/download.html
   - Add to PATH environment variable

3. **PortAudio** (Required by PyAudio)
   
   **macOS:**
   ```bash
   brew install portaudio
   ```
   
   **Ubuntu/Debian:**
   ```bash
   sudo apt-get install portaudio19-dev python3-dev
   ```
   
   **Windows:**
   - Handled automatically by pip

## Installation

### Step 1: Clone the Repository

```bash
cd transcription-module
```

### Step 2: Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate it
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### Step 3: Install Python Dependencies

```bash
# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt
```

This may take several minutes as it downloads and installs:
- OpenAI Whisper and PyTorch
- Audio processing libraries
- NLP models
- UI frameworks

### Step 4: Download Language Model

```bash
# Download spaCy English model
python -m spacy download en_core_web_sm
```

### Step 5: Test Installation

```bash
# Test imports
python -c "import whisper; import pyaudio; print('✅ Installation successful!')"
```

## Configuration

### Environment Variables

Create a `.env` file in the transcription-module directory:

```bash
cp .env.example .env
```

Edit `.env` to customize settings:

```bash
# Model Configuration
WHISPER_MODEL_SIZE=base      # tiny, base, small, medium, large

# Audio Settings
SAMPLE_RATE=16000
CHUNK_SIZE=1024
CHANNELS=1

# Performance
LATENCY_TARGET=2.5
USE_GPU=true                 # Set to false if no GPU

# Features
ENABLE_SPEAKER_DIARIZATION=true
ENABLE_ERROR_CORRECTION=true
ENABLE_VAD=true

# Export
DEFAULT_EXPORT_FORMAT=docx
EXPORT_DIRECTORY=./exports

# Language
LANGUAGE=en
```

### GPU Configuration (Optional)

For faster transcription with NVIDIA GPU:

1. Install CUDA toolkit
2. Install PyTorch with CUDA:
   ```bash
   pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
   ```

3. Verify GPU:
   ```bash
   python -c "import torch; print(torch.cuda.is_available())"
   ```

## Quick Start

### Option 1: Streamlit UI (Recommended)

```bash
streamlit run src/streamlit_app.py
```

Opens in browser at http://localhost:8501

### Option 2: Flask Web App

```bash
python src/flask_app.py
```

Opens at http://localhost:5000

### Option 3: CLI

```bash
# List available audio devices
python run.py devices

# Start real-time transcription
python run.py realtime --duration 60 --model base

# Transcribe an audio file
python run.py transcribe meeting.wav transcript.docx --model base

# Start UI
python run.py ui
```

### Option 4: Python Script

```python
from src import TranscriptionEngine, AudioCapture

# Initialize
engine = TranscriptionEngine(model_size="base")
audio = AudioCapture()

# Start
engine.start()
audio.start_capture(callback=engine.process_audio)

# Stop after recording
audio.stop_capture()
engine.stop()

# Export
engine.export_transcript("meeting.docx", format="docx")
```

## Usage Examples

### Example 1: Quick Meeting Transcription

```bash
# Start Streamlit UI
streamlit run src/streamlit_app.py

# In the UI:
# 1. Click "Start Transcription"
# 2. Speak or play audio
# 3. Watch real-time transcription
# 4. Click "Stop Transcription"
# 5. Click "Export" and choose format
```

### Example 2: Transcribe Recorded Meeting

```bash
python run.py transcribe meeting_recording.wav meeting_notes.docx --model medium
```

### Example 3: Custom Python Integration

```python
from src import TranscriptionEngine, ErrorCorrector

# Initialize components
engine = TranscriptionEngine(model_size="base")
corrector = ErrorCorrector()

# Transcribe file
raw_transcript = engine.transcribe_file("meeting.wav")

# Apply corrections
clean_transcript = corrector.correct_text(raw_transcript)

# Save
with open("transcript.txt", "w") as f:
    f.write(clean_transcript)

print("Transcription complete!")
```

### Example 4: Real-time with Speaker Diarization

```python
from src import TranscriptionEngine, AudioCapture, SpeakerDiarizer

# Initialize with diarization
engine = TranscriptionEngine(model_size="base", enable_diarization=True)
audio = AudioCapture()
diarizer = SpeakerDiarizer()

# Start transcription
engine.start()
audio.start_capture(callback=engine.process_audio)

# Let it run...
import time
time.sleep(60)

# Stop
audio.stop_capture()
engine.stop()

# Get segments with speakers
segments = engine.get_segments()
for seg in segments:
    print(f"{seg.speaker_id}: {seg.text}")
```

## Troubleshooting

### Common Issues

#### 1. Import Error: No module named 'pyaudio'

**Error:**
```
ModuleNotFoundError: No module named 'pyaudio'
```

**Solution:**
```bash
# macOS
brew install portaudio
pip install pyaudio

# Ubuntu/Debian
sudo apt-get install portaudio19-dev python3-dev
pip install pyaudio

# Windows
pip install pipwin
pipwin install pyaudio
```

#### 2. FFmpeg not found

**Error:**
```
FileNotFoundError: [Errno 2] No such file or directory: 'ffmpeg'
```

**Solution:**
Install FFmpeg and add to PATH:
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
# Add to PATH
```

#### 3. CUDA/GPU Issues

**Error:**
```
RuntimeError: CUDA out of memory
```

**Solution:**
1. Use a smaller model: `WHISPER_MODEL_SIZE=tiny`
2. Disable GPU: `USE_GPU=false`
3. Close other applications using GPU

#### 4. No Audio Input Detected

**Error:**
```
OSError: No Default Input Device Available
```

**Solution:**
1. Check microphone is connected
2. Grant microphone permissions to terminal/Python
3. List devices: `python run.py devices`
4. Specify device: `AudioCapture(device_index=1)`

#### 5. Slow Transcription

**Problem:** Transcription is too slow

**Solutions:**
1. Use smaller model: `tiny` or `base`
2. Enable GPU acceleration
3. Increase `LATENCY_TARGET`
4. Disable speaker diarization
5. Close other applications

#### 6. Poor Transcription Quality

**Problem:** Many errors in transcript

**Solutions:**
1. Use larger model: `medium` or `large`
2. Improve audio quality
3. Reduce background noise
4. Place microphone closer to speakers
5. Enable error correction: `ENABLE_ERROR_CORRECTION=true`

#### 7. Speaker Diarization Not Working

**Error:**
```
OSError: You need to provide a HuggingFace token
```

**Solution:**
1. Get token from https://huggingface.co/settings/tokens
2. Set environment variable:
   ```bash
   export HF_TOKEN=your_token_here
   ```
3. Or login:
   ```bash
   huggingface-cli login
   ```

### Getting Help

If you encounter issues:

1. Check the logs in the console
2. Review the [Architecture Documentation](docs/ARCHITECTURE.md)
3. Search existing GitHub issues
4. Create a new issue with:
   - Operating system and version
   - Python version
   - Full error message
   - Steps to reproduce

## Performance Tuning

### For Real-Time Transcription

Optimize for low latency:
```bash
WHISPER_MODEL_SIZE=tiny
LATENCY_TARGET=2.0
USE_GPU=true
ENABLE_SPEAKER_DIARIZATION=false
```

### For Maximum Accuracy

Optimize for quality:
```bash
WHISPER_MODEL_SIZE=large
LATENCY_TARGET=5.0
USE_GPU=true
ENABLE_ERROR_CORRECTION=true
```

### For Resource-Constrained Systems

Minimal resource usage:
```bash
WHISPER_MODEL_SIZE=tiny
USE_GPU=false
ENABLE_SPEAKER_DIARIZATION=false
ENABLE_ERROR_CORRECTION=false
```

## Next Steps

1. Read [Architecture Documentation](docs/ARCHITECTURE.md)
2. Explore example scripts
3. Customize for your needs
4. Integrate with your workflow

## Support

For questions and support:
- Review documentation
- Check GitHub issues
- Contact maintainers

Happy transcribing! 🎤
