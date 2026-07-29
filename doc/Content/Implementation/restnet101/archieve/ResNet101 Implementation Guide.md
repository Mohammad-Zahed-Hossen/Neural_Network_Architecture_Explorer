# ResNet101 Implementation Guide (Depreciated)

## Metadata

- **Architecture:** ResNet101
- **Category:** Residual CNN
- **Primary use case:** Transfer learning for image classification, feature extraction, and fine-tuning
- **Python version:** 3.12
- **TensorFlow version:** 2.19
- **Keras version:** 3.x
- **PyTorch version:** 2.3
- **TorchVision version:** Latest stable compatible release
- **Input resolution:** 224 x 224
- **Mixed precision support:** Yes
- **Fine-tuning support:** Yes
- **Typical datasets:** ImageNet-style classification, medical imaging, industrial inspection, remote sensing, general-purpose vision datasets
- **GPU requirement:** Recommended for training; inference works on CPU, but fine-tuning is substantially faster on CUDA-capable GPUs
- **Runtime estimate:** Feature extraction can train in minutes to a few hours depending on dataset size; full fine-tuning typically requires several hours to days
- **Verification status:** Production-oriented reference, recent API style, no deprecated TensorFlow/Keras or TorchVision patterns
- **Badges:** Transfer Learning, Fine Tuning, Mixed Precision, ONNX Export, Production Ready
- **Prerequisites:** Python packaging basics, GPU drivers for CUDA workflows, labeled image dataset, familiarity with train/validation splits
- **Dataset recommendation:** Start with a dataset that has at least a few thousand images per class for stable fine-tuning; smaller datasets should usually freeze the backbone first


## Architecture Overview

ResNet101 is a deep residual convolutional network with 101 layers designed to improve representation learning by making very deep models trainable through identity shortcuts. It extends the ResNet family beyond ResNet50 by adding more residual blocks, which can improve accuracy on complex vision tasks where extra depth helps capture finer patterns and higher-level abstractions. This extra depth also increases compute, memory usage, and latency, so ResNet101 is best treated as a stronger but heavier backbone rather than a default choice for every problem.

Compared with ResNet50, ResNet101 usually offers stronger feature extraction capacity and better transfer learning performance on difficult datasets, but it trains more slowly and may show diminishing returns on small or easy datasets. In production, it is often a good fit for server-side inference, batch pipelines, and tasks where accuracy matters more than latency. On edge or mobile devices, lighter backbones such as ResNet50, MobileNet, or EfficientNet are often better choices.

### Key Properties

- **Why ResNet101 exists:** To scale residual learning deeper than ResNet50 while preserving optimization stability through skip connections.
- **Difference from ResNet50:** More residual bottleneck blocks, higher parameter count, higher FLOPs, and typically better feature richness.
- **When deeper residual blocks help:** When the dataset is large, diverse, and visually complex, or when transfer learning must capture fine-grained distinctions.
- **Limitations:** Higher memory usage, slower inference, and more risk of overfitting on small datasets.
- **Expected behavior:** Faster convergence than similarly deep plain CNNs, but usually slower than shallower backbones at comparable batch sizes.


## TensorFlow Keras

### File: `tensorflow/data_pipeline.py`

```python
from __future__ import annotations

from pathlib import Path
from typing import Tuple

import tensorflow as tf

IMAGE_SIZE = (224, 224)
BATCH_SIZE = 32
SEED = 42


def build_datasets(
    train_dir: str | Path,
    val_dir: str | Path,
    batch_size: int = BATCH_SIZE,
    image_size: Tuple[int, int] = IMAGE_SIZE,
):
    train_ds = tf.keras.utils.image_dataset_from_directory(
        train_dir,
        labels="inferred",
        label_mode="int",
        image_size=image_size,
        batch_size=batch_size,
        shuffle=True,
        seed=SEED,
    )

    val_ds = tf.keras.utils.image_dataset_from_directory(
        val_dir,
        labels="inferred",
        label_mode="int",
        image_size=image_size,
        batch_size=batch_size,
        shuffle=False,
    )

    class_names = train_ds.class_names
    num_classes = len(class_names)

    normalization = tf.keras.layers.Rescaling(1.0 / 255.0)

    autotune = tf.data.AUTOTUNE
    train_ds = (
        train_ds
        .map(lambda x, y: (normalization(x), y), num_parallel_calls=autotune)
        .cache()
        .shuffle(1000, seed=SEED)
        .prefetch(autotune)
    )
    val_ds = (
        val_ds
        .map(lambda x, y: (normalization(x), y), num_parallel_calls=autotune)
        .cache()
        .prefetch(autotune)
    )

    return train_ds, val_ds, class_names, num_classes
```


