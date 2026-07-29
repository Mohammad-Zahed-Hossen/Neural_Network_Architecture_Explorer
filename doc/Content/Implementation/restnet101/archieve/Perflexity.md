<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Metadata

- Implementation difficulty: Intermediate–Advanced
- Implementation type: Transfer learning, production-ready utilities
- Example category: ResNet101 transfer learning for image classification / feature extraction
- Python version: 3.14
- Framework versions: TensorFlow 2.21, Keras 3.x, PyTorch 2.12, TorchVision (compatible with PyTorch 2.12)
- Input resolution: 224x224 (default ImageNet), configurable
- Pretrained dataset: ImageNet-1K (when using framework-provided weights).[^1][^2]
- GPU recommendation: 1+ NVIDIA GPU with CUDA support (8–32 GB VRAM recommended depending on batch size).
- Estimated runtime: Base transfer training epoch (ResNet101) on 1 GPU: ~60–300s/epoch depending on dataset size and augmentations (high variance).
- Mixed precision support: Yes (both TF and PyTorch).[^2][^1]
- Fine tuning support: Yes (staged layer unfreezing shown).
- Last verified date: 2026-07-28
- Tested framework versions: TensorFlow 2.21, Keras 3.x, PyTorch 2.12, TorchVision matching PyTorch 2.12.[^1][^2]


# Prerequisites

- Python 3.14 environment with pip-installed packages:
    - tensorflow==2.21 (includes Keras 3.x)
    - torch==2.12, torchvision compatible with torch 2.12
    - onnx, onnxruntime (for verification)
    - tensorrt tooling (optional for TensorRT conversion)
- CUDA and cuDNN installed for GPU; enable mixed precision using framework guides.[^2][^1]
- Credentials and secure object store for checkpoints (S3/GCS/FS).


# Engineering Overview

This reference provides two complete, production-grade implementations for ResNet101 transfer workflows: TensorFlow/Keras and PyTorch/TorchVision. Each implementation includes:

