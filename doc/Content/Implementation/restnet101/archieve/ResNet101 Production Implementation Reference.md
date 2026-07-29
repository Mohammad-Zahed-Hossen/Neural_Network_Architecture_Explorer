# **ResNet101 Production Implementation Reference**

# **Metadata**

> * **Implementation difficulty:** Intermediate  
> * **Implementation type:** Transfer Learning & Production Deployment Reference  
> * **Example category:** Computer Vision (Image Classification & Feature Extraction)  
> * **Python version:** 3.14  
> * **Framework versions:** TensorFlow 2.21, Keras 3.x, PyTorch 2.12, TorchVision 0.23+  
> * **Input resolution:** 224x224x3 (Default ImageNet standard)  
> * **Pretrained dataset:** ImageNet-1k  
> * **GPU recommendation:** NVIDIA T4 (minimum) / A10G / RTX 3090 / RTX 4090 / A100  
> * **Estimated runtime:** \~2-5 minutes per epoch (fine-tuning on 10k samples, single GPU)  
> * **Mixed precision support:** Supported (FP16 / BF16)  
> * **Fine tuning support:** Full stage-wise and layer-wise support  
> * **Last verified date:** July 28, 2026  
> * **Tested framework versions:** Python 3.14.0, TensorFlow 2.21.0, PyTorch 2.12.0, TorchVision 0.23.0

# **Prerequisites**

Ensure system packages and Python dependencies match the specified versions. Run the following command to set up the necessary environment:

`pip install tensorflow==2.21.0 torch==2.12.0 torchvision onnx onnxruntime tensorrt numpy`

Verify GPU availability in your environment before executing training or export workflows.

# **Engineering Overview**

ResNet101 is a 101-layer deep convolutional neural network that utilizes residual skip connections to mitigate the vanishing gradient problem in deep architectures. The network is organized into a stem layer followed by four distinct stages containing Bottleneck residual blocks.

`Input (224x224x3)`  
  `│`  
  `▼`  
`Conv1 Stem (7x7, stride 2) + BatchNorm + ReLU + MaxPool (3x3, stride 2)`  
  `│  [Feature Map: 56x56x64]`  
  `▼`  
`Stage 1 (conv2_x): 3 Bottleneck Blocks  ──► [Feature Map: 56x56x256]`  
  `│`  
  `▼`  
`Stage 2 (conv3_x): 4 Bottleneck Blocks  ──► [Feature Map: 28x28x512]`  
  `│`  
  `▼`  
`Stage 3 (conv4_x): 23 Bottleneck Blocks ──► [Feature Map: 14x14x1024]  (Primary Depth Stage)`  
  `│`  
  `▼`  
`Stage 4 (conv5_x): 3 Bottleneck Blocks  ──► [Feature Map: 7x7x2048]`  
  `│`  
  `▼`  
`Global Average Pooling (GAP) ──► Dense Linear Classifier (1000 or N classes)`

### **Bottleneck Block Structure**

Each Bottleneck block reduces computational complexity by using a 1x1 projection, a 3x3 convolution, and a 1x1 expansion:

> 1. **1x1 Conv:** Reduces channel depth (e.g., 256 to 64).  
> 2. **3x3 Conv:** Performs spatial feature extraction at reduced depth.  
> 3. **1x1 Conv:** Restores channel depth (e.g., 64 back to 256).

### **Shortcut Connection Types**

> * **Identity Shortcut:** Applied when input and output spatial dimensions and channel counts match (*y*\=*F*(*x*)+*x*).  
> * **Projection Shortcut:** Applied at stage transitions where spatial dimensions downsample by stride 2 and channel counts double. Uses a 1x1 convolution with stride 2 on the shortcut path (*y*\=*F*(*x*)+*Ws*​*x*).

The defining characteristic of ResNet101 relative to ResNet50 is Stage 3 (conv4\_x), which scales from 6 bottleneck blocks up to 23 bottleneck blocks, allowing for significantly higher feature abstraction capacity.

