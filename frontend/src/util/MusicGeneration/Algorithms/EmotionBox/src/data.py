import os
import torch
import numpy as np
from pretty_midi import PrettyMIDI
from progress.bar import Bar
import config
import utils
from preprocess import preprocess_midi

class Dataset:
    def __init__(self, root, verbose=False):
        assert os.path.isdir(root), root
        paths = utils.find_files_by_extensions(root, ['.mid', '.midi'])
        self.root = root
        self.samples = []
        self.seqlens = []

        if verbose:
            paths = Bar(root).iter(list(paths))

        for path in paths:
            midi_data = PrettyMIDI(path)
            eventseq, control_seq = preprocess_midi(path)
            pitch_histogram, note_density = self.extract_features(control_seq)
            self.samples.append((eventseq, pitch_histogram, note_density))
            self.seqlens.append(len(eventseq))

        self.avglen = np.mean(self.seqlens)

    import numpy as np


    def extract_note_density(control_seq_array):
        # Assuming the note density is represented as a single value in the compressed array
        note_density_idx = -1  # Assuming the note density is the last column

        # Extract the note density column from the compressed array
        note_densities = control_seq_array[:, note_density_idx]

        return note_densities

    def extract_features(self, control_seq):
        pitch_histogram = extract_pitch_histogram(control_seq_array)
        note_density = extract_note_density(control_seq_array)
        return pitch_histogram, note_density
    
    def extract_pitch_histogram(control_seq_array):
        # Assuming the pitch histogram is represented as a one-hot encoded vector
        # in the compressed array with a fixed number of columns
        pitch_histogram_cols = 12  # Assuming 12 pitch classes (C, C#, D, D#, ..., B)
        pitch_histogram_idx = -2  # Assuming the pitch histogram is the second-to-last column

        # Extract the pitch histogram columns from the compressed array
        pitch_histogram_data = control_seq_array[:, pitch_histogram_idx:pitch_histogram_idx + pitch_histogram_cols]

        # Convert the one-hot encoded vectors to pitch histogram arrays
        pitch_histograms = []
        for row in pitch_histogram_data:
            pitch_histogram = np.zeros(pitch_histogram_cols, dtype=int)
            for i, value in enumerate(row):
                pitch_histogram[i] = value
            pitch_histograms.append(pitch_histogram)

        return pitch_histograms

    def batches(self, batch_size, window_size, stride_size):
        indeces = [(i, range(j, j + window_size))
                   for i, seqlen in enumerate(self.seqlens)
                   for j in range(0, seqlen - window_size, stride_size)]

        while True:
            eventseq_batch = []
            pitch_histogram_batch = []
            note_density_batch = []
            n = 0

            for ii in np.random.permutation(len(indeces)):
                i, r = indeces[ii]
                eventseq, pitch_histogram, note_density = self.samples[i]
                eventseq = eventseq[r.start:r.stop]
                pitch_histogram = pitch_histogram[r.start:r.stop]
                note_density = note_density[r.start:r.stop]

                eventseq_batch.append(eventseq)
                pitch_histogram_batch.append(pitch_histogram)
                note_density_batch.append(note_density)

                n += 1
                if n == batch_size:
                    eventseq_stack = np.stack(eventseq_batch, axis=1)
                    pitch_histogram_stack = np.stack(pitch_histogram_batch, axis=1)
                    note_density_stack = np.stack(note_density_batch, axis=1)

                    yield eventseq_stack, pitch_histogram_stack, note_density_stack

                    eventseq_batch.clear()
                    pitch_histogram_batch.clear()
                    note_density_batch.clear()
                    n = 0

    def __repr__(self):
        return (f'Dataset(root="{self.root}", '
                f'samples={len(self.samples)}, '
                f'avglen={self.avglen})')