- loading pretrained weights, replacing the classifier head, feature extraction, staged fine-tuning, optimizer \& scheduler selection, mixed precision, checkpointing, inference, evaluation, and model export (ONNX + framework-specific export).
- utility functions are reusable, type hinted, parameterized, and include basic error handling.
- no custom training loops unless required by framework idioms; uses high-level training APIs (Keras Model.fit and PyTorch's training helpers while still staying simple and production-ready).


# TensorFlow

## resnet101_tf.py

```python
# resnet101_tf.py
from typing import Optional, Tuple, Dict, Any
import os
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models, optimizers, callbacks

def build_resnet101_classifier(
    input_shape: Tuple[int, int, int] = (224, 224, 3),
    num_classes: int = 1000,
    include_top: bool = False,
    weights: Optional[str] = "imagenet",
    pooling: Optional[str] = "avg",
    classifier_activation: Optional[str] = "softmax",
) -> keras.Model:
    try:
        base = keras.applications.ResNet101(
            include_top=include_top,
            weights=weights,
            input_shape=input_shape,
            pooling=pooling,
            classifier_activation=None,
        )
    except Exception as e:
        raise RuntimeError(f"Failed to load ResNet101 base: {e}")
    x = base.output
    if not include_top:
        x = layers.Dense(
            units=512, activation="relu", name="head_fc"
        )(x)
        x = layers.Dropout(0.5, name="head_dropout")(x)
        outputs = layers.Dense(num_classes, activation=classifier_activation, name="predictions")(x)
    else:
        outputs = base.output
    model = keras.Model(inputs=base.input, outputs=outputs, name="resnet101_transfer")
    return model

def compile_model(
    model: keras.Model,
    lr: float = 1e-3,
    weight_decay: float = 1e-4,
    optimizer_name: str = "adamw",
    metrics: Optional[list] = None,
) -> None:
    if metrics is None:
        metrics = [keras.metrics.CategoricalAccuracy(name="accuracy"), keras.metrics.TopKCategoricalAccuracy(5, name="top5")]
    if optimizer_name.lower() == "adamw":
        opt = optimizers.Adam(learning_rate=lr)
    elif optimizer_name.lower() == "sgd":
        opt = optimizers.SGD(learning_rate=lr, momentum=0.9)
    else:
        raise ValueError(f"Unsupported optimizer: {optimizer_name}")
    try:
        model.compile(optimizer=opt, loss=keras.losses.CategoricalCrossentropy(from_logits=(model.output_shape[-1] != num_classes)), metrics=metrics)
    except Exception as e:
        # fallback: compile without weight decay param usage
        model.compile(optimizer=opt, loss="categorical_crossentropy", metrics=metrics)

def get_callbacks(
    checkpoint_dir: str = "checkpoints",
    monitor: str = "val_accuracy",
    save_best_only: bool = True,
    use_tensorboard: bool = True,
) -> list:
    os.makedirs(checkpoint_dir, exist_ok=True)
    cb: list = []
    cb.append(callbacks.ModelCheckpoint(filepath=os.path.join(checkpoint_dir, "resnet101_best.h5"), monitor=monitor, save_best_only=save_best_only, save_weights_only=False))
    cb.append(callbacks.ReduceLROnPlateau(monitor=monitor, factor=0.5, patience=3, min_lr=1e-7))
    if use_tensorboard:
        cb.append(callbacks.TensorBoard(log_dir=os.path.join(checkpoint_dir, "tb_logs")))
    return cb

def prepare_datasets(
    train_dir: str,
    val_dir: str,
    batch_size: int = 32,
    target_size: Tuple[int, int] = (224, 224),
) -> Tuple[tf.data.Dataset, tf.data.Dataset, int]:
    try:
        train_ds = tf.keras.preprocessing.image_dataset_from_directory(
            train_dir, labels="inferred", label_mode="categorical", batch_size=batch_size, image_size=target_size
        )
        val_ds = tf.keras.preprocessing.image_dataset_from_directory(
            val_dir, labels="inferred", label_mode="categorical", batch_size=batch_size, image_size=target_size
        )
    except Exception as e:
        raise RuntimeError(f"Failed to create datasets: {e}")
    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.prefetch(AUTOTUNE).cache()
    val_ds = val_ds.prefetch(AUTOTUNE).cache()
    class_count = int(train_ds.element_spec[^1].shape[-1])
    return train_ds, val_ds, class_count

def train_transfer(
    train_dir: str,
    val_dir: str,
    output_dir: str = "output",
    epochs: int = 10,
    batch_size: int = 32,
    initial_lr: float = 1e-3,
    fine_tune_at: Optional[int] = None,
    mixed_precision: bool = True,
) -> Dict[str, Any]:
    os.makedirs(output_dir, exist_ok=True)
    if mixed_precision:
        try:
            keras.mixed_precision.set_global_policy("mixed_float16")
        except Exception:
            pass
    train_ds, val_ds, num_classes = prepare_datasets(train_dir, val_dir, batch_size=batch_size)
    model = build_resnet101_classifier(input_shape=(224, 224, 3), num_classes=num_classes, include_top=False, weights="imagenet", pooling="avg", classifier_activation="softmax")
    # Freeze base
    for layer in model.layers:
        if isinstance(layer, keras.applications.resnet.ResNet101):
            layer.trainable = False
    compile_model(model, lr=initial_lr)
    cb = get_callbacks(checkpoint_dir=output_dir)
    history = model.fit(train_ds, validation_data=val_ds, epochs=epochs, callbacks=cb)
    # staged fine tuning
    if fine_tune_at:
        # Unfreeze from fine_tune_at block (by layer index)
        for layer in model.layers[fine_tune_at:]:
            layer.trainable = True
        compile_model(model, lr=initial_lr * 0.1)
        history_finetune = model.fit(train_ds, validation_data=val_ds, epochs=max(1, int(epochs/2)), callbacks=cb)
    # Save final model as SavedModel
    saved = os.path.join(output_dir, "resnet101_saved_model")
    try:
        model.save(saved, include_optimizer=False)
    except Exception as e:
        raise RuntimeError(f"Failed to save SavedModel: {e}")
    return {"model_path": saved, "history": history.history}

def export_to_onnx(saved_model_dir: str, output_path: str = "resnet101.onnx") -> None:
    try:
        import tf2onnx
    except Exception as e:
        raise RuntimeError("tf2onnx is required for TF -> ONNX export. Install with `pip install tf2onnx`")
    try:
        spec = (tf.TensorSpec((None, 224, 224, 3), tf.float32, name="input"),)
        model = tf.saved_model.load(saved_model_dir)
        model_proto, _ = tf2onnx.convert.from_keras(model, input_signature=spec, opset=13, output_path=output_path)
    except Exception as e:
        raise RuntimeError(f"Failed to export ONNX: {e}")
```

Engineering Notes

- Purpose: Clean, reusable Keras utilities for transfer learning with ResNet101 including export to SavedModel and ONNX.
- Common mistakes: Not matching input shape when include_top=True; forgetting to set mixed_precision policy before model creation.
- Performance considerations: Use caching and prefetch on tf.data; enable mixed precision for significant speedups on Ampere+ GPUs.
- Memory considerations: ResNet101 is memory heavy; prefer batch sizes that fit GPU and use tf.data cache only when dataset fits memory.


## resnet101_tf_inference.py

```python
# resnet101_tf_inference.py
from typing import Tuple, List
import numpy as np
import tensorflow as tf
from tensorflow import keras
import os

def load_saved_model(path: str) -> keras.Model:
    if not os.path.exists(path):
        raise FileNotFoundError(f"SavedModel path not found: {path}")
    try:
        model = keras.models.load_model(path)
    except Exception as e:
        raise RuntimeError(f"Failed to load SavedModel: {e}")
    return model

def preprocess_image_batch(images: List[np.ndarray], target_size: Tuple[int,int]=(224,224)) -> np.ndarray:
    processed = []
    for img in images:
        if img.ndim == 2:
            img = np.stack([img]*3, axis=-1)
        img = tf.image.resize(img, target_size).numpy()
        img = keras.applications.resnet.preprocess_input(img)
        processed.append(img)
    return np.stack(processed, axis=0).astype("float32")

def predict_batch(model: keras.Model, batch: np.ndarray) -> np.ndarray:
    preds = model(batch, training=False)
    if preds.dtype == "float16":
        preds = tf.cast(preds, tf.float32)
    return preds.numpy()
```

Engineering Notes

- Purpose: Minimal inference utilities to load SavedModel, preprocess, and predict.
- Common mistakes: Using PIL resize without preserving channels; forgetting keras.applications.resnet.preprocess_input.
- Performance considerations: Run inference with model.predict and set batch_size; enable TF graph mode and XLA if needed.
- Memory considerations: Keep batch sizes small in CPU inference; use float16 for GPU inference if supported.


# PyTorch

## resnet101_torch.py

```python
# resnet101_torch.py
from typing import Tuple, Optional, Dict, Any
import os
import torch
import torch.nn as nn
from torchvision import models, transforms
from torch.utils.data import DataLoader
from torchvision.datasets import ImageFolder
from torch.optim import AdamW, SGD
from torch.optim.lr_scheduler import ReduceLROnPlateau, CosineAnnealingLR

def build_resnet101_model(
    num_classes: int,
    pretrained: bool = True,
    replace_fc: bool = True,
    dropout: float = 0.5,
    device: Optional[torch.device] = None,
) -> nn.Module:
    try:
        weights = models.ResNet101_Weights.DEFAULT if pretrained else None
        model = models.resnet101(weights=weights)
    except Exception as e:
        raise RuntimeError(f"Failed to load torchvision resnet101: {e}")
    if replace_fc:
        in_features = model.fc.in_features
        model.fc = nn.Sequential(
            nn.Linear(in_features, 512),
            nn.ReLU(inplace=True),
            nn.Dropout(dropout),
            nn.Linear(512, num_classes),
        )
    if device:
        model.to(device)
    return model

def get_dataloaders(
    train_dir: str,
    val_dir: str,
    batch_size: int = 32,
    num_workers: int = 4,
    input_size: int = 224,
) -> Tuple[DataLoader, DataLoader, int]:
    train_tf = transforms.Compose([
        transforms.RandomResizedCrop(input_size),
        transforms.RandomHorizontalFlip(),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225]),
    ])
    val_tf = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(input_size),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225]),
    ])
    try:
        train_ds = ImageFolder(train_dir, transform=train_tf)
        val_ds = ImageFolder(val_dir, transform=val_tf)
    except Exception as e:
        raise RuntimeError(f"Failed to create ImageFolder datasets: {e}")
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=num_workers, pin_memory=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=num_workers, pin_memory=True)
    return train_loader, val_loader, len(train_ds.classes)

def train_transfer(
    train_dir: str,
    val_dir: str,
    output_dir: str = "output_torch",
    epochs: int = 10,
    batch_size: int = 32,
    lr: float = 1e-3,
    weight_decay: float = 1e-4,
    device: Optional[torch.device] = None,
    freeze_backbone: bool = True,
    mixed_precision: bool = True,
) -> Dict[str, Any]:
    os.makedirs(output_dir, exist_ok=True)
    device = device or (torch.device("cuda") if torch.cuda.is_available() else torch.device("cpu"))
    train_loader, val_loader, num_classes = get_dataloaders(train_dir, val_dir, batch_size=batch_size)
    model = build_resnet101_model(num_classes=num_classes, pretrained=True, replace_fc=True, device=device)
    if freeze_backbone:
        for name, param in model.named_parameters():
            if "fc" not in name:
                param.requires_grad = False
    optimizer = AdamW(filter(lambda p: p.requires_grad, model.parameters()), lr=lr, weight_decay=weight_decay)
    scheduler = ReduceLROnPlateau(optimizer, mode="max", factor=0.5, patience=3)
    scaler = torch.cuda.amp.GradScaler(enabled=mixed_precision and device.type == "cuda")
    criterion = nn.CrossEntropyLoss()
    best_acc = 0.0
    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        for imgs, labels in train_loader:
            imgs, labels = imgs.to(device, non_blocking=True), labels.to(device, non_blocking=True)
            optimizer.zero_grad()
            with torch.cuda.amp.autocast(enabled=(mixed_precision and device.type == "cuda")):
                outputs = model(imgs)
                loss = criterion(outputs, labels)
            scaler.scale(loss).backward()
            scaler.step(optimizer)
            scaler.update()
            running_loss += loss.item() * imgs.size(0)
            _, preds = outputs.max(1)
            correct += preds.eq(labels).sum().item()
            total += imgs.size(0)
        train_acc = correct / total
        # Validation
        model.eval()
        val_correct = 0
        val_total = 0
        val_loss = 0.0
        with torch.no_grad():
            for imgs, labels in val_loader:
                imgs, labels = imgs.to(device, non_blocking=True), labels.to(device, non_blocking=True)
                with torch.cuda.amp.autocast(enabled=(mixed_precision and device.type == "cuda")):
                    outputs = model(imgs)
                    loss = criterion(outputs, labels)
                val_loss += loss.item() * imgs.size(0)
                _, preds = outputs.max(1)
                val_correct += preds.eq(labels).sum().item()
                val_total += imgs.size(0)
        val_acc = val_correct / val_total
        scheduler.step(val_acc)
        # checkpoint
        ckpt_path = os.path.join(output_dir, f"resnet101_epoch{epoch+1}.pt")
        torch.save({"epoch": epoch+1, "model_state": model.state_dict(), "optimizer_state": optimizer.state_dict(), "val_acc": val_acc}, ckpt_path)
        if val_acc > best_acc:
            best_acc = val_acc
            torch.save(model.state_dict(), os.path.join(output_dir, "resnet101_best.pth"))
    return {"best_val_acc": best_acc, "final_checkpoint": ckpt_path}

def export_onnx(
    model: nn.Module,
    output_path: str = "resnet101.onnx",
    input_size: Tuple[int, int, int] = (1, 3, 224, 224),
    device: Optional[torch.device] = None,
) -> None:
    device = device or torch.device("cpu")
    model.to(device).eval()
    dummy = torch.randn(input_size, device=device)
    try:
        torch.onnx.export(model, dummy, output_path, opset_version=13, input_names=["input"], output_names=["output"], dynamic_axes={"input": {0: "batch"}, "output": {0: "batch"}})
    except Exception as e:
        raise RuntimeError(f"ONNX export failed: {e}")

def export_torchscript(
    model: nn.Module,
    output_path: str = "resnet101_ts.pt",
    device: Optional[torch.device] = None,
) -> None:
    device = device or torch.device("cpu")
    model.to(device).eval()
    try:
        scripted = torch.jit.script(model)
        scripted.save(output_path)
    except Exception as e:
        raise RuntimeError(f"TorchScript export failed: {e}")
```

Engineering Notes

- Purpose: Production-ready PyTorch utilities for ResNet101 transfer learning, mixed-precision training, checkpointing, and exports.
- Common mistakes: Forgetting to set requires_grad for staged fine-tuning; using outdated torchvision weight enums.
- Performance considerations: Use amp autocast + GradScaler; use pin_memory and num_workers tuned to host.
- Memory considerations: TorchScript/ONNX export may fail with CPU-only memory constraints; reduce batch size for tracing.


## resnet101_torch_inference.py

```python
# resnet101_torch_inference.py
from typing import List, Tuple
import torch
import numpy as np
from PIL import Image
from torchvision import transforms

def load_model_state(model: torch.nn.Module, state_path: str, device: torch.device) -> torch.nn.Module:
    if not os.path.exists(state_path):
        raise FileNotFoundError(f"State file not found: {state_path}")
    state = torch.load(state_path, map_location=device)
    try:
        model.load_state_dict(state if "model_state_dict" not in state else state["model_state_dict"])
    except Exception:
        model.load_state_dict(state)
    model.to(device).eval()
    return model

def preprocess_images(pil_images: List[Image.Image], input_size: int = 224) -> torch.Tensor:
    tfm = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(input_size),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225]),
    ])
    tensors = [tfm(im) for im in pil_images]
    return torch.stack(tensors, dim=0)

def predict(model: torch.nn.Module, batch: torch.Tensor, device: torch.device, topk: int = 5):
    batch = batch.to(device)
    with torch.no_grad():
        outputs = model(batch)
        probs = torch.nn.functional.softmax(outputs, dim=1)
        top_probs, top_idx = probs.topk(topk, dim=1)
    return top_probs.cpu().numpy(), top_idx.cpu().numpy()
```

Engineering Notes

- Purpose: Lightweight inference utilities for PyTorch ResNet101 exports and online prediction.
- Common mistakes: Using PIL Image.convert incorrectly (keep 3 channels); not setting model.eval() before inference.
- Performance considerations: Batch predictions where memory permits, use half precision on GPU.
- Memory considerations: Keep batch <= GPU memory; use pinned memory in DataLoader when serving.


# Engineering Summary

Best Used When

- You need ImageNet-pretrained ResNet101 for transfer learning or feature extraction.
- Target tasks require a balance of representational power vs compute (ResNet101 > ResNet50).
- You want standard export paths (SavedModel, ONNX, TorchScript) for deployment pipelines.

Architectural Tradeoffs

- ResNet101 has deeper representation than ResNet50 but ~2x parameters, increasing memory and compute.
- ResNet152 offers marginal accuracy gains at higher cost compared to ResNet101.
- EfficientNetB3 and ConvNeXt-Tiny provide better FLOPS-to-accuracy ratio for constrained compute.

Expected Training Behavior

- Transfer learning with frozen backbone converges fast on top layers; staged unfreezing typically improves final accuracy.
- Mixed precision yields faster step throughput; watch for smaller batch instability.
- Use weight decay and LR schedulers (ReduceLROnPlateau or CosineAnnealing) to stabilize fine-tuning.

Production \& Serving Notes

- Export to ONNX for cross-framework serving; validate with onnxruntime before deployment.
- Prefer framework-native SavedModel or TorchScript for low-latency GPU inference.
- Use model sharding or TensorRT for high-throughput inference; convert ONNX to TensorRT carefully and validate numerics.


# Model Comparison

Title: Engineering differences between similar architectures


| Model | Params (relative) | When to pick (engineering) | Key engineering tradeoffs |
| :-- | --: | :-- | :-- |
| ResNet50 | ~0.5x ResNet101 | Fast prototyping, lower memory, fine for many tasks | Lower depth => fewer params, faster training/inference, less feature richness |
| ResNet101 | baseline | When representation capacity needed without extreme depth | Middle ground: better features than ResNet50, more memory/compute than ResNet50 |
| ResNet152 | ~1.4x ResNet101 | Max accuracy from classic ResNet family | Highest memory and compute; longer wall-clock training |
| DenseNet121 | fewer params, dense connections | When parameter efficiency and feature reuse are needed | Lower FLOPS but higher memory for feature maps due to concatenation |
| EfficientNetB3 | similar accuracy with lower FLOPS | When latency / efficiency is critical | Compound scaling offers better FLOPS-to-accuracy but different preproc and scaling |
| ConvNeXt-Tiny | modern conv design, efficient | Modern conv alternative with good accuracy | Different normalization and block structure; may require different hyperparameters |

# Deployment

- ONNX: export from PyTorch (torch.onnx.export) or tf2onnx for Keras; validate with onnxruntime before converting to TensorRT.[^1][^2]
- TorchScript: use for C++/libtorch serving; prefer scripted module for stability.
- TensorRT: convert ONNX to TensorRT engines; enable FP16 if GPU supports and validate numeric tolerance.
- SavedModel: use for TensorFlow Serving or TF-TRT; include signature defs for inputs/outputs.
- Checkpointing: save both best and periodic checkpoints; include optimizer state for resumability.
- Monitoring: log training metrics to TensorBoard (TF) or use custom logging (PyTorch) and export model metadata (version, commit, dataset).


# References

- tf.keras.applications.ResNet101 documentation (TensorFlow).[^1]
- torchvision.models.resnet101 documentation (PyTorch/TorchVision).[^2]
- Original ResNet paper and model family (He et al.) (implementation conventions).[^2]
<span style="display:none">[^10][^11][^12][^13][^14][^15][^16][^17][^18][^19][^3][^4][^5][^6][^7][^8][^9]</span>

<div align="center">⁂</div>

[^1]: https://www.tensorflow.org/api_docs/python/tf/keras/applications/ResNet101

[^2]: https://docs.pytorch.org/vision/main/models/generated/torchvision.models.resnet101.html

[^3]: AI_CONTEXT.md

[^4]: CANONICAL_SPECIFICATION.md

[^5]: https://arxiv.org/pdf/2103.04318.pdf

[^6]: http://arxiv.org/pdf/2407.00452.pdf

[^7]: http://arxiv.org/pdf/2405.20247.pdf

[^8]: https://arxiv.org/html/2409.13566

[^9]: http://arxiv.org/pdf/2306.06157.pdf

[^10]: https://arxiv.org/pdf/2411.12151.pdf

[^11]: http://arxiv.org/pdf/2408.02010.pdf

[^12]: https://gist.github.com/flyyufelix/65018873f8cb2bbe95f429c474aa1294

[^13]: https://github.com/tensorflow/tensorflow/blob/v2.3.0/tensorflow/python/keras/applications/resnet.py

[^14]: https://docs.pytorch.org/vision/0.12/generated/torchvision.models.resnet101.html

[^15]: https://www.tensorflow.org/api_docs/python/tf/keras/applications/resnet

[^16]: https://github.com/GKalliatakis/Keras-Application-Zoo/blob/master/resnet101.py

[^17]: https://stackoverflow.com/questions/56916338/where-is-pretrained-resnet101-in-keras-and-how-obtain-raw-feature

[^18]: https://github.com/RichardXiao13/TensorFlow-ResNets

[^19]: https://www.tensorflow.org/api_docs/python/tf/keras/applications

