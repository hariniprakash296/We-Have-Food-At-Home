#!/usr/bin/env python3
"""
Simple CLI runner for the transcription system.
Provides a command-line interface for quick transcription tasks.
"""

import argparse
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from transcription_engine import TranscriptionEngine
from audio_capture import AudioCapture
from config import get_settings


def transcribe_file(audio_file: str, output_file: str, model_size: str = "base"):
    """
    Transcribe an audio file.
    
    Args:
        audio_file: Path to input audio file
        output_file: Path to output transcript file
        model_size: Whisper model size
    """
    print(f"Transcribing {audio_file}...")
    print(f"Using model: {model_size}")
    
    engine = TranscriptionEngine(model_size=model_size)
    transcript = engine.transcribe_file(audio_file)
    
    # Determine format from output file extension
    ext = Path(output_file).suffix.lower().lstrip('.')
    if ext not in ['txt', 'docx', 'pdf', 'json']:
        ext = 'txt'
    
    # Create a temporary session for export
    from datetime import datetime
    from transcription_engine import TranscriptionSession, TranscriptSegment
    
    session = TranscriptionSession(
        session_id=f"cli_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        start_time=datetime.now()
    )
    
    # Add transcript as a single segment
    segment = TranscriptSegment(
        text=transcript,
        timestamp=datetime.now().timestamp()
    )
    session.add_segment(segment)
    
    # Export
    from export_handler import ExportHandler
    exporter = ExportHandler()
    exporter.export(session, output_file, ext)
    
    print(f"✅ Transcript saved to {output_file}")


def realtime_transcribe(duration: int = 60, model_size: str = "base"):
    """
    Start real-time transcription.
    
    Args:
        duration: Duration in seconds (0 for indefinite)
        model_size: Whisper model size
    """
    import time
    
    print("Starting real-time transcription...")
    print(f"Using model: {model_size}")
    print("Press Ctrl+C to stop\n")
    
    engine = TranscriptionEngine(model_size=model_size)
    audio = AudioCapture()
    
    try:
        engine.start()
        audio.start_capture(callback=engine.process_audio)
        
        start_time = time.time()
        
        while True:
            time.sleep(2)
            
            # Print latest segments
            segments = engine.get_segments()
            if segments:
                latest = segments[-1]
                print(f"[{time.strftime('%H:%M:%S')}] {latest.text}")
            
            # Check duration
            if duration > 0 and (time.time() - start_time) >= duration:
                break
    
    except KeyboardInterrupt:
        print("\n\nStopping transcription...")
    
    finally:
        audio.stop_capture()
        engine.stop()
        
        # Ask to export
        if engine.current_session and len(engine.get_segments()) > 0:
            response = input("\nExport transcript? (y/n): ")
            if response.lower() == 'y':
                filename = input("Enter filename (e.g., meeting.docx): ")
                ext = Path(filename).suffix.lower().lstrip('.')
                if ext not in ['txt', 'docx', 'pdf', 'json']:
                    ext = 'docx'
                    filename = f"{filename}.{ext}"
                
                engine.export_transcript(filename, ext)
                print(f"✅ Transcript saved to {filename}")


def list_devices():
    """List available audio input devices."""
    print("Available audio input devices:\n")
    
    audio = AudioCapture()
    devices = audio.list_devices()
    
    for device in devices:
        print(f"  [{device['index']}] {device['name']}")
        print(f"      Channels: {device['channels']}, Sample Rate: {device['sample_rate']} Hz")
        print()


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Real-Time Meeting Transcriber CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Transcribe an audio file
  python run.py transcribe meeting.wav output.docx --model base
  
  # Real-time transcription for 60 seconds
  python run.py realtime --duration 60 --model base
  
  # List audio devices
  python run.py devices
  
  # Start Streamlit UI
  python run.py ui
        """
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Command to run')
    
    # Transcribe command
    transcribe_parser = subparsers.add_parser('transcribe', help='Transcribe an audio file')
    transcribe_parser.add_argument('input', help='Input audio file')
    transcribe_parser.add_argument('output', help='Output transcript file')
    transcribe_parser.add_argument('--model', default='base', 
                                   choices=['tiny', 'base', 'small', 'medium', 'large'],
                                   help='Whisper model size')
    
    # Realtime command
    realtime_parser = subparsers.add_parser('realtime', help='Start real-time transcription')
    realtime_parser.add_argument('--duration', type=int, default=0,
                                help='Duration in seconds (0 for indefinite)')
    realtime_parser.add_argument('--model', default='base',
                                choices=['tiny', 'base', 'small', 'medium', 'large'],
                                help='Whisper model size')
    
    # Devices command
    subparsers.add_parser('devices', help='List available audio devices')
    
    # UI command
    subparsers.add_parser('ui', help='Start Streamlit UI')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    if args.command == 'transcribe':
        transcribe_file(args.input, args.output, args.model)
    elif args.command == 'realtime':
        realtime_transcribe(args.duration, args.model)
    elif args.command == 'devices':
        list_devices()
    elif args.command == 'ui':
        import subprocess
        subprocess.run(['streamlit', 'run', 'src/streamlit_app.py'])


if __name__ == '__main__':
    main()