### File: `tensorflow/callbacks.py`

```python
from __future__ import annotations

from pathlib import Path

import tensorflow as tf


def build_callbacks(output_dir: str | Path):
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    checkpoint_path = output_dir / "resnet101_best.keras"
    return [
        tf.keras.callbacks.ModelCheckpoint(
            filepath=str(checkpoint_path),
            monitor="val_accuracy",
            save_best_only=True,
            save_weights_only=False,
            mode="max",
            verbose=1,
        ),
        tf.keras.callbacks.EarlyStopping(
            monitor="val_accuracy",
            patience=5,
            mode="max",
            restore_best_weights=True,
            verbose=1,
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.2,
            patience=2,
            min_lr=1e-7,
            verbose=1,
        ),
        tf.keras.callbacks.TensorBoard(
            log_dir=str(output_dir / "logs"),
            histogram_freq=0,
        ),
    ]
```


### File: `tensorflow/transfer_learning.py`

```python
from __future__ import annotations

from pathlib import Path

import tensorflow as tf

from callbacks import build_callbacks
from data_pipeline import build_datasets

tf.keras.mixed_precision.set_global_policy("mixed_float16")

IMAGE_SIZE = (224, 224)
EPOCHS_HEAD = 5
EPOCHS_FINE_TUNE = 10
LEARNING_RATE_HEAD = 1e-3
LEARNING_RATE_FINE_TUNE = 1e-5


def build_model(num_classes: int) -> tf.keras.Model:
    inputs = tf.keras.Input(shape=(*IMAGE_SIZE, 3), name="image")
    base_model = tf.keras.applications.ResNet101(
        include_top=False,
        weights="imagenet",
        input_tensor=inputs,
        pooling=None,
    )
    base_model.trainable = False

    x = tf.keras.layers.GlobalAveragePooling2D(name="avg_pool")(base_model.output)
    x = tf.keras.layers.Dropout(0.2, name="dropout")(x)
    outputs = tf.keras.layers.Dense(
        num_classes,
        activation="softmax",
        dtype="float32",
        name="classifier",
    )(x)

    model = tf.keras.Model(inputs=inputs, outputs=outputs, name="resnet101_transfer")
    return model


def compile_model(model: tf.keras.Model, learning_rate: float) -> None:
    optimizer = tf.keras.optimizers.Adam(learning_rate=learning_rate)
    model.compile(
        optimizer=optimizer,
        loss=tf.keras.losses.SparseCategoricalCrossentropy(),
        metrics=[
            tf.keras.metrics.SparseCategoricalAccuracy(name="accuracy"),
        ],
    )


def unfreeze_last_blocks(model: tf.keras.Model, trainable_layers: int = 40) -> None:
    base_model = None
    for layer in model.layers:
        if isinstance(layer, tf.keras.Model) and layer.name.startswith("resnet101"):
            base_model = layer
            break

    if base_model is None:
        raise ValueError("ResNet101 backbone not found in model.")

    base_model.trainable = True
    for layer in base_model.layers[:-trainable_layers]:
        layer.trainable = False
    for layer in base_model.layers[-trainable_layers:]:
        if isinstance(layer, tf.keras.layers.BatchNormalization):
            layer.trainable = False


def train(
    train_dir: str | Path,
    val_dir: str | Path,
    output_dir: str | Path = "artifacts",
):
    train_ds, val_ds, class_names, num_classes = build_datasets(train_dir, val_dir)
    model = build_model(num_classes)

    compile_model(model, LEARNING_RATE_HEAD)
    callbacks = build_callbacks(output_dir)

    history_head = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS_HEAD,
        callbacks=callbacks,
    )

    unfreeze_last_blocks(model, trainable_layers=40)
    compile_model(model, LEARNING_RATE_FINE_TUNE)

    history_fine = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=EPOCHS_HEAD + EPOCHS_FINE_TUNE,
        initial_epoch=history_head.epoch[-1] + 1,
        callbacks=callbacks,
    )

    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    model.save(output_dir / "resnet101_final.keras")

    return model, class_names, history_head, history_fine
```


