# **ResNet101 Production Implementation Guide** (Depreciated)

# **ResNet101 Architecture Implementation Reference**

## **1\. Metadata & Technical Prerequisites**

| Property | Value |
| :---- | :---- |
| **Target Architecture** | Deep Residual Network (101 layers with Bottleneck Blocks) |
| **Primary Domain** | Computer Vision (Image Classification, Feature Extraction, Backbone) |
| **Input Resolution (Default)** | 224×224×3 (RGB) |
| **Parameters** | ∼44,549,160 (44.55M) |
| **FLOPs (224x224)** | ∼7.85 GFLOPs (15.7×109 Multiply-Accumulate Operations) |
| **FP32 Checkpoint Size** | ∼170 MB |
| **FP16 Checkpoint Size** | ∼85 MB |
| **Target Hardware** | NVIDIA Ampere / Ada Lovelace / Hopper GPUs, Apple Silicon (MPS), CPU |
| **Mixed Precision Support** | float16, bfloat16 (NVIDIA Ampere+ recommended) |
| **Prerequisites** | Python 3.14+, PyTorch 2.12+, TensorFlow 2.21+, Keras 3.x, CUDA 12.x |

## **2\. Architectural Deep Dive & Engineering Trade-Offs**

### **Architectural Mechanics**

ResNet101 is a 101-layer deep convolutional neural network that utilizes residual learning through identity shortcut connections. The fundamental insight of residual networks is that learning residual functions *F*(*x*)=*H*(*x*)−*x* is easier for gradient-based optimization than learning unreferenced mappings *H*(*x*).

The block layout of ResNet101 follows a four-stage bottleneck design preceded by a stem convolution and followed by a global average pooling layer and fully connected classification head:

Input7×7 Conv, *s*\=2​BN​ReLU3×3 MaxPool, *s*\=2​Stage 1​Stage 2​Stage 3​Stage 4​GAP​FC  
Input: (3, 224, 224\)  
  │  
  ▼  
\[Stem Stage\] 7x7 Conv, Stride 2, 64 Filters \-\> BatchNorm \-\> ReLU \-\> 3x3 MaxPool, Stride 2  
  │  (Output: 64 x 56 x 56\)  
  ▼  
\[Stage 1 (conv2\_x)\] 3 Bottleneck Blocks  (Channels: 64  \-\> 64  \-\> 256\)  \-- Output: 256 x 56 x 56  
  │  
  ▼  
\[Stage 2 (conv3\_x)\] 4 Bottleneck Blocks  (Channels: 128 \-\> 128 \-\> 512\)  \-- Output: 512 x 28 x 28  
  │  
  ▼  
\[Stage 3 (conv4\_x)\] 23 Bottleneck Blocks (Channels: 256 \-\> 256 \-\> 1024\) \-- Output: 1024 x 14 x 14  
  │  (Represents 68% of total network depth)  
  ▼  
\[Stage 4 (conv5\_x)\] 3 Bottleneck Blocks  (Channels: 512 \-\> 512 \-\> 2048\) \-- Output: 2048 x 7 x 7  
  │  
  ▼  
\[Head\] Global Average Pooling (2048) \-\> Fully Connected (Num Classes)

Each bottleneck block consists of three stacked operations:

> 1. 1×1 Convolution for dimensionality reduction (compression factor 1/4).  
> 2. 3×3 Convolution for spatial feature extraction.  
> 3. 1×1 Convolution for dimensionality restoration (channel expansion by 4×).

### **Stage-4 Bottleneck Depth: ResNet50 vs. ResNet101 vs. ResNet152**

The distinguishing characteristic of ResNet101 compared to ResNet50 and ResNet152 lies almost entirely in the depth of **Stage 3 (conv4\_x)**:

| ResNet Variant | Stage 1 (conv2\_x) | Stage 2 (conv3\_x) | Stage 3 (conv4\_x) | Stage 4 (conv5\_x) | Total Bottleneck Blocks |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **ResNet50** | 3 | 4 | **6** | 3 | 16 |
| **ResNet101** | 3 | 4 | **23** | 3 | 33 |
| **ResNet152** | 3 | 8 | **36** | 3 | 48 |

The 23 bottleneck blocks in Stage 3 make up 69 operations (23×3), accounting for more than two-thirds of the entire network's layer depth. This gives ResNet101 significantly higher representation capacity for complex, abstract semantic concepts while maintaining low spatial resolutions (14×14).

### **Comparative Performance Metrics**

| Metric | ResNet50 | ResNet101 | ResNet152 |
| :---- | :---- | :---- | :---- |
| **Parameter Count** | 25.56M | **44.55M** (+74%) | 60.19M (+135%) |
| **FLOPs (224×224)** | 4.12 GFLOPs | **7.85 GFLOPs** (+90%) | 11.58 GFLOPs (+181%) |
| **Top-1 Accuracy (ImageNet)** | ∼76.1% | **∼77.4%** (+1.3%) | ∼78.3% (+2.2%) |
| **FP32 VRAM (Training, BS=32)** | ∼4.2 GB | **∼7.1 GB** | ∼10.4 GB |
| **Inference Latency (A100, FP16)** | ∼1.1 ms | **∼1.9 ms** | ∼2.8 ms |
| **Primary Use Case** | Real-time, Edge, Baseline | **High-capacity feature extraction, Fine-grained classification** | Offline batch processing, Maximum accuracy bounds |

### **Optimization & Gradient Flow**

