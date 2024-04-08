
# Implementing EmotionBox to Brain Beats v4

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Based on the PyTorch implementation of EmotionBox, the paper is available on 
[https://arxiv.org/abs/2112.08561](https://arxiv.org/abs/2112.08561).

The code contains only the proposed method detailed in the paper.

The trained models are in the .\save dir.

## Generated Samples

    Run the generate.py to generate music using EmotionBox.


## Training Instructions

- Preprocessing

    ```shell
    Run preprocess.py 
    ```

- Training
    ```shell
    Run train.py 
## Requirements

- pretty_midi
- numpy
- pytorch >= 0.4
- tensorboardX
- progress