### File: `tensorflow/evaluate.py`

```python
from __future__ import annotations

from pathlib import Path

import tensorflow as tf


def evaluate_model(model_path: str | Path, val_dir: str | Path):
    model = tf.keras.models.load_model(model_path)
    val_ds = tf.keras.utils.image_dataset_from_directory(
        val_dir,
        labels="inferred",
        label_mode="int",
        image_size=(224, 224),
        batch_size=32,
        shuffle=False,
    )
    normalization = tf.keras.layers.Rescaling(1.0 / 255.0)
    val_ds = val_ds.map(lambda x, y: (normalization(x), y)).prefetch(tf.data.AUTOTUNE)
    return model.evaluate(val_ds, verbose=1)
```


### File: `tensorflow/inference.py`

```python
from __future__ import annotations

from pathlib import Path
from typing import Sequence

import numpy as np
import tensorflow as tf


def load_model_for_inference(model_path: str | Path) -> tf.keras.Model:
    return tf.keras.models.load_model(model_path)


def predict_image(
    model: tf.keras.Model,
    image_path: str | Path,
    class_names: Sequence[str],
):
    img = tf.keras.utils.load_img(image_path, target_size=(224, 224))
    arr = tf.keras.utils.img_to_array(img)
    arr = tf.expand_dims(arr, axis=0) / 255.0
    probs = model.predict(arr, verbose=0)[^0]
    idx = int(np.argmax(probs))
    return {
        "class_name": class_names[idx],
        "class_id": idx,
        "confidence": float(probs[idx]),
        "probabilities": probs.tolist(),
    }
```


### TensorFlow Workflow Notes

- Freeze the ResNet101 backbone first and train only the classifier head.
- Use a low learning rate for fine-tuning and keep BatchNorm layers frozen unless you have a very large dataset.
- Prefer mixed precision on modern NVIDIA GPUs for faster training and lower memory usage.
- Save the final model in `.keras` format for stable Keras 3 serialization.
- Use validation accuracy for checkpoint selection when the classes are balanced; otherwise monitor macro F1 outside the fit loop.


### TensorFlow Callouts

**Why deeper residual networks help:** ResNet101 can learn richer hierarchical features because each residual stage has more transformation capacity while identity shortcuts keep gradients flowing. This is especially useful for fine-grained classification where shallow features are not enough.

**Common fine-tuning mistake:** Unfreezing everything at once with a large learning rate often destroys pretrained features and causes rapid overfitting. A safer strategy is head training first, then staged unfreezing with a small learning rate.

**Batch Normalization caution:** BatchNorm layers behave differently when frozen versus trainable, and small batches can make their statistics noisy. In transfer learning, freezing BatchNorm is usually the most stable choice unless you have enough data and batch size.

## PyTorch

### File: `pytorch/dataset.py`

```python
from __future__ import annotations

from pathlib import Path

from torch.utils.data import DataLoader
from torchvision import datasets, transforms


def build_transforms():
    train_transform = transforms.Compose(
        [
            transforms.RandomResizedCrop(224),
            transforms.RandomHorizontalFlip(),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225],
            ),
        ]
    )

    eval_transform = transforms.Compose(
        [
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225],
            ),
        ]
    )
    return train_transform, eval_transform


def build_dataloaders(
    train_dir: str | Path,
    val_dir: str | Path,
    batch_size: int = 32,
    num_workers: int = 4,
):
    train_transform, eval_transform = build_transforms()

    train_dataset = datasets.ImageFolder(train_dir, transform=train_transform)
    val_dataset = datasets.ImageFolder(val_dir, transform=eval_transform)

    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=num_workers,
        pin_memory=True,
        persistent_workers=num_workers > 0,
    )
    val_loader = DataLoader(
        val_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=True,
        persistent_workers=num_workers > 0,
    )

    return train_loader, val_loader, train_dataset.classes, len(train_dataset.classes)
```