Because of the deep 23-block stack in Stage 3, gradient signals propagating backward through pure convolution paths can attenuate. ResNet101 relies on additive identity shortcuts:

*xl*\+1​\=*xl*​\+*F*(*xl*​,*Wl*​)

By applying the chain rule for backpropagation:

∂*xl*​∂L​\=∂*xL*​∂L​∂*xl*​∂*xL*​​\=∂*xL*​∂L​(1+∂*xl*​∂​*i*\=*l*∑*L*−1​*F*(*xi*​,*Wi*​))

The term ∂*xL*​∂L​ flows directly to layer *xl*​ without passing through weight layers, preventing vanishing gradients across all 23 blocks in Stage 3\.

### **Trade-Off Matrix: When to Select ResNet101**

#### **Recommended Scenarios**

> * **Fine-Grained Classification**: Fine-grained distinction tasks (e.g., medical imaging, species identification, satellite surface analysis) benefit from Stage 3 depth.  
> * **Complex Feature Extraction Backbone**: Excellent as a feature extraction backbone for multi-stage detectors (Faster R-CNN, Mask R-CNN, Cascade R-CNN) where deep representation power improves region proposal quality.  
> * **High-Data Regimes**: When fine-tuning on large datasets (\>100,000 training images) where lower-capacity models like ResNet50 saturate.

#### **Non-Recommended Scenarios**

> * **Edge Deployment & Ultra-Low Latency**: For real-time mobile or embedded inference (\<2ms budget on low-power devices), lightweight modern backbones like MobileNetV4, EfficientNet-B2, or ConvNeXt-Nano offer superior FLOP-to-accuracy trade-offs.  
> * **Small Datasets (\<5,000 images)**: High capacity increases risk of overfitting unless aggressive freezing (freezing Stages 1 through 3\) or heavy data augmentation is applied.

## **3\. Educational & Production Engineering Callouts**

### **1\. Batch Normalization Behavior in Fine-Tuning**

**Context:** ResNet101 contains 104 Batch Normalization (BN) layers. During transfer learning, treating BN layers incorrectly is a common source of fine-tuning instability.

**Mechanism:** Standard BN tracks running statistics (*μ*,*σ*) during training and uses frozen statistics during inference. If BN running statistics update on small target datasets, the pre-trained weights in subsequent layers become misaligned, destroying learned representations.

**Production Standard:** Keep BN layers in **evaluation mode** (model.eval() in PyTorch, or setting trainable=False on BN layers in Keras) during initial transfer learning. Only update BN running statistics if the target dataset is large (\>50,000 samples) and matches the batch size used during pre-training (*BS*≥32).

### **2\. The 23-Block Stage-3 Bottleneck & Learning Rate Warmup**

**Context:** Fine-tuning all 101 layers simultaneously with a constant learning rate often causes gradient shock in early iterations.

**Mechanism:** The dense 23-block block structure of Stage 3 accumulates gradient norms during backpropagation. Unfreezing these layers with a high initial learning rate causes large parameter updates, distorting pre-trained features before the top classifier head stabilizes.

**Production Standard:** Use a **5-epoch linear warmup** starting from LRstart​\=0.001×LRtarget​ up to LRtarget​, followed by Cosine Annealing. When unfreezing Stage 3 during two-stage fine-tuning, reduce the learning rate by a factor of 10 to 100 relative to the classification head rate.

### **3\. Mixed Precision Numerical Stability**

**Context:** Training ResNet101 in FP16/BF16 speeds up throughput by 2.5× on NVIDIA Tensor Core architectures.

**Mechanism:** In FP16, 1×1 projection convolutions in bottleneck layers with large channel dimensions (1024→2048) can suffer from numerical underflow during residual addition (*x*\+*F*(*x*)) if residual values fall below 2−24.

**Production Standard:** Use PyTorch torch.amp.autocast('cuda') with GradScaler or Keras keras.mixed\_precision.set\_global\_policy('mixed\_float16'). On Ampere, Ada Lovelace, or Hopper GPUs, prefer bfloat16 over float16 because bfloat16 matches the dynamic range of float32 (10−38 to 1038), avoiding gradient underflow without requiring loss scaling.

## **4\. PyTorch 2.12 Production Pipeline**

### **Repository Structure**

resnet101\_pytorch/  
├── dataset.py  
├── utils.py  
├── train.py  
├── evaluate.py  
├── inference.py  
└── export\_onnx.py

### **dataset.py**

"""  
Dataset module for ResNet101 training and validation pipelines.  
Handles data loading, torchvision v2 transformations, and memory-pinned DataLoaders.  
"""

from pathlib import Path  
from typing import Tuple, Optional  
import torch  
from torch.utils.data import DataLoader, Dataset  
from torchvision.datasets import ImageFolder, FakeData  
import torchvision.transforms.v2 as T

def get\_transforms(  
    image\_size: Tuple\[int, int\] \= (224, 224),  
    is\_training: bool \= True  
) \-\> T.Compose:  
    """  
    Constructs TorchVision v2 transformation pipelines for ResNet101.  
      
    Args:  
        image\_size: Tuple indicating target height and width.  
        is\_training: If True, returns augmentation pipeline; else evaluation pipeline.  
      
    Returns:  
        T.Compose pipeline.  
    """  
    if is\_training:  
        return T.Compose(\[  
            T.ToImage(),  
            T.RandomResizedCrop(size=image\_size, scale=(0.8, 1.0), antialias=True),  
            T.RandomHorizontalFlip(p=0.5),  
            T.ToDtype(torch.float32, scale=True),  
            T.Normalize(mean=\[0.485, 0.456, 0.406\], std=\[0.229, 0.224, 0.225\])  
        \])  
    else:  
        return T.Compose(\[  
            T.ToImage(),  
            T.Resize(size=(256, 256), antialias=True),  
            T.CenterCrop(size=image\_size),  
            T.ToDtype(torch.float32, scale=True),  
            T.Normalize(mean=\[0.485, 0.456, 0.406\], std=\[0.229, 0.224, 0.225\])  
        \])

