"""
Streamlit-based UI for real-time meeting transcription.
Provides a user-friendly interface for live transcription display.
"""

import streamlit as st
import time
from datetime import datetime
import threading
from pathlib import Path

# Import transcription components
from transcription_engine import TranscriptionEngine
from audio_capture import AudioCapture
from speaker_diarization import SpeakerDiarizer
from error_correction import ErrorCorrector
from export_handler import ExportHandler
from config import get_settings


# Page configuration
st.set_page_config(
    page_title="Real-Time Meeting Transcriber",
    page_icon="🎤",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .main-title {
        font-size: 3rem;
        font-weight: bold;
        text-align: center;
        margin-bottom: 2rem;
    }
    .transcript-box {
        background-color: #f0f2f6;
        border-radius: 10px;
        padding: 20px;
        max-height: 500px;
        overflow-y: auto;
    }
    .segment {
        margin-bottom: 10px;
        padding: 10px;
        background-color: white;
        border-radius: 5px;
        border-left: 3px solid #4CAF50;
    }
    .timestamp {
        color: #666;
        font-size: 0.9rem;
    }
    .speaker {
        color: #2196F3;
        font-weight: bold;
    }
</style>
""", unsafe_allow_html=True)


def initialize_session_state():
    """Initialize Streamlit session state variables."""
    if 'engine' not in st.session_state:
        st.session_state.engine = None
    if 'audio_capture' not in st.session_state:
        st.session_state.audio_capture = None
    if 'is_recording' not in st.session_state:
        st.session_state.is_recording = False
    if 'corrector' not in st.session_state:
        st.session_state.corrector = ErrorCorrector()
    if 'exporter' not in st.session_state:
        st.session_state.exporter = ExportHandler()
    if 'settings' not in st.session_state:
        st.session_state.settings = get_settings()


def sidebar_controls():
    """Render sidebar controls."""
    st.sidebar.header("⚙️ Settings")
    
    # Model selection
    model_size = st.sidebar.selectbox(
        "Whisper Model Size",
        ["tiny", "base", "small", "medium", "large"],
        index=1,
        help="Larger models are more accurate but slower"
    )
    
    # Feature toggles
    enable_diarization = st.sidebar.checkbox(
        "Enable Speaker Diarization",
        value=True,
        help="Identify different speakers"
    )
    
    enable_correction = st.sidebar.checkbox(
        "Enable Error Correction",
        value=True,
        help="Apply grammar and spelling corrections"
    )
    
    # Audio device selection
    st.sidebar.subheader("🎤 Audio Input")
    
    if st.session_state.audio_capture:
        devices = st.session_state.audio_capture.list_devices()
        device_options = [f"{d['index']}: {d['name']}" for d in devices]
        
        selected_device = st.sidebar.selectbox(
            "Input Device",
            device_options,
            help="Select audio input device"
        )
        
        device_index = int(selected_device.split(':')[0])
    else:
        device_index = None
    
    return {
        'model_size': model_size,
        'enable_diarization': enable_diarization,
        'enable_correction': enable_correction,
        'device_index': device_index
    }


def start_transcription(config):
    """Start the transcription process."""
    try:
        # Initialize engine
        st.session_state.engine = TranscriptionEngine(
            model_size=config['model_size'],
            enable_diarization=config['enable_diarization']
        )
        
        # Initialize audio capture
        st.session_state.audio_capture = AudioCapture(
            device_index=config['device_index']
        )
        
        # Start transcription
        st.session_state.engine.start()
        st.session_state.audio_capture.start_capture(
            callback=st.session_state.engine.process_audio
        )
        
        st.session_state.is_recording = True
        st.success("✅ Transcription started!")
        
    except Exception as e:
        st.error(f"❌ Error starting transcription: {e}")


def stop_transcription():
    """Stop the transcription process."""
    try:
        if st.session_state.audio_capture:
            st.session_state.audio_capture.stop_capture()
        
        if st.session_state.engine:
            st.session_state.engine.stop()
        
        st.session_state.is_recording = False
        st.success("⏹️ Transcription stopped!")
        
    except Exception as e:
        st.error(f"❌ Error stopping transcription: {e}")


def display_transcript():
    """Display the live transcript."""
    if not st.session_state.engine:
        st.info("👆 Start transcription to see results here")
        return
    
    segments = st.session_state.engine.get_segments()
    
    if not segments:
        st.info("🎤 Listening... Speak to see transcription")
        return
    
    # Display segments
    st.markdown('<div class="transcript-box">', unsafe_allow_html=True)
    
    for segment in segments[-20:]:  # Show last 20 segments
        timestamp = datetime.fromtimestamp(segment.timestamp).strftime('%H:%M:%S')
        speaker = segment.speaker_id if segment.speaker_id else "Unknown"
        
        # Apply error correction if enabled
        text = segment.text
        if st.session_state.settings.enable_error_correction:
            text = st.session_state.corrector.correct_text(text)
        
        st.markdown(f"""
        <div class="segment">
            <span class="timestamp">[{timestamp}]</span>
            <span class="speaker">{speaker}:</span>
            {text}
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown('</div>', unsafe_allow_html=True)


def export_controls():
    """Render export controls."""
    st.sidebar.subheader("💾 Export Transcript")
    
    export_format = st.sidebar.selectbox(
        "Format",
        ["txt", "docx", "pdf", "json"],
        help="Select export format"
    )
    
    filename = st.sidebar.text_input(
        "Filename",
        value=f"transcript_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{export_format}"
    )
    
    if st.sidebar.button("Export"):
        if st.session_state.engine and st.session_state.engine.current_session:
            try:
                st.session_state.engine.export_transcript(filename, export_format)
                st.sidebar.success(f"✅ Exported to {filename}")
            except Exception as e:
                st.sidebar.error(f"❌ Export failed: {e}")
        else:
            st.sidebar.warning("⚠️ No transcription to export")


def main():
    """Main application."""
    initialize_session_state()
    
    # Title
    st.markdown('<div class="main-title">🎤 Real-Time Meeting Transcriber</div>', unsafe_allow_html=True)
    
    # Sidebar
    config = sidebar_controls()
    export_controls()
    
    # Main controls
    col1, col2, col3 = st.columns([1, 1, 2])
    
    with col1:
        if not st.session_state.is_recording:
            if st.button("🎙️ Start Transcription", type="primary", use_container_width=True):
                start_transcription(config)
        else:
            if st.button("⏹️ Stop Transcription", type="secondary", use_container_width=True):
                stop_transcription()
    
    with col2:
        if st.button("🔄 Clear Transcript", use_container_width=True):
            if st.session_state.engine:
                st.session_state.engine.current_session.segments = []
                st.rerun()
    
    # Status indicator
    if st.session_state.is_recording:
        st.markdown("🔴 **Recording in progress...**")
    else:
        st.markdown("⚪ **Ready to record**")
    
    st.divider()
    
    # Transcript display
    st.subheader("📝 Live Transcript")
    
    # Auto-refresh container
    transcript_container = st.container()
    
    with transcript_container:
        display_transcript()
    
    # Auto-refresh while recording
    if st.session_state.is_recording:
        time.sleep(1)
        st.rerun()
    
    # Footer
    st.divider()
    
    # Statistics
    if st.session_state.engine and st.session_state.engine.current_session:
        segments = st.session_state.engine.get_segments()
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.metric("Total Segments", len(segments))
        
        with col2:
            if segments:
                duration = segments[-1].timestamp - segments[0].timestamp
                st.metric("Duration", f"{duration:.1f}s")
            else:
                st.metric("Duration", "0s")
        
        with col3:
            word_count = sum(len(seg.text.split()) for seg in segments)
            st.metric("Word Count", word_count)


if __name__ == "__main__":
    main()
