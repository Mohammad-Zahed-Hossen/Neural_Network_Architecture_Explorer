import json
import os
import math

# Helper to write JSON files
def write_json(path, data):
    with open(path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"Generated {data['name']} successfully: {path} ({len(data['architecture']['layers'])} layers)")

# Helper to make channel filters divisible by 8 (Keras standard)
def make_divisible(v, divisor=8, min_value=None):
    if min_value is None:
        min_value = divisor
    new_v = max(min_value, int(v + divisor / 2) // divisor * divisor)
    if new_v < 0.9 * v:
        new_v += divisor
    return new_v

# Helper to scale filters
def round_filters(filters, width_coefficient):
    if not width_coefficient or width_coefficient == 1.0:
        return filters
    return make_divisible(filters * width_coefficient, 8)

# Helper to scale repeats
def round_repeats(repeats, depth_coefficient):
    if not depth_coefficient or depth_coefficient == 1.0:
        return repeats
    return int(math.ceil(depth_coefficient * repeats))

# 1. GENERATE MOBILENET V1
def generate_mobilenet_v1(model_id, name, fullName, paperYear, authors, paperUrl, depth, totalParameters, totalFLOPs, top1Accuracy, top5Accuracy, memoryUsage, description, tags, colorTheme):
    layers = []
    connections = []
    groups = []
    y_ptr = 0

    # Input layer
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

    # conv1
    conv1_weights = 3 * 3 * 3 * 32
    layers.append({
        "id": "conv1",
        "type": "conv2d",
        "name": "conv1",
        "inputShape": { "dimensions": [None, 224, 224, 3], "description": "224×224×3" },
        "outputShape": { "dimensions": [None, 112, 112, 32], "description": "112×112×32" },
        "config": {
            "filters": 32,
            "kernelSize": [3, 3],
            "strides": [2, 2],
            "padding": "same",
            "useBias": False,
            "activation": "linear"
        },
        "parameters": {
            "total": conv1_weights,
            "weights": conv1_weights,
            "biases": 0,
            "formula": "kernel_height × kernel_width × input_channels × output_filters",
            "calculationSteps": [
                { "label": "Kernel Weights", "expression": "3 × 3 × 3 × 32", "result": conv1_weights, "explanation": "32 convolutional filters of size 3x3 convolving over 3 RGB channels. Stride 2 downsamples output to 112x112." }
            ]
        },
        "educationalNote": {
            "summary": "Standard early 3x3 convolution to downsample inputs.",
            "detailed": "Captures initial visual patterns like lines and edges. Stride of 2 halves resolution to reduce downstream processing.",
            "whyItMatters": "Early spatial reduction saves computation in deeper stages.",
            "keyTakeaway": "Early layers capture general visual contours."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "blue",
        "icon": "layers"
    })
    connections.append({ "id": "c_input_conv1", "sourceId": "input_1", "targetId": "conv1", "type": "sequential" })
    y_ptr += 150

    # conv1_bn
    layers.append({
        "id": "conv1_bn",
        "type": "batch_norm",
        "name": "conv1_bn",
        "inputShape": { "dimensions": [None, 112, 112, 32], "description": "112×112×32" },
        "outputShape": { "dimensions": [None, 112, 112, 32], "description": "112×112×32" },
        "config": { "axis": 3, "momentum": 0.99, "epsilon": 0.001 },
        "parameters": {
            "total": 32 * 4,
            "weights": 32 * 2,
            "biases": 32 * 2,
            "formula": "4 × channels",
            "calculationSteps": [
                { "label": "Parameters", "expression": "4 × 32", "result": 128, "explanation": "Moving mean/variance + trainable scale/shift parameters." }
            ]
        },
        "educationalNote": {
            "summary": "Normalizes conv1 outputs.",
            "detailed": "Normalizes activations to stabilize learning.",
            "whyItMatters": "Prevents vanishing gradients.",
            "keyTakeaway": "Stabilizes initial features."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "gray",
        "icon": "activity"
    })
    connections.append({ "id": "c_conv1_bn", "sourceId": "conv1", "targetId": "conv1_bn", "type": "sequential" })
    y_ptr += 150

    # conv1_relu
    layers.append({
        "id": "conv1_relu",
        "type": "activation",
        "name": "conv1_relu",
        "inputShape": { "dimensions": [None, 112, 112, 32], "description": "112×112×32" },
        "outputShape": { "dimensions": [None, 112, 112, 32], "description": "112×112×32" },
        "config": { "activation": "relu" }, # Keras uses relu6
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": {
            "summary": "ReLU6 activation capping outputs to 6.",
            "detailed": "Capping values to 6 prevents numerical overflow and is optimal for fixed-point integer quantization on edge hardware.",
            "whyItMatters": "Essential for deployment on low-precision microcontrollers and mobile processors.",
            "keyTakeaway": "Capped activations prevent precision loss during quantization."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "pink",
        "icon": "zap"
    })
    connections.append({ "id": "c_bn_relu", "sourceId": "conv1_bn", "targetId": "conv1_relu", "type": "sequential" })
    y_ptr += 150

    stem_ids = ["conv1", "conv1_bn", "conv1_relu"]
    groups.append({
        "id": "group_stem",
        "name": "Input Stem",
        "description": "Standard early downsampling block.",
        "layerIds": stem_ids,
        "color": colorTheme
    })

    # Blocks: (block_idx, stride, out_filters)
    blocks_config = [
        (1, 1, 64),
        (2, 2, 128),
        (3, 1, 128),
        (4, 2, 256),
        (5, 1, 256),
        (6, 2, 512),
        (7, 1, 512),
        (8, 1, 512),
        (9, 1, 512),
        (10, 1, 512),
        (11, 1, 512),
        (12, 2, 1024),
        (13, 1, 1024)
    ]

    last_layer_id = "conv1_relu"
    current_channels = 32

    for block_idx, stride, out_filters in blocks_config:
        block_prefix = f"conv_dw_{block_idx}"
        block_layer_ids = []

        h_in = 112 if block_idx in [1, 2] else (56 if block_idx in [3, 4] else (28 if block_idx in [5, 6] else (14 if block_idx <= 11 else 7)))
        h_out = h_in // stride

        # 1. Depthwise Conv
        dw_id = block_prefix
        dw_weights = 3 * 3 * current_channels
        layers.append({
            "id": dw_id,
            "type": "conv2d",
            "name": dw_id,
            "inputShape": { "dimensions": [None, h_in, h_in, current_channels], "description": f"{h_in}×{h_in}×{current_channels}" },
            "outputShape": { "dimensions": [None, h_out, h_out, current_channels], "description": f"{h_out}×{h_out}×{current_channels}" },
            "config": {
                "filters": current_channels,
                "kernelSize": [3, 3],
                "strides": [stride, stride],
                "padding": "same",
                "useBias": False,
                "activation": "linear"
            },
            "parameters": {
                "total": dw_weights,
                "weights": dw_weights,
                "biases": 0,
                "formula": "kernel_height × kernel_width × channels",
                "calculationSteps": [
                    { "label": "Depthwise weights", "expression": f"3 × 3 × {current_channels}", "result": dw_weights, "explanation": "Applies one independent 3x3 filter per channel, separating spatial convolutions from channel mixing." }
                ]
            },
            "educationalNote": {
                "summary": "Depthwise convolution performing spatial filtering.",
                "detailed": f"Operates spatial convolving over each of the {current_channels} channels separately. Cuts down computing weights by 90% compared to standard convolutions.",
                "whyItMatters": "The core mechanism behind MobileNet's fast runtime and low parameter size.",
                "keyTakeaway": "Depthwise convolutions perform spatial filtering without mixing channels."
            },
            "position": { "x": 250, "y": y_ptr },
            "color": "blue",
            "icon": "layers"
        })
        connections.append({ "id": f"c_{last_layer_id}_{dw_id}", "sourceId": last_layer_id, "targetId": dw_id, "type": "sequential" })
        block_layer_ids.append(dw_id)
        y_ptr += 150

        # Depthwise BN
        dw_bn_id = f"{dw_id}_bn"
        layers.append({
            "id": dw_bn_id,
            "type": "batch_norm",
            "name": dw_bn_id,
            "inputShape": { "dimensions": [None, h_out, h_out, current_channels], "description": f"{h_out}×{h_out}×{current_channels}" },
            "outputShape": { "dimensions": [None, h_out, h_out, current_channels], "description": f"{h_out}×{h_out}×{current_channels}" },
            "config": { "axis": 3, "momentum": 0.99, "epsilon": 0.001 },
            "parameters": {
                "total": current_channels * 4,
                "weights": current_channels * 2,
                "biases": current_channels * 2,
                "formula": "4 × channels",
                "calculationSteps": []
            },
            "educationalNote": {
                "summary": "Normalizes depthwise outputs.",
                "detailed": "Stabilizes the activation scale before non-linear gating.",
                "whyItMatters": "Enables faster and more robust gradient updates.",
                "keyTakeaway": "Keeps spatial distributions stable."
            },
            "position": { "x": 250, "y": y_ptr },
            "color": "gray",
            "icon": "activity"
        })
        connections.append({ "id": f"c_{dw_id}_{dw_bn_id}", "sourceId": dw_id, "targetId": dw_bn_id, "type": "sequential" })
        block_layer_ids.append(dw_bn_id)
        y_ptr += 150

        # Depthwise ReLU
        dw_relu_id = f"{dw_id}_relu"
        layers.append({
            "id": dw_relu_id,
            "type": "activation",
            "name": dw_relu_id,
            "inputShape": { "dimensions": [None, h_out, h_out, current_channels], "description": f"{h_out}×{h_out}×{current_channels}" },
            "outputShape": { "dimensions": [None, h_out, h_out, current_channels], "description": f"{h_out}×{h_out}×{current_channels}" },
            "config": { "activation": "relu" },
            "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
            "educationalNote": {
                "summary": "Applies ReLU6 activation to depthwise outputs.",
                "detailed": "Calculates f(x) = min(max(0, x), 6) element-wise.",
                "whyItMatters": "Controls numerical ranges for embedded hardware.",
                "keyTakeaway": "Capped non-linearity."
            },
            "position": { "x": 250, "y": y_ptr },
            "color": "pink",
            "icon": "zap"
        })
        connections.append({ "id": f"c_{dw_bn_id}_{dw_relu_id}", "sourceId": dw_bn_id, "targetId": dw_relu_id, "type": "sequential" })
        block_layer_ids.append(dw_relu_id)
        y_ptr += 150

        # 2. Pointwise Conv
        pw_id = f"conv_pw_{block_idx}"
        pw_weights = current_channels * out_filters
        layers.append({
            "id": pw_id,
            "type": "conv2d",
            "name": pw_id,
            "inputShape": { "dimensions": [None, h_out, h_out, current_channels], "description": f"{h_out}×{h_out}×{current_channels}" },
            "outputShape": { "dimensions": [None, h_out, h_out, out_filters], "description": f"{h_out}×{h_out}×{out_filters}" },
            "config": {
                "filters": out_filters,
                "kernelSize": [1, 1],
                "strides": [1, 1],
                "padding": "valid",
                "useBias": False,
                "activation": "linear"
            },
            "parameters": {
                "total": pw_weights,
                "weights": pw_weights,
                "biases": 0,
                "formula": "input_channels × output_filters",
                "calculationSteps": [
                    { "label": "Pointwise weights", "expression": f"{current_channels} × {out_filters}", "result": pw_weights, "explanation": "Combines spatial activations across channels." }
                ]
            },
            "educationalNote": {
                "summary": "Pointwise 1x1 convolution mapping features.",
                "detailed": f"Performs linear combinations over the spatial outputs to project channels from {current_channels} to {out_filters}.",
                "whyItMatters": "Handles the cross-channel feature integration step in depthwise-separable conv blocks.",
                "keyTakeaway": "Mixes channels using 1x1 filter maps."
            },
            "position": { "x": 250, "y": y_ptr },
            "color": "blue",
            "icon": "layers"
        })
        connections.append({ "id": f"c_{dw_relu_id}_{pw_id}", "sourceId": dw_relu_id, "targetId": pw_id, "type": "sequential" })
        block_layer_ids.append(pw_id)
        y_ptr += 150

        # Pointwise BN
        pw_bn_id = f"{pw_id}_bn"
        layers.append({
            "id": pw_bn_id,
            "type": "batch_norm",
            "name": pw_bn_id,
            "inputShape": { "dimensions": [None, h_out, h_out, out_filters], "description": f"{h_out}×{h_out}×{out_filters}" },
            "outputShape": { "dimensions": [None, h_out, h_out, out_filters], "description": f"{h_out}×{h_out}×{out_filters}" },
            "config": { "axis": 3, "momentum": 0.99, "epsilon": 0.001 },
            "parameters": {
                "total": out_filters * 4,
                "weights": out_filters * 2,
                "biases": out_filters * 2,
                "formula": "4 × channels",
                "calculationSteps": []
            },
            "educationalNote": {
                "summary": "Normalizes pointwise outputs.",
                "detailed": "Normalizes the mixed representation before activation.",
                "whyItMatters": "Prepares activations for representation matching.",
                "keyTakeaway": "Maintains normal variance across channels."
            },
            "position": { "x": 250, "y": y_ptr },
            "color": "gray",
            "icon": "activity"
        })
        connections.append({ "id": f"c_{pw_id}_{pw_bn_id}", "sourceId": pw_id, "targetId": pw_bn_id, "type": "sequential" })
        block_layer_ids.append(pw_bn_id)
        y_ptr += 150

        # Pointwise ReLU
        pw_relu_id = f"{pw_id}_relu"
        layers.append({
            "id": pw_relu_id,
            "type": "activation",
            "name": pw_relu_id,
            "inputShape": { "dimensions": [None, h_out, h_out, out_filters], "description": f"{h_out}×{h_out}×{out_filters}" },
            "outputShape": { "dimensions": [None, h_out, h_out, out_filters], "description": f"{h_out}×{h_out}×{out_filters}" },
            "config": { "activation": "relu" },
            "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
            "educationalNote": {
                "summary": "Applies ReLU6 activation to pointwise outputs.",
                "detailed": "Computes rectified output limited to 6.",
                "whyItMatters": "Final non-linear gating of block output.",
                "keyTakeaway": "Capped non-linearity."
            },
            "position": { "x": 250, "y": y_ptr },
            "color": "pink",
            "icon": "zap"
        })
        connections.append({ "id": f"c_{pw_bn_id}_{pw_relu_id}", "sourceId": pw_bn_id, "targetId": pw_relu_id, "type": "sequential" })
        block_layer_ids.append(pw_relu_id)
        y_ptr += 150

        groups.append({
            "id": f"group_block_{block_idx}",
            "name": f"Depthwise Separable Block {block_idx}",
            "description": f"Separates spatial filtering from channel mixing: 3x3 dwconv ({current_channels} ch) -> 1x1 pwconv ({out_filters} ch).",
            "layerIds": block_layer_ids,
            "color": "#3B82F6"
        })

        last_layer_id = pw_relu_id
        current_channels = out_filters

    # GAP
    layers.append({
        "id": "global_average_pooling2d",
        "type": "global_average_pooling2d",
        "name": "global_average_pooling2d",
        "inputShape": { "dimensions": [None, 7, 7, 1024], "description": "7×7×1024" },
        "outputShape": { "dimensions": [None, 1024], "description": "1024" },
        "config": {},
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": {
            "summary": "Global average pooling.",
            "detailed": "Averages spatial dimensions (7x7) to form a global feature vector.",
            "whyItMatters": "Avoids parameter bloat associated with flattening.",
            "keyTakeaway": "Replaces heavy fully connected layers with zero parameters."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "amber",
        "icon": "activity"
    })
    connections.append({ "id": "c_last_gap", "sourceId": last_layer_id, "targetId": "global_average_pooling2d", "type": "sequential" })
    y_ptr += 150

    # Predictions
    pred_weights = 1024 * 1000
    layers.append({
        "id": "predictions",
        "type": "dense",
        "name": "predictions",
        "inputShape": { "dimensions": [None, 1024], "description": "1024" },
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
                { "label": "Weights", "expression": "1024 × 1000", "result": pred_weights, "explanation": "Fully connected mapping weights." },
                { "label": "Biases", "expression": "1000", "result": 1000, "explanation": "One learnable bias parameter per output class." }
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
    connections.append({ "id": "c_gap_predictions", "sourceId": "global_average_pooling2d", "targetId": "predictions", "type": "sequential" })

    groups.append({
        "id": "group_classifier",
        "name": "Global Pooling & Classification",
        "description": "GAP followed by the dense prediction head.",
        "layerIds": ["global_average_pooling2d", "predictions"],
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

# 2. GENERATE MOBILENET V3 (SMALL & LARGE)
def generate_mobilenet_v3(model_id, name, fullName, paperYear, authors, paperUrl, depth, totalParameters, totalFLOPs, top1Accuracy, top5Accuracy, memoryUsage, description, tags, colorTheme, blocks_config, final_conv_filters, first_dense_filters):
    layers = []
    connections = []
    groups = []
    y_ptr = 0

    # Input layer
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

    # conv1 (use_bias=False, activation=hard_swish)
    conv1_weights = 3 * 3 * 3 * 16
    layers.append({
        "id": "conv1",
        "type": "conv2d",
        "name": "conv1",
        "inputShape": { "dimensions": [None, 224, 224, 3], "description": "224×224×3" },
        "outputShape": { "dimensions": [None, 112, 112, 16], "description": "112×112×16" },
        "config": {
            "filters": 16,
            "kernelSize": [3, 3],
            "strides": [2, 2],
            "padding": "same",
            "useBias": False,
            "activation": "linear"
        },
        "parameters": {
            "total": conv1_weights,
            "weights": conv1_weights,
            "biases": 0,
            "formula": "kernel_height × kernel_width × input_channels × output_filters",
            "calculationSteps": [
                { "label": "Kernel Weights", "expression": "3 × 3 × 3 × 16", "result": conv1_weights, "explanation": "16 filters convolving over 3 RGB channels with stride 2." }
            ]
        },
        "educationalNote": {
            "summary": "Stem convolution downsampling inputs.",
            "detailed": "Extracts initial features while halving resolution to 112x112.",
            "whyItMatters": "Reduces computational demands in initial stages.",
            "keyTakeaway": "Stem convolutions downsample maps."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "blue",
        "icon": "layers"
    })
    connections.append({ "id": "c_input_conv1", "sourceId": "input_1", "targetId": "conv1", "type": "sequential" })
    y_ptr += 150

    # conv1_bn
    layers.append({
        "id": "conv1_bn",
        "type": "batch_norm",
        "name": "conv1_bn",
        "inputShape": { "dimensions": [None, 112, 112, 16], "description": "112×112×16" },
        "outputShape": { "dimensions": [None, 112, 112, 16], "description": "112×112×16" },
        "config": { "axis": 3, "momentum": 0.99, "epsilon": 0.001 },
        "parameters": {
            "total": 16 * 4,
            "weights": 16 * 2,
            "biases": 16 * 2,
            "formula": "4 × channels",
            "calculationSteps": []
        },
        "educationalNote": {
            "summary": "Normalizes stem activations.",
            "detailed": "Balances activation statistics before activation.",
            "whyItMatters": "Enables faster and more robust gradient updates.",
            "keyTakeaway": "BN stabilizes gradient flow."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "gray",
        "icon": "activity"
    })
    connections.append({ "id": "c_conv1_bn", "sourceId": "conv1", "targetId": "conv1_bn", "type": "sequential" })
    y_ptr += 150

    # conv1_act
    layers.append({
        "id": "conv1_act",
        "type": "activation",
        "name": "conv1_act",
        "inputShape": { "dimensions": [None, 112, 112, 16], "description": "112×112×16" },
        "outputShape": { "dimensions": [None, 112, 112, 16], "description": "112×112×16" },
        "config": { "activation": "hard_swish" },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": {
            "summary": "Applies hard-swish activation.",
            "detailed": "Hard-swish approximates swish activation: x * relu6(x+3)/6, which is faster on mobile platforms.",
            "whyItMatters": "Combines non-linearity of ReLU with smooth curves of Swish to enhance gradient flows.",
            "keyTakeaway": "Approximates swish activation for fast mobile processing."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "pink",
        "icon": "zap"
    })
    connections.append({ "id": "c_conv1_act", "sourceId": "conv1_bn", "targetId": "conv1_act", "type": "sequential" })
    y_ptr += 150

    stem_ids = ["conv1", "conv1_bn", "conv1_act"]
    groups.append({
        "id": "group_stem",
        "name": "Input Stem",
        "description": "Stem block using hard-swish activation.",
        "layerIds": stem_ids,
        "color": colorTheme
    })

    last_layer_id = "conv1_act"
    current_channels = 16

    # Inverted Residual bottlenecks
    # block_config element: (kernel, exp_size, out_filters, use_se, activation, stride)
    for b_idx, (kernel, exp_size, out_filters, use_se, act, stride) in enumerate(blocks_config, 1):
        block_prefix = f"block_{b_idx}_"
        block_layer_ids = []

        h_in = 112 if b_idx == 1 else (56 if b_idx <= (3 if model_id == "mobilenetv3small" else 3) else (28 if b_idx <= (8 if model_id == "mobilenetv3large" else 3) else (14 if b_idx <= (12 if model_id == "mobilenetv3large" else 8) else 7)))
        if model_id == "mobilenetv3small":
            # Small model height configuration
            if b_idx == 1: h_in = 112
            elif b_idx <= 3: h_in = 56
            elif b_idx <= 8: h_in = 28
            else: h_in = 14
        h_out = h_in // stride

        has_expand = (exp_size != current_channels)
        has_skip = (stride == 1 and current_channels == out_filters)

        # 1. Expand Conv
        expand_out_id = last_layer_id
        if has_expand:
            exp_id = f"{block_prefix}expand"
            exp_weights = current_channels * exp_size
            layers.append({
                "id": exp_id,
                "type": "conv2d",
                "name": exp_id,
                "inputShape": { "dimensions": [None, h_in, h_in, current_channels], "description": f"{h_in}×{h_in}×{current_channels}" },
                "outputShape": { "dimensions": [None, h_in, h_in, exp_size], "description": f"{h_in}×{h_in}×{exp_size}" },
                "config": {
                    "filters": exp_size,
                    "kernelSize": [1, 1],
                    "strides": [1, 1],
                    "padding": "valid",
                    "useBias": False,
                    "activation": "linear"
                },
                "parameters": {
                    "total": exp_weights,
                    "weights": exp_weights,
                    "biases": 0,
                    "formula": "input_channels × output_filters",
                    "calculationSteps": [
                        { "label": "Expand weights", "expression": f"{current_channels} × {exp_size}", "result": exp_weights, "explanation": "1x1 expansion bottleneck conv." }
                    ]
                },
                "educationalNote": {
                    "summary": "1x1 Expansion bottleneck.",
                    "detailed": f"Projects channels from {current_channels} to a wider space of {exp_size}.",
                    "whyItMatters": "Expands representational capacity for the spatial depthwise conv.",
                    "keyTakeaway": "Expansion projects to higher dimensions."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "blue",
                "icon": "layers"
            })
            connections.append({ "id": f"c_{last_layer_id}_{exp_id}", "sourceId": last_layer_id, "targetId": exp_id, "type": "sequential" })
            block_layer_ids.append(exp_id)
            y_ptr += 150

            exp_bn_id = f"{exp_id}_BN"
            layers.append({
                "id": exp_bn_id,
                "type": "batch_norm",
                "name": exp_bn_id,
                "inputShape": { "dimensions": [None, h_in, h_in, exp_size], "description": f"{h_in}×{h_in}×{exp_size}" },
                "outputShape": { "dimensions": [None, h_in, h_in, exp_size], "description": f"{h_in}×{h_in}×{exp_size}" },
                "config": { "axis": 3, "momentum": 0.99, "epsilon": 0.001 },
                "parameters": {
                    "total": exp_size * 4,
                    "weights": exp_size * 2,
                    "biases": exp_size * 2,
                    "formula": "4 × channels",
                    "calculationSteps": []
                },
                "educationalNote": {
                    "summary": "Normalizes expanded activations.",
                    "keyTakeaway": "Stabilizes expansion statistics."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "gray",
                "icon": "activity"
            })
            connections.append({ "id": f"c_{exp_id}_{exp_bn_id}", "sourceId": exp_id, "targetId": exp_bn_id, "type": "sequential" })
            block_layer_ids.append(exp_bn_id)
            y_ptr += 150

            exp_act_id = f"{exp_id}_act"
            layers.append({
                "id": exp_act_id,
                "type": "activation",
                "name": exp_act_id,
                "inputShape": { "dimensions": [None, h_in, h_in, exp_size], "description": f"{h_in}×{h_in}×{exp_size}" },
                "outputShape": { "dimensions": [None, h_in, h_in, exp_size], "description": f"{h_in}×{h_in}×{exp_size}" },
                "config": { "activation": act },
                "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
                "educationalNote": {
                    "summary": f"Applies {act} activation.",
                    "keyTakeaway": f"Non-linearity activation."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "pink",
                "icon": "zap"
            })
            connections.append({ "id": f"c_{exp_bn_id}_{exp_act_id}", "sourceId": exp_bn_id, "targetId": exp_act_id, "type": "sequential" })
            block_layer_ids.append(exp_act_id)
            y_ptr += 150
            expand_out_id = exp_act_id

        # 2. Depthwise Conv
        dw_id = f"{block_prefix}depthwise"
        dw_weights = kernel * kernel * exp_size
        layers.append({
            "id": dw_id,
            "type": "conv2d",
            "name": dw_id,
            "inputShape": { "dimensions": [None, h_in, h_in, exp_size], "description": f"{h_in}×{h_in}×{exp_size}" },
            "outputShape": { "dimensions": [None, h_out, h_out, exp_size], "description": f"{h_out}×{h_out}×{exp_size}" },
            "config": {
                "filters": exp_size,
                "kernelSize": [kernel, kernel],
                "strides": [stride, stride],
                "padding": "same",
                "useBias": False,
                "activation": "linear"
            },
            "parameters": {
                "total": dw_weights,
                "weights": dw_weights,
                "biases": 0,
                "formula": "kernel_height × kernel_width × channels",
                "calculationSteps": [
                    { "label": "Depthwise weights", "expression": f"{kernel} × {kernel} × {exp_size}", "result": dw_weights, "explanation": "Kernel weights convolving over spatial maps." }
                ]
            },
            "educationalNote": {
                "summary": f"Spatial depthwise {kernel}x{kernel} convolution.",
                "detailed": f"Applies independent kernels over each channel to model spatial details.",
                "whyItMatters": "Enables cheap feature extraction over large dimensions.",
                "keyTakeaway": "Extracts spatial representations."
            },
            "position": { "x": 250, "y": y_ptr },
            "color": "blue",
            "icon": "layers"
        })
        connections.append({ "id": f"c_{expand_out_id}_{dw_id}", "sourceId": expand_out_id, "targetId": dw_id, "type": "sequential" })
        block_layer_ids.append(dw_id)
        y_ptr += 150

        dw_bn_id = f"{dw_id}_BN"
        layers.append({
            "id": dw_bn_id,
            "type": "batch_norm",
            "name": dw_bn_id,
            "inputShape": { "dimensions": [None, h_out, h_out, exp_size], "description": f"{h_out}×{h_out}×{exp_size}" },
            "outputShape": { "dimensions": [None, h_out, h_out, exp_size], "description": f"{h_out}×{h_out}×{exp_size}" },
            "config": { "axis": 3, "momentum": 0.99, "epsilon": 0.001 },
            "parameters": {
                "total": exp_size * 4,
                "weights": exp_size * 2,
                "biases": exp_size * 2,
                "formula": "4 × channels",
                "calculationSteps": []
            },
            "educationalNote": {
                "summary": "Normalizes depthwise feature maps.",
                "keyTakeaway": "Keeps spatial activations normalized."
            },
            "position": { "x": 250, "y": y_ptr },
            "color": "gray",
            "icon": "activity"
        })
        connections.append({ "id": f"c_{dw_id}_{dw_bn_id}", "sourceId": dw_id, "targetId": dw_bn_id, "type": "sequential" })
        block_layer_ids.append(dw_bn_id)
        y_ptr += 150

        dw_act_id = f"{dw_id}_act"
        layers.append({
            "id": dw_act_id,
            "type": "activation",
            "name": dw_act_id,
            "inputShape": { "dimensions": [None, h_out, h_out, exp_size], "description": f"{h_out}×{h_out}×{exp_size}" },
            "outputShape": { "dimensions": [None, h_out, h_out, exp_size], "description": f"{h_out}×{h_out}×{exp_size}" },
            "config": { "activation": act },
            "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
            "educationalNote": {
                "summary": f"Applies {act} activation.",
                "keyTakeaway": "Non-linearity activation."
            },
            "position": { "x": 250, "y": y_ptr },
            "color": "pink",
            "icon": "zap"
        })
        connections.append({ "id": f"c_{dw_bn_id}_{dw_act_id}", "sourceId": dw_bn_id, "targetId": dw_act_id, "type": "sequential" })
        block_layer_ids.append(dw_act_id)
        y_ptr += 150

        dw_out_id = dw_act_id

        # 3. Squeeze-and-Excitation (SE) module
        if use_se:
            se_reduced_channels = make_divisible(exp_size / 4, 8)
            se_sq_id = f"{block_prefix}squeeze"
            layers.append({
                "id": se_sq_id,
                "type": "global_average_pooling2d",
                "name": se_sq_id,
                "inputShape": { "dimensions": [None, h_out, h_out, exp_size], "description": f"{h_out}×{h_out}×{exp_size}" },
                "outputShape": { "dimensions": [None, exp_size], "description": str(exp_size) },
                "config": {},
                "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
                "educationalNote": {
                    "summary": "SE Squeeze averaging spatial activations.",
                    "detailed": "Collapses spatial dimensions to form channel global context vectors.",
                    "whyItMatters": "Used to model interdependencies between channels.",
                    "keyTakeaway": "Collapses spatial details to channel context."
                },
                "position": { "x": 100, "y": y_ptr - 400 },
                "color": "amber",
                "icon": "activity"
            })
            connections.append({ "id": f"c_{dw_out_id}_{se_sq_id}", "sourceId": dw_out_id, "targetId": se_sq_id, "type": "skip" })
            block_layer_ids.append(se_sq_id)

            se_red_id = f"{block_prefix}reduce"
            se_red_weights = exp_size * se_reduced_channels
            layers.append({
                "id": se_red_id,
                "type": "conv2d",
                "name": se_red_id,
                "inputShape": { "dimensions": [None, 1, 1, exp_size], "description": f"1×1×{exp_size}" },
                "outputShape": { "dimensions": [None, 1, 1, se_reduced_channels], "description": f"1×1×{se_reduced_channels}" },
                "config": {
                    "filters": se_reduced_channels,
                    "kernelSize": [1, 1],
                    "strides": [1, 1],
                    "padding": "valid",
                    "useBias": True,
                    "activation": "linear"
                },
                "parameters": {
                    "total": se_red_weights + se_reduced_channels,
                    "weights": se_red_weights,
                    "biases": se_reduced_channels,
                    "formula": "input_channels × output_filters + output_filters",
                    "calculationSteps": []
                },
                "educationalNote": {
                    "summary": "SE reduction layer.",
                    "detailed": f"Compresses channel features to {se_reduced_channels} with bias.",
                    "whyItMatters": "Controls SE param size.",
                    "keyTakeaway": "Squeezes features."
                },
                "position": { "x": 100, "y": y_ptr - 250 },
                "color": "blue",
                "icon": "layers"
            })
            connections.append({ "id": f"c_{se_sq_id}_{se_red_id}", "sourceId": se_sq_id, "targetId": se_red_id, "type": "sequential" })
            block_layer_ids.append(se_red_id)

            se_exp_id = f"{block_prefix}expand"
            se_exp_weights = se_reduced_channels * exp_size
            layers.append({
                "id": se_exp_id,
                "type": "conv2d",
                "name": se_exp_id,
                "inputShape": { "dimensions": [None, 1, 1, se_reduced_channels], "description": f"1×1×{se_reduced_channels}" },
                "outputShape": { "dimensions": [None, 1, 1, exp_size], "description": f"1×1×{exp_size}" },
                "config": {
                    "filters": exp_size,
                    "kernelSize": [1, 1],
                    "strides": [1, 1],
                    "padding": "valid",
                    "useBias": True,
                    "activation": "hard_sigmoid"
                },
                "parameters": {
                    "total": se_exp_weights + exp_size,
                    "weights": se_exp_weights,
                    "biases": exp_size,
                    "formula": "input_channels × output_filters + output_filters",
                    "calculationSteps": []
                },
                "educationalNote": {
                    "summary": "SE expand layer with hard-sigmoid activation.",
                    "detailed": "Expands bottleneck back to output scales.",
                    "whyItMatters": "Gives weights representing importance of channels.",
                    "keyTakeaway": "Excites maps."
                },
                "position": { "x": 100, "y": y_ptr - 100 },
                "color": "blue",
                "icon": "layers"
            })
            connections.append({ "id": f"c_{se_red_id}_{se_exp_id}", "sourceId": se_red_id, "targetId": se_exp_id, "type": "sequential" })
            block_layer_ids.append(se_exp_id)

            se_mul_id = f"{block_prefix}multiply"
            layers.append({
                "id": se_mul_id,
                "type": "concatenate", # fallback type or custom multiply
                "name": se_mul_id,
                "inputShape": { "dimensions": [None, h_out, h_out, exp_size], "description": "Features + SE Weights" },
                "outputShape": { "dimensions": [None, h_out, h_out, exp_size], "description": f"{h_out}×{h_out}×{exp_size}" },
                "config": {},
                "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
                "educationalNote": {
                    "summary": "SE channel excitation multiplication.",
                    "detailed": "Scales the channels of feature maps by multiplying them with the computed excitation weights.",
                    "whyItMatters": "Dynamically selects relevant feature mappings.",
                    "keyTakeaway": "Excites features."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "cyan",
                "icon": "git-merge"
            })
            connections.append({ "id": f"c_{dw_out_id}_{se_mul_id}", "sourceId": dw_out_id, "targetId": se_mul_id, "type": "sequential" })
            connections.append({ "id": f"c_{se_exp_id}_{se_mul_id}", "sourceId": se_exp_id, "targetId": se_mul_id, "type": "concatenate" })
            block_layer_ids.append(se_mul_id)
            y_ptr += 150
            dw_out_id = se_mul_id

        # 4. Project Conv
        proj_id = f"{block_prefix}project"
        proj_weights = exp_size * out_filters
        layers.append({
            "id": proj_id,
            "type": "conv2d",
            "name": proj_id,
            "inputShape": { "dimensions": [None, h_out, h_out, exp_size], "description": f"{h_out}×{h_out}×{exp_size}" },
            "outputShape": { "dimensions": [None, h_out, h_out, out_filters], "description": f"{h_out}×{h_out}×{out_filters}" },
            "config": {
                "filters": out_filters,
                "kernelSize": [1, 1],
                "strides": [1, 1],
                "padding": "valid",
                "useBias": False,
                "activation": "linear"
            },
            "parameters": {
                "total": proj_weights,
                "weights": proj_weights,
                "biases": 0,
                "formula": "input_channels × output_filters",
                "calculationSteps": [
                    { "label": "Project weights", "expression": f"{exp_size} × {out_filters}", "result": proj_weights, "explanation": "1x1 projection compress weights." }
                ]
            },
            "educationalNote": {
                "summary": "1x1 linear bottleneck projection.",
                "detailed": f"Compresses channel volume to output channels {out_filters} using a linear layer.",
                "whyItMatters": "Preserves information manifolds in lower dimensions.",
                "keyTakeaway": "Compresses representation layers."
            },
            "position": { "x": 250, "y": y_ptr },
            "color": "blue",
            "icon": "layers"
        })
        connections.append({ "id": f"c_{dw_out_id}_{proj_id}", "sourceId": dw_out_id, "targetId": proj_id, "type": "sequential" })
        block_layer_ids.append(proj_id)
        y_ptr += 150

        # Project BN
        proj_bn_id = f"{proj_id}_BN"
        layers.append({
            "id": proj_bn_id,
            "type": "batch_norm",
            "name": proj_bn_id,
            "inputShape": { "dimensions": [None, h_out, h_out, out_filters], "description": f"{h_out}×{h_out}×{out_filters}" },
            "outputShape": { "dimensions": [None, h_out, h_out, out_filters], "description": f"{h_out}×{h_out}×{out_filters}" },
            "config": { "axis": 3, "momentum": 0.99, "epsilon": 0.001 },
            "parameters": {
                "total": out_filters * 4,
                "weights": out_filters * 2,
                "biases": out_filters * 2,
                "formula": "4 × channels",
                "calculationSteps": []
            },
            "educationalNote": {
                "summary": "Normalizes projection outputs.",
                "keyTakeaway": "Normalizes final bottleneck layers."
            },
            "position": { "x": 250, "y": y_ptr },
            "color": "gray",
            "icon": "activity"
        })
        connections.append({ "id": f"c_{proj_id}_{proj_bn_id}", "sourceId": proj_id, "targetId": proj_bn_id, "type": "sequential" })
        block_layer_ids.append(proj_bn_id)
        y_ptr += 150

        # 5. Add Skip
        block_out_id = proj_bn_id
        if has_skip:
            add_id = f"{block_prefix}add"
            layers.append({
                "id": add_id,
                "type": "add",
                "name": add_id,
                "inputShape": { "dimensions": [None, h_out, h_out, out_filters], "description": f"{out_filters} channels" },
                "outputShape": { "dimensions": [None, h_out, h_out, out_filters], "description": f"{out_filters} channels" },
                "config": {},
                "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
                "educationalNote": {
                    "summary": "Performs residual sum.",
                    "detailed": "Adds bottleneck output directly to block input.",
                    "whyItMatters": "Avoids gradient vanishing issues.",
                    "keyTakeaway": "Summation skip connection."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "red",
                "icon": "plus-circle"
            })
            connections.append({ "id": f"c_{proj_bn_id}_{add_id}", "sourceId": proj_bn_id, "targetId": add_id, "type": "sequential" })
            connections.append({ "id": f"c_{last_layer_id}_{add_id}", "sourceId": last_layer_id, "targetId": add_id, "type": "skip" })
            block_layer_ids.append(add_id)
            y_ptr += 150
            block_out_id = add_id

        groups.append({
            "id": f"group_b{b_idx}",
            "name": f"Bottleneck Block {b_idx}",
            "description": f"Inverted bottleneck: {'1x1 expansion → ' if has_expand else ''}{kernel}x{kernel} dwconv → {'SE → ' if use_se else ''}1x1 projection.",
            "layerIds": block_layer_ids,
            "color": "#06B6D4"
        })

        last_layer_id = block_out_id
        current_channels = out_filters

    # final_conv (use_bias=False, activation=hard_swish)
    final_conv_weights = current_channels * final_conv_filters
    layers.append({
        "id": "final_conv",
        "type": "conv2d",
        "name": "final_conv",
        "inputShape": { "dimensions": [None, 7, 7, current_channels], "description": f"7×7×{current_channels}" },
        "outputShape": { "dimensions": [None, 7, 7, final_conv_filters], "description": f"7×7×{final_conv_filters}" },
        "config": {
            "filters": final_conv_filters,
            "kernelSize": [1, 1],
            "strides": [1, 1],
            "padding": "valid",
            "useBias": False,
            "activation": "linear"
        },
        "parameters": {
            "total": final_conv_weights,
            "weights": final_conv_weights,
            "biases": 0,
            "formula": "input_channels × output_filters",
            "calculationSteps": [
                { "label": "Conv weights", "expression": f"{current_channels} × {final_conv_filters}", "result": final_conv_weights, "explanation": "Final feature synthesizer weights." }
            ]
        },
        "educationalNote": {
            "summary": "1x1 final convolution.",
            "detailed": "Synthesizes final block features before global pooling.",
            "whyItMatters": "Controls feature parameters.",
            "keyTakeaway": "Final convolution expansion."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "blue",
        "icon": "layers"
    })
    connections.append({ "id": "c_last_finalconv", "sourceId": last_layer_id, "targetId": "final_conv", "type": "sequential" })
    y_ptr += 150

    # final_conv_bn
    layers.append({
        "id": "final_conv_bn",
        "type": "batch_norm",
        "name": "final_conv_bn",
        "inputShape": { "dimensions": [None, 7, 7, final_conv_filters], "description": f"7×7×{final_conv_filters}" },
        "outputShape": { "dimensions": [None, 7, 7, final_conv_filters], "description": f"7×7×{final_conv_filters}" },
        "config": { "axis": 3, "momentum": 0.99, "epsilon": 0.001 },
        "parameters": {
            "total": final_conv_filters * 4,
            "weights": final_conv_filters * 2,
            "biases": final_conv_filters * 2,
            "formula": "4 × channels",
            "calculationSteps": []
        },
        "educationalNote": {
            "summary": "Normalizes final conv.",
            "keyTakeaway": "Final normalization before pooling."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "gray",
        "icon": "activity"
    })
    connections.append({ "id": "c_finalconv_bn", "sourceId": "final_conv", "targetId": "final_conv_bn", "type": "sequential" })
    y_ptr += 150

    # final_conv_act
    layers.append({
        "id": "final_conv_act",
        "type": "activation",
        "name": "final_conv_act",
        "inputShape": { "dimensions": [None, 7, 7, final_conv_filters], "description": f"7×7×{final_conv_filters}" },
        "outputShape": { "dimensions": [None, 7, 7, final_conv_filters], "description": f"7×7×{final_conv_filters}" },
        "config": { "activation": "hard_swish" },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": {
            "summary": "Hard-swish activation.",
            "keyTakeaway": "Final activation step."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "pink",
        "icon": "zap"
    })
    connections.append({ "id": "c_finalconv_act", "sourceId": "final_conv_bn", "targetId": "final_conv_act", "type": "sequential" })
    y_ptr += 150

    # avg_pool
    layers.append({
        "id": "global_average_pooling2d",
        "type": "global_average_pooling2d",
        "name": "global_average_pooling2d",
        "inputShape": { "dimensions": [None, 7, 7, final_conv_filters], "description": f"7×7×{final_conv_filters}" },
        "outputShape": { "dimensions": [None, final_conv_filters], "description": str(final_conv_filters) },
        "config": {},
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": {
            "summary": "Global average pooling.",
            "detailed": "Averages spatial dimensions to form a global feature vector.",
            "whyItMatters": "Saves compute parameter sizes.",
            "keyTakeaway": "Replaces heavy fully connected layers with zero parameters."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "amber",
        "icon": "activity"
    })
    connections.append({ "id": "c_act_avg", "sourceId": "final_conv_act", "targetId": "global_average_pooling2d", "type": "sequential" })
    y_ptr += 150

    # first_dense (filters=first_dense_filters, activation=hard_swish)
    fd_weights = final_conv_filters * first_dense_filters
    layers.append({
        "id": "first_dense",
        "type": "dense",
        "name": "first_dense",
        "inputShape": { "dimensions": [None, final_conv_filters], "description": str(final_conv_filters) },
        "outputShape": { "dimensions": [None, first_dense_filters], "description": str(first_dense_filters) },
        "config": {
            "units": first_dense_filters,
            "activation": "hard_swish",
            "useBias": True
        },
        "parameters": {
            "total": fd_weights + first_dense_filters,
            "weights": fd_weights,
            "biases": first_dense_filters,
            "formula": "(input_features + 1) × output_units",
            "calculationSteps": [
                { "label": "Weights", "expression": f"{final_conv_filters} × {first_dense_filters}", "result": fd_weights, "explanation": "Bottleneck dense scaling weights." }
            ]
        },
        "educationalNote": {
            "summary": "Dense feature mapping bottleneck.",
            "detailed": "Maps pooled visual representations into a smaller feature space before final classifications.",
            "whyItMatters": "Protects and structures feature dimensions.",
            "keyTakeaway": "Bottleneck mapping."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "violet",
        "icon": "layers"
    })
    connections.append({ "id": "c_avg_fd", "sourceId": "global_average_pooling2d", "targetId": "first_dense", "type": "sequential" })
    y_ptr += 150

    # predictions (dense)
    pred_weights = first_dense_filters * 1000
    layers.append({
        "id": "predictions",
        "type": "dense",
        "name": "predictions",
        "inputShape": { "dimensions": [None, first_dense_filters], "description": str(first_dense_filters) },
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
                { "label": "Weights", "expression": f"{first_dense_filters} × 1000", "result": pred_weights, "explanation": "Fully connected mapping weights." }
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
    connections.append({ "id": "c_fd_predictions", "sourceId": "first_dense", "targetId": "predictions", "type": "sequential" })

    groups.append({
        "id": "group_classifier",
        "name": "Global Pooling & Classification",
        "description": "Global average pooling followed by double dense classifier layers.",
        "layerIds": ["final_conv", "final_conv_bn", "final_conv_act", "global_average_pooling2d", "first_dense", "predictions"],
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

# 3. GENERATE EFFICIENTNET B0-B7
def generate_efficientnet(model_id, name, fullName, paperYear, authors, paperUrl, depth, totalParameters, totalFLOPs, top1Accuracy, top5Accuracy, memoryUsage, description, tags, colorTheme, width_coefficient, depth_coefficient, resolution, dropout_rate):
    layers = []
    connections = []
    groups = []
    y_ptr = 0

    # Input layer
    layers.append({
        "id": "input_1",
        "type": "input",
        "name": "input_1",
        "inputShape": { "dimensions": [None, resolution, resolution, 3], "description": f"{resolution}×{resolution}×3 RGB Image" },
        "outputShape": { "dimensions": [None, resolution, resolution, 3], "description": f"{resolution}×{resolution}×3 RGB Image" },
        "config": { "shape": [resolution, resolution, 3] },
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

    # rescale padding zero
    layers.append({
        "id": "normalization", # fallback/rescaling
        "type": "activation",
        "name": "normalization",
        "inputShape": { "dimensions": [None, resolution, resolution, 3], "description": f"{resolution}×{resolution}×3" },
        "outputShape": { "dimensions": [None, resolution, resolution, 3], "description": f"{resolution}×{resolution}×3" },
        "config": {},
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": {
            "summary": "Performs dynamic rescaling and normalization of input pixels.",
            "detailed": "Scales and normalizes input image pixel ranges to match train bounds.",
            "whyItMatters": "Prevents gradient saturation on early convolutions.",
            "keyTakeaway": "Standardizes visual features."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "gray",
        "icon": "crop"
    })
    connections.append({ "id": "c_input_norm", "sourceId": "input_1", "targetId": "normalization", "type": "sequential" })
    y_ptr += 150

    # stem_padding
    layers.append({
        "id": "stem_padding",
        "type": "activation",
        "name": "stem_padding",
        "inputShape": { "dimensions": [None, resolution, resolution, 3], "description": f"{resolution}×{resolution}×3" },
        "outputShape": { "dimensions": [None, resolution + 1, resolution + 1, 3], "description": f"{resolution+1}×{resolution+1}×3" },
        "config": { "padding": [[0, 1], [0, 1]] },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": {
            "summary": "Zero padding for the stem conv.",
            "detailed": "Pads borders to control dimensions.",
            "whyItMatters": "Ensures boundary pixel convolving.",
            "keyTakeaway": "Pads borders."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "gray",
        "icon": "crop"
    })
    connections.append({ "id": "c_norm_pad", "sourceId": "normalization", "targetId": "stem_padding", "type": "sequential" })
    y_ptr += 150

    # stem_conv
    stem_filters = round_filters(32, width_coefficient)
    stem_weights = 3 * 3 * 3 * stem_filters
    layers.append({
        "id": "stem_conv",
        "type": "conv2d",
        "name": "stem_conv",
        "inputShape": { "dimensions": [None, resolution + 1, resolution + 1, 3], "description": f"{resolution+1}×{resolution+1}×3" },
        "outputShape": { "dimensions": [None, resolution // 2, resolution // 2, stem_filters], "description": f"{resolution // 2}×{resolution // 2}×{stem_filters}" },
        "config": {
            "filters": stem_filters,
            "kernelSize": [3, 3],
            "strides": [2, 2],
            "padding": "valid",
            "useBias": False,
            "activation": "linear"
        },
        "parameters": {
            "total": stem_weights,
            "weights": stem_weights,
            "biases": 0,
            "formula": "kernel_height × kernel_width × input_channels × output_filters",
            "calculationSteps": [
                { "label": "Kernel Weights", "expression": f"3 × 3 × 3 × {stem_filters}", "result": stem_weights, "explanation": "Stem convolution maps input channels to scaled filters." }
            ]
        },
        "educationalNote": {
            "summary": "Standard early downsampling 3x3 convolution.",
            "detailed": "Captures baseline visual primitives and shrinks resolution by 50%.",
            "whyItMatters": "Shrinks image bounds early to reduce compute scales.",
            "keyTakeaway": "Stem downsampling."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "blue",
        "icon": "layers"
    })
    connections.append({ "id": "c_pad_stemconv", "sourceId": "stem_padding", "targetId": "stem_conv", "type": "sequential" })
    y_ptr += 150

    # stem_bn
    layers.append({
        "id": "stem_bn",
        "type": "batch_norm",
        "name": "stem_bn",
        "inputShape": { "dimensions": [None, resolution // 2, resolution // 2, stem_filters], "description": f"{resolution // 2}×{resolution // 2}×{stem_filters}" },
        "outputShape": { "dimensions": [None, resolution // 2, resolution // 2, stem_filters], "description": f"{resolution // 2}×{resolution // 2}×{stem_filters}" },
        "config": { "axis": 3, "momentum": 0.99, "epsilon": 0.001 },
        "parameters": {
            "total": stem_filters * 4,
            "weights": stem_filters * 2,
            "biases": stem_filters * 2,
            "formula": "4 × channels",
            "calculationSteps": []
        },
        "educationalNote": {
            "summary": "Normalizes stem activations.",
            "keyTakeaway": "Maintains normalization properties."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "gray",
        "icon": "activity"
    })
    connections.append({ "id": "c_stemconv_bn", "sourceId": "stem_conv", "targetId": "stem_bn", "type": "sequential" })
    y_ptr += 150

    # stem_activation
    layers.append({
        "id": "stem_activation",
        "type": "activation",
        "name": "stem_activation",
        "inputShape": { "dimensions": [None, resolution // 2, resolution // 2, stem_filters], "description": f"{resolution // 2}×{resolution // 2}×{stem_filters}" },
        "outputShape": { "dimensions": [None, resolution // 2, resolution // 2, stem_filters], "description": f"{resolution // 2}×{resolution // 2}×{stem_filters}" },
        "config": { "activation": "swish" },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": {
            "summary": "Applies swish activation.",
            "detailed": "Swish: x * sigmoid(x). Smooth, non-monotonic curve that outperforms ReLU on deep models.",
            "whyItMatters": "Core activation in EfficientNet design.",
            "keyTakeaway": "Swish non-linearity."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "pink",
        "icon": "zap"
    })
    connections.append({ "id": "c_stembn_act", "sourceId": "stem_bn", "targetId": "stem_activation", "type": "sequential" })
    y_ptr += 150

    stem_ids = ["normalization", "stem_padding", "stem_conv", "stem_bn", "stem_activation"]
    groups.append({
        "id": "group_stem",
        "name": "Input Stem",
        "description": "Stem block using Swish activation.",
        "layerIds": stem_ids,
        "color": colorTheme
    })

    # MBConv block stages
    # Stage configuration: (stage_idx, kernel_size, repeats, filters_in, filters_out, expand_ratio, id_skip, strides, se_ratio)
    blocks_args = [
        (1, 3, 1, 32, 16, 1, True, 1, 0.25),
        (2, 3, 2, 16, 24, 6, True, 2, 0.25),
        (3, 5, 2, 24, 40, 6, True, 2, 0.25),
        (4, 3, 3, 40, 80, 6, True, 2, 0.25),
        (5, 5, 3, 80, 112, 6, True, 1, 0.25),
        (6, 5, 4, 112, 192, 6, True, 2, 0.25),
        (7, 3, 1, 192, 320, 6, True, 1, 0.25)
    ]

    last_layer_id = "stem_activation"
    current_channels = stem_filters
    h_curr = resolution // 2

    # Map stage blocks to characters (e.g. block1a, block2a, block2b)
    for stage_idx, kernel, repeats, f_in, f_out, expand_ratio, id_skip, stride, se_ratio in blocks_args:
        scaled_repeats = round_repeats(repeats, depth_coefficient)
        scaled_f_out = round_filters(f_out, width_coefficient)

        for rep_idx in range(scaled_repeats):
            char_suffix = chr(97 + rep_idx)  # 'a', 'b', 'c', ...
            block_name = f"block{stage_idx}{char_suffix}"
            block_layer_ids = []

            # First block of a stage handles stride and channel mapping
            b_stride = stride if rep_idx == 0 else 1
            b_in = current_channels
            b_out = scaled_f_out
            b_h_in = h_curr
            b_h_out = b_h_in // b_stride

            has_expand = (expand_ratio > 1)
            expanded_filters = b_in * expand_ratio
            has_skip = (b_stride == 1 and b_in == b_out)

            # 1. Expand block
            expand_out_id = last_layer_id
            if has_expand:
                exp_id = f"{block_name}_expand_conv"
                exp_weights = b_in * expanded_filters
                layers.append({
                    "id": exp_id,
                    "type": "conv2d",
                    "name": exp_id,
                    "inputShape": { "dimensions": [None, b_h_in, b_h_in, b_in], "description": f"{b_h_in}×{b_h_in}×{b_in}" },
                    "outputShape": { "dimensions": [None, b_h_in, b_h_in, expanded_filters], "description": f"{b_h_in}×{b_h_in}×{expanded_filters}" },
                    "config": {
                        "filters": expanded_filters,
                        "kernelSize": [1, 1],
                        "strides": [1, 1],
                        "padding": "same",
                        "useBias": False,
                        "activation": "linear"
                    },
                    "parameters": {
                        "total": exp_weights,
                        "weights": exp_weights,
                        "biases": 0,
                        "formula": "input_channels × output_filters",
                        "calculationSteps": [
                            { "label": "Expand weights", "expression": f"{b_in} × {expanded_filters}", "result": exp_weights, "explanation": "1x1 expansion convolution." }
                        ]
                    },
                    "educationalNote": {
                        "summary": "1x1 Expansion bottleneck layer.",
                        "detailed": f"Expands the input dimension from {b_in} to {expanded_filters} channels.",
                        "whyItMatters": "Prepares channels for subsequent depthwise convolutions.",
                        "keyTakeaway": "Inverted bottleneck expansion."
                    },
                    "position": { "x": 250, "y": y_ptr },
                    "color": "blue",
                    "icon": "layers"
                })
                connections.append({ "id": f"c_{last_layer_id}_{exp_id}", "sourceId": last_layer_id, "targetId": exp_id, "type": "sequential" })
                block_layer_ids.append(exp_id)
                y_ptr += 150

                exp_bn_id = f"{block_name}_expand_bn"
                layers.append({
                    "id": exp_bn_id,
                    "type": "batch_norm",
                    "name": exp_bn_id,
                    "inputShape": { "dimensions": [None, b_h_in, b_h_in, expanded_filters], "description": f"{b_h_in}×{b_h_in}×{expanded_filters}" },
                    "outputShape": { "dimensions": [None, b_h_in, b_h_in, expanded_filters], "description": f"{b_h_in}×{b_h_in}×{expanded_filters}" },
                    "config": { "axis": 3, "momentum": 0.99, "epsilon": 0.001 },
                    "parameters": {
                        "total": expanded_filters * 4,
                        "weights": expanded_filters * 2,
                        "biases": expanded_filters * 2,
                        "formula": "4 × channels",
                        "calculationSteps": []
                    },
                    "educationalNote": {
                        "summary": "Normalizes expansion.",
                        "keyTakeaway": "Normalizes expanded features."
                    },
                    "position": { "x": 250, "y": y_ptr },
                    "color": "gray",
                    "icon": "activity"
                })
                connections.append({ "id": f"c_{exp_id}_{exp_bn_id}", "sourceId": exp_id, "targetId": exp_bn_id, "type": "sequential" })
                block_layer_ids.append(exp_bn_id)
                y_ptr += 150

                exp_act_id = f"{block_name}_expand_activation"
                layers.append({
                    "id": exp_act_id,
                    "type": "activation",
                    "name": exp_act_id,
                    "inputShape": { "dimensions": [None, b_h_in, b_h_in, expanded_filters], "description": f"{b_h_in}×{b_h_in}×{expanded_filters}" },
                    "outputShape": { "dimensions": [None, b_h_in, b_h_in, expanded_filters], "description": f"{b_h_in}×{b_h_in}×{expanded_filters}" },
                    "config": { "activation": "swish" },
                    "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
                    "educationalNote": {
                        "summary": "Swish activation.",
                        "keyTakeaway": "Smooth non-linearity."
                    },
                    "position": { "x": 250, "y": y_ptr },
                    "color": "pink",
                    "icon": "zap"
                })
                connections.append({ "id": f"c_{exp_bn_id}_{exp_act_id}", "sourceId": exp_bn_id, "targetId": exp_act_id, "type": "sequential" })
                block_layer_ids.append(exp_act_id)
                y_ptr += 150
                expand_out_id = exp_act_id

            # 2. Depthwise Conv
            # Padding setup
            dw_pad_h_in = b_h_in
            if b_stride > 1:
                dw_pad_id = f"{block_name}_dwconv_pad"
                layers.append({
                    "id": dw_pad_id,
                    "type": "activation",
                    "name": dw_pad_id,
                    "inputShape": { "dimensions": [None, b_h_in, b_h_in, expanded_filters], "description": f"{b_h_in}×{b_h_in}×{expanded_filters}" },
                    "outputShape": { "dimensions": [None, b_h_in + 1, b_h_in + 1, expanded_filters], "description": f"{b_h_in+1}×{b_h_in+1}×{expanded_filters}" },
                    "config": { "padding": [[0, 1], [0, 1]] },
                    "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
                    "educationalNote": {
                        "summary": "Zero padding for stride conv.",
                        "keyTakeaway": "Pads borders."
                    },
                    "position": { "x": 250, "y": y_ptr },
                    "color": "gray",
                    "icon": "crop"
                })
                connections.append({ "id": f"c_{expand_out_id}_{dw_pad_id}", "sourceId": expand_out_id, "targetId": dw_pad_id, "type": "sequential" })
                block_layer_ids.append(dw_pad_id)
                y_ptr += 150
                expand_out_id = dw_pad_id
                dw_pad_h_in = b_h_in + 1

            dw_id = f"{block_name}_dwconv"
            dw_weights = kernel * kernel * expanded_filters
            layers.append({
                "id": dw_id,
                "type": "conv2d",
                "name": dw_id,
                "inputShape": { "dimensions": [None, dw_pad_h_in, dw_pad_h_in, expanded_filters], "description": f"{dw_pad_h_in}×{dw_pad_h_in}×{expanded_filters}" },
                "outputShape": { "dimensions": [None, b_h_out, b_h_out, expanded_filters], "description": f"{b_h_out}×{b_h_out}×{expanded_filters}" },
                "config": {
                    "filters": expanded_filters,
                    "kernelSize": [kernel, kernel],
                    "strides": [b_stride, b_stride],
                    "padding": "same" if b_stride == 1 else "valid",
                    "useBias": False,
                    "activation": "linear"
                },
                "parameters": {
                    "total": dw_weights,
                    "weights": dw_weights,
                    "biases": 0,
                    "formula": "kernel_height × kernel_width × channels",
                    "calculationSteps": [
                        { "label": "Depthwise weights", "expression": f"{kernel} × {kernel} × {expanded_filters}", "result": dw_weights, "explanation": "Kernel weights convolving over spatial maps." }
                    ]
                },
                "educationalNote": {
                    "summary": f"Spatial depthwise {kernel}x{kernel} convolution.",
                    "detailed": f"Applies independent kernels over each channel to model spatial details.",
                    "whyItMatters": "Saves computing parameters dramatically.",
                    "keyTakeaway": "Performs spatial convolutions."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "blue",
                "icon": "layers"
            })
            connections.append({ "id": f"c_{expand_out_id}_{dw_id}", "sourceId": expand_out_id, "targetId": dw_id, "type": "sequential" })
            block_layer_ids.append(dw_id)
            y_ptr += 150

            dw_bn_id = f"{block_name}_bn"
            layers.append({
                "id": dw_bn_id,
                "type": "batch_norm",
                "name": dw_bn_id,
                "inputShape": { "dimensions": [None, b_h_out, b_h_out, expanded_filters], "description": f"{b_h_out}×{b_h_out}×{expanded_filters}" },
                "outputShape": { "dimensions": [None, b_h_out, b_h_out, expanded_filters], "description": f"{b_h_out}×{b_h_out}×{expanded_filters}" },
                "config": { "axis": 3, "momentum": 0.99, "epsilon": 0.001 },
                "parameters": {
                    "total": expanded_filters * 4,
                    "weights": expanded_filters * 2,
                    "biases": expanded_filters * 2,
                    "formula": "4 × channels",
                    "calculationSteps": []
                },
                "educationalNote": {
                    "summary": "Normalizes depthwise outputs.",
                    "keyTakeaway": "Maintains spatial scale normalization."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "gray",
                "icon": "activity"
            })
            connections.append({ "id": f"c_{dw_id}_{dw_bn_id}", "sourceId": dw_id, "targetId": dw_bn_id, "type": "sequential" })
            block_layer_ids.append(dw_bn_id)
            y_ptr += 150

            dw_act_id = f"{block_name}_activation"
            layers.append({
                "id": dw_act_id,
                "type": "activation",
                "name": dw_act_id,
                "inputShape": { "dimensions": [None, b_h_out, b_h_out, expanded_filters], "description": f"{b_h_out}×{b_h_out}×{expanded_filters}" },
                "outputShape": { "dimensions": [None, b_h_out, b_h_out, expanded_filters], "description": f"{b_h_out}×{b_h_out}×{expanded_filters}" },
                "config": { "activation": "swish" },
                "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
                "educationalNote": {
                    "summary": "Swish activation.",
                    "keyTakeaway": "Non-linearity activation."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "pink",
                "icon": "zap"
            })
            connections.append({ "id": f"c_{dw_bn_id}_{dw_act_id}", "sourceId": dw_bn_id, "targetId": dw_act_id, "type": "sequential" })
            block_layer_ids.append(dw_act_id)
            y_ptr += 150

            dw_out_id = dw_act_id

            # 3. Squeeze-and-Excitation (SE) module
            if se_ratio > 0:
                se_reduced_channels = max(1, int(b_in * se_ratio))
                se_sq_id = f"{block_name}_se_squeeze"
                layers.append({
                    "id": se_sq_id,
                    "type": "global_average_pooling2d",
                    "name": se_sq_id,
                    "inputShape": { "dimensions": [None, b_h_out, b_h_out, expanded_filters], "description": f"{b_h_out}×{b_h_out}×{expanded_filters}" },
                    "outputShape": { "dimensions": [None, expanded_filters], "description": str(expanded_filters) },
                    "config": {},
                    "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
                    "educationalNote": {
                        "summary": "SE Squeeze averaging spatial activations.",
                        "detailed": "Collapses spatial dimensions to form channel global context vectors.",
                        "whyItMatters": "Used to model interdependencies between channels.",
                        "keyTakeaway": "Collapses spatial details to channel context."
                    },
                    "position": { "x": 100, "y": y_ptr - 400 },
                    "color": "amber",
                    "icon": "activity"
                })
                connections.append({ "id": f"c_{dw_out_id}_{se_sq_id}", "sourceId": dw_out_id, "targetId": se_sq_id, "type": "skip" })
                block_layer_ids.append(se_sq_id)

                se_red_id = f"{block_name}_se_reshape" # reduziert
                se_red_weights = expanded_filters * se_reduced_channels
                layers.append({
                    "id": se_red_id,
                    "type": "conv2d",
                    "name": se_red_id,
                    "inputShape": { "dimensions": [None, 1, 1, expanded_filters], "description": f"1×1×{expanded_filters}" },
                    "outputShape": { "dimensions": [None, 1, 1, se_reduced_channels], "description": f"1×1×{se_reduced_channels}" },
                    "config": {
                        "filters": se_reduced_channels,
                        "kernelSize": [1, 1],
                        "strides": [1, 1],
                        "padding": "valid",
                        "useBias": True,
                        "activation": "swish"
                    },
                    "parameters": {
                        "total": se_red_weights + se_reduced_channels,
                        "weights": se_red_weights,
                        "biases": se_reduced_channels,
                        "formula": "input_channels × output_filters + output_filters",
                        "calculationSteps": []
                    },
                    "educationalNote": {
                        "summary": "SE reduction layer.",
                        "detailed": f"Compresses channel features to {se_reduced_channels} with bias.",
                        "whyItMatters": "Controls SE param size.",
                        "keyTakeaway": "Squeezes features."
                    },
                    "position": { "x": 100, "y": y_ptr - 250 },
                    "color": "blue",
                    "icon": "layers"
                })
                connections.append({ "id": f"c_{se_sq_id}_{se_red_id}", "sourceId": se_sq_id, "targetId": se_red_id, "type": "sequential" })
                block_layer_ids.append(se_red_id)

                se_exp_id = f"{block_name}_se_expand"
                se_exp_weights = se_reduced_channels * expanded_filters
                layers.append({
                    "id": se_exp_id,
                    "type": "conv2d",
                    "name": se_exp_id,
                    "inputShape": { "dimensions": [None, 1, 1, se_reduced_channels], "description": f"1×1×{se_reduced_channels}" },
                    "outputShape": { "dimensions": [None, 1, 1, expanded_filters], "description": f"1×1×{expanded_filters}" },
                    "config": {
                        "filters": expanded_filters,
                        "kernelSize": [1, 1],
                        "strides": [1, 1],
                        "padding": "valid",
                        "useBias": True,
                        "activation": "sigmoid"
                    },
                    "parameters": {
                        "total": se_exp_weights + expanded_filters,
                        "weights": se_exp_weights,
                        "biases": expanded_filters,
                        "formula": "input_channels × output_filters + output_filters",
                        "calculationSteps": []
                    },
                    "educationalNote": {
                        "summary": "SE expand layer with sigmoid activation.",
                        "detailed": "Expands bottleneck back to output scales.",
                        "whyItMatters": "Gives weights representing importance of channels.",
                        "keyTakeaway": "Excites maps."
                    },
                    "position": { "x": 100, "y": y_ptr - 100 },
                    "color": "blue",
                    "icon": "layers"
                })
                connections.append({ "id": f"c_{se_red_id}_{se_exp_id}", "sourceId": se_red_id, "targetId": se_exp_id, "type": "sequential" })
                block_layer_ids.append(se_exp_id)

                se_ex_id = f"{block_name}_se_excite"
                layers.append({
                    "id": se_ex_id,
                    "type": "concatenate", # Fallback type for multiplication
                    "name": se_ex_id,
                    "inputShape": { "dimensions": [None, b_h_out, b_h_out, expanded_filters], "description": "Features + SE Weights" },
                    "outputShape": { "dimensions": [None, b_h_out, b_h_out, expanded_filters], "description": f"{b_h_out}×{b_h_out}×{expanded_filters}" },
                    "config": {},
                    "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
                    "educationalNote": {
                        "summary": "Excitation step.",
                        "detailed": "Multiplies feature maps with SE weights.",
                        "whyItMatters": "Controls channel attention dynamics.",
                        "keyTakeaway": "Excites features."
                    },
                    "position": { "x": 250, "y": y_ptr },
                    "color": "cyan",
                    "icon": "git-merge"
                })
                connections.append({ "id": f"c_{dw_out_id}_{se_ex_id}", "sourceId": dw_out_id, "targetId": se_ex_id, "type": "sequential" })
                connections.append({ "id": f"c_{se_exp_id}_{se_ex_id}", "sourceId": se_exp_id, "targetId": se_ex_id, "type": "concatenate" })
                block_layer_ids.append(se_ex_id)
                y_ptr += 150
                dw_out_id = se_ex_id

            # 4. Project Conv
            proj_id = f"{block_name}_project_conv"
            proj_weights = expanded_filters * b_out
            layers.append({
                "id": proj_id,
                "type": "conv2d",
                "name": proj_id,
                "inputShape": { "dimensions": [None, b_h_out, b_h_out, expanded_filters], "description": f"{b_h_out}×{b_h_out}×{expanded_filters}" },
                "outputShape": { "dimensions": [None, b_h_out, b_h_out, b_out], "description": f"{b_h_out}×{b_h_out}×{b_out}" },
                "config": {
                    "filters": b_out,
                    "kernelSize": [1, 1],
                    "strides": [1, 1],
                    "padding": "same",
                    "useBias": False,
                    "activation": "linear"
                },
                "parameters": {
                    "total": proj_weights,
                    "weights": proj_weights,
                    "biases": 0,
                    "formula": "input_channels × output_filters",
                    "calculationSteps": [
                        { "label": "Project weights", "expression": f"{expanded_filters} × {b_out}", "result": proj_weights, "explanation": "Compresses channel bottleneck." }
                    ]
                },
                "educationalNote": {
                    "summary": "1x1 projection conv (linear bottleneck).",
                    "detailed": f"Compresses channel features back to {b_out} dimensions.",
                    "whyItMatters": "Linear bottlenecks prevent activation information losses.",
                    "keyTakeaway": "Compresses activations."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "blue",
                "icon": "layers"
            })
            connections.append({ "id": f"c_{dw_out_id}_{proj_id}", "sourceId": dw_out_id, "targetId": proj_id, "type": "sequential" })
            block_layer_ids.append(proj_id)
            y_ptr += 150

            # Project BN
            proj_bn_id = f"{block_name}_project_bn"
            layers.append({
                "id": proj_bn_id,
                "type": "batch_norm",
                "name": proj_bn_id,
                "inputShape": { "dimensions": [None, b_h_out, b_h_out, b_out], "description": f"{b_h_out}×{b_h_out}×{b_out}" },
                "outputShape": { "dimensions": [None, b_h_out, b_h_out, b_out], "description": f"{b_h_out}×{b_h_out}×{b_out}" },
                "config": { "axis": 3, "momentum": 0.99, "epsilon": 0.001 },
                "parameters": {
                    "total": b_out * 4,
                    "weights": b_out * 2,
                    "biases": b_out * 2,
                    "formula": "4 × channels",
                    "calculationSteps": []
                },
                "educationalNote": {
                    "summary": "Normalizes projection.",
                    "keyTakeaway": "Normalizes final bottleneck layer."
                },
                "position": { "x": 250, "y": y_ptr },
                "color": "gray",
                "icon": "activity"
            })
            connections.append({ "id": f"c_{proj_id}_{proj_bn_id}", "sourceId": proj_id, "targetId": proj_bn_id, "type": "sequential" })
            block_layer_ids.append(proj_bn_id)
            y_ptr += 150

            # 5. Add Skip
            block_out_id = proj_bn_id
            if has_skip:
                add_id = f"{block_name}_add"
                layers.append({
                    "id": add_id,
                    "type": "add",
                    "name": add_id,
                    "inputShape": { "dimensions": [None, b_h_out, b_h_out, b_out], "description": f"{b_out} channels" },
                    "outputShape": { "dimensions": [None, b_h_out, b_h_out, b_out], "description": f"{b_out} channels" },
                    "config": {},
                    "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
                    "educationalNote": {
                        "summary": "Performs residual sum.",
                        "detailed": "Adds bottleneck output directly to block input.",
                        "whyItMatters": "Avoids gradient vanishing issues.",
                        "keyTakeaway": "Summation skip connection."
                    },
                    "position": { "x": 250, "y": y_ptr },
                    "color": "red",
                    "icon": "plus-circle"
                })
                connections.append({ "id": f"c_{proj_bn_id}_{add_id}", "sourceId": proj_bn_id, "targetId": add_id, "type": "sequential" })
                connections.append({ "id": f"c_{last_layer_id}_{add_id}", "sourceId": last_layer_id, "targetId": add_id, "type": "skip" })
                block_layer_ids.append(add_id)
                y_ptr += 150
                block_out_id = add_id

            groups.append({
                "id": f"group_{block_name}",
                "name": f"MBConv Block {block_name[-2:]}",
                "description": f"MBConv bottleneck: 1x1 expand → {kernel}x{kernel} dwconv → {'SE → ' if se_ratio > 0 else ''}1x1 projection.",
                "layerIds": block_layer_ids,
                "color": "#F97316"
            })

            last_layer_id = block_out_id
            current_channels = b_out
            h_curr = b_h_out

    # top_conv (filters = round_filters(1280, width_coefficient))
    top_conv_filters = round_filters(1280, width_coefficient)
    top_conv_weights = current_channels * top_conv_filters
    layers.append({
        "id": "top_conv",
        "type": "conv2d",
        "name": "top_conv",
        "inputShape": { "dimensions": [None, h_curr, h_curr, current_channels], "description": f"{h_curr}×{h_curr}×{current_channels}" },
        "outputShape": { "dimensions": [None, h_curr, h_curr, top_conv_filters], "description": f"{h_curr}×{h_curr}×{top_conv_filters}" },
        "config": {
            "filters": top_conv_filters,
            "kernelSize": [1, 1],
            "strides": [1, 1],
            "padding": "same",
            "useBias": False,
            "activation": "linear"
        },
        "parameters": {
            "total": top_conv_weights,
            "weights": top_conv_weights,
            "biases": 0,
            "formula": "input_channels × output_filters",
            "calculationSteps": [
                { "label": "Conv weights", "expression": f"{current_channels} × {top_conv_filters}", "result": top_conv_weights, "explanation": "Final feature synthesizer weights." }
            ]
        },
        "educationalNote": {
            "summary": "1x1 final convolution.",
            "detailed": "Synthesizes final block features before global pooling.",
            "whyItMatters": "Controls feature parameters.",
            "keyTakeaway": "Final convolution expansion."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "blue",
        "icon": "layers"
    })
    connections.append({ "id": "c_last_topconv", "sourceId": last_layer_id, "targetId": "top_conv", "type": "sequential" })
    y_ptr += 150

    # top_bn
    layers.append({
        "id": "top_bn",
        "type": "batch_norm",
        "name": "top_bn",
        "inputShape": { "dimensions": [None, h_curr, h_curr, top_conv_filters], "description": f"{h_curr}×{h_curr}×{top_conv_filters}" },
        "outputShape": { "dimensions": [None, h_curr, h_curr, top_conv_filters], "description": f"{h_curr}×{h_curr}×{top_conv_filters}" },
        "config": { "axis": 3, "momentum": 0.99, "epsilon": 0.001 },
        "parameters": {
            "total": top_conv_filters * 4,
            "weights": top_conv_filters * 2,
            "biases": top_conv_filters * 2,
            "formula": "4 × channels",
            "calculationSteps": []
        },
        "educationalNote": {
            "summary": "Normalizes final conv.",
            "keyTakeaway": "Final normalization before pooling."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "gray",
        "icon": "activity"
    })
    connections.append({ "id": "c_topconv_bn", "sourceId": "top_conv", "targetId": "top_bn", "type": "sequential" })
    y_ptr += 150

    # top_activation
    layers.append({
        "id": "top_activation",
        "type": "activation",
        "name": "top_activation",
        "inputShape": { "dimensions": [None, h_curr, h_curr, top_conv_filters], "description": f"{h_curr}×{h_curr}×{top_conv_filters}" },
        "outputShape": { "dimensions": [None, h_curr, h_curr, top_conv_filters], "description": f"{h_curr}×{h_curr}×{top_conv_filters}" },
        "config": { "activation": "swish" },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": {
            "summary": "Swish activation.",
            "keyTakeaway": "Final activation step."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "pink",
        "icon": "zap"
    })
    connections.append({ "id": "c_topbn_act", "sourceId": "top_bn", "targetId": "top_activation", "type": "sequential" })
    y_ptr += 150

    # avg_pool
    layers.append({
        "id": "avg_pool",
        "type": "global_average_pooling2d",
        "name": "avg_pool",
        "inputShape": { "dimensions": [None, h_curr, h_curr, top_conv_filters], "description": f"{h_curr}×{h_curr}×{top_conv_filters}" },
        "outputShape": { "dimensions": [None, top_conv_filters], "description": str(top_conv_filters) },
        "config": {},
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": {
            "summary": "Global average pooling.",
            "detailed": "Averages spatial dimensions to form a global feature vector.",
            "whyItMatters": "Saves compute parameter sizes.",
            "keyTakeaway": "Replaces heavy fully connected layers with zero parameters."
        },
        "position": { "x": 250, "y": y_ptr },
        "color": "amber",
        "icon": "activity"
    })
    connections.append({ "id": "c_act_avg", "sourceId": "top_activation", "targetId": "avg_pool", "type": "sequential" })
    y_ptr += 150

    # predictions
    pred_weights = top_conv_filters * 1000
    layers.append({
        "id": "predictions",
        "type": "dense",
        "name": "predictions",
        "inputShape": { "dimensions": [None, top_conv_filters], "description": str(top_conv_filters) },
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
                { "label": "Weights", "expression": f"{top_conv_filters} × 1000", "result": pred_weights, "explanation": "Fully connected mapping weights." }
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
        "description": "Global average pooling followed by dense classifier predictions.",
        "layerIds": ["top_conv", "top_bn", "top_activation", "avg_pool", "predictions"],
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
        "inputShape": { "channels": 3, "height": resolution, "width": resolution },
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


if __name__ == "__main__":
    print("Generating MobileNet V1...")
    generate_mobilenet_v1(
        "mobilenet", "MobileNet", "MobileNets: Efficient Convolutional Neural Networks for Mobile Vision Applications",
        2017, ["Andrew G. Howard", "Menglong Zhu", "Bo Chen", "Dmitry Kalenichenko", "Weijun Wang", "Tobias Weyand", "Marco Andreetto", "Hartwig Adam"], "https://arxiv.org/abs/1704.04861",
        28, 4253864, 569000000, 0.704, 0.895, 16,
        "Introduces depthwise separable convolutions to create lightweight models. Designed for mobile and embedded vision applications with minimal computational overhead.",
        ["CNN", "Classification", "Mobile", "Lightweight", "ImageNet"], "#0EA5E9"
    )

    # MobileNetV3 configs
    mobilenetv3_small_blocks = [
        # (kernel, exp_size, out_filters, use_se, activation, stride)
        (3, 16, 16, True, "relu", 2),
        (3, 72, 24, False, "relu", 2),
        (3, 88, 24, False, "relu", 1),
        (5, 96, 40, True, "hard_swish", 2),
        (5, 240, 40, True, "hard_swish", 1),
        (5, 240, 40, True, "hard_swish", 1),
        (5, 120, 48, True, "hard_swish", 1),
        (5, 144, 48, True, "hard_swish", 1),
        (5, 288, 96, True, "hard_swish", 2),
        (5, 576, 96, True, "hard_swish", 1),
        (5, 576, 96, True, "hard_swish", 1)
    ]
    mobilenetv3_large_blocks = [
        (3, 16, 16, False, "relu", 1),
        (3, 64, 24, False, "relu", 2),
        (3, 72, 24, False, "relu", 1),
        (5, 72, 40, True, "relu", 2),
        (5, 120, 40, True, "relu", 1),
        (5, 120, 40, True, "relu", 1),
        (3, 240, 80, False, "hard_swish", 2),
        (3, 200, 80, False, "hard_swish", 1),
        (3, 184, 80, False, "hard_swish", 1),
        (3, 184, 80, False, "hard_swish", 1),
        (3, 480, 112, True, "hard_swish", 1),
        (3, 672, 112, True, "hard_swish", 1),
        (5, 672, 160, True, "hard_swish", 2),
        (5, 960, 160, True, "hard_swish", 1),
        (5, 960, 160, True, "hard_swish", 1)
    ]

    print("\nGenerating MobileNet V3 Large & Small...")
    generate_mobilenet_v3(
        "mobilenetv3small", "MobileNetV3 Small", "Searching for MobileNetV3 (Small)",
        2019, ["Andrew Howard", "Mark Sandler", "Grace Chu", "Liang-Chieh Chen", "Bo Chen", "Mingxing Tan", "Weijun Wang", "Yukun Zhu", "Ruoming Peng", "Vijay Vasudevan", "Hartwig Adam"], "https://arxiv.org/abs/1905.02175",
        66, 2535592, 65000000, 0.671, 0.875, 10,
        "Ultra-lightweight MobileNet variant found through neural architecture search. Ideal for extreme mobile constraints with very small parameter count.",
        ["CNN", "Classification", "Mobile", "Lightweight", "NAS", "ImageNet"], "#0891B2", mobilenetv3_small_blocks, 576, 1024
    )

    generate_mobilenet_v3(
        "mobilenetv3large", "MobileNetV3 Large", "Searching for MobileNetV3 (Large)",
        2019, ["Andrew Howard", "Mark Sandler", "Grace Chu", "Liang-Chieh Chen", "Bo Chen", "Mingxing Tan", "Weijun Wang", "Yukun Zhu", "Ruoming Peng", "Vijay Vasudevan", "Hartwig Adam"], "https://arxiv.org/abs/1905.02175",
        109, 5422104, 219000000, 0.754, 0.923, 21,
        "Larger MobileNetV3 variant optimized for better accuracy. Uses hardware-aware search and squeeze-and-excitation blocks for improved performance.",
        ["CNN", "Classification", "Mobile", "NAS", "ImageNet"], "#00D9FF", mobilenetv3_large_blocks, 960, 1280
    )

    # EfficientNet configs
    # (width_coefficient, depth_coefficient, resolution, dropout_rate, model_id, name)
    eff_configs = [
        (1.0, 1.0, 224, 0.2, "efficientnetb0", "EfficientNetB0", "EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks", 5330564, 390000000, 0.773, 0.935, 20),
        (1.0, 1.1, 240, 0.2, "efficientnetb1", "EfficientNetB1", "EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks (B1)", 7794184, 710000000, 0.791, 0.944, 30),
        (1.1, 1.2, 260, 0.3, "efficientnetb2", "EfficientNetB2", "EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks (B2)", 9109994, 1030000000, 0.802, 0.950, 37),
        (1.2, 1.4, 300, 0.3, "efficientnetb3", "EfficientNetB3", "EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks (B3)", 12233232, 1860000000, 0.813, 0.956, 48),
        (1.4, 1.8, 380, 0.4, "efficientnetb4", "EfficientNetB4", "EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks (B4)", 19341616, 4800000000, 0.830, 0.960, 74),
        (1.6, 2.2, 456, 0.4, "efficientnetb5", "EfficientNetB5", "EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks (B5)", 30389784, 9700000000, 0.837, 0.963, 118),
        (1.8, 2.6, 528, 0.5, "efficientnetb6", "EfficientNetB6", "EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks (B6)", 43040704, 19300000000, 0.842, 0.968, 166),
        (2.0, 3.1, 600, 0.5, "efficientnetb7", "EfficientNetB7", "EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks (B7)", 66658687, 37000000000, 0.844, 0.970, 257)
    ]

    print("\nGenerating EfficientNet B0-B7 models...")
    for w_coef, d_coef, res, drop, m_id, m_name, f_name, t_params, t_flops, t1_acc, t5_acc, mem in eff_configs:
        generate_efficientnet(
            m_id, m_name, f_name, 2019, ["Mingxing Tan", "Quoc V. Le"], "https://arxiv.org/abs/1905.11946",
            84 if m_id=="efficientnetb0" else (106 if m_id=="efficientnetb1" else (115 if m_id=="efficientnetb2" else (154 if m_id=="efficientnetb3" else (214 if m_id=="efficientnetb4" else (456 if m_id=="efficientnetb5" else (550 if m_id=="efficientnetb6" else 813)))))),
            t_params, t_flops, t1_acc, t5_acc, mem,
            f_name + " scaled using compound scaling values.",
            ["CNN", "Classification", "Efficient", "Compound-Scaling", "ImageNet"], "#F97316",
            w_coef, d_coef, res, drop
        )

    print("\nAll generations completed!")
