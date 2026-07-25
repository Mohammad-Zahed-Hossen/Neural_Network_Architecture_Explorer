# Legacy Data Pipeline

This folder contains historical scripts that were used to originally generate the model data now living in `data/models/`. These scripts are preserved for reference purposes only and are **not part of the current build**.

## Files

- `generate-models.js` - Main JavaScript generator script
- `generate_inception_xception_nasnet.py` - Python script for Inception, Xception, and NASNet models
- `generate_mobilenet_efficientnet.py` - Python script for MobileNet and EfficientNet models
- `generate_resnet_densenet.py` - Python script for ResNet and DenseNet models
- `generate_vgg.py` - Python script for VGG models
- `model.schema.json` - Original JSON schema for model data

## Note

These scripts are not imported or referenced by any application code. The current codebase uses `lib/schema/model.schema.ts` for TypeScript-based schema validation.