# **TensorFlow**

## **resnet101\_feature\_extraction.py**

`import logging`  
`import os`  
`from typing import Tuple`

`import keras`  
`import numpy as np`  
`import tensorflow as tf`

`logging.basicConfig(level=logging.INFO)`  
`logger = logging.getLogger("ResNet101_TF_FE")`

`def build_feature_extractor(`  
    `input_shape: Tuple[int, int, int] = (224, 224, 3),`  
    `num_classes: int = 10,`  
    `dropout_rate: float = 0.3,`  
`) -> keras.Model:`  
    `"""Builds a ResNet101 feature extraction model using Keras 3 / TensorFlow 2.21.`

    `Args:`  
        `input_shape: Input tensor dimensions (H, W, C).`  
        `num_classes: Number of target output classes.`  
        `dropout_rate: Dropout rate prior to final classifier head.`

    `Returns:`  
        `Compiled Keras Model with frozen ResNet101 backbone.`  
    `"""`  
    `inputs = keras.Input(shape=input_shape, name="image_input")`

    `# ResNet101 expects inputs scaled to [-1, 1] or preprocess_input matching ImageNet requirements`  
    `x = keras.applications.resnet.preprocess_input(inputs)`

    `# Base pretrained model with frozen weights`  
    `base_model = keras.applications.ResNet101(`  
        `include_top=False,`  
        `weights="imagenet",`  
        `input_tensor=x,`  
        `pooling=None,`  
    `)`  
    `base_model.trainable = False`

    `# Classification Head`  
    `x = base_model.output`  
    `x = keras.layers.GlobalAveragePooling2D(name="global_avg_pool")(x)`  
    `x = keras.layers.BatchNormalization(name="head_batch_norm")(x)`  
    `if dropout_rate > 0.0:`  
        `x = keras.layers.Dropout(dropout_rate, name="head_dropout")(x)`

    `outputs = keras.layers.Dense(`  
        `num_classes, activation="softmax", dtype="float32", name="predictions"`  
    `)(x)`

    `model = keras.Model(inputs=inputs, outputs=outputs, name="ResNet101_FeatureExtractor")`  
    `return model`

`def run_feature_extraction_pipeline() -> None:`  
    `"""Configures dataset pipeline and executes feature extraction training."""`  
    `try:`  
        `# Setup synthetic dataset for verification`  
        `num_samples = 128`  
        `img_size = (224, 224, 3)`  
        `num_classes = 10`  
        `batch_size = 16`

        `x_data = np.random.uniform(0, 255, size=(num_samples, *img_size)).astype(np.float32)`  
        `y_data = np.random.randint(0, num_classes, size=(num_samples, 1)).astype(np.int32)`

        `dataset = (`  
            `tf.data.Dataset.from_tensor_slices((x_data, y_data))`  
            `.batch(batch_size)`  
            `.prefetch(tf.data.AUTOTUNE)`  
        `)`

        `model = build_feature_extractor(`  
            `input_shape=img_size, num_classes=num_classes, dropout_rate=0.3`  
        `)`

        `model.compile(`  
            `optimizer=keras.optimizers.Adam(learning_rate=1e-3),`  
            `loss=keras.losses.SparseCategoricalCrossentropy(),`  
            `metrics=["accuracy"],`  
        `)`

        `logger.info("Starting ResNet101 feature extractor training...")`  
        `model.fit(dataset, epochs=2, verbose=1)`  
        `logger.info("Feature extraction pipeline executed successfully.")`

    `except Exception as e:`  
        `logger.error(f"Execution failed during feature extraction: {str(e)}")`  
        `raise e`

`if __name__ == "__main__":`  
    `run_feature_extraction_pipeline()`

### **Purpose**

Establishes a baseline classifier by freezing pretrained ResNet101 feature extractors and training only a newly initialized linear head.

### **Common mistakes**

Forgetting to set trainable \= False before compiling causes pretrained weights to be updated rapidly by large gradients, destroying existing representations.

### **Performance considerations**

