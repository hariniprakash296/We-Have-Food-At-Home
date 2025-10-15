"""
Flask-based alternative UI for real-time meeting transcription.
Provides REST API and web interface for transcription services.
"""

from flask import Flask, render_template_string, jsonify, request
import json
from datetime import datetime
import logging

from transcription_engine import TranscriptionEngine
from audio_capture import AudioCapture
from export_handler import ExportHandler
from config import get_settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Global state
engine: TranscriptionEngine = None
audio_capture: AudioCapture = None
is_recording = False


# HTML Template
HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>Real-Time Meeting Transcriber</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        h1 {
            color: #333;
        }
        .controls {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            justify-content: center;
        }
        button {
            padding: 10px 20px;
            font-size: 16px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        .btn-primary {
            background-color: #4CAF50;
            color: white;
        }
        .btn-secondary {
            background-color: #f44336;
            color: white;
        }
        .btn-info {
            background-color: #2196F3;
            color: white;
        }
        .status {
            text-align: center;
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        .status.recording {
            background-color: #ffebee;
            color: #c62828;
        }
        .status.ready {
            background-color: #e8f5e9;
            color: #2e7d32;
        }
        .transcript-container {
            background-color: white;
            border-radius: 10px;
            padding: 20px;
            min-height: 400px;
            max-height: 600px;
            overflow-y: auto;
        }
        .segment {
            margin-bottom: 15px;
            padding: 10px;
            border-left: 3px solid #4CAF50;
            background-color: #f9f9f9;
        }
        .timestamp {
            color: #666;
            font-size: 0.9em;
        }
        .speaker {
            color: #2196F3;
            font-weight: bold;
        }
        .stats {
            display: flex;
            gap: 20px;
            margin-top: 20px;
            justify-content: center;
        }
        .stat-box {
            background-color: white;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
        }
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #4CAF50;
        }
        .stat-label {
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎤 Real-Time Meeting Transcriber</h1>
    </div>
    
    <div class="controls">
        <button class="btn-primary" onclick="startTranscription()">Start Transcription</button>
        <button class="btn-secondary" onclick="stopTranscription()">Stop Transcription</button>
        <button class="btn-info" onclick="clearTranscript()">Clear Transcript</button>
        <button class="btn-info" onclick="exportTranscript()">Export</button>
    </div>
    
    <div id="status" class="status ready">Ready to record</div>
    
    <div class="transcript-container" id="transcript">
        <p style="text-align: center; color: #999;">Start transcription to see results...</p>
    </div>
    
    <div class="stats">
        <div class="stat-box">
            <div class="stat-value" id="segmentCount">0</div>
            <div class="stat-label">Segments</div>
        </div>
        <div class="stat-box">
            <div class="stat-value" id="duration">0s</div>
            <div class="stat-label">Duration</div>
        </div>
        <div class="stat-box">
            <div class="stat-value" id="wordCount">0</div>
            <div class="stat-label">Words</div>
        </div>
    </div>
    
    <script>
        let isRecording = false;
        let updateInterval;
        
        function startTranscription() {
            fetch('/api/start', { method: 'POST' })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        isRecording = true;
                        updateStatus('Recording in progress...', true);
                        startUpdates();
                    } else {
                        alert('Failed to start: ' + data.error);
                    }
                });
        }
        
        function stopTranscription() {
            fetch('/api/stop', { method: 'POST' })
                .then(response => response.json())
                .then(data => {
                    isRecording = false;
                    updateStatus('Ready to record', false);
                    stopUpdates();
                });
        }
        
        function clearTranscript() {
            fetch('/api/clear', { method: 'POST' })
                .then(() => updateTranscript());
        }
        
        function exportTranscript() {
            window.location.href = '/api/export?format=docx';
        }
        
        function updateStatus(message, recording) {
            const status = document.getElementById('status');
            status.textContent = recording ? '🔴 ' + message : '⚪ ' + message;
            status.className = 'status ' + (recording ? 'recording' : 'ready');
        }
        
        function updateTranscript() {
            fetch('/api/transcript')
                .then(response => response.json())
                .then(data => {
                    const container = document.getElementById('transcript');
                    
                    if (data.segments.length === 0) {
                        container.innerHTML = '<p style="text-align: center; color: #999;">No transcription yet...</p>';
                        return;
                    }
                    
                    let html = '';
                    data.segments.slice(-20).forEach(segment => {
                        const time = new Date(segment.timestamp * 1000).toLocaleTimeString();
                        const speaker = segment.speaker_id || 'Unknown';
                        html += `
                            <div class="segment">
                                <span class="timestamp">[${time}]</span>
                                <span class="speaker">${speaker}:</span>
                                ${segment.text}
                            </div>
                        `;
                    });
                    
                    container.innerHTML = html;
                    container.scrollTop = container.scrollHeight;
                    
                    // Update stats
                    document.getElementById('segmentCount').textContent = data.stats.total_segments;
                    document.getElementById('duration').textContent = data.stats.duration.toFixed(1) + 's';
                    document.getElementById('wordCount').textContent = data.stats.word_count;
                });
        }
        
        function startUpdates() {
            updateInterval = setInterval(updateTranscript, 1000);
        }
        
        function stopUpdates() {
            if (updateInterval) {
                clearInterval(updateInterval);
            }
        }
        
        // Initial load
        updateTranscript();
    </script>