def create\_dataloaders(  
    data\_dir: Optional\[str\] \= None,  
    batch\_size: int \= 32,  
    num\_workers: int \= 4,  
    image\_size: Tuple\[int, int\] \= (224, 224\)  
) \-\> Tuple\[DataLoader, DataLoader, int\]:  
    """  
    Creates production DataLoaders for training and validation sets.  
    Falls back to synthetic data if data\_dir is None or invalid.  
    """  
    train\_transform \= get\_transforms(image\_size=image\_size, is\_training=True)  
    val\_transform \= get\_transforms(image\_size=image\_size, is\_training=False)

    if data\_dir and Path(data\_dir).exists():  
        train\_path \= Path(data\_dir) / "train"  
        val\_path \= Path(data\_dir) / "val"  
          
        train\_dataset: Dataset \= ImageFolder(root=str(train\_path), transform=train\_transform)  
        val\_dataset: Dataset \= ImageFolder(root=str(val\_path), transform=val\_transform)  
        num\_classes \= len(train\_dataset.classes) \# type: ignore  
    else:  
        print("\[INFO\] Data directory not found or unspecified. Synthetic datasets created.")  
        num\_classes \= 10  
        train\_dataset \= FakeData(  
            size=200,  
            image\_size=(3, image\_size\[0\], image\_size\[1\]),  
            num\_classes=num\_classes,  
            transform=train\_transform  
        )  
        val\_dataset \= FakeData(  
            size=50,  
            image\_size=(3, image\_size\[0\], image\_size\[1\]),  
            num\_classes=num\_classes,  
            transform=val\_transform  
        )

    train\_loader \= DataLoader(  
        train\_dataset,  
        batch\_size=batch\_size,  
        shuffle=True,  
        num\_workers=num\_workers,  
        pin\_memory=torch.cuda.is\_available(),  
        drop\_last=True  
    )

    val\_loader \= DataLoader(  
        val\_dataset,  
        batch\_size=batch\_size,  
        shuffle=False,  
        num\_workers=num\_workers,  
        pin\_memory=torch.cuda.is\_available(),  
        drop\_last=False  
    )

    return train\_loader, val\_loader, num\_classes

if \_\_name\_\_ \== "\_\_main\_\_":  
    t\_loader, v\_loader, n\_cls \= create\_dataloaders(data\_dir=None, batch\_size=16)  
    images, labels \= next(iter(t\_loader))  
    print(f"\[SUCCESS\] Dataset Pipeline Verified.")  
    print(f"  Batch shape: {images.shape}")  
    print(f"  Labels shape: {labels.shape}")  
    print(f"  Number of classes: {n\_cls}")

### **utils.py**

"""  
Utility functions for seed initialization, logging, device management, and metrics calculation.  
"""

import os  
import random  
import logging  
import numpy as np  
import torch

def set\_seed(seed: int \= 42\) \-\> None:  
    """  
    Sets random seeds across random, numpy, and torch for reproducibility.  
    """  
    random.seed(seed)  
    os.environ\['PYTHONHASHSEED'\] \= str(seed)  
    np.random.seed(seed)  
    torch.manual\_seed(seed)  
    torch.cuda.manual\_seed(seed)  
    torch.cuda.manual\_seed\_all(seed)  
    torch.backends.cudnn.deterministic \= True  
    torch.backends.cudnn.benchmark \= False

def get\_device() \-\> torch.device:  
    """  
    Resolves available compute accelerator (CUDA \-\> MPS \-\> CPU).  
    """  
    if torch.cuda.is\_available():  
        return torch.device("cuda")  
    elif torch.backends.mps.is\_available():  
        return torch.device("mps")  
    else:  
        return torch.device("cpu")

def setup\_logger(name: str \= "ResNet101\_Logger") \-\> logging.Logger:  
    """  
    Configures standard application logger.  
    """  
    logger \= logging.getLogger(name)  
    logger.setLevel(logging.INFO)  
    if not logger.handlers:  
        ch \= logging.StreamHandler()  
        formatter \= logging.Formatter('\[%(asctime)s\] \[%(levelname)s\] \- %(message)s', datefmt='%Y-%m-%d %H:%M:%S')  
        ch.setFormatter(formatter)  
        logger.addHandler(ch)  
    return logger

def count\_parameters(model: torch.nn.Module) \-\> Tuple\[int, int\]:  
    """  
    Calculates total and trainable parameter counts.  
    """  
    total \= sum(p.numel() for p in model.parameters())  
    trainable \= sum(p.numel() for p in model.parameters() if p.requires\_grad)  
    return total, trainable

if \_\_name\_\_ \== "\_\_main\_\_":  
    set\_seed(42)  
    device \= get\_device()  
    logger \= setup\_logger()  
    logger.info(f"Target device resolved: {device}")

### **train.py**

