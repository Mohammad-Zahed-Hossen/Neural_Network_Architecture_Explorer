# Graph Topologies & Connections Analysis

Analyzes neural network graphs as mathematical node-link topologies, mapping size, bypass routes, and density.

## 1. Node & Edge Volumes Table

| Model ID | Nodes Count | Edges Count | Skip Connections | Dense Connections | Blocks/Groups | Input Size |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `alexnet` | 13 | 12 | 0 | 0 | 3 | `224x224` |
| `convnext` | 14 | 13 | 0 | 0 | 6 | `224x224` |
| `densenet121` | 429 | 486 | 0 | 58 | 9 | `224x224` |
| `densenet169` | 597 | 678 | 0 | 82 | 9 | `224x224` |
| `densenet201` | 709 | 806 | 0 | 98 | 9 | `224x224` |
| `efficientnetb0` | 213 | 237 | 25 | 16 | 18 | `224x224` |
| `efficientnetb1` | 301 | 339 | 39 | 23 | 25 | `224x224` |
| `efficientnetb2` | 301 | 339 | 39 | 23 | 25 | `224x224` |
| `efficientnetb3` | 340 | 384 | 45 | 26 | 28 | `224x224` |
| `efficientnetb4` | 418 | 474 | 57 | 32 | 34 | `224x224` |
| `efficientnetb5` | 506 | 576 | 71 | 39 | 41 | `224x224` |
| `efficientnetb6` | 584 | 666 | 83 | 45 | 47 | `224x224` |
| `efficientnetb7` | 711 | 813 | 103 | 55 | 57 | `600x600` |
| `inceptionresnetv2` | 124 | 135 | 20 | 0 | 7 | `224x224` |
| `inceptionv3` | 90 | 93 | 12 | 0 | 5 | `224x224` |
| `lenet` | 9 | 8 | 0 | 0 | 3 | `32x32` |
| `maxvit` | 11 | 10 | 0 | 0 | 6 | `224x224` |
| `mobilenet` | 84 | 83 | 0 | 0 | 15 | `224x224` |
| `mobilenetv2` | 152 | 161 | 10 | 0 | 19 | `224x224` |
| `mobilenetv3large` | 169 | 186 | 18 | 8 | 17 | `224x224` |
| `mobilenetv3small` | 137 | 151 | 15 | 9 | 13 | `224x224` |
| `nasnetlarge` | 66 | 84 | 40 | 0 | 21 | `224x224` |
| `nasnetmobile` | 48 | 60 | 28 | 0 | 15 | `224x224` |
| `resnet101` | 346 | 378 | 33 | 0 | 35 | `224x224` |
| `resnet101v2` | 376 | 408 | 33 | 0 | 35 | `224x224` |
| `resnet152` | 516 | 565 | 50 | 0 | 52 | `224x224` |
| `resnet152v2` | 563 | 612 | 50 | 0 | 52 | `224x224` |
| `resnet50` | 176 | 191 | 16 | 0 | 18 | `224x224` |
| `resnet50v2` | 189 | 204 | 16 | 0 | 18 | `224x224` |
| `swin` | 13 | 12 | 0 | 0 | 6 | `224x224` |
| `vgg16` | 23 | 22 | 0 | 0 | 6 | `224x224` |
| `vgg19` | 26 | 25 | 0 | 0 | 6 | `224x224` |
| `vit` | 17 | 18 | 2 | 0 | 4 | `224x224` |
| `xception` | 117 | 125 | 11 | 0 | 13 | `224x224` |

## 2. Residual and Dense Connection Analysis

Bypass routes (residual/skip sums and dense concatenations) are the primary driver of depth stability in modern backbones:

- **DenseNet** variants contain the highest density of concatenation links, creating complete routing sub-graphs.
- **ResNet** models employ identity additions, providing a linear skip highway bypass directly to initial input layers.
- **Vision Transformers (ViT)** use standard self-attention routing, bypassing convolutional locality constraints entirely.