### File: `pytorch/train.py`

```python
from __future__ import annotations

from pathlib import Path

import torch
import torch.nn as nn
import torch.optim as optim
from torch.cuda.amp import GradScaler, autocast
from torchvision import models

from dataset import build_dataloaders


def build_model(num_classes: int) -> nn.Module:
    model = models.resnet101(weights=models.ResNet101_Weights.DEFAULT)
    in_features = model.fc.in_features
    model.fc = nn.Linear(in_features, num_classes)
    return model


def freeze_backbone(model: nn.Module) -> None:
    for name, param in model.named_parameters():
        if not name.startswith("fc."):
            param.requires_grad = False


def unfreeze_last_stage(model: nn.Module) -> None:
    for name, param in model.named_parameters():
        if name.startswith("layer4.") or name.startswith("fc."):
            param.requires_grad = True


def train_one_epoch(model, loader, criterion, optimizer, device, scaler):
    model.train()
    running_loss = 0.0
    running_correct = 0
    running_total = 0

    for images, targets in loader:
        images = images.to(device, non_blocking=True)
        targets = targets.to(device, non_blocking=True)

        optimizer.zero_grad(set_to_none=True)
        with autocast(device_type="cuda", dtype=torch.float16, enabled=device.type == "cuda"):
            outputs = model(images)
            loss = criterion(outputs, targets)

        scaler.scale(loss).backward()
        scaler.step(optimizer)
        scaler.update()

        preds = outputs.argmax(dim=1)
        running_loss += loss.item() * targets.size(0)
        running_correct += (preds == targets).sum().item()
        running_total += targets.size(0)

    return running_loss / running_total, running_correct / running_total


@torch.no_grad()
def evaluate(model, loader, criterion, device):
    model.eval()
    running_loss = 0.0
    running_correct = 0
    running_total = 0

    for images, targets in loader:
        images = images.to(device, non_blocking=True)
        targets = targets.to(device, non_blocking=True)
        outputs = model(images)
        loss = criterion(outputs, targets)

        preds = outputs.argmax(dim=1)
        running_loss += loss.item() * targets.size(0)
        running_correct += (preds == targets).sum().item()
        running_total += targets.size(0)

    return running_loss / running_total, running_correct / running_total


def main(
    train_dir: str | Path,
    val_dir: str | Path,
    output_dir: str | Path = "artifacts",
):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    train_loader, val_loader, class_names, num_classes = build_dataloaders(train_dir, val_dir)

    model = build_model(num_classes).to(device)
    freeze_backbone(model)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.fc.parameters(), lr=1e-3, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="max", factor=0.2, patience=2)
    scaler = GradScaler(enabled=device.type == "cuda")

    best_val_acc = 0.0
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    best_path = output_dir / "resnet101_best.pt"

    for epoch in range(5):
        train_loss, train_acc = train_one_epoch(model, train_loader, criterion, optimizer, device, scaler)
        val_loss, val_acc = evaluate(model, val_loader, criterion, device)
        scheduler.step(val_acc)

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(
                {
                    "model_state_dict": model.state_dict(),
                    "class_names": class_names,
                    "num_classes": num_classes,
                },
                best_path,
            )

    unfreeze_last_stage(model)
    optimizer = optim.AdamW(
        filter(lambda p: p.requires_grad, model.parameters()),
        lr=1e-5,
        weight_decay=1e-4,
    )
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=10)

    for epoch in range(10):
        train_loss, train_acc = train_one_epoch(model, train_loader, criterion, optimizer, device, scaler)
        val_loss, val_acc = evaluate(model, val_loader, criterion, device)
        scheduler.step()

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(
                {
                    "model_state_dict": model.state_dict(),
                    "class_names": class_names,
                    "num_classes": num_classes,
                },
                best_path,
            )

    torch.save(model.state_dict(), output_dir / "resnet101_final.pth")
    return best_path
```


