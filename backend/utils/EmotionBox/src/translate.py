import json
import os
import subprocess

# Sample JSON data
json_data = [
    {"prediction": "anger", "probabilities": {"calm": 0.2, "sad": 0.3, "anger": 0.4, "happiness": 0.1}},
    {"prediction": "calm", "probabilities": {"calm": 0.7, "sad": 0.2, "anger": 0.3, "happiness": 0.1}},
    {"prediction": "happiness", "probabilities": {"calm": 0.1, "sad": 0.1, "anger": 0.4, "happiness": 0.7}}
]

def generate_control_string(probabilities):
    pitch_histogram = ",".join(f"{int(p*100)}" for p in probabilities.values())
    note_density = str(max(range(len(probabilities)), key=lambda i: list(probabilities.values())[i]) + 1)
    return f"{pitch_histogram};{note_density}"

def main():
    for data in json_data:
        prediction = data["prediction"]
        probabilities = data["probabilities"]
        control_string = generate_control_string(probabilities)
        
        # Call the generate.py script with the generated control string
        subprocess.run(["python", "generate.py", "-c", f"'{control_string}'"], check=True)

if __name__ == "__main__":
    main()