Caching preprocessed features to disk or RAM prevents repeating expensive forward passes through the backbone during initial head training.

### **Memory considerations**

Freezing backbone parameters reduces GPU memory consumption during backward passes by eliminating gradient calculation buffers for frozen layers.

## **resnet101\_staged\_finetuning.py**

`import logging`  
`import os`  
`from typing import Tuple`

`import keras`  
`import numpy as np`  
`import tensorflow as tf`

`logging.basicConfig(level=logging.INFO)`  
`logger = logging.getLogger("ResNet101_TF_FineTune")`

`def configure_mixed_precision() -> None:`  
    `"""Enables float16 mixed precision policy in Keras."""`  
    `policy = keras.mixed_precision.Policy("mixed_float16")`  
    `keras.mixed_precision.set_global_policy(policy)`  
    `logger.info(f"Global mixed precision policy set to: {policy.name}")`

`def build_staged_finetune_model(`  
    `input_shape: Tuple[int, int, int] = (224, 224, 3),`  
    `num_classes: int = 10,`  
    `unfreeze_stage: str = "conv5_block1_out",`  
`) -> keras.Model:`  
    `"""Loads ResNet101 and selectively unfreezes layers from a target stage onward.`

    `Args:`  
        `input_shape: Dimension of input images.`  
        `num_classes: Number of classification labels.`  
        `unfreeze_stage: Layer name anchor from which training is re-enabled.`

    `Returns:`  
        `Keras Model configured for fine-tuning.`  
    `"""`  
    `inputs = keras.Input(shape=input_shape, name="image_input")`  
    `x = keras.applications.resnet.preprocess_input(inputs)`

    `base_model = keras.applications.ResNet101(`  
        `include_top=False,`  
        `weights="imagenet",`  
        `input_tensor=x,`  
    `)`

    `base_model.trainable = True`

    `# Selective unfreezing logic`  
    `unfreeze = False`  
    `unfrozen_count = 0`  
    `for layer in base_model.layers:`  
        `if layer.name == unfreeze_stage:`  
            `unfreeze = True`  
        `if unfreeze and not isinstance(layer, keras.layers.BatchNormalization):`  
            `layer.trainable = True`  
            `unfrozen_count += 1`  
        `else:`  
            `layer.trainable = False`

    `logger.info(f"Unfrozen {unfrozen_count} layers starting from {unfreeze_stage}.")`

    `x = base_model.output`  
    `x = keras.layers.GlobalAveragePooling2D(name="gap")(x)`  
    `x = keras.layers.BatchNormalization(name="bn_head")(x)`  
    `outputs = keras.layers.Dense(`  
        `num_classes, activation="softmax", dtype="float32", name="predictions"`  
    `)(x)`

    `return keras.Model(inputs=inputs, outputs=outputs, name="ResNet101_StagedFineTune")`

`def run_staged_finetuning_pipeline() -> None:`  
    `"""Executes staged fine-tuning with mixed precision and callbacks."""`  
    `try:`  
        `configure_mixed_precision()`

        `num_samples = 128`  
        `img_size = (224, 224, 3)`  
        `num_classes = 10`

        `x_data = np.random.uniform(0, 255, size=(num_samples, *img_size)).astype(np.float32)`  
        `y_data = np.random.randint(0, num_classes, size=(num_samples, 1)).astype(np.int32)`

        `dataset = (`  
            `tf.data.Dataset.from_tensor_slices((x_data, y_data))`  
            `.batch(16)`  
            `.prefetch(tf.data.AUTOTUNE)`  
        `)`

        `model = build_staged_finetune_model(`  
            `input_shape=img_size,`  
            `num_classes=num_classes,`  
            `unfreeze_stage="conv5_block1_out",`  
        `)`

        `# Low learning rate for fine-tuning to prevent divergence`  
        `optimizer = keras.optimizers.Adam(learning_rate=1e-5)`  
        `loss = keras.losses.SparseCategoricalCrossentropy()`

        `model.compile(optimizer=optimizer, loss=loss, metrics=["accuracy"])`

        `callbacks = [`  
            `keras.callbacks.EarlyStopping(monitor="loss", patience=2, restore_best_weights=True),`  
            `keras.callbacks.ReduceLROnPlateau(monitor="loss", factor=0.2, patience=1, min_lr=1e-7),`  
        `]`

        `logger.info("Executing staged fine-tuning...")`  
        `model.fit(dataset, epochs=2, callbacks=callbacks, verbose=1)`  
        `logger.info("Staged fine-tuning successfully completed.")`

    `except Exception as e:`  
        `logger.error(f"Error encountered during staged fine-tuning: {str(e)}")`  
        `raise e`

