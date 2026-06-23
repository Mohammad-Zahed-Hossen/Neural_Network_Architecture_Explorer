# Research Papers Index & Summaries

Detailed indexing of the papers behind neural network breakthroughs represented in the database.

## 1. Chronological Breakthrough Timeline

### 1998 — Gradient-Based Learning Applied to Document Recognition

- **Authors**: Yann LeCun, Léon Bottou, Yoshua Bengio, Patrick Haffner
- **Key Contribution**: Demonstrated that gradient-based learning can be applied to document recognition systems and introduced the classic convolutional network architecture (LeNet-5) utilizing weight sharing and subsampling.
- **Linked models**: `lenet`
- **URL**: [http://yann.lecun.com/exdb/publis/pdf/lecun-98.pdf](http://yann.lecun.com/exdb/publis/pdf/lecun-98.pdf)

**Strengths & Innovations**:
- Pioneered the core components of modern CNNs: convolutions, weight sharing, pooling, and fully connected layers.
- Significant reduction in parameter footprint compared to fully connected networks.

**Weaknesses & Constraints**:
- Limited to low-resolution grayscale images (e.g. 32x32) due to computation bounds of 1998.
- Gradient degradation and vanishing gradients when attempting to stack deeper layers.

**Historical Legacy**:
Established the blueprint for all future deep learning convolutional architectures.

---

### 2012 — ImageNet Classification with Deep Convolutional Neural Networks

- **Authors**: Alex Krizhevsky, Ilya Sutskever, Geoffrey E. Hinton
- **Key Contribution**: Won the ImageNet LSVRC-2012 competition by a huge margin, demonstrating that large CNNs can be trained on massive datasets using GPUs.
- **Linked models**: `alexnet`
- **URL**: [https://proceedings.neurips.cc/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf](https://proceedings.neurips.cc/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf)

**Strengths & Innovations**:
- Pioneered GPU acceleration for training deep CNNs.
- Introduced ReLU non-linearities for faster convergence and Dropout regularization to prevent overfitting.

**Weaknesses & Constraints**:
- Extremely heavy parameter count (over 60 million parameters).
- Coarse early convolutions (11x11, stride 4) that miss fine-grained local textures.

**Historical Legacy**:
Ignited the modern deep learning revolution and established the GPU as the default hardware for training neural networks.

---

### 2014 — Very Deep Convolutional Networks for Large-Scale Image Recognition

- **Authors**: Karen Simonyan, Andrew Zisserman
- **Key Contribution**: Demonstrated that stacking multiple small 3x3 convolutions standardizes visual design and enables much deeper networks.
- **Linked models**: `vgg16`, `vgg19`
- **URL**: [https://arxiv.org/abs/1409.1556](https://arxiv.org/abs/1409.1556)

**Strengths & Innovations**:
- Uniform, clean design utilizing simple 3x3 conv structures
- Pretrained models serve as excellent generic visual extractors

**Weaknesses & Constraints**:
- Extremely heavy parameter count (138M+ for VGG16)
- High computational cost and slow training rates

**Historical Legacy**:
Established depth as a primary design dimension, driving research towards standardizing filter grids.

---

### 2015 — Deep Residual Learning for Image Recognition

- **Authors**: Kaiming He, Xiangyu Zhang, Shaoqing Ren, Jian Sun
- **Key Contribution**: Introduced identity shortcut skip connections to bypass layer parameters, enabling deep models to compile and train without optimization saturation.
- **Linked models**: `resnet50`, `resnet101`, `resnet152`
- **URL**: [https://arxiv.org/abs/1512.03385](https://arxiv.org/abs/1512.03385)

**Strengths & Innovations**:
- Allows training networks with 1000+ layers with stable convergence
- Dramatically reduced parameter count compared to massive sequential networks like VGG

**Weaknesses & Constraints**:
- Adding layers increases runtime, which can require bottleneck optimizations
- Identity shortcuts do not increase representational capacity directly

**Historical Legacy**:
Skip connections are now a standard architectural element in almost all modern vision models and Transformers.

---

### 2015 — Rethinking the Inception Architecture for Computer Vision

- **Authors**: Christian Szegedy, Vincent Vanhoucke, Sergey Ioffe, Jonathon Shlens, Zbigniew Wojna
- **Key Contribution**: Introduced multi-branch Inception blocks with factorized convolutions (e.g. splitting 7x7 convs into 1x7 and 7x1) to reduce parameters.
- **Linked models**: `inceptionv3`
- **URL**: [https://arxiv.org/abs/1512.00567](https://arxiv.org/abs/1512.00567)

**Strengths & Innovations**:
- Extracts multi-scale features (1x1, 3x3, 5x5) simultaneously in parallel branches
- Highly parameter-efficient for its accuracy class

**Weaknesses & Constraints**:
- Complex branch structure can cause bottlenecks in memory access and slow execution
- Difficult to scale and adapt for custom segmentation/detection heads

**Historical Legacy**:
Popularized parallel multi-branch architectures and auxiliary training loss heads.

---

### 2016 — Identity Mappings in Deep Residual Networks

- **Authors**: Kaiming He, Xiangyu Zhang, Shaoqing Ren, Jian Sun
- **Key Contribution**: Redesigned the residual block to place Batch Normalization and ReLU activations *before* the convolution (Pre-activation).
- **Linked models**: `resnet50v2`, `resnet101v2`, `resnet152v2`
- **URL**: [https://arxiv.org/abs/1603.05027](https://arxiv.org/abs/1603.05027)

**Strengths & Innovations**:
- Ensures an completely clean identity path for gradients to flow uninterrupted
- Reduces overfitting and improves classification accuracy over original ResNets

**Weaknesses & Constraints**:
- Requires slightly different hyperparameter adjustments for training stabilization
- Marginally changes the API and activation extraction points

**Historical Legacy**:
Popularized the pre-activation design layout, which is standard in many modern transformer models.

---

### 2016 — Densely Connected Convolutional Networks

- **Authors**: Gao Huang, Zhuang Liu, Laurens van der Maaten, Kilian Q. Weinberger
- **Key Contribution**: Connected each layer to every other layer in a feedforward block, concatenating feature maps instead of adding them.
- **Linked models**: `densenet121`, `densenet169`, `densenet201`
- **URL**: [https://arxiv.org/abs/1608.06993](https://arxiv.org/abs/1608.06993)

**Strengths & Innovations**:
- Exceptional parameter efficiency (matches ResNet accuracy with half the parameters)
- Continuous feature reuse ensures all layers access low-level and high-level features

**Weaknesses & Constraints**:
- Extremely high memory footprint because concatenated tensors must be held in VRAM buffers
- Slower inference speed on older GPU architectures due to memory layout overhead

**Historical Legacy**:
Demonstrated that dense feature reuse and explicit channel concatenation are viable alternatives to residual sums.

---

### 2016 — Xception: Deep Learning with Depthwise Separable Convolutions

- **Authors**: François Chollet
- **Key Contribution**: Replaced standard Inception modules with depthwise separable convolutions, adding residual skip connections.
- **Linked models**: `xception`
- **URL**: [https://arxiv.org/abs/1610.02357](https://arxiv.org/abs/1610.02357)

**Strengths & Innovations**:
- Better parameter efficiency and accuracy than standard Inception V3
- Extremely clean, uniform sequential layout compared to messy inception branches

**Weaknesses & Constraints**:
- Can be slower to train on systems without optimized depthwise convolution kernels
- Relatively heavy parameter size compared to MobileNet

**Historical Legacy**:
Bridged the gap between high-capacity inception designs and lightweight depthwise separable convolutions.

---

### 2016 — Inception-v4, Inception-ResNet and the Impact of Residual Connections on Learning

- **Authors**: Christian Szegedy, Sergey Ioffe, Vincent Vanhoucke, Alex A. Alemi
- **Key Contribution**: Combined the multi-branch Inception module with residual skip connections, demonstrating that residual links dramatically accelerate Inception network training.
- **Linked models**: `inceptionresnetv2`
- **URL**: [https://arxiv.org/abs/1602.07261](https://arxiv.org/abs/1602.07261)

**Strengths & Innovations**:
- Dramatically speeds up training convergence compared to pure Inception networks.
- Maintains multi-scale receptive fields while gaining residual gradient flow stability.

**Weaknesses & Constraints**:
- Highly complex, heterogeneous block configurations that are hard to optimize for custom hardware.
- Significant GPU memory overhead due to multiple parallel feature branches.

**Historical Legacy**:
Demonstrated that the combination of residual learning and multi-branch feature extraction is highly synergetic.

---

### 2017 — MobileNets: Efficient Convolutional Neural Networks for Mobile Vision Applications

- **Authors**: Andrew G. Howard, Menglong Zhu, Bo Chen, Dmitry Kalenichenko, Weijun Wang, Tobias Weyand, Marco Andreetto, Hartwig Adam
- **Key Contribution**: Introduced depthwise separable convolutions to build lightweight, low-latency visual models.
- **Linked models**: `mobilenet`
- **URL**: [https://arxiv.org/abs/1704.04861](https://arxiv.org/abs/1704.04861)

**Strengths & Innovations**:
- Reduces computation (FLOPs) and parameters by up to 9x with minimal accuracy drops
- Extremely small file size (e.g. ~16MB), ideal for mobile app bundles

**Weaknesses & Constraints**:
- Reduced capacity leads to lower classification accuracy on highly complex datasets
- Depthwise layers can be memory bandwidth bound on server GPUs

**Historical Legacy**:
Pioneered mobile-first computer vision and popularized hardware-conscious CNN design.

---

### 2017 — Learning Transferable Architectures for Scalable Image Recognition

- **Authors**: Barret Zoph, Vijay Vasudevan, Jonathon Shlens, Quoc V. Le
- **Key Contribution**: Designed cell-based neural search spaces (Normal Cells and Reduction Cells) optimized by reinforcement learning.
- **Linked models**: `nasnetmobile`, `nasnetlarge`
- **URL**: [https://arxiv.org/abs/1707.07012](https://arxiv.org/abs/1707.07012)

**Strengths & Innovations**:
- Discovered highly optimized visual cells that easily generalize across different tasks
- Achieved state-of-the-art ImageNet accuracy at the time of publication

**Weaknesses & Constraints**:
- Extremely complex, irregular node layouts make hardware caching inefficient
- Massive reinforcement learning search required 500+ GPUs to run

**Historical Legacy**:
Pioneered Neural Architecture Search (NAS), accelerating the automated design of AI models.

---

### 2018 — MobileNetV2: Inverted Residuals and Linear Bottlenecks

- **Authors**: Mark Sandler, Andrew Howard, Menglong Zhu, Andrey Zhmoginov, Liang-Chieh Chen
- **Key Contribution**: Introduced the Inverted Residual Block with linear bottlenecks, allowing highly efficient information flow and feature reuse for mobile computer vision models.
- **Linked models**: `mobilenetv2`
- **URL**: [https://arxiv.org/abs/1801.04381](https://arxiv.org/abs/1801.04381)

**Strengths & Innovations**:
- Inverted residual structure maintains high capacity in narrow layers.
- Linear bottlenecks prevent ReLU activation from destroying useful manifold features in thin layers.

**Weaknesses & Constraints**:
- Depthwise convolutions can be memory-bandwidth bottlenecked on standard server GPUs.
- Slightly more complex block configuration compared to MobileNetV1.

**Historical Legacy**:
Established the inverted residual block as a primary design motif for efficient, lightweight CNN models.

---

### 2019 — Searching for MobileNetV3

- **Authors**: Andrew Howard, Mark Sandler, Grace Chu, Liang-Chieh Chen, Bo Chen, Mingxing Tan, Weijun Wang, Yukun Zhu, Ruoming Peng, Vijay Vasudevan, Hartwig Adam
- **Key Contribution**: Combined hardware-aware Neural Architecture Search (NAS) and NetAdapt algorithms with the hard-swish activation function.
- **Linked models**: `mobilenetv3small`, `mobilenetv3large`
- **URL**: [https://arxiv.org/abs/1905.02175](https://arxiv.org/abs/1905.02175)

**Strengths & Innovations**:
- State-of-the-art speed-accuracy tradeoff on mobile CPUs
- Introduces squeeze-and-excitation attention blocks to prioritize channels

**Weaknesses & Constraints**:
- Inference speed benefits are CPU-centric and may not show on high-end desktop GPUs
- High design complexity makes custom modifications difficult

**Historical Legacy**:
Demonstrated that automated reinforcement learning search yields better edge networks than human designers.

---

### 2019 — EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks

- **Authors**: Mingxing Tan, Quoc V. Le
- **Key Contribution**: Formulated a compound scaling method to scale network depth, width, and input resolution using a fixed mathematical coefficient.
- **Linked models**: `efficientnetb0`, `efficientnetb1`, `efficientnetb2`, `efficientnetb3`, `efficientnetb4`, `efficientnetb5`, `efficientnetb6`, `efficientnetb7`
- **URL**: [https://arxiv.org/abs/1905.11946](https://arxiv.org/abs/1905.11946)

**Strengths & Innovations**:
- Exceptional accuracy-to-parameter ratio (8x parameter reduction for similar accuracy)
- Modular, mathematically coherent family scaling (from B0 up to B7)

**Weaknesses & Constraints**:
- Very deep variants (B6/B7) are slow to train due to deep sequential dependencies
- Requires advanced training recipes (like AutoAugment) to achieve target benchmarks

**Historical Legacy**:
Established scientific scaling frameworks for deep architectures, displacing ad-hoc scaling guesswork.

---

### 2020 — An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale

- **Authors**: Alexey Dosovitskiy, Lucas Beyer, et al.
- **Key Contribution**: Applied standard transformer self-attention blocks directly to non-overlapping image patches, showing that CNN-style inductive bias is not necessary at scale.
- **Linked models**: `vit`
- **URL**: [https://arxiv.org/abs/2010.11929](https://arxiv.org/abs/2010.11929)

**Strengths & Innovations**:
- Captures global long-range relationships in the very first layers
- Scales exceptionally well with massive datasets and computational budgets

**Weaknesses & Constraints**:
- Lacks inductive bias, requiring massive dataset pretraining or heavy data augmentation to generalize
- Quadratic complexity with token sequence length limits high-resolution deployment

**Historical Legacy**:
Launched the Vision Transformer revolution, shifting the computer vision backbone paradigm away from pure CNNs.

---

### 2021 — Swin Transformer: Hierarchical Vision Transformer using Shifted Windows

- **Authors**: Ze Liu, Yutong Lin, et al.
- **Key Contribution**: Introduced shifted local window attention and a hierarchical patch merging structure to reduce attention complexity from quadratic to linear, enabling high-resolution image processing.
- **Linked models**: `swin`
- **URL**: [https://arxiv.org/abs/2103.14030](https://arxiv.org/abs/2103.14030)

**Strengths & Innovations**:
- Linear complexity makes it fast and practical for high-resolution images
- Hierarchical representations allow multi-scale feature extractions

**Weaknesses & Constraints**:
- Windows restrict global context sharing within a single layer; cross-window communication relies on window shifts in subsequent blocks
- High implementation complexity compared to standard ViT

**Historical Legacy**:
Popularized local window self-attention in Vision Transformers, enabling them to act as general-purpose backbones for standard downstream tasks.

---

### 2022 — A ConvNet for the 2020s

- **Authors**: Zhuang Liu, Hanzi Mao, et al.
- **Key Contribution**: Modernized a standard ResNet with transformer design choices (7x7 depthwise convs, LayerNorm, GELU, patchify stems), proving that pure CNNs can achieve accuracy and scaling comparable to ViTs.
- **Linked models**: `convnext`
- **URL**: [https://arxiv.org/abs/2201.03545](https://arxiv.org/abs/2201.03545)

**Strengths & Innovations**:
- Maintains CNN speed, memory efficiency, and simple implementation while matching ViT accuracy
- Doesn't require custom window attention kernels, facilitating deployment

**Weaknesses & Constraints**:
- Still bounded by local receptive fields (though larger 7x7) compared to global self-attention
- Lacks the dynamic token-routing behavior of Transformers

**Historical Legacy**:
Resurrected interest in pure convolutional backbones, showing that architectural training recipes and macro design choices are more critical than the attention vs. conv dichotomy itself.

---

### 2022 — MaxViT: Multi-Axis Vision Transformer

- **Authors**: Zhengsu Chen, Jianchao Tan, et al.
- **Key Contribution**: Combined MBConv CNN blocks with block window attention (local context) and sparse grid attention (global context), achieving global self-attention in linear time.
- **Linked models**: `maxvit`
- **URL**: [https://arxiv.org/abs/2204.01697](https://arxiv.org/abs/2204.01697)

**Strengths & Innovations**:
- Computes true global attention in linear time
- Combines CNN inductive bias (MBConv) with Transformer flexibility

**Weaknesses & Constraints**:
- High parameter count and complex block structure
- Slower training throughput compared to pure CNNs

**Historical Legacy**:
Demonstrated that combining local convolutions with grid-based global attention creates highly efficient hybrid vision architectures.

---