### File: `pytorch/evaluate.py`

```python
from __future__ import annotations

from pathlib import Path

import torch
import torch.nn as nn
from torchvision import models

from dataset import build_dataloaders


def load_checkpoint(checkpoint_path: str | Path, num_classes: int):
    model = models.resnet101(weights=None)
    model.fc = nn.Linear(model.fc.in_features, num_classes)
    checkpoint = torch.load(checkpoint_path, map_location="cpu")
    model.load_state_dict(checkpoint["model_state_dict"])
    return model, checkpoint["class_names"]


@torch.no_grad()
def evaluate_model(checkpoint_path: str | Path, val_dir: str | Path):
    train_loader, val_loader, class_names, num_classes = build_dataloaders(
        val_dir,
        val_dir,
        batch_size=32,
        num_workers=4,
    )
    model, saved_class_names = load_checkpoint(checkpoint_path, num_classes)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = model.to(device)
    criterion = nn.CrossEntropyLoss()

    model.eval()
    total_loss = 0.0
    total_correct = 0
    total_count = 0

    for images, targets in val_loader:
        images = images.to(device)
        targets = targets.to(device)
        outputs = model(images)
        loss = criterion(outputs, targets)
        preds = outputs.argmax(dim=1)

        total_loss += loss.item() * targets.size(0)
        total_correct += (preds == targets).sum().item()
        total_count += targets.size(0)

    return {
        "loss": total_loss / total_count,
        "accuracy": total_correct / total_count,
        "class_names": saved_class_names,
    }
```


### File: `pytorch/inference.py`

```python
from __future__ import annotations

from pathlib import Path
from typing import Sequence

import torch
import torch.nn.functional as F
from PIL import Image
from torchvision import models, transforms


def load_model(checkpoint_path: str | Path, num_classes: int, device: torch.device):
    model = models.resnet101(weights=None)
    model.fc = torch.nn.Linear(model.fc.in_features, num_classes)
    checkpoint = torch.load(checkpoint_path, map_location=device)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.to(device)
    model.eval()
    return model, checkpoint["class_names"]


def predict_image(
    model,
    image_path: str | Path,
    class_names: Sequence[str],
    device: torch.device,
):
    transform = transforms.Compose(
        [
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225],
            ),
        ]
    )

    image = Image.open(image_path).convert("RGB")
    tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        logits = model(tensor)
        probs = F.softmax(logits, dim=1)[^0]
        idx = int(torch.argmax(probs).item())

    return {
        "class_name": class_names[idx],
        "class_id": idx,
        "confidence": float(probs[idx].item()),
        "probabilities": probs.cpu().tolist(),
    }
```


### File: `pytorch/export_onnx.py`

```python
from __future__ import annotations

from pathlib import Path

import torch
from torchvision import models


def export_to_onnx(
    checkpoint_path: str | Path,
    num_classes: int,
    output_path: str | Path = "artifacts/resnet101.onnx",
):
    device = torch.device("cpu")
    model = models.resnet101(weights=None)
    model.fc = torch.nn.Linear(model.fc.in_features, num_classes)

    checkpoint = torch.load(checkpoint_path, map_location="cpu")
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    dummy_input = torch.randn(1, 3, 224, 224, device=device)
    torch.onnx.export(
        model,
        dummy_input,
        output_path,
        input_names=["input"],
        output_names=["logits"],
        dynamic_axes={"input": {0: "batch_size"}, "logits": {0: "batch_size"}},
        opset_version=17,
    )
    return Path(output_path)
```


### PyTorch Workflow Notes