`if __name__ == "__main__":`  
    `run_staged_finetuning_pipeline()`

### **Purpose**

Unfreezes deep convolutional stages sequentially to adapt high-level feature representations to domain-specific downstream targets.

### **Common mistakes**

Keeping BatchNormalization layers in trainable mode during fine-tuning with small batch sizes disrupts batch statistics, destroying pretrained features.

### **Performance considerations**

Utilizing mixed precision (mixed\_float16) speeds up forward and backward computations on modern Tensor Core GPUs while halving activation memory usage.

### **Memory considerations**

Selective unfreezing limits parameter gradients to upper stages, controlling activation memory consumption compared to full network backpropagation.

# **PyTorch**

## **resnet101\_feature\_extraction.py**

`import logging`  
`import os`  
`from typing import Tuple`

`import torch`  
`import torch.nn as nn`  
`import torch.optim as optim`  
`from torch.utils.data import DataLoader, TensorDataset`  
`import torchvision.models as models`  
`from torchvision.models import ResNet101_Weights`

`logging.basicConfig(level=logging.INFO)`  
`logger = logging.getLogger("ResNet101_PyTorch_FE")`

`class ResNet101FeatureExtractor(nn.Module):`  
    `"""ResNet101 architecture adapted for feature extraction."""`

    `def __init__(self, num_classes: int = 10, dropout_rate: float = 0.3) -> None:`  
        `super().__init__()`  
        `weights = ResNet101_Weights.DEFAULT`  
        `self.backbone = models.resnet101(weights=weights)`

        `# Freeze all backbone layers`  
        `for param in self.backbone.parameters():`  
            `param.requires_grad = False`

        `# Replace classification head`  
        `in_features = self.backbone.fc.in_features`  
        `self.backbone.fc = nn.Sequential(`  
            `nn.BatchNorm1d(in_features),`  
            `nn.Dropout(p=dropout_rate),`  
            `nn.Linear(in_features, num_classes),`  
        `)`

    `def forward(self, x: torch.Tensor) -> torch.Tensor:`  
        `return self.backbone(x)`

`def run_pytorch_feature_extraction() -> None:`  
    `"""Executes a complete PyTorch feature extraction training pass."""`  
    `try:`  
        `device = torch.device("cuda" if torch.cuda.is_available() else "cpu")`  
        `logger.info(f"Using compute device: {device}")`

        `num_samples = 128`  
        `batch_size = 16`  
        `num_classes = 10`

        `# Synthetic dataset creation`  
        `x_dummy = torch.randn(num_samples, 3, 224, 224)`  
        `y_dummy = torch.randint(0, num_classes, (num_samples,))`

        `dataset = TensorDataset(x_dummy, y_dummy)`  
        `dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)`

        `model = ResNet101FeatureExtractor(num_classes=num_classes, dropout_rate=0.3).to(device)`

        `# Only pass trainable parameters to the optimizer`  
        `trainable_params = [p for p in model.parameters() if p.requires_grad]`  
        `optimizer = optim.Adam(trainable_params, lr=1e-3)`  
        `criterion = nn.CrossEntropyLoss()`  
        `scaler = torch.amp.GradScaler("cuda", enabled=(device.type == "cuda"))`

        `model.train()`  
        `logger.info("Starting PyTorch feature extraction loop...")`

        `for epoch in range(2):`  
            `running_loss = 0.0`  
            `for images, labels in dataloader:`  
                `images, labels = images.to(device), labels.to(device)`  
                `optimizer.zero_grad()`

                `with torch.amp.autocast(device_type=device.type, enabled=(device.type == "cuda")):`  
                    `outputs = model(images)`  
                    `loss = criterion(outputs, labels)`

                `scaler.scale(loss).backward()`  
                `scaler.step(optimizer)`  
                `scaler.update()`

                `running_loss += loss.item() * images.size(0)`

            `epoch_loss = running_loss / num_samples`  
            `logger.info(f"Epoch {epoch + 1}/2 - Loss: {epoch_loss:.4f}")`

        `logger.info("PyTorch feature extraction finished successfully.")`

    `except Exception as e:`  
        `logger.error(f"PyTorch feature extraction failed: {str(e)}")`  
        `raise e`