"""  
Main training loop for ResNet101 transfer learning and staged fine-tuning.  
Demonstrates layer freezing, cosine scheduling with warmup, and mixed precision.  
"""

import math  
from pathlib import Path  
from typing import Dict, Any  
import torch  
import torch.nn as nn  
from torchvision.models import resnet101, ResNet101\_Weights

from dataset import create\_dataloaders  
from utils import set\_seed, get\_device, setup\_logger, count\_parameters

def build\_resnet101\_model(num\_classes: int, freeze\_backbone: bool \= True) \-\> nn.Module:  
    """  
    Constructs ResNet101 model with pre-trained ImageNet weights and customized FC head.  
    """  
    weights \= ResNet101\_Weights.DEFAULT  
    model \= resnet101(weights=weights)

    if freeze\_backbone:  
        for param in model.parameters():  
            param.requires\_grad \= False

    \# Replace classification head  
    in\_features \= model.fc.in\_features  
    model.fc \= nn.Sequential(  
        nn.Dropout(p=0.3),  
        nn.Linear(in\_features, num\_classes)  
    )  
    return model

def unfreeze\_stage4\_and\_3(model: nn.Module) \-\> None:  
    """  
    Unfreezes Stage 4 (conv5\_x) and Stage 3 (conv4\_x) bottleneck blocks for fine-tuning.  
    """  
    \# Unfreeze layer4 (Stage 4\) and layer3 (Stage 3\)  
    for name, child in model.named\_children():  
        if name in \['layer3', 'layer4', 'fc'\]:  
            for param in child.parameters():  
                param.requires\_grad \= True

def train\_epoch(  
    model: nn.Module,  
    loader: torch.utils.data.DataLoader,  
    criterion: nn.Module,  
    optimizer: torch.optim.Optimizer,  
    scaler: torch.amp.GradScaler,  
    device: torch.device,  
    use\_amp: bool  
) \-\> float:  
    model.train()  
    running\_loss \= 0.0

    for images, targets in loader:  
        images, targets \= images.to(device), targets.to(device)  
        optimizer.zero\_grad()

        with torch.amp.autocast(device\_type=device.type, enabled=use\_amp):  
            outputs \= model(images)  
            loss \= criterion(outputs, targets)

        scaler.scale(loss).backward()  
        scaler.step(optimizer)  
        scaler.update()

        running\_loss \+= loss.item() \* images.size(0)

    return running\_loss / len(loader.dataset) \# type: ignore

def run\_training\_pipeline() \-\> None:  
    set\_seed(42)  
    logger \= setup\_logger()  
    device \= get\_device()  
    use\_amp \= (device.type \== "cuda")

    \# Hyperparameters  
    batch\_size \= 16  
    epochs\_phase1 \= 2  
    epochs\_phase2 \= 2  
    lr\_phase1 \= 1e-3  
    lr\_phase2 \= 1e-4

    train\_loader, val\_loader, num\_classes \= create\_dataloaders(batch\_size=batch\_size)  
    model \= build\_resnet101\_model(num\_classes=num\_classes, freeze\_backbone=True)  
    model.to(device)

    total\_params, trainable\_params \= count\_parameters(model)  
    logger.info(f"Initialized ResNet101 Phase 1\. Total Params: {total\_params:,} | Trainable: {trainable\_params:,}")

    criterion \= nn.CrossEntropyLoss()  
    optimizer \= torch.optim.AdamW(model.fc.parameters(), lr=lr\_phase1, weight\_decay=1e-2)  
    scaler \= torch.amp.GradScaler('cuda', enabled=use\_amp)

    \# Phase 1: Feature Extraction  
    logger.info("--- Starting Phase 1: Feature Extractor Training \---")  
    for epoch in range(epochs\_phase1):  
        loss \= train\_epoch(model, train\_loader, criterion, optimizer, scaler, device, use\_amp)  
        logger.info(f"Phase 1 \- Epoch \[{epoch+1}/{epochs\_phase1}\] Loss: {loss:.4f}")

    \# Phase 2: Staged Fine-Tuning  
    logger.info("--- Starting Phase 2: Staged Fine-Tuning (Unfreezing Stage 3 & 4\) \---")  
    unfreeze\_stage4\_and\_3(model)  
      
    total\_params, trainable\_params \= count\_parameters(model)  
    logger.info(f"Unfrozen Stage 3 & 4\. Total Params: {total\_params:,} | Trainable: {trainable\_params:,}")

    optimizer\_ft \= torch.optim.AdamW(\[  
        {'params': model.layer3.parameters(), 'lr': lr\_phase2 \* 0.1},  
        {'params': model.layer4.parameters(), 'lr': lr\_phase2 \* 0.1},  
        {'params': model.fc.parameters(), 'lr': lr\_phase2}  
    \], weight\_decay=1e-2)

    scheduler \= torch.optim.lr\_scheduler.CosineAnnealingLR(optimizer\_ft, T\_max=epochs\_phase2)

    for epoch in range(epochs\_phase2):  
        loss \= train\_epoch(model, train\_loader, criterion, optimizer\_ft, scaler, device, use\_amp)  
        scheduler.step()  
        logger.info(f"Phase 2 \- Epoch \[{epoch+1}/{epochs\_phase2}\] Loss: {loss:.4f} | LR: {scheduler.get\_last\_lr()\[0\]:.6f}")

    \# Save artifact  
    output\_path \= Path("resnet101\_checkpoint.pt")  
    torch.save({  
        'model\_state\_dict': model.state\_dict(),  
        'num\_classes': num\_classes  
    }, output\_path)  
    logger.info(f"\[SUCCESS\] Saved model checkpoint to {output\_path}")