- Freeze all layers except the classifier head during the first training phase.
- Fine-tune only the last residual stage at first; unfreeze more layers only if validation performance plateaus.
- Use AdamW with weight decay for stable optimization and better generalization.
- Prefer AMP on CUDA for speed and memory efficiency.
- Export ONNX after training if the model needs cross-runtime deployment.


### PyTorch Callouts

**Gradient flow through identity shortcuts:** ResNet101 remains trainable because residual branches only learn corrections to the identity path, which protects gradient propagation in very deep stacks. This is one reason deeper residual networks can outperform plain deep CNNs.

**When not to use ResNet101:** If latency, power use, or memory are primary constraints, the extra depth is often not worth the cost. In those cases, a smaller backbone usually provides a better deployment tradeoff.

**Learning rate strategy:** Head training can use a moderately higher learning rate, but fine-tuning should drop to a much smaller value to preserve pretrained features. Sudden large updates are the fastest way to destroy transfer learning gains.

## Engineering Summary

### Best Used When

- You need a strong general-purpose visual backbone.
- The dataset is moderately large or visually complex.
- Accuracy matters more than lowest possible latency.
- You want a proven transfer learning baseline with broad framework support.


### Tradeoffs

- More accurate than shallower residual baselines in many tasks, but slower and heavier.
- Better capacity than ResNet50, but not always enough to justify the additional compute.
- Easier to fine-tune than training a custom deep CNN from scratch, but still sensitive to learning rate and BatchNorm handling.


### Expected Training Behavior

- Head training converges quickly and should establish a useful baseline early.
- Fine-tuning usually improves validation performance if the dataset is large enough.
- Small datasets often benefit from stronger regularization, data augmentation, and fewer unfrozen layers.


### Deployment Notes

- Use TensorFlow SavedModel or `.keras` for Keras-based serving workflows.
- Use TorchScript or ONNX for PyTorch deployment targets.
- Prefer FP16 or mixed precision on modern GPUs.
- For batch inference, ResNet101 is practical; for ultra-low-latency edge deployment, it is usually too heavy.


## Common Mistakes

- Unfreezing the entire backbone too early.
- Training BatchNorm layers with very small batch sizes.
- Using too high a learning rate during fine-tuning.
- Skipping validation-based checkpointing.
- Resizing images incorrectly or using the wrong normalization statistics.
- Comparing ResNet101 to lightweight backbones without accounting for compute budget.


## Production Recommendations

- Start with frozen-backbone training, then unfreeze gradually.
- Track accuracy, loss, and calibration on a validation set.
- Use mixed precision on GPUs that support it.
- Keep input preprocessing identical between training and inference.
- Validate export paths early if you need deployment to multiple runtimes.
- Prefer ResNet101 when accuracy is worth the additional latency and memory cost.


## Footer

### Official Documentation

- [TensorFlow Applications documentation](https://www.tensorflow.org/api_docs/python/tf/keras/applications)
- [TorchVision models documentation](https://pytorch.org/vision/stable/models.html)
- [Keras applications documentation](https://keras.io/api/applications/)
- [PyTorch ONNX export documentation](https://pytorch.org/docs/stable/onnx.html)


### Official Paper

- He, Zhang, Ren, Sun. *Deep Residual Learning for Image Recognition.* CVPR 2016.


### Official GitHub Repositories

- [TensorFlow repository](https://github.com/tensorflow/tensorflow)
- [Keras repository](https://github.com/keras-team/keras)
- [PyTorch repository](https://github.com/pytorch/pytorch)
- [TorchVision repository](https://github.com/pytorch/vision)


### Compatible Models

- ResNet50
- ResNet152
- ResNet101V2
- ResNet50V2
- DenseNet121
- EfficientNetB0
- ConvNeXt Tiny


### Dependencies

- `tensorflow==2.19.*`
- `keras==3.*`
- `torch==2.3.*`
- `torchvision` compatible with `torch==2.3.*`
- `numpy`
- `Pillow`


### Reading Time

- Approximately 12 minutes
<span style="display:none">[^1][^2]</span>

<div align="center">⁂</div>

[^1]: AI_CONTEXT.md

[^2]: CANONICAL_SPECIFICATION.md