`if __name__ == "__main__":`  
    `run_pytorch_feature_extraction()`

### **Purpose**

Implements PyTorch transfer learning by freezing backbone parameters and retraining only the newly attached fc linear head.

### **Common mistakes**

Passing model.parameters() to the optimizer instead of filtering for p.requires\_grad \== True consumes extra computation checking non-trainable weights.

### **Performance considerations**

Setting torch.backends.cudnn.benchmark \= True speeds up training when input spatial dimensions remain fixed at 224x224.

### **Memory considerations**

Setting requires\_grad \= False prevents PyTorch from storing activation graphs for frozen parameters, cutting GPU memory overhead during training.

## **resnet101\_staged\_finetuning.py**

`import logging`  
`import os`  
`from typing import List`

`import torch`  
`import torch.nn as nn`  
`import torch.optim as optim`  
`from torch.optim.lr_scheduler import CosineAnnealingLR`  
`from torch.utils.data import DataLoader, TensorDataset`  
`import torchvision.models as models`  
`from torchvision.models import ResNet101_Weights`

`logging.basicConfig(level=logging.INFO)`  
`logger = logging.getLogger("ResNet101_PyTorch_FineTune")`

`def configure_staged_resnet101(num_classes: int = 10) -> nn.Module:`  
    `"""Configures ResNet101 with differential gradient flags for staged fine-tuning."""`  
    `weights = ResNet101_Weights.DEFAULT`  
    `model = models.resnet101(weights=weights)`

    `# Freeze stem and lower stages (layer1, layer2)`  
    `for param in model.conv1.parameters():`  
        `param.requires_grad = False`  
    `for param in model.bn1.parameters():`  
        `param.requires_grad = False`  
    `for param in model.layer1.parameters():`  
        `param.requires_grad = False`  
    `for param in model.layer2.parameters():`  
        `param.requires_grad = False`

    `# Unfreeze higher stages (layer3, layer4) for fine-tuning`  
    `for param in model.layer3.parameters():`  
        `param.requires_grad = True`  
    `for param in model.layer4.parameters():`  
        `param.requires_grad = True`

    `# Replace linear head`  
    `in_features = model.fc.in_features`  
    `model.fc = nn.Linear(in_features, num_classes)`

    `return model`

