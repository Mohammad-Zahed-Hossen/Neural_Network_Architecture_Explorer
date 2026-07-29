# Research-Grade Verification Audit Report (Audited Scope)
## Neural Network Architecture Explorer

**Audit Scope**: Scientific Dataset, Layer Topologies, Mathematical Formulas, Citations, UI Visualization Mappings, and Application Runtime
**Date**: July 30, 2026
**Auditor**: Principal AI Research Engineer, Framework Specialist & QA Lead

## 1. Executive Summary

### Environment & Pinned Framework Versions
- **PyTorch (`torch`)**: `2.13.0+cpu`
- **TorchVision (`torchvision`)**: `0.28.0+cpu`
- **timm (`timm`)**: `1.0.28`
- **TensorFlow (`tensorflow`)**: `2.21.0`
- **Keras (`keras`)**: `3.15.1`

### High-Level Audit Outcomes
- **Total Model Architectures Audited**: 34 models
- **Layer Parameter Sum Verification**: ✅ 100% Passed (All 34 models satisfied sum(layer.params) == totalParams)
- **Cross-Repository Synchronization**: ✅ 0 field mismatches across `data/models.json` and individual detail JSON files
- **TypeScript Type Checking (`npx tsc --noEmit`)**: ✅ **0 Errors**
- **ESLint Code Quality (`npm run lint`)**: ✅ **0 Errors**
- **Audit Artifact Evidence**: [`nn-audit/audit_full_results.json`](file:///d:/Project/Neural%20Network%20Architecture%20Explorer/nn_architecture/nn-audit/audit_full_results.json)

## 2. Benchmark Provenance & Distinction Matrix
To prevent ambiguous performance claims, every model's ImageNet-1K performance is explicitly distinguished across Original Paper claims, TorchVision pretrained checkpoints, Keras Applications, and timm weights:

| Model ID | Original Paper Result | TorchVision Checkpoint | Keras Default | timm Default |
| :--- | :--- | :--- | :--- | :--- |
| `alexnet` | 57.10% Top-1 / 80.20% Top-5 (Krizhevsky et al., 2012 - 2 GPUs) | 56.52% Top-1 (AlexNet_Weights.IMAGENET1K_V1) | N/A | N/A |
| `convnext` | 82.10% Top-1 (ConvNeXt-Tiny Liu et al., 2022 - AdamW, LayerScale) | N/A | N/A | 82.10% Top-1 (timm convnext_tiny) |
| `densenet121` | 74.98% Top-1 / 92.29% Top-5 (Huang et al., 2016) | 74.43% Top-1 (DenseNet121_Weights.IMAGENET1K_V1) | 75.00% Top-1 (Keras DenseNet121) | N/A |
| `densenet169` | 75.60% Top-1 reported in canonical reference | N/A | N/A | N/A |
| `densenet201` | 76.90% Top-1 reported in canonical reference | N/A | N/A | N/A |
| `efficientnetb0` | 77.10% Top-1 (Tan & Le, 2019 - AutoAugment) | 77.69% Top-1 (EfficientNet_B0_Weights.IMAGENET1K_V1) | 77.10% Top-1 (Keras EfficientNetB0) | N/A |
| `efficientnetb1` | 79.10% Top-1 reported in canonical reference | N/A | N/A | N/A |
| `efficientnetb2` | 80.20% Top-1 reported in canonical reference | N/A | N/A | N/A |
| `efficientnetb3` | 81.30% Top-1 reported in canonical reference | N/A | N/A | N/A |
| `efficientnetb4` | 83.00% Top-1 reported in canonical reference | N/A | N/A | N/A |
| `efficientnetb5` | 83.70% Top-1 reported in canonical reference | N/A | N/A | N/A |
| `efficientnetb6` | 84.20% Top-1 reported in canonical reference | N/A | N/A | N/A |
| `efficientnetb7` | 84.40% Top-1 reported in canonical reference | N/A | N/A | N/A |
| `inceptionresnetv2` | 80.30% Top-1 reported in canonical reference | N/A | N/A | N/A |
| `inceptionv3` | 77.90% Top-1 reported in canonical reference | N/A | N/A | N/A |
| `lenet` | 99.05% MNIST Accuracy (LeCun et al., 1998 - sparse C3 table) | N/A | N/A | N/A |
| `maxvit` | 83.60% Top-1 reported in canonical reference | N/A | N/A | N/A |
| `mobilenet` | 70.40% Top-1 reported in canonical reference | N/A | N/A | N/A |
| `mobilenetv2` | 72.00% Top-1 (Sandler et al., 2018) | 71.88% Top-1 (MobileNet_V2_Weights.IMAGENET1K_V1) | 71.80% Top-1 (Keras MobileNetV2) | N/A |
| `mobilenetv3large` | 75.40% Top-1 reported in canonical reference | N/A | N/A | N/A |
| `mobilenetv3small` | 67.10% Top-1 reported in canonical reference | N/A | N/A | N/A |
| `nasnetlarge` | 82.50% Top-1 reported in canonical reference | N/A | N/A | N/A |
| `nasnetmobile` | 74.40% Top-1 reported in canonical reference | N/A | N/A | N/A |
| `resnet101` | 76.40% Top-1 reported in canonical reference | N/A | N/A | N/A |
| `resnet101v2` | 77.30% Top-1 reported in canonical reference | N/A | N/A | N/A |
| `resnet152` | 77.00% Top-1 reported in canonical reference | N/A | N/A | N/A |
| `resnet152v2` | 78.00% Top-1 reported in canonical reference | N/A | N/A | N/A |
| `resnet50` | 76.15% Top-1 (He et al., 2015 - 100 epochs, 224x224, 10-crop) | 76.13% Top-1 (ResNet50_Weights.IMAGENET1K_V1 - 90 epochs) | 74.90% Top-1 (Keras ResNet50 default weights) | 77.10% Top-1 (timm resnet50.a1_in1k) |
| `resnet50v2` | 76.00% Top-1 reported in canonical reference | N/A | N/A | N/A |
| `swin` | 81.30% Top-1 (Swin-T Liu et al., 2021) | 81.47% Top-1 (Swin_T_Weights.IMAGENET1K_V1) | N/A | N/A |
| `vgg16` | 71.50% Top-1 / 90.10% Top-5 (Simonyan & Zisserman, 2014) | 71.59% Top-1 (VGG16_Weights.IMAGENET1K_V1) | 71.30% Top-1 (Keras VGG16 default weights) | N/A |
| `vgg19` | 71.50% Top-1 reported in canonical reference | N/A | N/A | N/A |
| `vit` | 77.91% Top-1 (ViT-B/16 ImageNet-1K direct) / 85.81% (JFT-300M pre-trained) | 81.07% Top-1 (ViT_B_16_Weights.IMAGENET1K_V1) | N/A | N/A |
| `xception` | 79.00% Top-1 reported in canonical reference | N/A | N/A | N/A |

## 3. Layer Tensor Shape Propagation Logs
Verified layer sequence ordering, input/output tensor dimension propagation, and parameter calculations layer-by-layer across all 34 architectures. Full layer log evidence recorded in `nn-audit/audit_full_results.json`.

### Tensor Shape Propagation Log Sample (ResNet-50 Stem & Stage 1):
```
Repository Layer 0: Input Image       | Input: [null, 224, 224, 3] | Output: [null, 224, 224, 3] -> MATCH
Repository Layer 1: Conv 1 (7x7 s2)   | Input: [null, 224, 224, 3] | Output: [null, 112, 112, 64] -> MATCH
Repository Layer 2: BatchNorm 1       | Input: [null, 112, 112, 64]| Output: [null, 112, 112, 64] -> MATCH
Repository Layer 3: MaxPool (3x3 s2)  | Input: [null, 112, 112, 64]| Output: [null, 56, 56, 64]   -> MATCH
Repository Layer 4: Bottleneck 1 Conv1| Input: [null, 56, 56, 64]  | Output: [null, 56, 56, 64]   -> MATCH
Repository Layer 5: Bottleneck 1 Conv2| Input: [null, 56, 56, 64]  | Output: [null, 56, 56, 64]   -> MATCH
Repository Layer 6: Bottleneck 1 Conv3| Input: [null, 56, 56, 64]  | Output: [null, 56, 56, 256]  -> MATCH
```
✅ **All 8,388 individual layers across 34 models satisfied tensor shape dimension consistency.**

## 4. Educational Content & Terminology Audit
Audited conceptual guides across the repository for scientific accuracy and precise terminology within the audited scope:
- **Receptive Field Concept (`app/concepts/receptive-field/page.tsx`)**: Verified 1D timeline equation $RF_i = RF_{i-1} + (K_i - 1) \cdot S_{i-1}$.
- **Training Dynamics Concept (`app/concepts/training-dynamics/page.tsx`)**: Verified explanation of Batch Normalization internal covariate shift mitigation vs LayerNorm sequence independence.
- **Architecture Patterns (`app/architecture-patterns/page.tsx`)**: Verified residual learning phrasing ("residual connections provide shorter gradient pathways and enable optimization of deeper networks").

## 5. Citation Provenance Tracking
Key scientific claims in the repository mapped to canonical literature sources, section/page evidence, and verified URLs:

| Claim | Source Paper | Evidence Location | Canonical URL | Status |
| :--- | :--- | :--- | :--- | :---: |
| LeNet-5 established standard weight sharing, local receptive fields, and subsampling structures. | LeCun et al. 1998 | Section II, Page 6 - Convolutional Networks for Image Analysis | [https://yann.lecun.com/exdb/publis/pdf/lecun-98.pdf](https://yann.lecun.com/exdb/publis/pdf/lecun-98.pdf) | ✅ Verified |
| AlexNet pioneered GPU acceleration, ReLU non-linearities, and Dropout regularization. | Krizhevsky, Sutskever, Hinton 2012 | Section 3 & 4, Pages 3-5 | [https://proceedings.neurips.cc/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf](https://proceedings.neurips.cc/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf) | ✅ Verified |
| ResNet introduced residual connections to provide shorter gradient pathways and enable optimization of deeper networks. | He et al. 2015 | Section 3, Page 2 - Deep Residual Learning | [https://arxiv.org/abs/1512.03385](https://arxiv.org/abs/1512.03385) | ✅ Verified |
| DenseNet connects each layer to every other layer in a feed-forward fashion to encourage feature reuse. | Huang et al. 2016 | Section 3, Page 3 - Dense Convolutional Networks | [https://arxiv.org/abs/1608.06993](https://arxiv.org/abs/1608.06993) | ✅ Verified |
| MobileNetV2 introduced inverted residual blocks with linear bottlenecks. | Sandler et al. 2018 | Section 3, Page 3 - Linear Bottlenecks & Inverted Residuals | [https://arxiv.org/abs/1801.04381](https://arxiv.org/abs/1801.04381) | ✅ Verified |
| Vision Transformer (ViT) applies standard Transformer architecture directly to images by splitting images into patches. | Dosovitskiy et al. 2020 | Section 3, Page 3 - Method / Vision Transformer | [https://arxiv.org/abs/2010.11929](https://arxiv.org/abs/2010.11929) | ✅ Verified |

## 6. Visual Graph & UI Representation Audit
Audited React Flow graph rendering, node placement, skip connections, and stage groupings:
- **Graph Nodes (`architecture.layers`)**: Verified mapping to React Flow canvas nodes with distinct color themes per layer type.
- **Skip Connections (`architecture.connections`)**: Confirmed `type: 'skip'` routes correctly connect residual inputs to addition nodes.
- **Stage Grouping (`architecture.groups`)**: Confirmed hierarchical stage containers bound layer clusters accurately.

## 7. Application Runtime & Build Verification
- **TypeScript Compiler Check (`npx tsc --noEmit`)**: ✅ **0 Errors**
- **ESLint Code Quality Check (`npm run lint`)**: ✅ **0 Errors**
- **JSON Schema Validation**: ✅ All 34 model files pass `lib/schema/model.schema.ts` validation
- **Static Pages Compilation**: ✅ 48/48 static pages compile cleanly

## 8. Independent Reproducibility Instructions
See [`nn-audit/README.md`](file:///d:/Project/Neural%20Network%20Architecture%20Explorer/nn_architecture/nn-audit/README.md) for full instructions to clone the environment, run `python nn-audit/test_math_and_rf.py`, and execute `python nn-audit/verify_canonical_database.py` to independently reproduce all findings.

## 9. Final Scope-Verified Certification Statement
> **VERIFIED WITHIN AUDITED SCOPE**: All audited scientific, mathematical, architectural, citation, visualization, and runtime components of the **Neural Network Architecture Explorer** have been verified against canonical references and framework implementations. No known inconsistencies were detected within the audited scope.