import json
import os

# Helper to write JSON files
def write_json(path, data):
    with open(path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"Generated {data['name']} successfully: {path} ({len(data['architecture']['layers'])} layers)")

# Helper to generate ResNet V1 (Original)
def generate_resnet_v1(model_id, name, fullName, paperYear, authors, paperUrl, depth, totalParameters, totalFLOPs, top1Accuracy, top5Accuracy, memoryUsage, description, tags, colorTheme, stages):
    layers = []
    connections = []
    groups = []
    y_ptr = 0

    # 1. Stem
    layers.append({
        "id": "input_1",
        "type": "input",
        "name": "input_1",
        "inputShape": { "dimensions": [None, 224, 224, 3], "description": "224×224×3 RGB Image" },
        "outputShape": { "dimensions": [None, 224, 224, 3], "description": "224×224×3 RGB Image" },
        "config": { "shape": [224, 224, 3] },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": {
            "summary": "Retinal layer receiving raw RGB pixel matrices.",
            "detailed": "Accepts normalized three-channel RGB images of size 224x224. This spatial standardization ensures weight compatibility in subsequent fully connected layers.",
            "whyItMatters": "Establishes spatial dimensions. Resizing inputs to 224x224 is required prior to forward propagation.",
            "keyTakeaway": "Fixed input sizes are critical to prevent spatial alignment errors in standard CNN dense layers."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "emerald",
        "icon": "image"
    })
    y_ptr += 150

    # conv1_conv
    layers.append({
        "id": "conv1_conv",
        "type": "conv2d",
        "name": "conv1_conv",
        "inputShape": { "dimensions": [None, 224, 224, 3], "description": "224×224×3" },
        "outputShape": { "dimensions": [None, 112, 112, 64], "description": "112×112×64" },
        "config": {
            "filters": 64,
            "kernelSize": [7, 7],
            "strides": [2, 2],
            "padding": "same",
            "useBias": False,
            "activation": "linear"
        },
        "parameters": {
            "total": 9408,
            "weights": 9408,
            "biases": 0,
            "formula": "kernel_height × kernel_width × input_channels × output_filters",
            "calculationSteps": [
                {
                    "label": "Kernel Weights",
                    "expression": "7 × 7 × 3 × 64",
                    "result": 9408,
                    "explanation": "64 independent filters of size 7x7 operating over 3 input channels. No bias is used because it is immediately followed by Batch Normalization."
                }
            ]
        },
        "educationalNote": {
            "summary": "Large 7x7 filters downsample inputs early.",
            "detailed": "Slides 64 different 7x7 kernels with a stride of 2 to extract general contours while shrinking spatial grid sizes.",
            "whyItMatters": "Shrinks resolution from 224x224 to 112x112, reducing downstream computation.",
            "keyTakeaway": "Early pooling and large stride convolutions preserve core shapes while minimizing compute requirements."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "blue",
        "icon": "layers"
    })
    connections.append({ "id": "c_input_conv1", "sourceId": "input_1", "targetId": "conv1_conv", "type": "sequential" })
    y_ptr += 150

    # conv1_bn
    layers.append({
        "id": "conv1_bn",
        "type": "batch_norm",
        "name": "conv1_bn",
        "inputShape": { "dimensions": [None, 112, 112, 64], "description": "112×112×64" },
        "outputShape": { "dimensions": [None, 112, 112, 64], "description": "112×112×64" },
        "config": { "axis": 3, "momentum": 0.99, "epsilon": 0.001 },
        "parameters": {
            "total": 256,
            "weights": 128,
            "biases": 128,
            "formula": "4 × channels",
            "calculationSteps": [
                {
                    "label": "Trainable parameters (gamma & beta)",
                    "expression": "2 × 64",
                    "result": 128,
                    "explanation": "Scale parameter (gamma) and shift parameter (beta) for each channel."
                },
                {
                    "label": "Non-trainable parameters (mean & variance)",
                    "expression": "2 × 64",
                    "result": 128,
                    "explanation": "Moving mean and moving variance tracked during training."
                }
            ]
        },
        "educationalNote": {
            "summary": "Normalizes activations to stabilize training.",
            "detailed": "Batch Normalization shifts activations to mean 0 and variance 1 across batch dimensions to avoid internal covariate shifts.",
            "whyItMatters": "BN layers are essential to stabilize gradient updates in deep CNNs.",
            "keyTakeaway": "BN layers are essential to stabilize gradient updates in deep CNNs."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "gray",
        "icon": "activity"
    })
    connections.append({ "id": "c_conv1_bn", "sourceId": "conv1_conv", "targetId": "conv1_bn", "type": "sequential" })
    y_ptr += 150

    # conv1_relu
    layers.append({
        "id": "conv1_relu",
        "type": "activation",
        "name": "conv1_relu",
        "inputShape": { "dimensions": [None, 112, 112, 64], "description": "112×112×64" },
        "outputShape": { "dimensions": [None, 112, 112, 64], "description": "112×112×64" },
        "config": { "activation": "relu" },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": {
            "summary": "Applies rectified linear non-linearity.",
            "detailed": "Calculates f(x) = max(0, x) element-wise. Keeps active regions positive and sets negative features to zero.",
            "whyItMatters": "ReLU is computationally simple and prevents gradient saturation for positive inputs.",
            "keyTakeaway": "ReLU allows learning complex non-linear combinations of edges."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "pink",
        "icon": "zap"
    })
    connections.append({ "id": "c_conv1_relu", "sourceId": "conv1_bn", "targetId": "conv1_relu", "type": "sequential" })
    y_ptr += 150

    # pool1_pad
    layers.append({
        "id": "pool1_pad",
        "type": "activation",
        "name": "pool1_pad",
        "inputShape": { "dimensions": [None, 112, 112, 64], "description": "112×112×64" },
        "outputShape": { "dimensions": [None, 114, 114, 64], "description": "114×114×64" },
        "config": { "padding": [[1, 1], [1, 1]] },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": {
            "summary": "Pads borders to control MaxPooling dimensions.",
            "detailed": "Adds zero borders around the 112x112 feature map to expand it to 114x114, ensuring MaxPooling dimensions fit correctly.",
            "whyItMatters": "Ensures pooling doesn't ignore borders.",
            "keyTakeaway": "Zero padding avoids border information loss."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "gray",
        "icon": "crop"
    })
    connections.append({ "id": "c_pool1_pad", "sourceId": "conv1_relu", "targetId": "pool1_pad", "type": "sequential" })
    y_ptr += 150

    # pool1_pool
    layers.append({
        "id": "pool1_pool",
        "type": "max_pooling2d",
        "name": "pool1_pool",
        "inputShape": { "dimensions": [None, 114, 114, 64], "description": "114×114×64" },
        "outputShape": { "dimensions": [None, 56, 56, 64], "description": "56×56×64" },
        "config": { "poolSize": [3, 3], "strides": [2, 2], "padding": "valid" },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": {
            "summary": "MaxPooling downsamples features to 56×56.",
            "detailed": "Extracts the maximum active pixel in overlapping 3x3 cells with stride 2.",
            "whyItMatters": "Reduces downstream spatial dims and introduces local translation invariance.",
            "keyTakeaway": "MaxPooling reduces resolution while filtering peak activations."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "amber",
        "icon": "shrink"
    })
    connections.append({ "id": "c_pool1_pool", "sourceId": "pool1_pad", "targetId": "pool1_pool", "type": "sequential" })
    y_ptr += 150

    stem_ids = ["conv1_conv", "conv1_bn", "conv1_relu", "pool1_pad", "pool1_pool"]
    groups.append({
        "id": "group_stem",
        "name": "Input Stem",
        "description": "Stem layers downsampling the high-res input image to 56x56 prior to deep stage routing.",
        "layerIds": stem_ids,
        "color": colorTheme
    })

    # Bottleneck Blocks
    last_layer_id = "pool1_pool"
    stage_w_in = 64

    for stage_num, block_count, in_channels, bot_channels, out_channels, initial_stride in stages:
        for block_idx in range(1, block_count + 1):
            is_projection = (block_idx == 1)
            block_stride = initial_stride if is_projection else 1
            block_prefix = f"conv{stage_num}_block{block_idx}_"
            block_layer_ids = []

            l1_id = f"{block_prefix}1_conv"
            l1_in = stage_w_in if is_projection else out_channels
            l1_h = 56 if stage_num == 2 else (28 if stage_num == 3 else (14 if stage_num == 4 else 7))
            l1_out_h = l1_h // block_stride if block_stride > 1 else l1_h

            # 1. 1x1 Conv
            l1_weights = l1_in * bot_channels
            layers.append({
                "id": l1_id,
                "type": "conv2d",
                "name": l1_id,
                "inputShape": { "dimensions": [None, l1_h, l1_h, l1_in], "description": f"{l1_h}×{l1_h}×{l1_in}" },
                "outputShape": { "dimensions": [None, l1_h, l1_h, bot_channels], "description": f"{l1_h}×{l1_h}×{bot_channels}" }, # stride is 1
                "config": {
                    "filters": bot_channels,
                    "kernelSize": [1, 1],
                    "strides": [1, 1],
                    "padding": "valid",
                    "useBias": False,
                    "activation": "linear"
                },
                "parameters": {
                    "total": l1_weights,
                    "weights": l1_weights,
                    "biases": 0,
                    "formula": "input_channels × output_filters",
                    "calculationSteps": [
                        {
                            "label": "Weights",
                            "expression": f"{l1_in} × {bot_channels}",
                            "result": l1_weights,
                            "explanation": "1x1 bottleneck convolution to adjust dimensionality."
                        }
                    ]
                },
                "educationalNote": {
                    "summary": "1x1 bottleneck convolution to adjust dimensionality.",
                    "detailed": f"This 1x1 filter reduces channels to {bot_channels} prior to the expensive 3x3 convolution, saving parameters.",
                    "whyItMatters": "Controls computation scale in deep bottleneck blocks.",
                    "keyTakeaway": "1x1 convolutions act as spatial-preserving channel projection blocks."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "blue",
                "icon": "layers"
            })
            connections.append({ "id": f"c_{last_layer_id}_{l1_id}", "sourceId": last_layer_id, "targetId": l1_id, "type": "sequential" })
            block_layer_ids.append(l1_id)
            y_ptr += 150

            # 1_bn
            l1_bn_id = f"{block_prefix}1_bn"
            layers.append({
                "id": l1_bn_id,
                "type": "batch_norm",
                "name": l1_bn_id,
                "inputShape": { "dimensions": [None, l1_h, l1_h, bot_channels], "description": f"{l1_h}×{l1_h}×{bot_channels}" },
                "outputShape": { "dimensions": [None, l1_h, l1_h, bot_channels], "description": f"{l1_h}×{l1_h}×{bot_channels}" },
                "config": { "axis": 3, "momentum": 0.99, "epsilon": 0.001 },
                "parameters": {
                    "total": bot_channels * 4,
                    "weights": bot_channels * 2,
                    "biases": bot_channels * 2,
                    "formula": "4 × channels",
                    "calculationSteps": [
                        {
                            "label": "Parameters",
                            "expression": f"4 × {bot_channels}",
                            "result": bot_channels * 4,
                            "explanation": "Moving mean/variance + trainable scales/biases."
                        }
                    ]
                },
                "educationalNote": {
                    "summary": "Normalizes bottleneck channels.",
                    "detailed": "Normalizes the compressed activation space before applying spatial convolutions.",
                    "whyItMatters": "Ensures inputs to downstream spatial convolutions are scaled identically.",
                    "keyTakeaway": "Stabilizes inputs for subsequent spatial convs."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "gray",
                "icon": "activity"
            })
            connections.append({ "id": f"c_{l1_id}_{l1_bn_id}", "sourceId": l1_id, "targetId": l1_bn_id, "type": "sequential" })
            block_layer_ids.append(l1_bn_id)
            y_ptr += 150

            # 1_relu
            l1_relu_id = f"{block_prefix}1_relu"
            layers.append({
                "id": l1_relu_id,
                "type": "activation",
                "name": l1_relu_id,
                "inputShape": { "dimensions": [None, l1_h, l1_h, bot_channels], "description": f"{l1_h}×{l1_h}×{bot_channels}" },
                "outputShape": { "dimensions": [None, l1_h, l1_h, bot_channels], "description": f"{l1_h}×{l1_h}×{bot_channels}" },
                "config": { "activation": "relu" },
                "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
                "educationalNote": {
                    "summary": "ReLU activation.",
                    "detailed": "Introduces activation non-linearity.",
                    "whyItMatters": "Allows complex feature mapping.",
                    "keyTakeaway": "Introduces activation non-linearity."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "pink",
                "icon": "zap"
            })
            connections.append({ "id": f"c_{l1_bn_id}_{l1_relu_id}", "sourceId": l1_bn_id, "targetId": l1_relu_id, "type": "sequential" })
            block_layer_ids.append(l1_relu_id)
            y_ptr += 150

            # 2. 3x3 Conv
            l2_id = f"{block_prefix}2_conv"
            l2_weights = 3 * 3 * bot_channels * bot_channels
            layers.append({
                "id": l2_id,
                "type": "conv2d",
                "name": l2_id,
                "inputShape": { "dimensions": [None, l1_h, l1_h, bot_channels], "description": f"{l1_h}×{l1_h}×{bot_channels}" },
                "outputShape": { "dimensions": [None, l1_out_h, l1_out_h, bot_channels], "description": f"{l1_out_h}×{l1_out_h}×{bot_channels}" },
                "config": {
                    "filters": bot_channels,
                    "kernelSize": [3, 3],
                    "strides": [block_stride, block_stride],
                    "padding": "same",
                    "useBias": False,
                    "activation": "linear"
                },
                "parameters": {
                    "total": l2_weights,
                    "weights": l2_weights,
                    "biases": 0,
                    "formula": "kernel_height × kernel_width × input_channels × output_filters",
                    "calculationSteps": [
                        {
                            "label": "Kernel Weights",
                            "expression": f"3 × 3 × {bot_channels} × {bot_channels}",
                            "result": l2_weights,
                            "explanation": "3x3 spatial convolution for feature extraction."
                        }
                    ]
                },
                "educationalNote": {
                    "summary": "3x3 convolution performing spatial feature extraction.",
                    "detailed": f"Extracts patterns (corners, junctions) on the bottleneck channel representation. Stride of {block_stride} handles spatial downsampling.",
                    "whyItMatters": "Combines spatial and channel features on the compressed bottleneck representation.",
                    "keyTakeaway": "Performs spatial convolutions on the reduced volume to save weights."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "blue",
                "icon": "layers"
            })
            connections.append({ "id": f"c_{l1_relu_id}_{l2_id}", "sourceId": l1_relu_id, "targetId": l2_id, "type": "sequential" })
            block_layer_ids.append(l2_id)
            y_ptr += 150

            # 2_bn
            l2_bn_id = f"{block_prefix}2_bn"
            layers.append({
                "id": l2_bn_id,
                "type": "batch_norm",
                "name": l2_bn_id,
                "inputShape": { "dimensions": [None, l1_out_h, l1_out_h, bot_channels], "description": f"{l1_out_h}×{l1_out_h}×{bot_channels}" },
                "outputShape": { "dimensions": [None, l1_out_h, l1_out_h, bot_channels], "description": f"{l1_out_h}×{l1_out_h}×{bot_channels}" },
                "config": { "axis": 3, "momentum": 0.99, "epsilon": 0.001 },
                "parameters": {
                    "total": bot_channels * 4,
                    "weights": bot_channels * 2,
                    "biases": bot_channels * 2,
                    "formula": "4 × channels",
                    "calculationSteps": [
                        {
                            "label": "Parameters",
                            "expression": f"4 × {bot_channels}",
                            "result": bot_channels * 4,
                            "explanation": "BatchNorm tracking vectors."
                        }
                    ]
                },
                "educationalNote": {
                    "summary": "Normalizes 3x3 outputs.",
                    "detailed": "Scales features before the final dimension projection.",
                    "whyItMatters": "Restores normalization properties.",
                    "keyTakeaway": "Maintains spatial scale consistency."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "gray",
                "icon": "activity"
            })
            connections.append({ "id": f"c_{l2_id}_{l2_bn_id}", "sourceId": l2_id, "targetId": l2_bn_id, "type": "sequential" })
            block_layer_ids.append(l2_bn_id)
            y_ptr += 150

            # 2_relu
            l2_relu_id = f"{block_prefix}2_relu"
            layers.append({
                "id": l2_relu_id,
                "type": "activation",
                "name": l2_relu_id,
                "inputShape": { "dimensions": [None, l1_out_h, l1_out_h, bot_channels], "description": f"{l1_out_h}×{l1_out_h}×{bot_channels}" },
                "outputShape": { "dimensions": [None, l1_out_h, l1_out_h, bot_channels], "description": f"{l1_out_h}×{l1_out_h}×{bot_channels}" },
                "config": { "activation": "relu" },
                "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
                "educationalNote": {
                    "summary": "ReLU activation.",
                    "detailed": "Prepares signals for bottleneck expansion.",
                    "whyItMatters": "Locks in positive features.",
                    "keyTakeaway": "Non-linear activation."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "pink",
                "icon": "zap"
            })
            connections.append({ "id": f"c_{l2_bn_id}_{l2_relu_id}", "sourceId": l2_bn_id, "targetId": l2_relu_id, "type": "sequential" })
            block_layer_ids.append(l2_relu_id)
            y_ptr += 150

            # 3. 1x1 Conv (Restore)
            l3_id = f"{block_prefix}3_conv"
            l3_weights = bot_channels * out_channels
            layers.append({
                "id": l3_id,
                "type": "conv2d",
                "name": l3_id,
                "inputShape": { "dimensions": [None, l1_out_h, l1_out_h, bot_channels], "description": f"{l1_out_h}×{l1_out_h}×{bot_channels}" },
                "outputShape": { "dimensions": [None, l1_out_h, l1_out_h, out_channels], "description": f"{l1_out_h}×{l1_out_h}×{out_channels}" },
                "config": {
                    "filters": out_channels,
                    "kernelSize": [1, 1],
                    "strides": [1, 1],
                    "padding": "valid",
                    "useBias": False,
                    "activation": "linear"
                },
                "parameters": {
                    "total": l3_weights,
                    "weights": l3_weights,
                    "biases": 0,
                    "formula": "input_channels × output_filters",
                    "calculationSteps": [
                        {
                            "label": "Weights",
                            "expression": f"{bot_channels} × {out_channels}",
                            "result": l3_weights,
                            "explanation": "Restores dimensionality back to representation capacity."
                        }
                    ]
                },
                "educationalNote": {
                    "summary": "1x1 conv expanding channel representation.",
                    "detailed": f"Expands output from {bot_channels} channels back to {out_channels} channels, restoring visual descriptors.",
                    "whyItMatters": "Prepares the tensor size to match the original skip connection shape.",
                    "keyTakeaway": "Expansion restores the high-dimensional capacity of features before residual adding."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "blue",
                "icon": "layers"
            })
            connections.append({ "id": f"c_{l2_relu_id}_{l3_id}", "sourceId": l2_relu_id, "targetId": l3_id, "type": "sequential" })
            block_layer_ids.append(l3_id)
            y_ptr += 150

            # 3_bn
            l3_bn_id = f"{block_prefix}3_bn"
            layers.append({
                "id": l3_bn_id,
                "type": "batch_norm",
                "name": l3_bn_id,
                "inputShape": { "dimensions": [None, l1_out_h, l1_out_h, out_channels], "description": f"{l1_out_h}×{l1_out_h}×{out_channels}" },
                "outputShape": { "dimensions": [None, l1_out_h, l1_out_h, out_channels], "description": f"{l1_out_h}×{l1_out_h}×{out_channels}" },
                "config": { "axis": 3, "momentum": 0.99, "epsilon": 0.001 },
                "parameters": {
                    "total": out_channels * 4,
                    "weights": out_channels * 2,
                    "biases": out_channels * 2,
                    "formula": "4 × channels",
                    "calculationSteps": [
                        {
                            "label": "Parameters",
                            "expression": f"4 × {out_channels}",
                            "result": out_channels * 4,
                            "explanation": "BatchNorm variables."
                        }
                    ]
                },
                "educationalNote": {
                    "summary": "Normalizes final bottleneck outputs.",
                    "detailed": "Normalizes final features before additions.",
                    "whyItMatters": "Controls scales on residual additions.",
                    "keyTakeaway": "Ensures stable signals for addition."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "gray",
                "icon": "activity"
            })
            connections.append({ "id": f"c_{l3_id}_{l3_bn_id}", "sourceId": l3_id, "targetId": l3_bn_id, "type": "sequential" })
            block_layer_ids.append(l3_bn_id)
            y_ptr += 150

            # SHORTCUT path
            shortcut_source = last_layer_id
            if is_projection:
                l0_id = f"{block_prefix}0_conv"
                l0_weights = l1_in * out_channels
                layers.append({
                    "id": l0_id,
                    "type": "conv2d",
                    "name": l0_id,
                    "inputShape": { "dimensions": [None, l1_h, l1_h, l1_in], "description": f"{l1_h}×{l1_h}×{l1_in}" },
                    "outputShape": { "dimensions": [None, l1_out_h, l1_out_h, out_channels], "description": f"{l1_out_h}×{l1_out_h}×{out_channels}" },
                    "config": {
                        "filters": out_channels,
                        "kernelSize": [1, 1],
                        "strides": [block_stride, block_stride],
                        "padding": "valid",
                        "useBias": False,
                        "activation": "linear"
                    },
                    "parameters": {
                        "total": l0_weights,
                        "weights": l0_weights,
                        "biases": 0,
                        "formula": "input_channels × output_filters",
                        "calculationSteps": [
                            {
                                "label": "Weights",
                                "expression": f"{l1_in} × {out_channels}",
                                "result": l0_weights,
                                "explanation": "Projects shortcut channels."
                            }
                        ]
                    },
                    "educationalNote": {
                        "summary": "1x1 projection shortcut matching shapes.",
                        "detailed": f"Ensures the shortcut tensor matches the main branch shape {out_channels} for element-wise addition.",
                        "whyItMatters": "Required to project spatial and channel dimensions.",
                        "keyTakeaway": "Used only when spatial grid or channels change between blocks."
                    },
                    "position": { "x": 100, "y": y_ptr - 450 },
                    "color": "violet",
                    "icon": "git-branch"
                })
                connections.append({ "id": f"c_{shortcut_source}_{l0_id}", "sourceId": shortcut_source, "targetId": l0_id, "type": "skip" })
                block_layer_ids.append(l0_id)

                l0_bn_id = f"{block_prefix}0_bn"
                layers.append({
                    "id": l0_bn_id,
                    "type": "batch_norm",
                    "name": l0_bn_id,
                    "inputShape": { "dimensions": [None, l1_out_h, l1_out_h, out_channels], "description": f"{l1_out_h}×{l1_out_h}×{out_channels}" },
                    "outputShape": { "dimensions": [None, l1_out_h, l1_out_h, out_channels], "description": f"{l1_out_h}×{l1_out_h}×{out_channels}" },
                    "config": { "axis": 3, "momentum": 0.99, "epsilon": 0.001 },
                    "parameters": {
                        "total": out_channels * 4,
                        "weights": out_channels * 2,
                        "biases": out_channels * 2,
                        "formula": "4 × channels",
                        "calculationSteps": [
                            {
                                "label": "Parameters",
                                "expression": f"4 × {out_channels}",
                                "result": out_channels * 4,
                                "explanation": "Normalizes shortcut output."
                            }
                        ]
                    },
                    "educationalNote": {
                        "summary": "Normalizes shortcut output.",
                        "detailed": "Applies Batch Normalization to the shortcut projection branch.",
                        "whyItMatters": "Maintains normal variance across shortcut outputs.",
                        "keyTakeaway": "Normalizes the projected skip connection."
                    },
                    "position": { "x": 100, "y": y_ptr - 300 },
                    "color": "gray",
                    "icon": "activity"
                })
                connections.append({ "id": f"c_{l0_id}_{l0_bn_id}", "sourceId": l0_id, "targetId": l0_bn_id, "type": "sequential" })
                block_layer_ids.append(l0_bn_id)
                shortcut_source = l0_bn_id

            # Add (Join)
            add_id = f"{block_prefix}add"
            layers.append({
                "id": add_id,
                "type": "add",
                "name": add_id,
                "inputShape": { "dimensions": [None, l1_out_h, l1_out_h, out_channels], "description": f"{out_channels} channels" },
                "outputShape": { "dimensions": [None, l1_out_h, l1_out_h, out_channels], "description": f"{out_channels} channels" },
                "config": {},
                "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
                "educationalNote": {
                    "summary": "Performs element-wise residual addition: F(x) + x.",
                    "detailed": "Adds the output of the convolutional sandwich to the skip connection. This enables gradients to flow directly backwards.",
                    "whyItMatters": "The core mathematical mechanism that avoids vanishing gradients in deep ResNets.",
                    "keyTakeaway": "Identity loops guarantee stable gradient updates."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "red",
                "icon": "plus-circle"
            })
            connections.append({ "id": f"c_{l3_bn_id}_{add_id}", "sourceId": l3_bn_id, "targetId": add_id, "type": "sequential" })
            if is_projection:
                connections.append({ "id": f"c_{shortcut_source}_{add_id}", "sourceId": shortcut_source, "targetId": add_id, "type": "sequential" })
            else:
                connections.append({ "id": f"c_{shortcut_source}_{add_id}", "sourceId": shortcut_source, "targetId": add_id, "type": "skip" })
            block_layer_ids.append(add_id)
            y_ptr += 150

            # Out (ReLU Activation)
            out_id = f"{block_prefix}out"
            layers.append({
                "id": out_id,
                "type": "activation",
                "name": out_id,
                "inputShape": { "dimensions": [None, l1_out_h, l1_out_h, out_channels], "description": f"{l1_out_h}×{l1_out_h}×{out_channels}" },
                "outputShape": { "dimensions": [None, l1_out_h, l1_out_h, out_channels], "description": f"{l1_out_h}×{l1_out_h}×{out_channels}" },
                "config": { "activation": "relu" },
                "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
                "educationalNote": {
                    "summary": "Activates block summation.",
                    "detailed": "Rectifies elements to introduce non-linearity at the block output.",
                    "whyItMatters": "Prepares activated features for the next block.",
                    "keyTakeaway": "Final activation step of the bottleneck block."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "pink",
                "icon": "zap"
            })
            connections.append({ "id": f"c_{add_id}_{out_id}", "sourceId": add_id, "targetId": out_id, "type": "sequential" })
            block_layer_ids.append(out_id)
            y_ptr += 150

            groups.append({
                "id": f"group_s{stage_num}_b{block_idx}",
                "name": f"Stage {stage_num} Block {block_idx}",
                "description": f"Bottleneck residual block: Conv 1x1 → 3x3 → 1x1 with {'projection' if is_projection else 'identity'} skip connection.",
                "layerIds": block_layer_ids,
                "color": "#3B82F6"
            })

            last_layer_id = out_id
        stage_w_in = out_channels

    # Global Average Pooling
    layers.append({
        "id": "avg_pool",
        "type": "global_average_pooling2d",
        "name": "avg_pool",
        "inputShape": { "dimensions": [None, 7, 7, 2048], "description": "7×7×2048" },
        "outputShape": { "dimensions": [None, 2048], "description": "2048" },
        "config": {},
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": {
            "summary": "Averages spatial dimensions to form a global feature vector.",
            "detailed": "Computes the spatial average of each of the 2,048 feature channels. Avoids parameter bloat associated with flattening.",
            "whyItMatters": "GAP acts as a global regularizer and reduces downstream parameters by 98%.",
            "keyTakeaway": "Replaces heavy fully connected layers with zero parameters."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "amber",
        "icon": "activity"
    })
    connections.append({ "id": f"c_{last_layer_id}_avg_pool", "sourceId": last_layer_id, "targetId": "avg_pool", "type": "sequential" })
    y_ptr += 150

    # Predictions
    pred_weights = 2048 * 1000
    layers.append({
        "id": "predictions",
        "type": "dense",
        "name": "predictions",
        "inputShape": { "dimensions": [None, 2048], "description": "2048" },
        "outputShape": { "dimensions": [None, 1000], "description": "1000" },
        "config": {
            "units": 1000,
            "activation": "softmax",
            "useBias": True
        },
        "parameters": {
            "total": pred_weights + 1000,
            "weights": pred_weights,
            "biases": 1000,
            "formula": "(input_features + 1) × output_units",
            "calculationSteps": [
                {
                    "label": "Weights",
                    "expression": "2048 × 1000",
                    "result": pred_weights,
                    "explanation": "Maps the 2048 pooled features to 1000 ImageNet classifications."
                },
                {
                    "label": "Biases",
                    "expression": "1000",
                    "result": 1000,
                    "explanation": "One learnable bias parameter per output category."
                }
            ]
        },
        "educationalNote": {
            "summary": "Computes probabilities for the 1,000 target classes.",
            "detailed": "Uses softmax activation function to compute class probabilities.",
            "whyItMatters": "Converts numerical logits into values that sum to 1.",
            "keyTakeaway": "Classification decision layer."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "violet",
        "icon": "award"
    })
    connections.append({ "id": "c_avg_pool_predictions", "sourceId": "avg_pool", "targetId": "predictions", "type": "sequential" })

    groups.append({
        "id": "group_classifier",
        "name": "Global Pooling & Classification",
        "description": "Global average pooling averaging spatial channels to a 2048 feature vector, followed by predictions.",
        "layerIds": ["avg_pool", "predictions"],
        "color": "#8B5CF6"
    })

    model_data = {
        "id": model_id,
        "name": name,
        "fullName": fullName,
        "paperYear": paperYear,
        "authors": authors,
        "paperUrl": paperUrl,
        "depth": depth,
        "totalParameters": totalParameters,
        "totalFLOPs": totalFLOPs,
        "inputShape": { "channels": 3, "height": 224, "width": 224 },
        "top1Accuracy": top1Accuracy,
        "top5Accuracy": top5Accuracy,
        "memoryUsage": memoryUsage,
        "description": description,
        "colorTheme": colorTheme,
        "tags": tags,
        "architecture": {
            "layers": layers,
            "connections": connections,
            "groups": groups
        }
    }

    output_path = os.path.join(os.path.dirname(__file__), f"{model_id}.json")
    write_json(output_path, model_data)

# Helper to generate ResNet V2 (Pre-activation)
def generate_resnet_v2(model_id, name, fullName, paperYear, authors, paperUrl, depth, totalParameters, totalFLOPs, top1Accuracy, top5Accuracy, memoryUsage, description, tags, colorTheme, stages):
    layers = []
    connections = []
    groups = []
    y_ptr = 0

    # 1. Input Stem (No preact)
    layers.append({
        "id": "input_1",
        "type": "input",
        "name": "input_1",
        "inputShape": { "dimensions": [None, 224, 224, 3], "description": "224×224×3 RGB Image" },
        "outputShape": { "dimensions": [None, 224, 224, 3], "description": "224×224×3 RGB Image" },
        "config": { "shape": [224, 224, 3] },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": {
            "summary": "Retinal layer receiving raw RGB pixel matrices.",
            "detailed": "Accepts normalized three-channel RGB images of size 224x224. This spatial standardization ensures weight compatibility in subsequent layers.",
            "whyItMatters": "Establishes spatial dimensions for the network.",
            "keyTakeaway": "Fixed input sizes are critical to prevent spatial alignment errors."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "emerald",
        "icon": "image"
    })
    y_ptr += 150

    # conv1_pad
    layers.append({
        "id": "conv1_pad",
        "type": "activation",
        "name": "conv1_pad",
        "inputShape": { "dimensions": [None, 224, 224, 3], "description": "224×224×3" },
        "outputShape": { "dimensions": [None, 230, 230, 3], "description": "230×230×3" },
        "config": { "padding": [[3, 3], [3, 3]] },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": {
            "summary": "Zero padding for the large conv1 kernel.",
            "detailed": "Pads borders with zeros to keep convolution dimensions matching standard Keras shapes.",
            "whyItMatters": "Required to properly shape spatial grids in stem layers.",
            "keyTakeaway": "Maintains spatial boundaries."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "gray",
        "icon": "crop"
    })
    connections.append({ "id": "c_input_pad", "sourceId": "input_1", "targetId": "conv1_pad", "type": "sequential" })
    y_ptr += 150

    # conv1_conv (bias is True in V2!)
    conv1_weights = 7 * 7 * 3 * 64
    layers.append({
        "id": "conv1_conv",
        "type": "conv2d",
        "name": "conv1_conv",
        "inputShape": { "dimensions": [None, 230, 230, 3], "description": "230×230×3" },
        "outputShape": { "dimensions": [None, 112, 112, 64], "description": "112×112×64" },
        "config": {
            "filters": 64,
            "kernelSize": [7, 7],
            "strides": [2, 2],
            "padding": "valid",
            "useBias": True,
            "activation": "linear"
        },
        "parameters": {
            "total": conv1_weights + 64,
            "weights": conv1_weights,
            "biases": 64,
            "formula": "kernel_height × kernel_width × input_channels × output_filters + output_filters",
            "calculationSteps": [
                {
                    "label": "Kernel Weights",
                    "expression": "7 × 7 × 3 × 64",
                    "result": conv1_weights,
                    "explanation": "64 independent filters of size 7x7 operating over 3 input channels."
                },
                {
                    "label": "Biases",
                    "expression": "64",
                    "result": 64,
                    "explanation": "One bias parameter per output channel."
                }
            ]
        },
        "educationalNote": {
            "summary": "Large 7x7 filters downsample inputs early.",
            "detailed": "First spatial feature extractor, shrinking inputs to 112x112.",
            "whyItMatters": "Captures general contours while saving computing costs.",
            "keyTakeaway": "Early downsampling reduces volume processing."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "blue",
        "icon": "layers"
    })
    connections.append({ "id": "c_pad_conv1", "sourceId": "conv1_pad", "targetId": "conv1_conv", "type": "sequential" })
    y_ptr += 150

    # pool1_pad
    layers.append({
        "id": "pool1_pad",
        "type": "activation",
        "name": "pool1_pad",
        "inputShape": { "dimensions": [None, 112, 112, 64], "description": "112×112×64" },
        "outputShape": { "dimensions": [None, 114, 114, 64], "description": "114×114×64" },
        "config": { "padding": [[1, 1], [1, 1]] },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": {
            "summary": "Zero padding for pooling.",
            "detailed": "Pads input features before max pooling to fit spatial shapes.",
            "whyItMatters": "Maintains boundary details.",
            "keyTakeaway": "Pads borders."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "gray",
        "icon": "crop"
    })
    connections.append({ "id": "c_conv1_poolpad", "sourceId": "conv1_conv", "targetId": "pool1_pad", "type": "sequential" })
    y_ptr += 150

    # pool1_pool
    layers.append({
        "id": "pool1_pool",
        "type": "max_pooling2d",
        "name": "pool1_pool",
        "inputShape": { "dimensions": [None, 114, 114, 64], "description": "114×114×64" },
        "outputShape": { "dimensions": [None, 56, 56, 64], "description": "56×56×64" },
        "config": { "poolSize": [3, 3], "strides": [2, 2], "padding": "valid" },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": {
            "summary": "MaxPooling downsamples features to 56×56.",
            "detailed": "Filters feature map to reduce resolution to 56x56.",
            "whyItMatters": "Extracts translation invariant features and drops compute size.",
            "keyTakeaway": "Downsamples maps."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "amber",
        "icon": "shrink"
    })
    connections.append({ "id": "c_poolpad_pool", "sourceId": "pool1_pad", "targetId": "pool1_pool", "type": "sequential" })
    y_ptr += 150

    stem_ids = ["conv1_pad", "conv1_conv", "pool1_pad", "pool1_pool"]
    groups.append({
        "id": "group_stem",
        "name": "Input Stem",
        "description": "Stem layers downsampling the high-res input image to 56x56.",
        "layerIds": stem_ids,
        "color": colorTheme
    })

    last_layer_id = "pool1_pool"
    stage_w_in = 64

    for stage_num, block_count, in_channels, bot_channels, out_channels, initial_stride in stages:
        for block_idx in range(1, block_count + 1):
            is_projection = (block_idx == 1)
            block_stride = initial_stride if is_projection else 1
            block_prefix = f"conv{stage_num}_block{block_idx}_"
            block_layer_ids = []

            l1_h = 56 if stage_num == 2 else (28 if stage_num == 3 else (14 if stage_num == 4 else 7))
            l1_out_h = l1_h // block_stride if block_stride > 1 else l1_h
            l_in = stage_w_in if is_projection else out_channels

            # Pre-activation BN
            preact_bn_id = f"{block_prefix}preact_bn"
            layers.append({
                "id": preact_bn_id,
                "type": "batch_norm",
                "name": preact_bn_id,
                "inputShape": { "dimensions": [None, l1_h, l1_h, l_in], "description": f"{l1_h}×{l1_h}×{l_in}" },
                "outputShape": { "dimensions": [None, l1_h, l1_h, l_in], "description": f"{l1_h}×{l1_h}×{l_in}" },
                "config": { "axis": 3, "momentum": 0.99, "epsilon": 1.001e-5 },
                "parameters": {
                    "total": l_in * 4,
                    "weights": l_in * 2,
                    "biases": l_in * 2,
                    "formula": "4 × channels",
                    "calculationSteps": [
                        { "label": "Parameters", "expression": f"4 × {l_in}", "result": l_in * 4, "explanation": "Pre-activation Batch Normalization scale and shift vectors." }
                    ]
                },
                "educationalNote": {
                    "summary": "Pre-activation Batch Normalization.",
                    "detailed": "Normalizes block inputs before applying convolutions, stabilizing gradient updates.",
                    "whyItMatters": "The core V2 enhancement that guarantees identity skip paths.",
                    "keyTakeaway": "Normalizing inputs before convolution yields smoother updates."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "gray",
                "icon": "activity"
            })
            connections.append({ "id": f"c_{last_layer_id}_{preact_bn_id}", "sourceId": last_layer_id, "targetId": preact_bn_id, "type": "sequential" })
            block_layer_ids.append(preact_bn_id)
            y_ptr += 150

            # Pre-activation ReLU
            preact_relu_id = f"{block_prefix}preact_relu"
            layers.append({
                "id": preact_relu_id,
                "type": "activation",
                "name": preact_relu_id,
                "inputShape": { "dimensions": [None, l1_h, l1_h, l_in], "description": f"{l1_h}×{l1_h}×{l_in}" },
                "outputShape": { "dimensions": [None, l1_h, l1_h, l_in], "description": f"{l1_h}×{l1_h}×{l_in}" },
                "config": { "activation": "relu" },
                "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
                "educationalNote": {
                    "summary": "Pre-activation ReLU.",
                    "detailed": "Activates the inputs before projection and convolution branches.",
                    "whyItMatters": "Permits full non-linear learning representation prior to convolutional mapping.",
                    "keyTakeaway": "Non-linear gating applied before convolution."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "pink",
                "icon": "zap"
            })
            connections.append({ "id": f"c_{preact_bn_id}_{preact_relu_id}", "sourceId": preact_bn_id, "targetId": preact_relu_id, "type": "sequential" })
            block_layer_ids.append(preact_relu_id)
            y_ptr += 150

            # Shortcut Path
            shortcut_source = last_layer_id
            if is_projection:
                l0_id = f"{block_prefix}0_conv"
                l0_weights = l_in * out_channels
                layers.append({
                    "id": l0_id,
                    "type": "conv2d",
                    "name": l0_id,
                    "inputShape": { "dimensions": [None, l1_h, l1_h, l_in], "description": f"{l1_h}×{l1_h}×{l_in}" },
                    "outputShape": { "dimensions": [None, l1_out_h, l1_out_h, out_channels], "description": f"{l1_out_h}×{l1_out_h}×{out_channels}" },
                    "config": {
                        "filters": out_channels,
                        "kernelSize": [1, 1],
                        "strides": [block_stride, block_stride],
                        "padding": "valid",
                        "useBias": True, # Keras default
                        "activation": "linear"
                    },
                    "parameters": {
                        "total": l0_weights + out_channels,
                        "weights": l0_weights,
                        "biases": out_channels,
                        "formula": "input_channels × output_filters + output_filters",
                        "calculationSteps": [
                            { "label": "Weights", "expression": f"{l_in} × {out_channels}", "result": l0_weights, "explanation": "1x1 projection kernel weights." },
                            { "label": "Biases", "expression": f"{out_channels}", "result": out_channels, "explanation": "Projection bias parameters." }
                        ]
                    },
                    "educationalNote": {
                        "summary": "Shortcut projection mapping channels and grids.",
                        "detailed": "Outputs matched channel dimensions using 1x1 conv over pre-activated inputs.",
                        "whyItMatters": "Synchronizes feature shapes for residual add.",
                        "keyTakeaway": "Shortcut projection adapts shapes."
                    },
                    "position": { "x": 100, "y": y_ptr + 450 },
                    "color": "violet",
                    "icon": "git-branch"
                })
                connections.append({ "id": f"c_{preact_relu_id}_{l0_id}", "sourceId": preact_relu_id, "targetId": l0_id, "type": "skip" })
                block_layer_ids.append(l0_id)
                shortcut_source = l0_id

            # Main branch conv 1
            l1_conv_id = f"{block_prefix}1_conv"
            l1_weights = l_in * bot_channels
            layers.append({
                "id": l1_conv_id,
                "type": "conv2d",
                "name": l1_conv_id,
                "inputShape": { "dimensions": [None, l1_h, l1_h, l_in], "description": f"{l1_h}×{l1_h}×{l_in}" },
                "outputShape": { "dimensions": [None, l1_h, l1_h, bot_channels], "description": f"{l1_h}×{l1_h}×{bot_channels}" },
                "config": {
                    "filters": bot_channels,
                    "kernelSize": [1, 1],
                    "strides": [1, 1],
                    "padding": "valid",
                    "useBias": False,
                    "activation": "linear"
                },
                "parameters": {
                    "total": l1_weights,
                    "weights": l1_weights,
                    "biases": 0,
                    "formula": "input_channels × output_filters",
                    "calculationSteps": [
                        { "label": "Weights", "expression": f"{l_in} × {bot_channels}", "result": l1_weights, "explanation": "1x1 bottleneck compress weights." }
                    ]
                },
                "educationalNote": {
                    "summary": "1x1 bottleneck layer.",
                    "detailed": "Compresses channels to bottleneck dimensions, preserving spatial features.",
                    "whyItMatters": "Saves computations prior to the spatial convolution.",
                    "keyTakeaway": "Bottle compression reduces compute complexity."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "blue",
                "icon": "layers"
            })
            connections.append({ "id": f"c_{preact_relu_id}_{l1_conv_id}", "sourceId": preact_relu_id, "targetId": l1_conv_id, "type": "sequential" })
            block_layer_ids.append(l1_conv_id)
            y_ptr += 150

            # Main branch BN 1
            l1_bn_id = f"{block_prefix}1_bn"
            layers.append({
                "id": l1_bn_id,
                "type": "batch_norm",
                "name": l1_bn_id,
                "inputShape": { "dimensions": [None, l1_h, l1_h, bot_channels], "description": f"{l1_h}×{l1_h}×{bot_channels}" },
                "outputShape": { "dimensions": [None, l1_h, l1_h, bot_channels], "description": f"{l1_h}×{l1_h}×{bot_channels}" },
                "config": { "axis": 3, "momentum": 0.99, "epsilon": 1.001e-5 },
                "parameters": {
                    "total": bot_channels * 4,
                    "weights": bot_channels * 2,
                    "biases": bot_channels * 2,
                    "formula": "4 × channels",
                    "calculationSteps": [
                        { "label": "Parameters", "expression": f"4 × {bot_channels}", "result": bot_channels * 4, "explanation": "BatchNorm vectors." }
                    ]
                },
                "educationalNote": {
                    "summary": "Bottleneck normalization.",
                    "detailed": "Normalizes compressed activations.",
                    "whyItMatters": "Maintains activation boundaries.",
                    "keyTakeaway": "Maintains normalization."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "gray",
                "icon": "activity"
            })
            connections.append({ "id": f"c_{l1_conv_id}_{l1_bn_id}", "sourceId": l1_conv_id, "targetId": l1_bn_id, "type": "sequential" })
            block_layer_ids.append(l1_bn_id)
            y_ptr += 150

            # Main branch ReLU 1
            l1_relu_id = f"{block_prefix}1_relu"
            layers.append({
                "id": l1_relu_id,
                "type": "activation",
                "name": l1_relu_id,
                "inputShape": { "dimensions": [None, l1_h, l1_h, bot_channels], "description": f"{l1_h}×{l1_h}×{bot_channels}" },
                "outputShape": { "dimensions": [None, l1_h, l1_h, bot_channels], "description": f"{l1_h}×{l1_h}×{bot_channels}" },
                "config": { "activation": "relu" },
                "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
                "educationalNote": {
                    "summary": "Bottleneck ReLU.",
                    "detailed": "Rectifies features to prepare for spatial convolutions.",
                    "whyItMatters": "Locking in activation signals.",
                    "keyTakeaway": "Activates compressed representations."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "pink",
                "icon": "zap"
            })
            connections.append({ "id": f"c_{l1_bn_id}_{l1_relu_id}", "sourceId": l1_bn_id, "targetId": l1_relu_id, "type": "sequential" })
            block_layer_ids.append(l1_relu_id)
            y_ptr += 150

            # Main branch Pad 2
            l2_pad_id = f"{block_prefix}2_pad"
            layers.append({
                "id": l2_pad_id,
                "type": "activation",
                "name": l2_pad_id,
                "inputShape": { "dimensions": [None, l1_h, l1_h, bot_channels], "description": f"{l1_h}×{l1_h}×{bot_channels}" },
                "outputShape": { "dimensions": [None, l1_h + 2, l1_h + 2, bot_channels], "description": f"{l1_h+2}×{l1_h+2}×{bot_channels}" },
                "config": { "padding": [[1, 1], [1, 1]] },
                "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
                "educationalNote": {
                    "summary": "Zero padding for 3x3 convolution.",
                    "detailed": "Adds zero borders around features before spatial filtering.",
                    "whyItMatters": "Ensures boundary pixel representation.",
                    "keyTakeaway": "Pads spatial grids."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "gray",
                "icon": "crop"
            })
            connections.append({ "id": f"c_{l1_relu_id}_{l2_pad_id}", "sourceId": l1_relu_id, "targetId": l2_pad_id, "type": "sequential" })
            block_layer_ids.append(l2_pad_id)
            y_ptr += 150

            # Main branch conv 2 (3x3 spatial filter, stride=block_stride)
            l2_conv_id = f"{block_prefix}2_conv"
            l2_weights = 3 * 3 * bot_channels * bot_channels
            layers.append({
                "id": l2_conv_id,
                "type": "conv2d",
                "name": l2_conv_id,
                "inputShape": { "dimensions": [None, l1_h + 2, l1_h + 2, bot_channels], "description": f"{l1_h+2}×{l1_h+2}×{bot_channels}" },
                "outputShape": { "dimensions": [None, l1_out_h, l1_out_h, bot_channels], "description": f"{l1_out_h}×{l1_out_h}×{bot_channels}" },
                "config": {
                    "filters": bot_channels,
                    "kernelSize": [3, 3],
                    "strides": [block_stride, block_stride],
                    "padding": "valid",
                    "useBias": False,
                    "activation": "linear"
                },
                "parameters": {
                    "total": l2_weights,
                    "weights": l2_weights,
                    "biases": 0,
                    "formula": "kernel_height × kernel_width × input_channels × output_filters",
                    "calculationSteps": [
                        { "label": "Kernel Weights", "expression": f"3 × 3 × {bot_channels} × {bot_channels}", "result": l2_weights, "explanation": "3x3 spatial filtering weights." }
                    ]
                },
                "educationalNote": {
                    "summary": "3x3 spatial convolution.",
                    "detailed": "Convolves 3x3 kernel over spatial grids to extract patterns. Performs downsampling if stride=2.",
                    "whyItMatters": "Core feature extractor layer in ResNet block.",
                    "keyTakeaway": "Performs spatial convolutions."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "blue",
                "icon": "layers"
            })
            connections.append({ "id": f"c_{l2_pad_id}_{l2_conv_id}", "sourceId": l2_pad_id, "targetId": l2_conv_id, "type": "sequential" })
            block_layer_ids.append(l2_conv_id)
            y_ptr += 150

            # Main branch BN 2
            l2_bn_id = f"{block_prefix}2_bn"
            layers.append({
                "id": l2_bn_id,
                "type": "batch_norm",
                "name": l2_bn_id,
                "inputShape": { "dimensions": [None, l1_out_h, l1_out_h, bot_channels], "description": f"{l1_out_h}×{l1_out_h}×{bot_channels}" },
                "outputShape": { "dimensions": [None, l1_out_h, l1_out_h, bot_channels], "description": f"{l1_out_h}×{l1_out_h}×{bot_channels}" },
                "config": { "axis": 3, "momentum": 0.99, "epsilon": 1.001e-5 },
                "parameters": {
                    "total": bot_channels * 4,
                    "weights": bot_channels * 2,
                    "biases": bot_channels * 2,
                    "formula": "4 × channels",
                    "calculationSteps": [
                        { "label": "Parameters", "expression": f"4 × {bot_channels}", "result": bot_channels * 4, "explanation": "BatchNorm tracking." }
                    ]
                },
                "educationalNote": {
                    "summary": "Spatial output normalization.",
                    "detailed": "Normalizes extracted spatial channels.",
                    "whyItMatters": "Prepares activations for final mapping.",
                    "keyTakeaway": "Normalizes outputs."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "gray",
                "icon": "activity"
            })
            connections.append({ "id": f"c_{l2_conv_id}_{l2_bn_id}", "sourceId": l2_conv_id, "targetId": l2_bn_id, "type": "sequential" })
            block_layer_ids.append(l2_bn_id)
            y_ptr += 150

            # Main branch ReLU 2
            l2_relu_id = f"{block_prefix}2_relu"
            layers.append({
                "id": l2_relu_id,
                "type": "activation",
                "name": l2_relu_id,
                "inputShape": { "dimensions": [None, l1_out_h, l1_out_h, bot_channels], "description": f"{l1_out_h}×{l1_out_h}×{bot_channels}" },
                "outputShape": { "dimensions": [None, l1_out_h, l1_out_h, bot_channels], "description": f"{l1_out_h}×{l1_out_h}×{bot_channels}" },
                "config": { "activation": "relu" },
                "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
                "educationalNote": {
                    "summary": "Spatial ReLU activation.",
                    "detailed": "Non-linear mapping prior to channel expansion.",
                    "whyItMatters": "Controls feature gradients.",
                    "keyTakeaway": "Activates spatial channels."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "pink",
                "icon": "zap"
            })
            connections.append({ "id": f"c_{l2_bn_id}_{l2_relu_id}", "sourceId": l2_bn_id, "targetId": l2_relu_id, "type": "sequential" })
            block_layer_ids.append(l2_relu_id)
            y_ptr += 150

            # Main branch conv 3 (1x1 restore layer, with bias in V2!)
            l3_conv_id = f"{block_prefix}3_conv"
            l3_weights = bot_channels * out_channels
            layers.append({
                "id": l3_conv_id,
                "type": "conv2d",
                "name": l3_conv_id,
                "inputShape": { "dimensions": [None, l1_out_h, l1_out_h, bot_channels], "description": f"{l1_out_h}×{l1_out_h}×{bot_channels}" },
                "outputShape": { "dimensions": [None, l1_out_h, l1_out_h, out_channels], "description": f"{l1_out_h}×{l1_out_h}×{out_channels}" },
                "config": {
                    "filters": out_channels,
                    "kernelSize": [1, 1],
                    "strides": [1, 1],
                    "padding": "valid",
                    "useBias": True, # V2 uses bias here!
                    "activation": "linear"
                },
                "parameters": {
                    "total": l3_weights + out_channels,
                    "weights": l3_weights,
                    "biases": out_channels,
                    "formula": "input_channels × output_filters + output_filters",
                    "calculationSteps": [
                        { "label": "Weights", "expression": f"{bot_channels} × {out_channels}", "result": l3_weights, "explanation": "1x1 projection weights." },
                        { "label": "Biases", "expression": f"{out_channels}", "result": out_channels, "explanation": "Projection bias vectors." }
                    ]
                },
                "educationalNote": {
                    "summary": "1x1 conv expanding channel representation.",
                    "detailed": f"Expands output from {bot_channels} channels back to {out_channels} channels.",
                    "whyItMatters": "Synthesizes final block features.",
                    "keyTakeaway": "Expansion restores channel volume."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "blue",
                "icon": "layers"
            })
            connections.append({ "id": f"c_{l2_relu_id}_{l3_conv_id}", "sourceId": l2_relu_id, "targetId": l3_conv_id, "type": "sequential" })
            block_layer_ids.append(l3_conv_id)
            y_ptr += 150

            # Add (Join) - output has no activation in V2!
            add_id = f"{block_prefix}add"
            layers.append({
                "id": add_id,
                "type": "add",
                "name": add_id,
                "inputShape": { "dimensions": [None, l1_out_h, l1_out_h, out_channels], "description": f"{out_channels} channels" },
                "outputShape": { "dimensions": [None, l1_out_h, l1_out_h, out_channels], "description": f"{out_channels} channels" },
                "config": {},
                "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
                "educationalNote": {
                    "summary": "Performs element-wise residual addition: F(x) + x.",
                    "detailed": "Combines the block input directly with the main residual path. The output is unactivated, preserving clean gradient paths.",
                    "whyItMatters": "V2 identity connections propagate gradients directly across blocks without non-linear gating.",
                    "keyTakeaway": "Direct identity summation improves backpropagation flow."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "red",
                "icon": "plus-circle"
            })
            connections.append({ "id": f"c_{l3_conv_id}_{add_id}", "sourceId": l3_conv_id, "targetId": add_id, "type": "sequential" })
            if is_projection:
                connections.append({ "id": f"c_{shortcut_source}_{add_id}", "sourceId": shortcut_source, "targetId": add_id, "type": "sequential" })
            else:
                connections.append({ "id": f"c_{shortcut_source}_{add_id}", "sourceId": shortcut_source, "targetId": add_id, "type": "skip" })
            block_layer_ids.append(add_id)
            y_ptr += 150

            groups.append({
                "id": f"group_s{stage_num}_b{block_idx}",
                "name": f"Stage {stage_num} Block {block_idx}",
                "description": f"Pre-activation bottleneck block: BN-ReLU → Conv 1x1 → BN-ReLU → Conv 3x3 → BN-ReLU → Conv 1x1.",
                "layerIds": block_layer_ids,
                "color": "#16A34A"
            })

            last_layer_id = add_id
        stage_w_in = out_channels

    # Final pre-activation outputs BN and ReLU!
    post_bn_id = "post_bn"
    layers.append({
        "id": post_bn_id,
        "type": "batch_norm",
        "name": post_bn_id,
        "inputShape": { "dimensions": [None, 7, 7, 2048], "description": "7×7×2048" },
        "outputShape": { "dimensions": [None, 7, 7, 2048], "description": "7×7×2048" },
        "config": { "axis": 3, "momentum": 0.99, "epsilon": 1.001e-5 },
        "parameters": {
            "total": 2048 * 4,
            "weights": 2048 * 2,
            "biases": 2048 * 2,
            "formula": "4 × channels",
            "calculationSteps": [
                { "label": "Parameters", "expression": "4 × 2048", "result": 8192, "explanation": "Final output Batch Normalization scales and shifts." }
            ]
        },
        "educationalNote": {
            "summary": "Post-stage final normalization.",
            "detailed": "Pre-activation architectures add a final BN to normalize feature maps before pooling.",
            "whyItMatters": "Prepares activations for representation matching.",
            "keyTakeaway": "Normalizes final feature vectors."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "gray",
        "icon": "activity"
    })
    connections.append({ "id": f"c_{last_layer_id}_postbn", "sourceId": last_layer_id, "targetId": post_bn_id, "type": "sequential" })
    y_ptr += 150

    post_relu_id = "post_relu"
    layers.append({
        "id": post_relu_id,
        "type": "activation",
        "name": post_relu_id,
        "inputShape": { "dimensions": [None, 7, 7, 2048], "description": "7×7×2048" },
        "outputShape": { "dimensions": [None, 7, 7, 2048], "description": "7×7×2048" },
        "config": { "activation": "relu" },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": {
            "summary": "Final ReLU gating.",
            "detailed": "Locks final features as active positive values before average pooling.",
            "whyItMatters": "Controls visual patterns before pooling.",
            "keyTakeaway": "Final activation."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "pink",
        "icon": "zap"
    })
    connections.append({ "id": f"c_{post_bn_id}_postrelu", "sourceId": post_bn_id, "targetId": post_relu_id, "type": "sequential" })
    y_ptr += 150

    # Global Average Pooling
    layers.append({
        "id": "avg_pool",
        "type": "global_average_pooling2d",
        "name": "avg_pool",
        "inputShape": { "dimensions": [None, 7, 7, 2048], "description": "7×7×2048" },
        "outputShape": { "dimensions": [None, 2048], "description": "2048" },
        "config": {},
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": {
            "summary": "Averages spatial dimensions to form a global feature vector.",
            "detailed": "Averages each 7x7 channel representation to a single vector, regularizing representations.",
            "whyItMatters": "GAP acts as a global regularizer and reduces downstream parameters by 98%.",
            "keyTakeaway": "Replaces heavy fully connected layers with zero parameters."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "amber",
        "icon": "activity"
    })
    connections.append({ "id": f"c_postrelu_avgpool", "sourceId": post_relu_id, "targetId": "avg_pool", "type": "sequential" })
    y_ptr += 150

    # Predictions
    pred_weights = 2048 * 1000
    layers.append({
        "id": "predictions",
        "type": "dense",
        "name": "predictions",
        "inputShape": { "dimensions": [None, 2048], "description": "2048" },
        "outputShape": { "dimensions": [None, 1000], "description": "1000" },
        "config": {
            "units": 1000,
            "activation": "softmax",
            "useBias": True
        },
        "parameters": {
            "total": pred_weights + 1000,
            "weights": pred_weights,
            "biases": 1000,
            "formula": "(input_features + 1) × output_units",
            "calculationSteps": [
                { "label": "Weights", "expression": "2048 × 1000", "result": pred_weights, "explanation": "Fully connected mapping weights." },
                { "label": "Biases", "expression": "1000", "result": 1000, "explanation": "Classification bias vectors." }
            ]
        },
        "educationalNote": {
            "summary": "Computes probabilities for the 1,000 target classes.",
            "detailed": "Uses softmax activation function to compute class probabilities.",
            "whyItMatters": "Converts numerical logits into values that sum to 1.",
            "keyTakeaway": "Classification decision layer."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "violet",
        "icon": "award"
    })
    connections.append({ "id": "c_avg_pool_predictions", "sourceId": "avg_pool", "targetId": "predictions", "type": "sequential" })

    groups.append({
        "id": "group_classifier",
        "name": "Global Pooling & Classification",
        "description": "Global average pooling averaging spatial channels, followed by predictions.",
        "layerIds": ["post_bn", "post_relu", "avg_pool", "predictions"],
        "color": "#8B5CF6"
    })

    model_data = {
        "id": model_id,
        "name": name,
        "fullName": fullName,
        "paperYear": paperYear,
        "authors": authors,
        "paperUrl": paperUrl,
        "depth": depth,
        "totalParameters": totalParameters,
        "totalFLOPs": totalFLOPs,
        "inputShape": { "channels": 3, "height": 224, "width": 224 },
        "top1Accuracy": top1Accuracy,
        "top5Accuracy": top5Accuracy,
        "memoryUsage": memoryUsage,
        "description": description,
        "colorTheme": colorTheme,
        "tags": tags,
        "architecture": {
            "layers": layers,
            "connections": connections,
            "groups": groups
        }
    }

    output_path = os.path.join(os.path.dirname(__file__), f"{model_id}.json")
    write_json(output_path, model_data)

# Helper to generate DenseNet
def generate_densenet(model_id, name, fullName, paperYear, authors, paperUrl, depth, totalParameters, totalFLOPs, top1Accuracy, top5Accuracy, memoryUsage, description, tags, colorTheme, db_configs):
    layers = []
    connections = []
    groups = []
    y_ptr = 0

    # 1. Stem
    layers.append({
        "id": "input_1",
        "type": "input",
        "name": "input_1",
        "inputShape": { "dimensions": [None, 224, 224, 3], "description": "224×224×3 RGB Image" },
        "outputShape": { "dimensions": [None, 224, 224, 3], "description": "224×224×3 RGB Image" },
        "config": { "shape": [224, 224, 3] },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": {
            "summary": "Retinal layer receiving raw RGB pixel matrices.",
            "detailed": "Accepts normalized three-channel RGB images of size 224x224. Spatial standardization ensures weight compatibility in downstream dense layers.",
            "whyItMatters": "Establishes spatial dimensions.",
            "keyTakeaway": "All input images are resized to 224x224x3 before forward propagation."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "emerald",
        "icon": "image"
    })
    y_ptr += 150

    # zero_padding2d
    layers.append({
        "id": "zero_padding2d",
        "type": "activation",
        "name": "zero_padding2d",
        "inputShape": { "dimensions": [None, 224, 224, 3], "description": "224×224×3" },
        "outputShape": { "dimensions": [None, 230, 230, 3], "description": "230×230×3" },
        "config": { "padding": [[3, 3], [3, 3]] },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": {
            "summary": "Pads image border with zeros.",
            "detailed": "Adds 3 rows/columns of zeros to borders, preparing for the large 7x7 stem convolution.",
            "whyItMatters": "Maintains spatial representation shapes in outer boundary elements.",
            "keyTakeaway": "Ensures stem output matches Keras shape exactly."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "gray",
        "icon": "crop"
    })
    connections.append({ "id": "c_in_pad", "sourceId": "input_1", "targetId": "zero_padding2d", "type": "sequential" })
    y_ptr += 150

    # conv1/conv
    layers.append({
        "id": "conv1/conv",
        "type": "conv2d",
        "name": "conv1/conv",
        "inputShape": { "dimensions": [None, 230, 230, 3], "description": "230×230×3" },
        "outputShape": { "dimensions": [None, 112, 112, 64], "description": "112×112×64" },
        "config": {
            "filters": 64,
            "kernelSize": [7, 7],
            "strides": [2, 2],
            "padding": "valid",
            "useBias": False,
            "activation": "linear"
        },
        "parameters": {
            "total": 9408,
            "weights": 9408,
            "biases": 0,
            "formula": "kernel_height × kernel_width × input_channels × output_filters",
            "calculationSteps": [
                {
                    "label": "Kernel Weights",
                    "expression": "7 × 7 × 3 × 64",
                    "result": 9408,
                    "explanation": "64 independent filters of size 7x7 operating over 3 input channels. No bias is used."
                }
            ]
        },
        "educationalNote": {
            "summary": "Extracts basic visual patterns and downsamples spatial size.",
            "detailed": "Uses large 7x7 filters to capture initial visual contexts while downsampling resolution to 112x112.",
            "whyItMatters": "Captures major shapes and boundaries while reducing computational density.",
            "keyTakeaway": "Stem convolutions reduce resolution for the dense blocks."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "blue",
        "icon": "layers"
    })
    connections.append({ "id": "c_pad_conv1", "sourceId": "zero_padding2d", "targetId": "conv1/conv", "type": "sequential" })
    y_ptr += 150

    # conv1/bn
    layers.append({
        "id": "conv1/bn",
        "type": "batch_norm",
        "name": "conv1/bn",
        "inputShape": { "dimensions": [None, 112, 112, 64], "description": "112×112×64" },
        "outputShape": { "dimensions": [None, 112, 112, 64], "description": "112×112×64" },
        "config": { "axis": 3, "momentum": 0.99, "epsilon": 0.001 },
        "parameters": {
            "total": 256,
            "weights": 128,
            "biases": 128,
            "formula": "4 × channels",
            "calculationSteps": [
                {
                    "label": "Parameters",
                    "expression": "4 × 64",
                    "result": 256,
                    "explanation": "Moving variables (mean, variance) + trainable scales (gamma, beta) per channel."
                }
            ]
        },
        "educationalNote": {
            "summary": "Normalizes stem activations.",
            "detailed": "Balances data scaling across the stem network.",
            "whyItMatters": "Avoids covariate shift early in training.",
            "keyTakeaway": "Stabilizes initial features."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "gray",
        "icon": "activity"
    })
    connections.append({ "id": "c_conv1_bn", "sourceId": "conv1/conv", "targetId": "conv1/bn", "type": "sequential" })
    y_ptr += 150

    # conv1/relu
    layers.append({
        "id": "conv1/relu",
        "type": "activation",
        "name": "conv1/relu",
        "inputShape": { "dimensions": [None, 112, 112, 64], "description": "112×112×64" },
        "outputShape": { "dimensions": [None, 112, 112, 64], "description": "112×112×64" },
        "config": { "activation": "relu" },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": {
            "summary": "ReLU activation.",
            "detailed": "Gives non-linear shapes to features.",
            "whyItMatters": "Permits mapping of complex shapes.",
            "keyTakeaway": "Introduces non-linearity."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "pink",
        "icon": "zap"
    })
    connections.append({ "id": "c_conv1_relu", "sourceId": "conv1/bn", "targetId": "conv1/relu", "type": "sequential" })
    y_ptr += 150

    # zero_padding2d_1
    layers.append({
        "id": "zero_padding2d_1",
        "type": "activation",
        "name": "zero_padding2d_1",
        "inputShape": { "dimensions": [None, 112, 112, 64], "description": "112×112×64" },
        "outputShape": { "dimensions": [None, 114, 114, 64], "description": "114×114×64" },
        "config": { "padding": [[1, 1], [1, 1]] },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": {
            "summary": "Zero padding for pooling.",
            "detailed": "Pads input borders to maintain visual maps across max pooling.",
            "whyItMatters": "Protects outer boundary structures.",
            "keyTakeaway": "Pads boundaries."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "gray",
        "icon": "crop"
    })
    connections.append({ "id": "c_relu_pad1", "sourceId": "conv1/relu", "targetId": "zero_padding2d_1", "type": "sequential" })
    y_ptr += 150

    # pool1
    layers.append({
        "id": "pool1",
        "type": "max_pooling2d",
        "name": "pool1",
        "inputShape": { "dimensions": [None, 114, 114, 64], "description": "114×114×64" },
        "outputShape": { "dimensions": [None, 56, 56, 64], "description": "56×56×64" },
        "config": { "poolSize": [3, 3], "strides": [2, 2], "padding": "valid" },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": {
            "summary": "Downsamples features to 56×56.",
            "detailed": "Reduces features to a smaller grid size of 56x56.",
            "whyItMatters": "Saves computing cost for downstream dense block processing.",
            "keyTakeaway": "MaxPooling downsamples features."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "amber",
        "icon": "shrink"
    })
    connections.append({ "id": "c_pad1_pool1", "sourceId": "zero_padding2d_1", "targetId": "pool1", "type": "sequential" })
    y_ptr += 150

    stem_layer_ids = ["zero_padding2d", "conv1/conv", "conv1/bn", "conv1/relu", "zero_padding2d_1", "pool1"]
    groups.append({
        "id": "group_stem",
        "name": "Input Stem",
        "description": "Stem layers downsampling the high-res input image to 56x56 prior to dense block propagation.",
        "layerIds": stem_layer_ids,
        "color": "#10B981"
    })

    k = 32  # growth rate
    current_channels = 64
    last_layer_id = "pool1"

    for db_num, num_layers, trans_prefix in db_configs:
        db_start_channels = current_channels
        db_layer_ids = []
        h_dim = 56 if db_num == 2 else (28 if db_num == 3 else (14 if db_num == 4 else 7))

        for layer_idx in range(1, num_layers + 1):
            block_prefix = f"conv{db_num}_block{layer_idx}_"
            block_l_ids = []

            # Bottleneck BN
            bn1_id = f"{block_prefix}0_bn"
            layers.append({
                "id": bn1_id,
                "type": "batch_norm",
                "name": bn1_id,
                "inputShape": { "dimensions": [None, h_dim, h_dim, current_channels], "description": f"{h_dim}×{h_dim}×{current_channels}" },
                "outputShape": { "dimensions": [None, h_dim, h_dim, current_channels], "description": f"{h_dim}×{h_dim}×{current_channels}" },
                "config": { "axis": 3, "momentum": 0.99, "epsilon": 0.001 },
                "parameters": {
                    "total": current_channels * 4,
                    "weights": current_channels * 2,
                    "biases": current_channels * 2,
                    "formula": "4 × channels",
                    "calculationSteps": [
                        { "label": "Parameters", "expression": f"4 × {current_channels}", "result": current_channels * 4, "explanation": "Pre-activation Batch Normalization." }
                    ]
                },
                "educationalNote": {
                    "summary": "Normalizes current accumulated features.",
                    "detailed": "Ensures the concatenated representation is normalized before bottleneck projection.",
                    "whyItMatters": "Keeps activations scaled properly across channels.",
                    "keyTakeaway": "Applies Batch Normalization first (Pre-activation ResNet style)."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "gray",
                "icon": "activity"
            })
            connections.append({ "id": f"c_{last_layer_id}_{bn1_id}", "sourceId": last_layer_id, "targetId": bn1_id, "type": "sequential" })
            block_l_ids.append(bn1_id)
            y_ptr += 150

            # Bottleneck ReLU
            relu1_id = f"{block_prefix}0_relu"
            layers.append({
                "id": relu1_id,
                "type": "activation",
                "name": relu1_id,
                "inputShape": { "dimensions": [None, h_dim, h_dim, current_channels], "description": f"{h_dim}×{h_dim}×{current_channels}" },
                "outputShape": { "dimensions": [None, h_dim, h_dim, current_channels], "description": f"{h_dim}×{h_dim}×{current_channels}" },
                "config": { "activation": "relu" },
                "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
                "educationalNote": {
                    "summary": "ReLU activation prior to conv.",
                    "detailed": "Pre-activation activation function.",
                    "whyItMatters": "Saves gradients from vanishing in deep stacks.",
                    "keyTakeaway": "Pre-activation layout ensures smoother gradient flow."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "pink",
                "icon": "zap"
            })
            connections.append({ "id": f"c_{bn1_id}_{relu1_id}", "sourceId": bn1_id, "targetId": relu1_id, "type": "sequential" })
            block_l_ids.append(relu1_id)
            y_ptr += 150

            # Bottleneck 1x1 Conv
            c1_id = f"{block_prefix}1_conv"
            c1_weights = current_channels * 128
            layers.append({
                "id": c1_id,
                "type": "conv2d",
                "name": c1_id,
                "inputShape": { "dimensions": [None, h_dim, h_dim, current_channels], "description": f"{h_dim}×{h_dim}×{current_channels}" },
                "outputShape": { "dimensions": [None, h_dim, h_dim, 128], "description": f"{h_dim}×{h_dim}×128" },
                "config": {
                    "filters": 128,
                    "kernelSize": [1, 1],
                    "strides": [1, 1],
                    "padding": "valid",
                    "useBias": False,
                    "activation": "linear"
                },
                "parameters": {
                    "total": c1_weights,
                    "weights": c1_weights,
                    "biases": 0,
                    "formula": "input_channels × output_filters",
                    "calculationSteps": [
                        { "label": "Weights", "expression": f"{current_channels} × 128", "result": c1_weights, "explanation": "Projection to 128 channels." }
                    ]
                },
                "educationalNote": {
                    "summary": "1x1 bottleneck convolution to compress channels.",
                    "detailed": f"Limits the incoming channel count ({current_channels}) down to a size of 128 channels, keeping computation manageable.",
                    "whyItMatters": "Bottleneck convolutions decrease parameter growth in deep networks.",
                    "keyTakeaway": "Bottlenecks limit parameter growth in densely connected blocks."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "blue",
                "icon": "layers"
            })
            connections.append({ "id": f"c_{relu1_id}_{c1_id}", "sourceId": relu1_id, "targetId": c1_id, "type": "sequential" })
            block_l_ids.append(c1_id)
            y_ptr += 150

            # Conv 3x3 BN
            bn2_id = f"{block_prefix}1_bn"
            layers.append({
                "id": bn2_id,
                "type": "batch_norm",
                "name": bn2_id,
                "inputShape": { "dimensions": [None, h_dim, h_dim, 128], "description": f"{h_dim}×{h_dim}×128" },
                "outputShape": { "dimensions": [None, h_dim, h_dim, 128], "description": f"{h_dim}×{h_dim}×128" },
                "config": { "axis": 3, "momentum": 0.99, "epsilon": 0.001 },
                "parameters": {
                    "total": 128 * 4,
                    "weights": 128 * 2,
                    "biases": 128 * 2,
                    "formula": "4 × channels",
                    "calculationSteps": [
                        { "label": "Parameters", "expression": "4 × 128", "result": 512, "explanation": "BatchNorm parameters." }
                    ]
                },
                "educationalNote": {
                    "summary": "Normalizes bottleneck features.",
                    "detailed": "Normalizes the bottleneck volume.",
                    "whyItMatters": "Maintains normal variance across bottleneck channels.",
                    "keyTakeaway": "Applies BN prior to spatial conv."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "gray",
                "icon": "activity"
            })
            connections.append({ "id": f"c_{c1_id}_{bn2_id}", "sourceId": c1_id, "targetId": bn2_id, "type": "sequential" })
            block_l_ids.append(bn2_id)
            y_ptr += 150

            # Conv 3x3 ReLU
            relu2_id = f"{block_prefix}1_relu"
            layers.append({
                "id": relu2_id,
                "type": "activation",
                "name": relu2_id,
                "inputShape": { "dimensions": [None, h_dim, h_dim, 128], "description": f"{h_dim}×{h_dim}×128" },
                "outputShape": { "dimensions": [None, h_dim, h_dim, 128], "description": f"{h_dim}×{h_dim}×128" },
                "config": { "activation": "relu" },
                "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
                "educationalNote": {
                    "summary": "ReLU activation.",
                    "detailed": "Non-linear activation step.",
                    "whyItMatters": "Controls visual mapping scales.",
                    "keyTakeaway": "Non-linear layer activation."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "pink",
                "icon": "zap"
            })
            connections.append({ "id": f"c_{bn2_id}_{relu2_id}", "sourceId": bn2_id, "targetId": relu2_id, "type": "sequential" })
            block_l_ids.append(relu2_id)
            y_ptr += 150

            # Conv 3x3 (produces growth rate k=32)
            c2_id = f"{block_prefix}2_conv"
            c2_weights = 3 * 3 * 128 * 32
            layers.append({
                "id": c2_id,
                "type": "conv2d",
                "name": c2_id,
                "inputShape": { "dimensions": [None, h_dim, h_dim, 128], "description": f"{h_dim}×{h_dim}×128" },
                "outputShape": { "dimensions": [None, h_dim, h_dim, 32], "description": f"{h_dim}×{h_dim}×32" },
                "config": {
                    "filters": 32,
                    "kernelSize": [3, 3],
                    "strides": [1, 1],
                    "padding": "same",
                    "useBias": False,
                    "activation": "linear"
                },
                "parameters": {
                    "total": c2_weights,
                    "weights": c2_weights,
                    "biases": 0,
                    "formula": "kernel_height × kernel_width × input_channels × output_filters",
                    "calculationSteps": [
                        { "label": "Kernel Weights", "expression": "3 × 3 × 128 × 32", "result": c2_weights, "explanation": "3x3 spatial filter producing growth rate channels." }
                    ]
                },
                "educationalNote": {
                    "summary": "Produces 'k=32' new features (growth rate).",
                    "detailed": f"The growth rate (k) is 32. This layer only needs to output 32 channels, representing the new features discovered.",
                    "whyItMatters": "Controls model size while adding new visual representations.",
                    "keyTakeaway": "Growth rate (k) defines how many channels each layer contributes."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "blue",
                "icon": "layers"
            })
            connections.append({ "id": f"c_{relu2_id}_{c2_id}", "sourceId": relu2_id, "targetId": c2_id, "type": "sequential" })
            block_l_ids.append(c2_id)
            y_ptr += 150

            # Concat
            concat_id = f"{block_prefix}concat"
            out_channels = current_channels + 32
            layers.append({
                "id": concat_id,
                "type": "concatenate",
                "name": concat_id,
                "inputShape": { "dimensions": [None, h_dim, h_dim, current_channels], "description": f"Input ({current_channels} ch) + New features (32 ch)" },
                "outputShape": { "dimensions": [None, h_dim, h_dim, out_channels], "description": f"{out_channels} channels" },
                "config": { "axis": 3 },
                "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
                "educationalNote": {
                    "summary": "Concatenates input with layer outputs.",
                    "detailed": f"Concatenates the block's input ({current_channels} channels) with the new 32 channels produced by the 3x3 conv, outputting {out_channels} channels.",
                    "analogy": "Like building a sandwich where each layer adds a new slice, keeping all previous slices intact.",
                    "whyItMatters": "Preserves features directly across all subsequent block stages.",
                    "keyTakeaway": "Concatenation preserves all visual features for subsequent reuse."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "cyan",
                "icon": "git-merge"
            })
            connections.append({ "id": f"c_{c2_id}_{concat_id}", "sourceId": c2_id, "targetId": concat_id, "type": "sequential" })
            connections.append({ "id": f"c_{last_layer_id}_{concat_id}", "sourceId": last_layer_id, "targetId": concat_id, "type": "concatenate" })
            block_l_ids.append(concat_id)
            y_ptr += 150

            last_layer_id = concat_id
            current_channels = out_channels
            db_layer_ids.extend(block_l_ids)

        groups.append({
            "id": f"group_db{db_num}",
            "name": f"Dense Block {db_num - 1}",
            "description": f"Densely connected block: {num_layers} layers with growth rate k=32. Channels grow to {current_channels}.",
            "layerIds": db_layer_ids,
            "color": "#8B5CF6"
        })

        # Transition Block
        if trans_prefix:
            trans_l_ids = []

            # Transition BN
            t_bn_id = f"{trans_prefix}_bn"
            layers.append({
                "id": t_bn_id,
                "type": "batch_norm",
                "name": t_bn_id,
                "inputShape": { "dimensions": [None, h_dim, h_dim, current_channels], "description": f"{h_dim}×{h_dim}×{current_channels}" },
                "outputShape": { "dimensions": [None, h_dim, h_dim, current_channels], "description": f"{h_dim}×{h_dim}×{current_channels}" },
                "config": { "axis": 3, "momentum": 0.99, "epsilon": 0.001 },
                "parameters": {
                    "total": current_channels * 4,
                    "weights": current_channels * 2,
                    "biases": current_channels * 2,
                    "formula": "4 × channels",
                    "calculationSteps": [
                        { "label": "Parameters", "expression": f"4 × {current_channels}", "result": current_channels * 4, "explanation": "BatchNorm scale and shift." }
                    ]
                },
                "educationalNote": {
                    "summary": "Normalizes final dense block output.",
                    "detailed": "Pre-activation setup for transition block.",
                    "whyItMatters": "Locks normalization before spatial downsampling.",
                    "keyTakeaway": "Pre-activation setup for transition."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "gray",
                "icon": "activity"
            })
            connections.append({ "id": f"c_{last_layer_id}_{t_bn_id}", "sourceId": last_layer_id, "targetId": t_bn_id, "type": "sequential" })
            trans_l_ids.append(t_bn_id)
            y_ptr += 150

            # Transition ReLU
            t_relu_id = f"{trans_prefix}_relu"
            layers.append({
                "id": t_relu_id,
                "type": "activation",
                "name": t_relu_id,
                "inputShape": { "dimensions": [None, h_dim, h_dim, current_channels], "description": f"{h_dim}×{h_dim}×{current_channels}" },
                "outputShape": { "dimensions": [None, h_dim, h_dim, current_channels], "description": f"{h_dim}×{h_dim}×{current_channels}" },
                "config": { "activation": "relu" },
                "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
                "educationalNote": {
                    "summary": "ReLU transition activation.",
                    "detailed": "Non-linear activations.",
                    "whyItMatters": "Controls boundary values.",
                    "keyTakeaway": "Non-linear layer activation."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "pink",
                "icon": "zap"
            })
            connections.append({ "id": f"c_{t_bn_id}_{t_relu_id}", "sourceId": t_bn_id, "targetId": t_relu_id, "type": "sequential" })
            trans_l_ids.append(t_relu_id)
            y_ptr += 150

            # Transition Conv (Compression, 50% channels)
            t_out_channels = current_channels // 2
            t_conv_id = f"{trans_prefix}_conv"
            t_weights = current_channels * t_out_channels
            layers.append({
                "id": t_conv_id,
                "type": "conv2d",
                "name": t_conv_id,
                "inputShape": { "dimensions": [None, h_dim, h_dim, current_channels], "description": f"{h_dim}×{h_dim}×{current_channels}" },
                "outputShape": { "dimensions": [None, h_dim, h_dim, t_out_channels], "description": f"{h_dim}×{h_dim}×{t_out_channels}" },
                "config": {
                    "filters": t_out_channels,
                    "kernelSize": [1, 1],
                    "strides": [1, 1],
                    "padding": "valid",
                    "useBias": False,
                    "activation": "linear"
                },
                "parameters": {
                    "total": t_weights,
                    "weights": t_weights,
                    "biases": 0,
                    "formula": "input_channels × output_filters",
                    "calculationSteps": [
                        { "label": "Weights", "expression": f"{current_channels} × {t_out_channels}", "result": t_weights, "explanation": "1x1 projection compression weights." }
                    ]
                },
                "educationalNote": {
                    "summary": "1x1 transition compression to reduce channels.",
                    "detailed": f"Compresses channel volume by 50% to prevent channel build-up across dense stages, managing memory constraints.",
                    "whyItMatters": "Restores low-dimensional memory efficiency.",
                    "keyTakeaway": "Compression prevents the channel count from blowing up."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "blue",
                "icon": "layers"
            })
            connections.append({ "id": f"c_{t_relu_id}_{t_conv_id}", "sourceId": t_relu_id, "targetId": t_conv_id, "type": "sequential" })
            trans_l_ids.append(t_conv_id)
            y_ptr += 150

            # Transition Pool (Average Pooling 2x2, stride 2)
            t_pool_id = f"{trans_prefix}_pool"
            pool_out_h = h_dim // 2
            layers.append({
                "id": t_pool_id,
                "type": "average_pooling2d",
                "name": t_pool_id,
                "inputShape": { "dimensions": [None, h_dim, h_dim, t_out_channels], "description": f"{h_dim}×{h_dim}×{t_out_channels}" },
                "outputShape": { "dimensions": [None, pool_out_h, pool_out_h, t_out_channels], "description": f"{pool_out_h}×{pool_out_h}×{t_out_channels}" },
                "config": { "poolSize": [2, 2], "strides": [2, 2], "padding": "valid" },
                "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
                "educationalNote": {
                    "summary": "Reduces spatial size using average pooling.",
                    "detailed": "Average pooling downsamples spatial grids by 50% to reduce resolution.",
                    "whyItMatters": "Saves compute sizes for the next block.",
                    "keyTakeaway": "Average pooling maps features to lower grid coordinates."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "amber",
                "icon": "shrink"
            })
            connections.append({ "id": f"c_{t_conv_id}_{t_pool_id}", "sourceId": t_conv_id, "targetId": t_pool_id, "type": "sequential" })
            trans_l_ids.append(t_pool_id)
            y_ptr += 150

            groups.append({
                "id": f"group_{trans_prefix}",
                "name": f"Transition Block {db_num - 1}",
                "description": f"Compresses channel volume from {current_channels} to {t_out_channels} and downsamples spatial grid by 50%.",
                "layerIds": trans_l_ids,
                "color": "#EC4899"
            })

            last_layer_id = t_pool_id
            current_channels = t_out_channels

    # Final Classification head
    # bn
    layers.append({
        "id": "bn",
        "type": "batch_norm",
        "name": "bn",
        "inputShape": { "dimensions": [None, 7, 7, current_channels], "description": f"7×7×{current_channels}" },
        "outputShape": { "dimensions": [None, 7, 7, current_channels], "description": f"7×7×{current_channels}" },
        "config": { "axis": 3, "momentum": 0.99, "epsilon": 0.001 },
        "parameters": {
            "total": current_channels * 4,
            "weights": current_channels * 2,
            "biases": current_channels * 2,
            "formula": "4 × channels",
            "calculationSteps": [
                { "label": "Parameters", "expression": f"4 × {current_channels}", "result": current_channels * 4, "explanation": "Final scale and shift vectors." }
            ]
        },
        "educationalNote": {
            "summary": "Final BatchNorm.",
            "detailed": "Pre-activation setup requires a final BN layer before pooling.",
            "whyItMatters": "Ensures balanced scaling of final outputs.",
            "keyTakeaway": "Normalizes final feature vectors."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "gray",
        "icon": "activity"
    })
    connections.append({ "id": f"c_{last_layer_id}_bn", "sourceId": last_layer_id, "targetId": "bn", "type": "sequential" })
    y_ptr += 150

    # relu
    layers.append({
        "id": "relu",
        "type": "activation",
        "name": "relu",
        "inputShape": { "dimensions": [None, 7, 7, current_channels], "description": f"7×7×{current_channels}" },
        "outputShape": { "dimensions": [None, 7, 7, current_channels], "description": f"7×7×{current_channels}" },
        "config": { "activation": "relu" },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": {
            "summary": "Final ReLU activation.",
            "detailed": "Locks outputs as activated features.",
            "whyItMatters": "Prepares activated representation for global pooling.",
            "keyTakeaway": "Final non-linear activation."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "pink",
        "icon": "zap"
    })
    connections.append({ "id": "c_bn_relu", "sourceId": "bn", "targetId": "relu", "type": "sequential" })
    y_ptr += 150

    # Global average pool
    layers.append({
        "id": "avg_pool",
        "type": "global_average_pooling2d",
        "name": "avg_pool",
        "inputShape": { "dimensions": [None, 7, 7, current_channels], "description": f"7×7×{current_channels}" },
        "outputShape": { "dimensions": [None, current_channels], "description": str(current_channels) },
        "config": {},
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": {
            "summary": "Global average pooling averaging spatial channels.",
            "detailed": f"Averages each 7x7 grid into a single feature vector of {current_channels} elements.",
            "whyItMatters": "GAP acts as a global regularizer and reduces downstream parameters by 98%.",
            "keyTakeaway": "Replaces heavy fully connected layers with zero parameters."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "amber",
        "icon": "activity"
    })
    connections.append({ "id": "c_relu_avg", "sourceId": "relu", "targetId": "avg_pool", "type": "sequential" })
    y_ptr += 150

    # Predictions
    pred_weights = current_channels * 1000
    layers.append({
        "id": "predictions",
        "type": "dense",
        "name": "predictions",
        "inputShape": { "dimensions": [None, current_channels], "description": str(current_channels) },
        "outputShape": { "dimensions": [None, 1000], "description": "1000" },
        "config": {
            "units": 1000,
            "activation": "softmax",
            "useBias": True
        },
        "parameters": {
            "total": pred_weights + 1000,
            "weights": pred_weights,
            "biases": 1000,
            "formula": "(input_features + 1) × output_units",
            "calculationSteps": [
                { "label": "Weights", "expression": f"{current_channels} × 1000", "result": pred_weights, "explanation": "Fully connected mapping weights." },
                { "label": "Biases", "expression": "1000", "result": 1000, "explanation": "Classification bias vectors." }
            ]
        },
        "educationalNote": {
            "summary": "Computes probabilities for the 1,000 target classes.",
            "detailed": "Uses softmax activation function to compute class probabilities.",
            "whyItMatters": "Converts numerical logits into values that sum to 1.",
            "keyTakeaway": "Classification decision layer."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "violet",
        "icon": "award"
    })
    connections.append({ "id": "c_avg_predictions", "sourceId": "avg_pool", "targetId": "predictions", "type": "sequential" })

    groups.append({
        "id": "group_classifier",
        "name": "Global Pooling & Classification",
        "description": "Global average pooling averaging spatial channels, followed by predictions.",
        "layerIds": ["bn", "relu", "avg_pool", "predictions"],
        "color": "#8B5CF6"
    })

    model_data = {
        "id": model_id,
        "name": name,
        "fullName": fullName,
        "paperYear": paperYear,
        "authors": authors,
        "paperUrl": paperUrl,
        "depth": depth,
        "totalParameters": totalParameters,
        "totalFLOPs": totalFLOPs,
        "inputShape": { "channels": 3, "height": 224, "width": 224 },
        "top1Accuracy": top1Accuracy,
        "top5Accuracy": top5Accuracy,
        "memoryUsage": memoryUsage,
        "description": description,
        "colorTheme": colorTheme,
        "tags": tags,
        "architecture": {
            "layers": layers,
            "connections": connections,
            "groups": groups
        }
    }

    output_path = os.path.join(os.path.dirname(__file__), f"{model_id}.json")
    write_json(output_path, model_data)

# Main Generation Task
if __name__ == "__main__":
    # ResNet V1 config stages: (stage_num, block_count, in_ch, bottleneck_ch, out_ch, initial_stride)
    resnet101_stages = [
        (2, 3, 64, 64, 256, 1),
        (3, 4, 256, 128, 512, 2),
        (4, 23, 512, 256, 1024, 2),
        (5, 3, 1024, 512, 2048, 2)
    ]
    resnet152_stages = [
        (2, 3, 64, 64, 256, 1),
        (3, 8, 256, 128, 512, 2),
        (4, 36, 512, 256, 1024, 2),
        (5, 3, 1024, 512, 2048, 2)
    ]

    print("Generating ResNet V1 models...")
    generate_resnet_v1(
        "resnet101", "ResNet101", "Deep Residual Learning for Image Recognition (101-layer)",
        2015, ["Kaiming He", "Xiangyu Zhang", "Shaoqing Ren", "Jian Sun"], "https://arxiv.org/abs/1512.03385",
        101, 44707176, 7600000000, 0.764, 0.932, 170,
        "101-layer residual network with even deeper architecture. Stacks bottleneck blocks for computational efficiency while maintaining representational power.",
        ["CNN", "Classification", "Residual", "ImageNet"], "#059669", resnet101_stages
    )

    generate_resnet_v1(
        "resnet152", "ResNet152", "Deep Residual Learning for Image Recognition (152-layer)",
        2015, ["Kaiming He", "Xiangyu Zhang", "Shaoqing Ren", "Jian Sun"], "https://arxiv.org/abs/1512.03385",
        152, 60192808, 11300000000, 0.770, 0.938, 230,
        "The deepest variant in the original ResNet family with 152 layers. Achieves best accuracy but requires more computational resources. Demonstrates that deeper networks benefit from skip connections.",
        ["CNN", "Classification", "Residual", "ImageNet"], "#047857", resnet152_stages
    )

    # ResNet V2 config stages
    resnet50v2_stages = [
        (2, 3, 64, 64, 256, 1),
        (3, 4, 256, 128, 512, 2),
        (4, 6, 512, 256, 1024, 2),
        (5, 3, 1024, 512, 2048, 2)
    ]
    resnet101v2_stages = [
        (2, 3, 64, 64, 256, 1),
        (3, 4, 256, 128, 512, 2),
        (4, 23, 512, 256, 1024, 2),
        (5, 3, 1024, 512, 2048, 2)
    ]
    resnet152v2_stages = [
        (2, 3, 64, 64, 256, 1),
        (3, 8, 256, 128, 512, 2),
        (4, 36, 512, 256, 1024, 2),
        (5, 3, 1024, 512, 2048, 2)
    ]

    print("\nGenerating ResNet V2 models...")
    generate_resnet_v2(
        "resnet50v2", "ResNet50V2", "Identity Mappings in Deep Residual Networks (V2)",
        2016, ["Kaiming He", "Xiangyu Zhang", "Shaoqing Ren", "Jian Sun"], "https://arxiv.org/abs/1603.05027",
        50, 25613800, 4100000000, 0.760, 0.930, 98,
        "Improved ResNet architecture with pre-activation, improving gradient flow and training stability. Better performance than original ResNet50 with similar parameters.",
        ["CNN", "Classification", "Residual", "ImageNet"], "#16A34A", resnet50v2_stages
    )

    generate_resnet_v2(
        "resnet101v2", "ResNet101V2", "Identity Mappings in Deep Residual Networks V2 (101-layer)",
        2016, ["Kaiming He", "Xiangyu Zhang", "Shaoqing Ren", "Jian Sun"], "https://arxiv.org/abs/1603.05027",
        101, 44675560, 7600000000, 0.773, 0.936, 170,
        "101-layer ResNet V2 with pre-activation structure. Outperforms original ResNet101 and provides a good balance between accuracy and computational cost.",
        ["CNN", "Classification", "Residual", "ImageNet"], "#22C55E", resnet101v2_stages
    )

    generate_resnet_v2(
        "resnet152v2", "ResNet152V2", "Identity Mappings in Deep Residual Networks V2 (152-layer)",
        2016, ["Kaiming He", "Xiangyu Zhang", "Shaoqing Ren", "Jian Sun"], "https://arxiv.org/abs/1603.05027",
        152, 60192808, 11300000000, 0.780, 0.940, 230,
        "The deepest ResNet V2 variant. Achieves state-of-the-art accuracy at the time with improved gradient flow and training dynamics.",
        ["CNN", "Classification", "Residual", "ImageNet"], "#4ADE80", resnet152v2_stages
    )

    # DenseNet config: (db_num, layers_count, transition_name_or_none)
    densenet169_db = [
        (2, 6, "pool2"),
        (3, 12, "pool3"),
        (4, 32, "pool4"),
        (5, 32, None)
    ]
    densenet201_db = [
        (2, 6, "pool2"),
        (3, 12, "pool3"),
        (4, 48, "pool4"),
        (5, 32, None)
    ]

    print("\nGenerating DenseNet models...")
    generate_densenet(
        "densenet169", "DenseNet169", "Densely Connected Convolutional Networks (169-layer)",
        2016, ["Gao Huang", "Zhuang Liu", "Laurens van der Maaten", "Kilian Q. Weinberger"], "https://arxiv.org/abs/1608.06993",
        169, 14149088, 3400000000, 0.756, 0.927, 56,
        "Deeper 169-layer variant of DenseNet. Balances accuracy improvement with computational cost through dense connections and efficient feature reuse.",
        ["CNN", "Classification", "Dense", "ImageNet"], "#7C3AED", densenet169_db
    )

    generate_densenet(
        "densenet201", "DenseNet201", "Densely Connected Convolutional Networks (201-layer)",
        2016, ["Gao Huang", "Zhuang Liu", "Laurens van der Maaten", "Kilian Q. Weinberger"], "https://arxiv.org/abs/1608.06993",
        201, 20242984, 4300000000, 0.769, 0.935, 80,
        "The largest DenseNet variant with 201 layers. Achieves excellent accuracy through dense feature reuse while maintaining parameter efficiency compared to older architectures.",
        ["CNN", "Classification", "Dense", "ImageNet"], "#6D28D9", densenet201_db
    )

    print("\nAll generations completed!")