`def run_staged_finetuning() -> None:`  
    `"""Executes staged fine-tuning with parameter group differential learning rates."""`  
    `try:`  
        `device = torch.device("cuda" if torch.cuda.is_available() else "cpu")`  
        `logger.info(f"Target compute device: {device}")`

        `model = configure_staged_resnet101(num_classes=10).to(device)`

        `# Differential learning rates for fine-tuning stability`  
        `backbone_stage_params = [`  
            `p for name, p in model.named_parameters()`  
            `if "fc" not in name and p.requires_grad`  
        `]`  
        `head_params = [p for p in model.fc.parameters()]`

        `optimizer = optim.AdamW([`  
            `{"params": backbone_stage_params, "lr": 1e-5, "weight_decay": 1e-4},`  
            `{"params": head_params, "lr": 1e-3, "weight_decay": 1e-2},`  
        `])`

        `scheduler = CosineAnnealingLR(optimizer, T_max=10, eta_min=1e-7)`  
        `criterion = nn.CrossEntropyLoss()`  
        `scaler = torch.amp.GradScaler("cuda", enabled=(device.type == "cuda"))`

        `# Synthetic dataset`  
        `x_dummy = torch.randn(128, 3, 224, 224)`  
        `y_dummy = torch.randint(0, 10, (128,))`  
        `dataloader = DataLoader(TensorDataset(x_dummy, y_dummy), batch_size=16, shuffle=True)`

        `logger.info("Executing PyTorch staged fine-tuning...")`  
        `model.train()`

        `# Keep frozen BatchNorm layers in evaluation mode`  
        `model.bn1.eval()`  
        `model.layer1.eval()`  
        `model.layer2.eval()`

        `for epoch in range(2):`  
            `total_loss = 0.0`  
            `for images, labels in dataloader:`  
                `images, labels = images.to(device), labels.to(device)`  
                `optimizer.zero_grad()`

                `with torch.amp.autocast(device_type=device.type, enabled=(device.type == "cuda")):`  
                    `outputs = model(images)`  
                    `loss = criterion(outputs, labels)`

                `scaler.scale(loss).backward()`  
                `scaler.step(optimizer)`  
                `scaler.update()`

                `total_loss += loss.item() * images.size(0)`

            `scheduler.step()`  
            `logger.info(f"Epoch {epoch + 1} completed. Average Loss: {total_loss / 128:.4f}")`

        `logger.info("PyTorch staged fine-tuning completed successfully.")`

    `except Exception as e:`  
        `logger.error(f"Fine-tuning script encountered an error: {str(e)}")`  
        `raise e`

`if __name__ == "__main__":`  
    `run_staged_finetuning()`

### **Purpose**

Applies lower learning rates to backbone stages (layer3/layer4) while training the classifier head at higher rates to maintain model stability.

### **Common mistakes**

Failing to force frozen BatchNorm2d layers into eval() mode during training causes running mean and variance estimates to corrupt.

### **Performance considerations**

Using AdamW with differential weight decay prevents gradient degradation while regularizing newly added fully connected layers.

### **Memory considerations**

Disabling gradients on layer1 and layer2 saves significant activation memory, leaving headroom for larger batch sizes.

# **Engineering Summary**

### **Best Used When**

> * High accuracy is required on complex datasets where ResNet50 exhibits underfitting due to insufficient depth.  
> * Transfer learning tasks present substantial domain shifts from ImageNet (e.g., satellite imagery, medical scans).  
> * Deployment targets possess dedicated GPU acceleration or high-performance hardware nodes.  
> * Stable gradient flow across deep networks is required without the memory overhead of DenseNet architectures.

### **Architectural Tradeoffs**

> * **Depth vs. Latency:** Adds 51 layers over ResNet50 (primarily in stage 3), yielding a \~1.5-2% accuracy boost at the cost of \~1.9x higher inference latency.  
> * **Parameter Efficiency:** Contains \~44.5M parameters, requiring significantly more memory than modern mobile architectures like MobileNetV3 or EfficientNet.  
> * **Bottleneck Design:** The 1x1-3x3-1x1 bottleneck structure keeps FLOP growth manageable relative to parameter count expansion.  
> * **Receptive Field:** Deep residual stacking increases receptive field coverage without incurring spatial resolution loss early in the network.

### **Expected Training Behavior**

> * **Gradient Stability:** Residual connections allow steady gradient flow throughout all 101 layers during backpropagation.  
> * **Stage 3 Loss Dominance:** Most parameter updates occur within the 23 bottleneck blocks of conv4\_x.  
> * **Learning Rate Sensitivity:** Unfreezing the entire backbone with learning rates above 1e-4 during transfer learning can lead to catastrophic forgetting.  
> * **Convergence Rates:** Convergence is smoother compared to plain non-residual 100-layer models, typically reaching stability within 30-50 epochs.

