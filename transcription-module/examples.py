"""
Simple integration example demonstrating the transcription system.

This example shows:
1. File transcription
2. Real-time transcription
3. Export to multiple formats
"""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from transcription_engine import TranscriptionEngine
from audio_capture import AudioCapture
from error_correction import ErrorCorrector
import time


def example_1_file_transcription():
    """Example: Transcribe an audio file"""
    print("=" * 60)
    print("Example 1: File Transcription")
    print("=" * 60)
    
    engine = TranscriptionEngine(model_size="tiny")  # Use tiny for demo
    
    # Note: You need an actual audio file for this to work
    # audio_file = "path/to/your/audio.wav"
    # transcript = engine.transcribe_file(audio_file)
    # print(f"Transcript: {transcript}")
    
    print("✅ Engine initialized successfully!")
    print("To use: engine.transcribe_file('your_audio.wav')")
    print()


def example_2_realtime_transcription():
    """Example: Real-time transcription for 10 seconds"""
    print("=" * 60)
    print("Example 2: Real-Time Transcription")
    print("=" * 60)
    
    try:
        engine = TranscriptionEngine(model_size="tiny")
        audio = AudioCapture()
        
        print("Starting real-time transcription...")
        print("(This would capture audio for 10 seconds)")
        
        # engine.start()
        # audio.start_capture(callback=engine.process_audio)
        # time.sleep(10)
        # audio.stop_capture()
        # engine.stop()
        
        print("✅ Components initialized successfully!")
        print("Uncomment the code to actually capture audio")
        print()
        
    except Exception as e:
        print(f"⚠️  Note: Audio devices may not be available in this environment")
        print(f"Error: {e}")
        print()


def example_3_error_correction():
    """Example: Apply error correction to text"""
    print("=" * 60)
    print("Example 3: Error Correction")
    print("=" * 60)
    
    corrector = ErrorCorrector()
    
    # Sample text with common transcription errors
    raw_text = "um so like i was thinking uh we should basically meet tomorrow"
    
    print(f"Raw text: {raw_text}")
    
    # Apply corrections
    clean_text = corrector.remove_filler_words(raw_text)
    print(f"After filler removal: {clean_text}")
    
    clean_text = corrector.fix_capitalization(clean_text)
    print(f"After capitalization: {clean_text}")
    
    clean_text = corrector.fix_punctuation(clean_text)
    print(f"Final text: {clean_text}")
    print()


def example_4_export_formats():
    """Example: Export to different formats"""
    print("=" * 60)
    print("Example 4: Export Formats")
    print("=" * 60)
    
    from transcription_engine import TranscriptionSession, TranscriptSegment
    from export_handler import ExportHandler
    from datetime import datetime
    
    # Create a sample session
    session = TranscriptionSession(
        session_id="demo_session",
        start_time=datetime.now()
    )
    
    # Add sample segments
    session.add_segment(TranscriptSegment(
        text="Welcome to the meeting. Let's discuss the project status.",
        timestamp=datetime.now().timestamp(),
        speaker_id="Speaker_1"
    ))
    
    session.add_segment(TranscriptSegment(
        text="The project is on track and we'll meet the deadline.",
        timestamp=datetime.now().timestamp(),
        speaker_id="Speaker_2"
    ))
    
    # Export to different formats
    exporter = ExportHandler()
    
    formats = ['txt', 'docx', 'pdf', 'json']
    for fmt in formats:
        filename = f"demo_transcript.{fmt}"
        try:
            exporter.export(session, filename, fmt)
            print(f"✅ Exported to {filename}")
        except Exception as e:
            print(f"⚠️  {fmt.upper()} export requires additional setup: {e}")
    
    print()


def main():
    """Run all examples"""
    print("\n")
    print("🎤 Real-Time Meeting Transcriber - Examples")
    print("=" * 60)
    print()
    
    example_1_file_transcription()
    example_2_realtime_transcription()
    example_3_error_correction()
    example_4_export_formats()
    
    print("=" * 60)
    print("Examples completed!")
    print("\nNext steps:")
    print("1. Run Streamlit UI: streamlit run src/streamlit_app.py")
    print("2. Run Flask app: python src/flask_app.py")
    print("3. Use CLI: python run.py --help")
    print()


if __name__ == "__main__":
    main()
