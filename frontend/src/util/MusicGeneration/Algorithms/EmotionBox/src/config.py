import torch

# Device configuration
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Model configuration
model_config = {
    'embedding_dim': 240,  # Dimension of the event embedding
    'input_size': 265,  # Size of the concatenated input (embedded event + pitch histogram + note density)
    'hidden_size': 512,  # Size of the hidden state in the GRU
    'num_layers': 3,  # Number of GRU layers
    'dropout': 0.3,  # Dropout rate
    'output_size': 240  # Size of the output (number of possible events)
}

# Training configuration
train = {
    'learning_rate': 0.0002,
    'batch_size': 64,
    'num_epochs': 100,
    'seq_length': 200,
    'stride': 10,
    'window_size': 2,
    'stride_size': 10,
    'control_ratio': 0.5,
    'teacher_forcing_ratio': 0.5,  
    'use_transposition': False  
}