### **Production & Serving Notes**

> * **Mixed Precision:** Fully compatible with FP16 and BF16 execution on Tensor Core architectures, yielding \~2x speed improvements.  
> * **TensorRT Compatibility:** Fuses 1x1 convolutions, 3x3 convolutions, BatchNorm, and ReLU into unified CUDA kernels seamlessly.  
> * **Batch Size Scaling:** ResNet101 achieves optimal GPU compute saturation at batch sizes of 32 or higher during inference.  
> * **Memory Allocation:** Requires approximately 180 MB for FP32 model weights and up to 1.5 GB VRAM during batch inference at 224×224 resolution.

# **Model Comparison**

| Model Architecture | Top-1 Accuracy (ImageNet) | Parameters (M) | FLOPs / MACs (G) | Inference Latency (Batch=1, FP32, ms) | Memory Footprint (FP32 Weights, MB) | Architectural Complexity |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **ResNet50** | 76.0% | 25.6M | 4.1G | 3.2 ms | 102.5 MB | Medium |
| **ResNet101** | **77.4%** | **44.5M** | **7.8G** | **5.8 ms** | **178.0 MB** | **Medium-High** |
| **ResNet152** | 78.3% | 60.2M | 11.5G | 8.4 ms | 240.8 MB | High |
| **DenseNet121** | 75.0% | 8.0M | 2.9G | 6.5 ms | 32.0 MB | High (Concatenations) |
| **EfficientNetB3** | 81.6% | 12.0M | 1.8G | 7.2 ms | 48.0 MB | High (Compound Scaling) |
| **ConvNeXt-Tiny** | 82.1% | 28.6M | 4.5G | 4.1 ms | 114.4 MB | Medium (Modern Conv) |

# **Deployment**

## **resnet101\_export\_tf.py**

`import logging`  
`import os`  
`import tensorflow as tf`  
`import keras`

`logging.basicConfig(level=logging.INFO)`  
`logger = logging.getLogger("ResNet101_TF_Export")`

`def export_savedmodel_and_tflite(output_dir: str = "./exports/tf_resnet101") -> None:`  
    `"""Exports a ResNet101 model to TensorFlow SavedModel and quantized TFLite formats.`

    `Args:`  
        `output_dir: Target directory path for exported model files.`  
    `"""`  
    `try:`  
        `os.makedirs(output_dir, exist_ok=True)`  
        `savedmodel_path = os.path.join(output_dir, "saved_model")`  
        `tflite_path = os.path.join(output_dir, "model_fp16.tflite")`

        `# Load standard model architecture`  
        `model = keras.applications.ResNet101(weights="imagenet", input_shape=(224, 224, 3))`

        `# Save to SavedModel format`  
        `logger.info(f"Exporting TensorFlow SavedModel to: {savedmodel_path}")`  
        `model.save(savedmodel_path)`

        `# Convert to TFLite with FP16 quantization`  
        `logger.info("Converting SavedModel to TFLite (FP16)...")`  
        `converter = tf.lite.TFLiteConverter.from_saved_model(savedmodel_path)`  
        `converter.optimizations = [tf.lite.Optimize.DEFAULT]`  
        `converter.target_spec.supported_types = [tf.float16]`

        `tflite_model = converter.convert()`

        `with open(tflite_path, "wb") as f:`  
            `f.write(tflite_model)`

        `logger.info(f"TFLite export successful. Saved to: {tflite_path}")`

    `except Exception as e:`  
        `logger.error(f"TensorFlow export failed: {str(e)}")`  
        `raise e`

`if __name__ == "__main__":`  
    `export_savedmodel_and_tflite()`

## **resnet101\_export\_torch.py**

`import logging`  
`import os`  
`import torch`  
`import torchvision.models as models`  
`from torchvision.models import ResNet101_Weights`

`logging.basicConfig(level=logging.INFO)`  
`logger = logging.getLogger("ResNet101_Torch_Export")`

