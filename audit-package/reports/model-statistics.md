# Model Inventory & Statistics Report

This report compiles a detailed inventory of the neural network architectures, tracking parameters, depth, computational costs, and accuracy benchmarks.

## 1. Quantitative Performance Overview

| Model ID | Model Name | Family | Depth | Parameters | FLOPs | MACs (approx) | Top-1 Acc | Top-5 Acc | Layers |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `alexnet` | **AlexNet** | Foundational | 8 | 62,378,344 | 720,000,000 | 360,000,000 | 57.1% | 80.2% | 13 |
| `convnext` | **ConvNeXt** | Other | 30 | 28,475,064 | 4,460,000,000 | 2,230,000,000 | 82.1% | 95.9% | 14 |
| `densenet121` | **DenseNet121** | DenseNet | 121 | 8,062,504 | 2,900,000,000 | 1,450,000,000 | 75.0% | 92.3% | 429 |
| `densenet169` | **DenseNet169** | DenseNet | 169 | 14,307,880 | 3,400,000,000 | 1,700,000,000 | 75.6% | 92.7% | 597 |
| `densenet201` | **DenseNet201** | DenseNet | 201 | 20,242,984 | 4,300,000,000 | 2,150,000,000 | 76.9% | 93.5% | 709 |
| `efficientnetb0` | **EfficientNetB0** | EfficientNet | 84 | 5,330,564 | 390,000,000 | 195,000,000 | 77.3% | 93.5% | 213 |
| `efficientnetb1` | **EfficientNetB1** | EfficientNet | 106 | 7,856,232 | 710,000,000 | 355,000,000 | 79.1% | 94.4% | 301 |
| `efficientnetb2` | **EfficientNetB2** | EfficientNet | 115 | 9,177,562 | 1,030,000,000 | 515,000,000 | 80.2% | 95.0% | 301 |
| `efficientnetb3` | **EfficientNetB3** | EfficientNet | 154 | 12,320,528 | 1,860,000,000 | 930,000,000 | 81.3% | 95.6% | 340 |
| `efficientnetb4` | **EfficientNetB4** | EfficientNet | 214 | 19,466,816 | 4,800,000,000 | 2,400,000,000 | 83.0% | 96.0% | 418 |
| `efficientnetb5` | **EfficientNetB5** | EfficientNet | 456 | 30,562,520 | 9,700,000,000 | 4,850,000,000 | 83.7% | 96.3% | 506 |
| `efficientnetb6` | **EfficientNetB6** | EfficientNet | 550 | 43,265,136 | 19,300,000,000 | 9,650,000,000 | 84.2% | 96.8% | 584 |
| `efficientnetb7` | **EfficientNetB7** | EfficientNet | 813 | 66,658,680 | 37,000,000,000 | 18,500,000,000 | 84.4% | 97.0% | 711 |
| `inceptionresnetv2` | **InceptionResNetV2** | Inception | 164 | 55,873,736 | 13,100,000,000 | 6,550,000,000 | 80.3% | 95.3% | 124 |
| `inceptionv3` | **InceptionV3** | Inception | 48 | 23,851,784 | 5,600,000,000 | 2,800,000,000 | 77.9% | 93.7% | 90 |
| `lenet` | **LeNet 5** | Foundational | 5 | 61,706 | 340,000 | 170,000 | 99.2% | 99.8% | 9 |
| `maxvit` | **MaxViT** | Other | 32 | 30,552,616 | 5,600,000,000 | 2,800,000,000 | 83.6% | 96.6% | 11 |
| `mobilenet` | **MobileNet** | MobileNet | 28 | 4,253,864 | 569,000,000 | 284,500,000 | 70.4% | 89.5% | 84 |
| `mobilenetv2` | **MobileNetV2** | MobileNet | 53 | 3,538,984 | 300,000,000 | 150,000,000 | 71.8% | 91.0% | 152 |
| `mobilenetv3large` | **MobileNetV3 Large** | MobileNet | 109 | 5,507,432 | 219,000,000 | 109,500,000 | 75.4% | 92.3% | 169 |
| `mobilenetv3small` | **MobileNetV3 Small** | MobileNet | 66 | 2,554,968 | 65,000,000 | 32,500,000 | 67.1% | 87.5% | 137 |
| `nasnetlarge` | **NASNetLarge** | NASNet | 389 | 88,949,818 | 24,040,000,000 | 12,020,000,000 | 82.5% | 96.0% | 66 |
| `nasnetmobile` | **NASNetMobile** | NASNet | 81 | 5,326,564 | 470,000,000 | 235,000,000 | 74.4% | 91.9% | 48 |
| `resnet101` | **ResNet101** | ResNet | 101 | 44,654,504 | 7,600,000,000 | 3,800,000,000 | 76.4% | 93.2% | 346 |
| `resnet101v2` | **ResNet101V2** | ResNet | 101 | 44,675,560 | 7,600,000,000 | 3,800,000,000 | 77.3% | 93.6% | 376 |
| `resnet152` | **ResNet152** | ResNet | 152 | 60,344,232 | 11,300,000,000 | 5,650,000,000 | 77.0% | 93.8% | 516 |
| `resnet152v2` | **ResNet152V2** | ResNet | 152 | 60,380,648 | 11,300,000,000 | 5,650,000,000 | 78.0% | 94.0% | 563 |
| `resnet50` | **ResNet50** | ResNet | 50 | 25,610,152 | 4,100,000,000 | 2,050,000,000 | 74.9% | 92.1% | 176 |
| `resnet50v2` | **ResNet50V2** | ResNet | 50 | 25,613,800 | 4,100,000,000 | 2,050,000,000 | 76.0% | 93.0% | 189 |
| `swin` | **Swin Transformer** | Other | 36 | 28,474,872 | 4,500,000,000 | 2,250,000,000 | 81.3% | 95.5% | 13 |
| `vgg16` | **VGG16** | VGG | 16 | 138,357,544 | 15,300,000,000 | 7,650,000,000 | 71.3% | 90.1% | 23 |
| `vgg19` | **VGG19** | VGG | 19 | 143,667,240 | 19,600,000,000 | 9,800,000,000 | 71.5% | 90.3% | 26 |
| `vit` | **ViT** | Other | 12 | 86,566,120 | 16,800,000,000 | 8,400,000,000 | 77.9% | 94.3% | 17 |
| `xception` | **Xception** | Xception | 71 | 22,910,480 | 8,400,000,000 | 4,200,000,000 | 79.0% | 94.5% | 117 |

## 2. Layer Type Aggregations across Dataset

| Layer Type | Occurrences in Dataset | Percentage |
| :--- | :---: | :---: |
| `conv2d` | 2813 | 33.5% |
| `batch_norm` | 2132 | 25.4% |
| `activation` | 1978 | 23.6% |
| `concatenate` | 522 | 6.2% |
| `add` | 480 | 5.7% |
| `global_average_pooling2d` | 306 | 3.6% |
| `dense` | 49 | 0.6% |
| `input` | 34 | 0.4% |
| `max_pooling2d` | 28 | 0.3% |
| `average_pooling2d` | 14 | 0.2% |
| `bottleneck` | 13 | 0.2% |
| `layer_norm` | 7 | 0.1% |
| `output` | 6 | 0.1% |
| `flatten` | 5 | 0.1% |
| `attention` | 1 | 0.0% |