</body>
</html>
"""


@app.route('/')
def index():
    """Render the main page."""
    return render_template_string(HTML_TEMPLATE)


@app.route('/api/start', methods=['POST'])
def start_transcription():
    """Start transcription."""
    global engine, audio_capture, is_recording
    
    try:
        if is_recording:
            return jsonify({'success': False, 'error': 'Already recording'})
        
        # Initialize components
        engine = TranscriptionEngine(model_size='base')
        audio_capture = AudioCapture()
        
        # Start transcription
        engine.start()
        audio_capture.start_capture(callback=engine.process_audio)
        
        is_recording = True
        
        return jsonify({'success': True})
    
    except Exception as e:
        logger.error(f"Error starting transcription: {e}")
        return jsonify({'success': False, 'error': str(e)})


@app.route('/api/stop', methods=['POST'])
def stop_transcription():
    """Stop transcription."""
    global engine, audio_capture, is_recording
    
    try:
        if audio_capture:
            audio_capture.stop_capture()
        
        if engine:
            engine.stop()
        
        is_recording = False
        
        return jsonify({'success': True})
    
    except Exception as e:
        logger.error(f"Error stopping transcription: {e}")
        return jsonify({'success': False, 'error': str(e)})


@app.route('/api/transcript')
def get_transcript():
    """Get current transcript."""
    global engine
    
    if not engine or not engine.current_session:
        return jsonify({
            'segments': [],
            'stats': {
                'total_segments': 0,
                'duration': 0,
                'word_count': 0
            }
        })
    
    segments = engine.get_segments()
    
    # Calculate stats
    word_count = sum(len(seg.text.split()) for seg in segments)
    duration = (segments[-1].timestamp - segments[0].timestamp) if segments else 0
    
    return jsonify({
        'segments': [
            {
                'text': seg.text,
                'timestamp': seg.timestamp,
                'speaker_id': seg.speaker_id
            }
            for seg in segments
        ],
        'stats': {
            'total_segments': len(segments),
            'duration': duration,
            'word_count': word_count
        }
    })


@app.route('/api/clear', methods=['POST'])
def clear_transcript():
    """Clear current transcript."""
    global engine
    
    if engine and engine.current_session:
        engine.current_session.segments = []
    
    return jsonify({'success': True})


@app.route('/api/export')
def export_transcript():
    """Export transcript."""
    global engine
    
    if not engine or not engine.current_session:
        return jsonify({'error': 'No transcript to export'}), 400
    
    format = request.args.get('format', 'docx')
    filename = f"transcript_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{format}"
    
    try:
        engine.export_transcript(filename, format)
        return jsonify({'success': True, 'filename': filename})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