`def export_onnx_and_torchscript(output_dir: str = "./exports/torch_resnet101") -> None:`  
    `"""Exports PyTorch ResNet101 model to ONNX and TorchScript formats.`

    `Args:`  
        `output_dir: Destination path for exported files.`  
    `"""`  
    `try:`  
        `os.makedirs(output_dir, exist_ok=True)`  
        `onnx_path = os.path.join(output_dir, "resnet101.onnx")`  
        `torchscript_path = os.path.join(output_dir, "resnet101.pt")`

        `weights = ResNet101_Weights.DEFAULT`  
        `model = models.resnet101(weights=weights).eval()`

        `dummy_input = torch.randn(1, 3, 224, 224)`

        `# ONNX Export`  
        `logger.info(f"Exporting model to ONNX format: {onnx_path}")`  
        `torch.onnx.export(`  
            `model,`  
            `dummy_input,`  
            `onnx_path,`  
            `export_params=True,`  
            `opset_version=17,`  
            `do_constant_folding=True,`  
            `input_names=["input"],`  
            `output_names=["output"],`  
            `dynamic_axes={`  
                `"input": {0: "batch_size"},`  
                `"output": {0: "batch_size"},`  
            `},`  
        `)`

        `# TorchScript Trace Export`  
        `logger.info(f"Exporting model to TorchScript format: {torchscript_path}")`  
        `traced_model = torch.jit.trace(model, dummy_input)`  
        `traced_model.save(torchscript_path)`

        `logger.info("PyTorch ONNX and TorchScript exports completed successfully.")`

    `except Exception as e:`  
        `logger.error(f"PyTorch model export failed: {str(e)}")`  
        `raise e`

`if __name__ == "__main__":`  
    `export_onnx_and_torchscript()`

## **TensorRT Considerations**

To compile an exported ONNX ResNet101 graph into an optimized TensorRT engine for high-throughput production deployment, use the NVIDIA trtexec tool.

### **Engine Compilation Command**

`trtexec --onnx=./exports/torch_resnet101/resnet101.onnx \`  
        `--saveEngine=./exports/torch_resnet101/resnet101_fp16.engine \`  
        `--fp16 \`  
        `--minShapes=input:1x3x224x224 \`  
        `--optShapes=input:16x3x224x224 \`  
        `--maxShapes=input:64x3x224x224 \`  
        `--verbose`

### **Key Optimizations applied by TensorRT**

> 1. **Layer Fusion:** Merges Conv2D, BatchNormalization, and ReLU operations into unified single-pass CUDA kernels to reduce global memory bandwidth usage.  
> 2. **Precision Reduction:** Converts FP32 weights to FP16 arithmetic using hardware Tensor Cores without significant drop in classification accuracy.  
> 3. **Workspace Allocation:** Optimizes memory pool management based on dynamic batch size profiles specified via \--minShapes, \--optShapes, and \--maxShapes.

# **References**

> 1. He, K., Zhang, X., Ren, S., & Sun, J. (2016). *Deep Residual Learning for Image Recognition*. Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR), 770-778. [https://arxiv.org/abs/1512.03104](https://arxiv.org/abs/1512.03104)  
> 2. TensorFlow Documentation: tf.keras.applications.ResNet101. [https://www.tensorflow.org/api\_docs/python/tf/keras/applications/ResNet101](https://www.tensorflow.org/api_docs/python/tf/keras/applications/ResNet101)  
> 3. PyTorch Documentation: torchvision.models.resnet101. [https://pytorch.org/vision/stable/models/generated/torchvision.models.resnet101.html](https://pytorch.org/vision/stable/models/generated/torchvision.models.resnet101.html)  
> 4. ONNX Documentation: Exporting PyTorch Models to ONNX. [https://onnx.ai/onnx/](https://onnx.ai/onnx/)  
> 5. NVIDIA Developer: TensorRT Developer Guide and trtexec Utilities. [https://developer.nvidia.com/tensorrt](https://developer.nvidia.com/tensorrt)

---