if \_\_name\_\_ \== "\_\_main\_\_":  
    run\_training\_pipeline()

### **evaluate.py**

"""  
Evaluation module calculating Top-1 and Top-5 accuracy metrics over validation datasets.  
"""

from typing import Tuple  
import torch  
import torch.nn as nn  
from torchvision.models import resnet101

from dataset import create\_dataloaders  
from utils import get\_device, setup\_logger

@torch.no\_grad()  
def evaluate\_accuracy(  
    model: nn.Module,  
    loader: torch.utils.data.DataLoader,  
    device: torch.device  
) \-\> Tuple\[float, float\]:  
    """  
    Computes Top-1 and Top-5 classification accuracy percentages.  
    """  
    model.eval()  
    correct\_top1 \= 0  
    correct\_top5 \= 0  
    total\_samples \= 0

    for images, targets in loader:  
        images, targets \= images.to(device), targets.to(device)  
        outputs \= model(images)

        \# Top-5 and Top-1 targets  
        maxk \= min(5, outputs.size(1))  
        \_, pred \= outputs.topk(maxk, dim=1, largest=True, sorted=True)  
        pred \= pred.t()  
        correct \= pred.eq(targets.view(1, \-1).expand\_as(pred))

        correct\_top1 \+= correct\[0\].sum().item()  
        correct\_top5 \+= correct\[:maxk\].reshape(-1).float().sum().item()  
        total\_samples \+= targets.size(0)

    top1\_acc \= (correct\_top1 / total\_samples) \* 100.0  
    top5\_acc \= (correct\_top5 / total\_samples) \* 100.0  
    return top1\_acc, top5\_acc

if \_\_name\_\_ \== "\_\_main\_\_":  
    logger \= setup\_logger()  
    device \= get\_device()  
    \_, val\_loader, num\_classes \= create\_dataloaders(batch\_size=16)

    \# Initialize model backbone  
    model \= resnet101(weights=None)  
    model.fc \= nn.Linear(model.fc.in\_features, num\_classes)  
      
    checkpoint \= torch.load("resnet101\_checkpoint.pt", map\_location=device, weights\_only=True)  
    model.load\_state\_dict(checkpoint\['model\_state\_dict'\])  
    model.to(device)

    top1, top5 \= evaluate\_accuracy(model, val\_loader, device)  
    logger.info(f"\[EVALUATION RESULTS\] Top-1 Accuracy: {top1:.2f}% | Top-5 Accuracy: {top5:.2f}%")

### **inference.py**

"""  
Inference engine executing batch or single-image classification predictions.  
"""

from typing import List, Tuple  
import torch  
import torch.nn as nn  
from PIL import Image  
import torchvision.transforms.v2 as T  
from torchvision.models import resnet101

from utils import get\_device

class ResNet101Inferencer:  
    """  
    Production inference engine wrapper for ResNet101 models.  
    """  
    def \_\_init\_\_(self, checkpoint\_path: str, device: torch.device):  
        self.device \= device  
        self.transform \= T.Compose(\[  
            T.ToImage(),  
            T.Resize(size=(256, 256), antialias=True),  
            T.CenterCrop(size=(224, 224)),  
            T.ToDtype(torch.float32, scale=True),  
            T.Normalize(mean=\[0.485, 0.456, 0.406\], std=\[0.229, 0.224, 0.225\])  
        \])  
          
        checkpoint \= torch.load(checkpoint\_path, map\_location=self.device, weights\_only=True)  
        num\_classes \= checkpoint\['num\_classes'\]  
          
        self.model \= resnet101(weights=None)  
        self.model.fc \= nn.Linear(self.model.fc.in\_features, num\_classes)  
        self.model.load\_state\_dict(checkpoint\['model\_state\_dict'\])  
        self.model.to(self.device)  
        self.model.eval()

    @torch.no\_grad()  
    def predict(self, image: Image.Image, top\_k: int \= 3\) \-\> List\[Tuple\[int, float\]\]:  
        """  
        Executes inference for a single PIL image.  
          
        Returns:  
            List of tuples: \[(class\_idx, confidence\_score), ...\]  
        """  
        tensor\_img \= self.transform(image).unsqueeze(0).to(self.device)  
        logits \= self.model(tensor\_img)  
        probabilities \= torch.softmax(logits, dim=1)  
          
        top\_probs, top\_indices \= torch.topk(probabilities, k=top\_k, dim=1)  
          
        results \= \[  
            (idx.item(), prob.item())  
            for idx, prob in zip(top\_indices\[0\], top\_probs\[0\])  
        \]  
        return results

if \_\_name\_\_ \== "\_\_main\_\_":  
    device \= get\_device()  
    \# Create dummy PIL Image  
    dummy\_img \= Image.new('RGB', (300, 300), color='blue')  
      
    inferencer \= ResNet101Inferencer(checkpoint\_path="resnet101\_checkpoint.pt", device=device)  
    predictions \= inferencer.predict(dummy\_img, top\_k=3)  
      
    print("\[SUCCESS\] ResNet101 Prediction Results:")  
    for rank, (cls\_idx, prob) in enumerate(predictions, 1):  
        print(f"  Rank {rank}: Class {cls\_idx} | Confidence: {prob:.4f}")

