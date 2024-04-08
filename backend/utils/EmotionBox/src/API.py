from flask import Flask, request, send_file
import json
import os
import subprocess


app = Flask(__name__)

def generate_control_string(probabilities):
    pitch_histogram = ",".join(f"{int(p*100)}" for p in probabilities.values())
    note_density = str(max(range(len(probabilities)), key=lambda i: list(probabilities.values())[i]) + 1)
    return f"{pitch_histogram};{note_density}"

@app.route('/generate_music', methods=['POST'])
def generate_music():
    data = request.get_json()

    control_string = generate_control_string(data['probabilities'])
    output_dir = 'output'

    # Call the generate.py script with the generated control string
    subprocess.run(["python", "generate.py", "-c", f"'{control_string}'", "-o", output_dir], check=True)

    # Find the generated MIDI file
    midi_files = [f for f in os.listdir(output_dir) if f.endswith('.mid')]
    if not midi_files:
        return "No MIDI file generated", 500

    midi_file = midi_files[0]
    return send_file(os.path.join(output_dir, midi_file), as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)