### **export\_onnx.py**

"""  
Exports PyTorch ResNet101 models to ONNX format and validates model structure.  
"""

from pathlib import Path  
import torch  
import torch.nn as nn  
from torchvision.models import resnet101  
import onnx  
import onnxruntime as ort

from utils import setup\_logger

def export\_to\_onnx(checkpoint\_path: str, output\_onnx\_path: str) \-\> None:  
    logger \= setup\_logger()  
    device \= torch.device("cpu")

    checkpoint \= torch.load(checkpoint\_path, map\_location=device, weights\_only=True)  
    num\_classes \= checkpoint\['num\_classes'\]

    model \= resnet101(weights=None)  
    model.fc \= nn.Linear(model.fc.in\_features, num\_classes)  
    model.load\_state\_dict(checkpoint\['model\_state\_dict'\])  
    model.eval()

    dummy\_input \= torch.randn(1, 3, 224, 224, device=device)

    \# Export configuration  
    torch.onnx.export(  
        model,  
        dummy\_input,  
        output\_onnx\_path,  
        export\_params=True,  
        opset\_version=17,  
        do\_constant\_folding=True,  
        input\_names=\['input'\],  
        output\_names=\['output'\],  
        dynamic\_axes={  
            'input': {0: 'batch\_size'},  
            'output': {0: 'batch\_size'}  
        }  
    )  
    logger.info(f"\[SUCCESS\] ONNX Model exported to: {output\_onnx\_path}")

    \# Validation  
    onnx\_model \= onnx.load(output\_onnx\_path)  
    onnx.checker.check\_model(onnx\_model)  
    logger.info("\[SUCCESS\] ONNX Integrity Check Passed.")

    \# Runtime Test  
    ort\_session \= ort.InferenceSession(output\_onnx\_path)  
    ort\_inputs \= {ort\_session.get\_inputs()\[0\].name: dummy\_input.numpy()}  
    ort\_outs \= ort\_session.run(None, ort\_inputs)  
    logger.info(f"\[SUCCESS\] ONNX Runtime Test Execution Successful. Output shape: {ort\_outs\[0\].shape}")

if \_\_name\_\_ \== "\_\_main\_\_":  
    export\_to\_onnx("resnet101\_checkpoint.pt", "resnet101.onnx")

## **5\. TensorFlow 2.21 / Keras 3 Production Pipeline**

### **Repository Structure**

resnet101\_keras/  
├── data\_pipeline.py  
├── callbacks.py  
├── transfer\_learning.py  
├── fine\_tuning.py  
├── evaluate.py  
└── inference.py

### **data\_pipeline.py**

"""  
tf.data Pipeline module for modern Keras 3 / TensorFlow 2.21 implementations.  
Applies asynchronous loading, prefetching, and Keras preprocessing layers.  
"""

import os  
from typing import Tuple, Optional  
import tensorflow as tf  
import keras

def create\_dataset\_pipeline(  
    data\_dir: Optional\[str\] \= None,  
    batch\_size: int \= 32,  
    image\_size: Tuple\[int, int\] \= (224, 224\)  
) \-\> Tuple\[tf.data.Dataset, tf.data.Dataset, int\]:  
    """  
    Creates tf.data input pipelines. Uses synthetic tensors if directory is unavailable.  
    """  
    if data\_dir and os.path.exists(data\_dir):  
        train\_ds \= keras.utils.image\_dataset\_from\_directory(  
            os.path.join(data\_dir, "train"),  
            image\_size=image\_size,  
            batch\_size=batch\_size,  
            label\_mode="int"  
        )  
        val\_ds \= keras.utils.image\_dataset\_from\_directory(  
            os.path.join(data\_dir, "val"),  
            image\_size=image\_size,  
            batch\_size=batch\_size,  
            label\_mode="int"  
        )  
        num\_classes \= len(train\_ds.class\_names)  
    else:  
        print("\[INFO\] Local data path invalid. Constructing synthetic tf.data pipeline.")  
        num\_classes \= 10  
        x\_train \= tf.random.uniform((128, image\_size\[0\], image\_size\[1\], 3), maxval=255)  
        y\_train \= tf.random.uniform((128,), maxval=num\_classes, dtype=tf.int32)  
          
        x\_val \= tf.random.uniform((32, image\_size\[0\], image\_size\[1\], 3), maxval=255)  
        y\_val \= tf.random.uniform((32,), maxval=num\_classes, dtype=tf.int32)

        train\_ds \= tf.data.Dataset.from\_tensor\_slices((x\_train, y\_train)).batch(batch\_size)  
        val\_ds \= tf.data.Dataset.from\_tensor\_slices((x\_val, y\_val)).batch(batch\_size)

    \# Preprocessing layers  
    preprocess\_input \= keras.applications.resnet.preprocess\_input

    def prepare\_data(x, y):  
        x \= preprocess\_input(x)  
        return x, y

    AUTOTUNE \= tf.data.AUTOTUNE  
    train\_ds \= train\_ds.map(prepare\_data, num\_parallel\_calls=AUTOTUNE).prefetch(buffer\_size=AUTOTUNE)  
    val\_ds \= val\_ds.map(prepare\_data, num\_parallel\_calls=AUTOTUNE).prefetch(buffer\_size=AUTOTUNE)

    return train\_ds, val\_ds, num\_classes

if \_\_name\_\_ \== "\_\_main\_\_":  
    t\_ds, v\_ds, n\_classes \= create\_dataset\_pipeline(data\_dir=None, batch\_size=16)  
    for imgs, lbls in t\_ds.take(1):  
        print(f"\[SUCCESS\] tf.data Pipeline Verified.")  
        print(f"  Images batch shape: {imgs.shape}")  
        print(f"  Labels batch shape: {lbls.shape}")

### **callbacks.py**

"""  
Custom callback utilities for model checkpointing, early stopping, and learning rate schedules.  
"""

import keras

def get\_production\_callbacks(checkpoint\_path: str \= "resnet101\_keras.keras") \-\> list:  
    """  
    Constructs standard callback suite for production training runs.  
    """  
    callbacks \= \[  
        keras.callbacks.ModelCheckpoint(  
            filepath=checkpoint\_path,  
            monitor="val\_loss",  
            save\_best\_only=True,  
            verbose=1  
        ),  
        keras.callbacks.EarlyStopping(  
            monitor="val\_loss",  
            patience=5,  
            restore\_best\_weights=True,  
            verbose=1  
        ),  
        keras.callbacks.ReduceLROnPlateau(  
            monitor="val\_loss",  
            factor=0.2,  
            patience=2,  
            min\_lr=1e-6,  
            verbose=1  
        ),  
        keras.callbacks.TensorBoard(  
            log\_dir="./logs\_resnet101",  
            histogram\_freq=1  
        )  
    \]  
    return callbacks

### **transfer\_learning.py**

"""  
Phase 1: Instantiates ResNet101 base feature extractor and trains custom classification head.  
"""

import keras  
from keras import layers  
from data\_pipeline import create\_dataset\_pipeline  
from callbacks import get\_production\_callbacks

def build\_resnet101\_transfer\_model(input\_shape: tuple, num\_classes: int) \-\> keras.Model:  
    """  
    Constructs Keras 3 ResNet101 functional model.  
    """  
    \# Configure Mixed Precision Policy  
    keras.mixed\_precision.set\_global\_policy("mixed\_float16")

    base\_model \= keras.applications.ResNet101(  
        include\_top=False,  
        weights="imagenet",  
        input\_shape=input\_shape  
    )  
    base\_model.trainable \= False

    inputs \= keras.Input(shape=input\_shape)  
    x \= base\_model(inputs, training=False)  
    x \= layers.GlobalAveragePooling2D()(x)  
    x \= layers.Dropout(0.3)(x)  
      
    \# Cast output layer back to float32 for numerical stability in softmax calculation  
    outputs \= layers.Dense(num\_classes, activation="softmax", dtype="float32")(x)

    model \= keras.Model(inputs, outputs, name="ResNet101\_Transfer\_Learning")  
    return model

def run\_phase1\_training() \-\> None:  
    batch\_size \= 16  
    image\_shape \= (224, 224, 3\)

    train\_ds, val\_ds, num\_classes \= create\_dataset\_pipeline(batch\_size=batch\_size)  
    model \= build\_resnet101\_transfer\_model(input\_shape=image\_shape, num\_classes=num\_classes)

    model.compile(  
        optimizer=keras.optimizers.AdamW(learning\_rate=1e-3, weight\_decay=1e-2),  
        loss=keras.losses.SparseCategoricalCrossentropy(),  
        metrics=\["accuracy"\]  
    )

    model.summary()  
    callbacks \= get\_production\_callbacks("resnet101\_phase1.keras")

    print("--- Phase 1: Training Classification Head \---")  
    model.fit(  
        train\_ds,  
        validation\_data=val\_ds,  
        epochs=2,  
        callbacks=callbacks  
    )

if \_\_name\_\_ \== "\_\_main\_\_":  
    run\_phase1\_training()

### **fine\_tuning.py**

"""  
Phase 2: Unfreezes Stage 3 (conv4\_x) and Stage 4 (conv5\_x) bottleneck blocks for low LR fine-tuning.  
"""

import keras  
from data\_pipeline import create\_dataset\_pipeline  
from callbacks import get\_production\_callbacks

def unfreeze\_resnet101\_layers(model: keras.Model, unfreeze\_from\_layer\_name: str \= "conv4\_block1\_out") \-\> keras.Model:  
    """  
    Unfreezes layers starting from a specified layer name.  
    """  
    \# Locate backbone inner model  
    base\_model \= None  
    for layer in model.layers:  
        if "resnet101" in layer.name.lower():  
            base\_model \= layer  
            break

    if base\_model is None:  
        base\_model \= model

    base\_model.trainable \= True  
    set\_trainable \= False

    for layer in base\_model.layers:  
        if layer.name \== unfreeze\_from\_layer\_name:  
            set\_trainable \= True  
          
        \# Keep Batch Normalization layers in inference mode to preserve pre-trained statistics  
        if isinstance(layer, keras.layers.BatchNormalization):  
            layer.trainable \= False  
        else:  
            layer.trainable \= set\_trainable

    return model

def run\_phase2\_fine\_tuning() \-\> None:  
    train\_ds, val\_ds, \_ \= create\_dataset\_pipeline(batch\_size=16)  
      
    \# Load Phase 1 saved weights  
    model \= keras.models.load\_model("resnet101\_phase1.keras")  
    model \= unfreeze\_resnet101\_layers(model, unfreeze\_from\_layer\_name="conv4\_block1\_out")

    \# Compile with low learning rate  
    model.compile(  
        optimizer=keras.optimizers.AdamW(learning\_rate=1e-5, weight\_decay=1e-4),  
        loss=keras.losses.SparseCategoricalCrossentropy(),  
        metrics=\["accuracy"\]  
    )

    callbacks \= get\_production\_callbacks("resnet101\_fine\_tuned.keras")

    print("--- Phase 2: Fine-Tuning Stage 3 & Stage 4 \---")  
    model.fit(  
        train\_ds,  
        validation\_data=val\_ds,  
        epochs=2,  
        callbacks=callbacks  
    )

if \_\_name\_\_ \== "\_\_main\_\_":  
    run\_phase2\_fine\_tuning()

### **evaluate.py**

"""  
Evaluation pipeline calculating Loss and Accuracy metrics over validation/test splits.  
"""

import keras  
from data\_pipeline import create\_dataset\_pipeline

def evaluate\_keras\_model(model\_path: str) \-\> None:  
    \_, val\_ds, \_ \= create\_dataset\_pipeline(batch\_size=16)  
    model \= keras.models.load\_model(model\_path)

    print(f"Evaluating Model: {model\_path}")  
    results \= model.evaluate(val\_ds, verbose=1)  
      
    metrics\_dict \= dict(zip(model.metrics\_names, results))  
    print(f"\[EVALUATION SUCCESS\]")  
    for metric\_name, val in metrics\_dict.items():  
        print(f"  {metric\_name}: {val:.4f}")

if \_\_name\_\_ \== "\_\_main\_\_":  
    evaluate\_keras\_model("resnet101\_phase1.keras")

### **inference.py**

"""  
Keras 3 Production Inference pipeline for ResNet101.  
"""

import numpy as np  
import keras  
from PIL import Image

class KerasResNet101Inferencer:  
    def \_\_init\_\_(self, model\_path: str):  
        self.model \= keras.models.load\_model(model\_path)  
        self.preprocess\_input \= keras.applications.resnet.preprocess\_input

    def predict\_image(self, image: Image.Image, top\_k: int \= 3\) \-\> list:  
        \# Resize image  
        img \= image.resize((224, 224))  
        img\_array \= keras.utils.img\_to\_array(img)  
        img\_array \= np.expand\_dims(img\_array, axis=0)  
        img\_array \= self.preprocess\_input(img\_array)

        predictions \= self.model.predict(img\_array, verbose=0)  
        top\_indices \= np.argsort(predictions\[0\])\[-top\_k:\]\[::-1\]  
          
        results \= \[(int(idx), float(predictions\[0\]\[idx\])) for idx in top\_indices\]  
        return results

if \_\_name\_\_ \== "\_\_main\_\_":  
    dummy\_img \= Image.new('RGB', (300, 300), color='green')  
    inferencer \= KerasResNet101Inferencer("resnet101\_phase1.keras")  
    preds \= inferencer.predict\_image(dummy\_img, top\_k=3)  
      
    print("\[SUCCESS\] Keras ResNet101 Prediction Results:")  
    for rank, (cls\_idx, prob) in enumerate(preds, 1):  
        print(f"  Rank {rank}: Class {cls\_idx} | Confidence: {prob:.4f}")

## **6\. Deployment & Inference Optimization**

### **PyTorch ONNX Runtime Deployment**

To achieve low inference latency, compile exported ONNX models using ONNX Runtime with CUDA Execution Provider:

import onnxruntime as ort  
import numpy as np

\# Session setup with optimization  
options \= ort.SessionOptions()  
options.graph\_optimization\_level \= ort.GraphOptimizationLevel.ORT\_ENABLE\_ALL

session \= ort.InferenceSession(  
    "resnet101.onnx",  
    options,  
    providers=\['CUDAExecutionProvider', 'CPUExecutionProvider'\]  
)

\# Execute inference  
input\_name \= session.get\_inputs()\[0\].name  
dummy\_tensor \= np.random.randn(1, 3, 224, 224).astype(np.float32)  
results \= session.run(None, {input\_name: dummy\_tensor})

### **TensorFlow Lite FP16 Quantization**

For embedded or server deployment on CPU/Edge hardware, convert Keras models using TensorFlow Lite FP16 Post-Training Quantization:

import tensorflow as tf

converter \= tf.lite.TFLiteConverter.from\_keras\_model(  
    tf.keras.models.load\_model("resnet101\_phase1.keras")  
)  
converter.optimizations \= \[tf.lite.Optimize.DEFAULT\]  
converter.target\_spec.supported\_types \= \[tf.float16\]

tflite\_fp16\_model \= converter.convert()

with open("resnet101\_fp16.tflite", "wb") as f:  
    f.write(tflite\_fp16\_model)  
print("\[SUCCESS\] Saved TFLite FP16 Model. File size reduced by \~50%.")

## **7\. Official References & Documentation**

> * **Original ResNet Paper**: [Deep Residual Learning for Image Recognition (He et al., 2015\)](https://arxiv.org/abs/1512.03385)  
> * **PyTorch Model Documentation**: [torchvision.models.resnet101](https://pytorch.org/vision/stable/models/generated/torchvision.models.resnet101.html)  
> * **Keras Application Documentation**: [keras.applications.ResNet101](https://www.google.com/search?q=https://keras.io/api/applications/resnet/%23resnet101-function)  
> * **TensorFlow Core API**: [TensorFlow v2.21 Documentation](https://www.tensorflow.org/api_docs/python/tf)  
> * **ONNX Specification**: [Open Neural Network Exchange Specification](https://onnx.ai/)

---

