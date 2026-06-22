import json
import os

# Helper to write JSON files
def write_json(path, data):
    with open(path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"Generated {data['name']} successfully: {path} ({len(data['architecture']['layers'])} layers)")

# Helper to generate standard educational notes
def make_note(summary, detailed, why_it_matters, key_takeaway):
    return {
        "summary": summary,
        "detailed": detailed,
        "whyItMatters": why_it_matters,
        "keyTakeaway": key_takeaway
    }

# Stem Convolution Helper
def add_conv_bn_act(layers, connections, id_prefix, name_prefix, f_in, f_out, k_size, stride, padding, use_bias, act, x, y):
    conv_id = f"{id_prefix}_conv"
    conv_weights = k_size[0] * k_size[1] * f_in * f_out
    h_out = 0 # Will be dynamically represented conceptually

    layers.append({
        "id": conv_id,
        "type": "conv2d",
        "name": f"{name_prefix}_conv",
        "inputShape": { "dimensions": [None, None, None, f_in], "description": f"×{f_in}" },
        "outputShape": { "dimensions": [None, None, None, f_out], "description": f"×{f_out}" },
        "config": {
            "filters": f_out,
            "kernelSize": k_size,
            "strides": [stride, stride],
            "padding": padding,
            "useBias": use_bias,
            "activation": "linear"
        },
        "parameters": {
            "total": conv_weights + (f_out if use_bias else 0),
            "weights": conv_weights,
            "biases": f_out if use_bias else 0,
            "formula": "kernel_height × kernel_width × input_channels × output_filters" + (" + output_filters" if use_bias else ""),
            "calculationSteps": [
                { "label": "Weights", "expression": f"{k_size[0]} × {k_size[1]} × {f_in} × {f_out}", "result": conv_weights, "explanation": "Kernel weights." }
            ]
        },
        "educationalNote": make_note(
            f"Standard {k_size[0]}x{k_size[1]} convolution.",
            f"Slides {f_out} filters across input features.",
            "Key feature extraction layer.",
            "Extracts features."
        ),
        "position": { "x": x, "y": y },
        "color": "blue",
        "icon": "layers"
    })

    bn_id = f"{id_prefix}_bn"
    layers.append({
        "id": bn_id,
        "type": "batch_norm",
        "name": f"{name_prefix}_bn",
        "inputShape": { "dimensions": [None, None, None, f_out], "description": f"×{f_out}" },
        "outputShape": { "dimensions": [None, None, None, f_out], "description": f"×{f_out}" },
        "config": { "axis": 3, "momentum": 0.99, "epsilon": 0.001 },
        "parameters": {
            "total": f_out * 4,
            "weights": f_out * 2,
            "biases": f_out * 2,
            "formula": "4 × channels",
            "calculationSteps": []
        },
        "educationalNote": make_note(
            "Batch Normalization.",
            "Normalizes features.",
            "Stabilizes learning.",
            "Keeps channels balanced."
        ),
        "position": { "x": x, "y": y + 50 },
        "color": "gray",
        "icon": "activity"
    })
    connections.append({ "id": f"c_{conv_id}_{bn_id}", "sourceId": conv_id, "targetId": bn_id, "type": "sequential" })

    act_id = f"{id_prefix}_act"
    layers.append({
        "id": act_id,
        "type": "activation",
        "name": f"{name_prefix}_act",
        "inputShape": { "dimensions": [None, None, None, f_out], "description": f"×{f_out}" },
        "outputShape": { "dimensions": [None, None, None, f_out], "description": f"×{f_out}" },
        "config": { "activation": act },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": make_note(
            f"Applies {act} activation.",
            "Non-linear mapping.",
            "Permits learning complex representations.",
            "Introduces non-linearity."
        ),
        "position": { "x": x, "y": y + 100 },
        "color": "pink",
        "icon": "zap"
    })
    connections.append({ "id": f"c_{bn_id}_{act_id}", "sourceId": bn_id, "targetId": act_id, "type": "sequential" })

    return act_id

# 1. GENERATE INCEPTION V3
def generate_inception_v3():
    layers = []
    connections = []
    groups = []
    y_ptr = 0

    # Input layer
    layers.append({
        "id": "input_1",
        "type": "input",
        "name": "input_1",
        "inputShape": { "dimensions": [None, 299, 299, 3], "description": "299×299×3 RGB Image" },
        "outputShape": { "dimensions": [None, 299, 299, 3], "description": "299×299×3 RGB Image" },
        "config": { "shape": [299, 299, 3] },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": make_note(
            "Sensory input receiving normalized RGB pixel matrices.",
            "Accepts normalized images of size 299x299. Larger dimensions preserve features across parallel Inception branches.",
            "Establishes spatial sizes for the multi-branch network.",
            "Larger inputs preserve high resolution visual details."
        ),
        "position": { "x": 250, "y": y_ptr },
        "color": "emerald",
        "icon": "image"
    })
    y_ptr += 150

    # Stem Layers
    last_id = "input_1"
    last_id = add_conv_bn_act(layers, connections, "conv2d_1", "conv2d_1", 3, 32, [3, 3], 2, "valid", False, "relu", 250, y_ptr)
    connections.append({ "id": f"c_in_conv1", "sourceId": "input_1", "targetId": "conv2d_1_conv", "type": "sequential" })
    y_ptr += 200

    last_id = add_conv_bn_act(layers, connections, "conv2d_2", "conv2d_2", 32, 32, [3, 3], 1, "valid", False, "relu", 250, y_ptr)
    y_ptr += 200

    last_id = add_conv_bn_act(layers, connections, "conv2d_3", "conv2d_3", 32, 64, [3, 3], 1, "same", False, "relu", 250, y_ptr)
    y_ptr += 200

    # max_pooling2d_1
    layers.append({
        "id": "max_pooling2d_1",
        "type": "max_pooling2d",
        "name": "max_pooling2d_1",
        "inputShape": { "dimensions": [None, 147, 147, 64], "description": "147×147×64" },
        "outputShape": { "dimensions": [None, 73, 73, 64], "description": "73×73×64" },
        "config": { "poolSize": [3, 3], "strides": [2, 2], "padding": "valid" },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": make_note(
            "MaxPooling downsamples resolution to 73x73.",
            "Halves feature resolutions.",
            "Drops memory footprints early.",
            "Downsamples features."
        ),
        "position": { "x": 250, "y": y_ptr },
        "color": "amber",
        "icon": "shrink"
    })
    connections.append({ "id": "c_act_pool1", "sourceId": last_id, "targetId": "max_pooling2d_1", "type": "sequential" })
    y_ptr += 150
    last_id = "max_pooling2d_1"

    last_id = add_conv_bn_act(layers, connections, "conv2d_4", "conv2d_4", 64, 80, [1, 1], 1, "valid", False, "relu", 250, y_ptr)
    y_ptr += 200

    last_id = add_conv_bn_act(layers, connections, "conv2d_5", "conv2d_5", 80, 192, [3, 3], 1, "valid", False, "relu", 250, y_ptr)
    y_ptr += 200

    # max_pooling2d_2
    layers.append({
        "id": "max_pooling2d_2",
        "type": "max_pooling2d",
        "name": "max_pooling2d_2",
        "inputShape": { "dimensions": [None, 71, 71, 192], "description": "71×71×192" },
        "outputShape": { "dimensions": [None, 35, 35, 192], "description": "35×35×192" },
        "config": { "poolSize": [3, 3], "strides": [2, 2], "padding": "valid" },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": make_note(
            "Second max pooling stage.",
            "Downsamples to 35x35.",
            "Reduces dimensions before the multi-branch stages.",
            "Reduces dimensions."
        ),
        "position": { "x": 250, "y": y_ptr },
        "color": "amber",
        "icon": "shrink"
    })
    connections.append({ "id": "c_act_pool2", "sourceId": last_id, "targetId": "max_pooling2d_2", "type": "sequential" })
    y_ptr += 150
    last_id = "max_pooling2d_2"

    stem_ids = [
        "conv2d_1_conv", "conv2d_1_bn", "conv2d_1_act",
        "conv2d_2_conv", "conv2d_2_bn", "conv2d_2_act",
        "conv2d_3_conv", "conv2d_3_bn", "conv2d_3_act",
        "max_pooling2d_1",
        "conv2d_4_conv", "conv2d_4_bn", "conv2d_4_act",
        "conv2d_5_conv", "conv2d_5_bn", "conv2d_5_act",
        "max_pooling2d_2"
    ]
    groups.append({
        "id": "group_stem",
        "name": "Input Stem",
        "description": "Stem convolutions downsampling input image prior to multi-branch Inception blocks.",
        "layerIds": stem_ids,
        "color": "#F59E0B"
    })

    # Let's add Inception A Block 1 (we represent 3 blocks of Inception A conceptually as 1 detailed Block to keep the rendering clean!)
    # Inception A has 4 branches:
    # - Br 1: 1x1 conv (64 filters)
    # - Br 2: 1x1 conv (48 filters) -> 3x3 conv (64 filters)
    # - Br 3: 1x1 conv (64 filters) -> 3x3 conv (96 filters) -> 3x3 conv (96 filters)
    # - Br 4: AveragePooling2D -> 1x1 conv (32 filters)
    block_prefix = "mixed_0_"
    br_layer_ids = []

    # Branch 1
    br1_id = add_conv_bn_act(layers, connections, f"{block_prefix}br1_conv1", f"{block_name(block_prefix)}br1_conv1", 192, 64, [1, 1], 1, "same", False, "relu", 100, y_ptr)
    connections.append({ "id": f"c_{last_id}_{block_prefix}br1_conv1_conv", "sourceId": last_id, "targetId": f"{block_prefix}br1_conv1_conv", "type": "skip" })
    br_layer_ids.extend([f"{block_prefix}br1_conv1_conv", f"{block_prefix}br1_conv1_bn", br1_id])

    # Branch 2
    br2_in = add_conv_bn_act(layers, connections, f"{block_prefix}br2_conv1", f"{block_name(block_prefix)}br2_conv1", 192, 48, [1, 1], 1, "same", False, "relu", 200, y_ptr)
    br2_out = add_conv_bn_act(layers, connections, f"{block_prefix}br2_conv2", f"{block_name(block_prefix)}br2_conv2", 48, 64, [3, 3], 1, "same", False, "relu", 200, y_ptr + 200)
    connections.append({ "id": f"c_{last_id}_{block_prefix}br2_conv1_conv", "sourceId": last_id, "targetId": f"{block_prefix}br2_conv1_conv", "type": "skip" })
    br_layer_ids.extend([f"{block_prefix}br2_conv1_conv", f"{block_prefix}br2_conv1_bn", br2_in, f"{block_prefix}br2_conv2_conv", f"{block_prefix}br2_conv2_bn", br2_out])

    # Branch 3
    br3_in = add_conv_bn_act(layers, connections, f"{block_prefix}br3_conv1", f"{block_name(block_prefix)}br3_conv1", 192, 64, [1, 1], 1, "same", False, "relu", 300, y_ptr)
    br3_mid = add_conv_bn_act(layers, connections, f"{block_prefix}br3_conv2", f"{block_name(block_prefix)}br3_conv2", 64, 96, [3, 3], 1, "same", False, "relu", 300, y_ptr + 200)
    br3_out = add_conv_bn_act(layers, connections, f"{block_prefix}br3_conv3", f"{block_name(block_prefix)}br3_conv3", 96, 96, [3, 3], 1, "same", False, "relu", 300, y_ptr + 400)
    connections.append({ "id": f"c_{last_id}_{block_prefix}br3_conv1_conv", "sourceId": last_id, "targetId": f"{block_prefix}br3_conv1_conv", "type": "skip" })
    br_layer_ids.extend([f"{block_prefix}br3_conv1_conv", f"{block_prefix}br3_conv1_bn", br3_in, f"{block_prefix}br3_conv2_conv", f"{block_prefix}br3_conv2_bn", br3_mid, f"{block_prefix}br3_conv3_conv", f"{block_prefix}br3_conv3_bn", br3_out])

    # Branch 4
    pool_id = f"{block_prefix}br4_pool"
    layers.append({
        "id": pool_id,
        "type": "average_pooling2d",
        "name": f"{block_name(block_prefix)}br4_pool",
        "inputShape": { "dimensions": [None, 35, 35, 192], "description": "35×35×192" },
        "outputShape": { "dimensions": [None, 35, 35, 192], "description": "35×35×192" },
        "config": { "poolSize": [3, 3], "strides": [1, 1], "padding": "same" },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": make_note("Averages activations spatially.", "Retains spatial details while pooling representations.", "Adds scale robustness.", "Spatially smooths maps.")
    })
    connections.append({ "id": f"c_{last_id}_{pool_id}", "sourceId": last_id, "targetId": pool_id, "type": "skip" })
    br4_out = add_conv_bn_act(layers, connections, f"{block_prefix}br4_conv1", f"{block_name(block_prefix)}br4_conv1", 192, 32, [1, 1], 1, "same", False, "relu", 400, y_ptr + 200)
    connections.append({ "id": f"c_pool_conv", "sourceId": pool_id, "targetId": f"{block_prefix}br4_conv1_conv", "type": "sequential" })
    br_layer_ids.extend([pool_id, f"{block_prefix}br4_conv1_conv", f"{block_prefix}br4_conv1_bn", br4_out])

    # Concat
    concat_id = f"{block_prefix}concat"
    layers.append({
        "id": concat_id,
        "type": "concatenate",
        "name": concat_id,
        "inputShape": { "dimensions": [None, 35, 35, 256], "description": "64 + 64 + 96 + 32 channels" },
        "outputShape": { "dimensions": [None, 35, 35, 256], "description": "256 channels" },
        "config": { "axis": 3 },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": make_note(
            "Concatenates features from all parallel Inception branches.",
            "Combines 1x1, 3x3, and 5x5 spatial features along the channel axis.",
            "Aggregates multi-scale visual details in a single representation tensor.",
            "Combines multi-scale filters."
        ),
        "position": { "x": 250, "y": y_ptr + 600 },
        "color": "cyan",
        "icon": "git-merge"
    })
    connections.append({ "id": f"c_br1_{concat_id}", "sourceId": br1_id, "targetId": concat_id, "type": "sequential" })
    connections.append({ "id": f"c_br2_{concat_id}", "sourceId": br2_out, "targetId": concat_id, "type": "sequential" })
    connections.append({ "id": f"c_br3_{concat_id}", "sourceId": br3_out, "targetId": concat_id, "type": "sequential" })
    connections.append({ "id": f"c_br4_{concat_id}", "sourceId": br4_out, "targetId": concat_id, "type": "sequential" })
    br_layer_ids.append(concat_id)

    groups.append({
        "id": "group_inception_a",
        "name": "Inception Module A",
        "description": "Applies parallel multi-scale convolutions (1x1, 3x3, 5x5) and combines features.",
        "layerIds": br_layer_ids,
        "color": "#3B82F6"
    })

    y_ptr += 750
    last_id = concat_id

    # We add GlobalAveragePooling and Predictions to represent the rest of the model compactly, while keeping the param total correct.
    layers.append({
        "id": "global_average_pooling2d",
        "type": "global_average_pooling2d",
        "name": "global_average_pooling2d",
        "inputShape": { "dimensions": [None, 8, 8, 2048], "description": "8×8×2048" },
        "outputShape": { "dimensions": [None, 2048], "description": "2048" },
        "config": {},
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": make_note(
            "Global average pooling.",
            "Averages visual representations to a single vector.",
            "Saves computing sizes.",
            "Replaces fully connected layers."
        ),
        "position": { "x": 250, "y": y_ptr },
        "color": "amber",
        "icon": "activity"
    })
    connections.append({ "id": "c_last_gap", "sourceId": last_id, "targetId": "global_average_pooling2d", "type": "sequential" })
    y_ptr += 150

    pred_weights = 2048 * 1000
    layers.append({
        "id": "predictions",
        "type": "dense",
        "name": "predictions",
        "inputShape": { "dimensions": [None, 2048], "description": "2048" },
        "outputShape": { "dimensions": [None, 1000], "description": "1000" },
        "config": { "units": 1000, "activation": "softmax", "useBias": True },
        "parameters": {
            "total": pred_weights + 1000,
            "weights": pred_weights,
            "biases": 1000,
            "formula": "(input_features + 1) × output_units",
            "calculationSteps": []
        },
        "educationalNote": make_note("Dense predictions.", "Outputs category probabilities.", "Final decision head.", "Classification layer.")
    })
    connections.append({ "id": "c_gap_pred", "sourceId": "global_average_pooling2d", "targetId": "predictions", "type": "sequential" })

    groups.append({
        "id": "group_classifier",
        "name": "Global Pooling & Classification",
        "description": "GAP followed by the dense classifier.",
        "layerIds": ["global_average_pooling2d", "predictions"],
        "color": "#8B5CF6"
    })

    # Prepare model
    model_data = {
        "id": "inceptionv3",
        "name": "InceptionV3",
        "fullName": "Rethinking the Inception Architecture for Computer Vision",
        "paperYear": 2015,
        "authors": ["Christian Szegedy", "Vincent Vanhoucke", "Sergey Ioffe", "Jonathon Shlens", "Zbigniew Wojna"],
        "paperUrl": "https://arxiv.org/abs/1512.00567",
        "depth": 48,
        "totalParameters": 23834568,
        "totalFLOPs": 5600000000,
        "inputShape": { "channels": 3, "height": 299, "width": 299 },
        "top1Accuracy": 0.779,
        "top5Accuracy": 0.937,
        "memoryUsage": 91,
        "description": "InceptionV3 is a multi-branch convolutional neural network utilizing factorized and parallel convolution blocks to process visual features at multiple spatial receptive fields simultaneously.",
        "colorTheme": "#F59E0B",
        "tags": ["CNN", "Classification", "Multi-branch", "ImageNet"],
        "architecture": {
            "layers": layers,
            "connections": connections,
            "groups": groups
        }
    }
    write_json(os.path.join(os.path.dirname(__file__), "inceptionv3.json"), model_data)

# Name Helper
def block_name(prefix):
    return prefix.replace("_", "/")

# 2. GENERATE INCEPTION RESNET V2
def generate_inception_resnet_v2():
    layers = []
    connections = []
    groups = []
    y_ptr = 0

    # Input layer
    layers.append({
        "id": "input_1",
        "type": "input",
        "name": "input_1",
        "inputShape": { "dimensions": [None, 299, 299, 3], "description": "299×299×3 RGB Image" },
        "outputShape": { "dimensions": [None, 299, 299, 3], "description": "299×299×3 RGB Image" },
        "config": { "shape": [299, 299, 3] },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": make_note(
            "Input layer receiving normalized RGB pixel matrices.",
            "Standard size of 299x299.",
            "Sets boundaries.",
            "Sets image boundaries."
        ),
        "position": { "x": 250, "y": y_ptr },
        "color": "emerald",
        "icon": "image"
    })
    y_ptr += 150

    # Stem Layers (Inception-ResNet-V2 Stem is very deep, we extract major steps)
    last_id = "input_1"
    last_id = add_conv_bn_act(layers, connections, "conv2d_1", "conv2d_1", 3, 32, [3, 3], 2, "valid", False, "relu", 250, y_ptr)
    connections.append({ "id": f"c_in_conv1", "sourceId": "input_1", "targetId": "conv2d_1_conv", "type": "sequential" })
    y_ptr += 200

    last_id = add_conv_bn_act(layers, connections, "conv2d_2", "conv2d_2", 32, 32, [3, 3], 1, "valid", False, "relu", 250, y_ptr)
    y_ptr += 200

    last_id = add_conv_bn_act(layers, connections, "conv2d_3", "conv2d_3", 32, 64, [3, 3], 1, "same", False, "relu", 250, y_ptr)
    y_ptr += 200

    # MaxPooling
    layers.append({
        "id": "max_pooling2d_1",
        "type": "max_pooling2d",
        "name": "max_pooling2d_1",
        "inputShape": { "dimensions": [None, 147, 147, 64], "description": "147×147×64" },
        "outputShape": { "dimensions": [None, 73, 73, 64], "description": "73×73×64" },
        "config": { "poolSize": [3, 3], "strides": [2, 2], "padding": "valid" },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": make_note("Downsamples stem maps.", "MaxPooling stage.", "Averages bounds.", "Downsamples features.")
    })
    connections.append({ "id": "c_act_pool1", "sourceId": last_id, "targetId": "max_pooling2d_1", "type": "sequential" })
    y_ptr += 150
    last_id = "max_pooling2d_1"

    stem_ids = ["conv2d_1_conv", "conv2d_1_bn", "conv2d_1_act", "conv2d_2_conv", "conv2d_2_bn", "conv2d_2_act", "conv2d_3_conv", "conv2d_3_bn", "conv2d_3_act", "max_pooling2d_1"]
    groups.append({
        "id": "group_stem",
        "name": "Input Stem",
        "description": "First feature downsampling convolutions.",
        "layerIds": stem_ids,
        "color": "#D97706"
    })

    # Inception-ResNet Block A
    block_prefix = "block_a1_"
    block_l_ids = []

    # Br 1: 1x1 conv (32)
    br1_id = add_conv_bn_act(layers, connections, f"{block_prefix}br1_conv1", f"{block_name(block_prefix)}br1_conv1", 64, 32, [1, 1], 1, "same", False, "relu", 100, y_ptr)
    connections.append({ "id": f"c_{last_id}_{block_prefix}br1_conv1_conv", "sourceId": last_id, "targetId": f"{block_prefix}br1_conv1_conv", "type": "skip" })
    block_l_ids.extend([f"{block_prefix}br1_conv1_conv", f"{block_prefix}br1_conv1_bn", br1_id])

    # Br 2: 1x1 -> 3x3 (32)
    br2_in = add_conv_bn_act(layers, connections, f"{block_prefix}br2_conv1", f"{block_name(block_prefix)}br2_conv1", 64, 32, [1, 1], 1, "same", False, "relu", 200, y_ptr)
    br2_out = add_conv_bn_act(layers, connections, f"{block_prefix}br2_conv2", f"{block_name(block_prefix)}br2_conv2", 32, 32, [3, 3], 1, "same", False, "relu", 200, y_ptr + 200)
    connections.append({ "id": f"c_{last_id}_{block_prefix}br2_conv1_conv", "sourceId": last_id, "targetId": f"{block_prefix}br2_conv1_conv", "type": "skip" })
    block_l_ids.extend([f"{block_prefix}br2_conv1_conv", f"{block_prefix}br2_conv1_bn", br2_in, f"{block_prefix}br2_conv2_conv", f"{block_prefix}br2_conv2_bn", br2_out])

    # Br 3: 1x1 -> 3x3 -> 3x3 (64)
    br3_in = add_conv_bn_act(layers, connections, f"{block_prefix}br3_conv1", f"{block_name(block_prefix)}br3_conv1", 64, 32, [1, 1], 1, "same", False, "relu", 300, y_ptr)
    br3_mid = add_conv_bn_act(layers, connections, f"{block_prefix}br3_conv2", f"{block_name(block_prefix)}br3_conv2", 32, 48, [3, 3], 1, "same", False, "relu", 300, y_ptr + 200)
    br3_out = add_conv_bn_act(layers, connections, f"{block_prefix}br3_conv3", f"{block_name(block_prefix)}br3_conv3", 48, 64, [3, 3], 1, "same", False, "relu", 300, y_ptr + 400)
    connections.append({ "id": f"c_{last_id}_{block_prefix}br3_conv1_conv", "sourceId": last_id, "targetId": f"{block_prefix}br3_conv1_conv", "type": "skip" })
    block_l_ids.extend([f"{block_prefix}br3_conv1_conv", f"{block_prefix}br3_conv1_bn", br3_in, f"{block_prefix}br3_conv2_conv", f"{block_prefix}br3_conv2_bn", br3_mid, f"{block_prefix}br3_conv3_conv", f"{block_prefix}br3_conv3_bn", br3_out])

    # Concat
    concat_id = f"{block_prefix}concat"
    layers.append({
        "id": concat_id,
        "type": "concatenate",
        "name": concat_id,
        "inputShape": { "dimensions": [None, 73, 73, 128], "description": "32 + 32 + 64 channels" },
        "outputShape": { "dimensions": [None, 73, 73, 128], "description": "128 channels" },
        "config": { "axis": 3 },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": make_note("Concatenates features from Inception-ResNet branches.", "Combines representations.", "Enables multi-scale extraction.", "Combines representations.")
    })
    connections.append({ "id": f"c_br1_{concat_id}", "sourceId": br1_id, "targetId": concat_id, "type": "sequential" })
    connections.append({ "id": f"c_br2_{concat_id}", "sourceId": br2_out, "targetId": concat_id, "type": "sequential" })
    connections.append({ "id": f"c_br3_{concat_id}", "sourceId": br3_out, "targetId": concat_id, "type": "sequential" })
    block_l_ids.append(concat_id)

    # linear 1x1 project (320 filters)
    proj_id = f"{block_prefix}project_conv"
    proj_weights = 128 * 320
    layers.append({
        "id": proj_id,
        "type": "conv2d",
        "name": proj_id,
        "inputShape": { "dimensions": [None, 73, 73, 128], "description": "73×73×128" },
        "outputShape": { "dimensions": [None, 73, 73, 320], "description": "73×73×320" },
        "config": {
            "filters": 320,
            "kernelSize": [1, 1],
            "strides": [1, 1],
            "padding": "same",
            "useBias": True,
            "activation": "linear"
        },
        "parameters": {
            "total": proj_weights + 320,
            "weights": proj_weights,
            "biases": 320,
            "formula": "input_channels × output_filters + output_filters",
            "calculationSteps": []
        },
        "educationalNote": make_note("Projects concatenated channels.", "Restores channel sizes without non-linearity.", "Prepares shapes for skip addition.", "1x1 linear mapping.")
    })
    connections.append({ "id": f"c_concat_{proj_id}", "sourceId": concat_id, "targetId": proj_id, "type": "sequential" })
    block_l_ids.append(proj_id)

    # Add sum
    add_id = f"{block_prefix}add"
    layers.append({
        "id": add_id,
        "type": "add",
        "name": add_id,
        "inputShape": { "dimensions": [None, 73, 73, 320], "description": "320 channels" },
        "outputShape": { "dimensions": [None, 73, 73, 320], "description": "320 channels" },
        "config": {},
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": make_note("Inception-ResNet skip addition.", "Adds representation output to the block input.", "Provides residual shortcut flow.", "Adds residual skip.")
    })
    connections.append({ "id": f"c_proj_{add_id}", "sourceId": proj_id, "targetId": add_id, "type": "sequential" })
    connections.append({ "id": f"c_input_{add_id}", "sourceId": last_id, "targetId": add_id, "type": "skip" })
    block_l_ids.append(add_id)

    groups.append({
        "id": "group_block_a",
        "name": "Inception ResNet Block A",
        "description": "Combines parallel multi-scale branches with a residual skip connection.",
        "layerIds": block_l_ids,
        "color": "#16A34A"
    })

    y_ptr += 800
    last_id = add_id

    # GAP & Predictions
    layers.append({
        "id": "global_average_pooling2d",
        "type": "global_average_pooling2d",
        "name": "global_average_pooling2d",
        "inputShape": { "dimensions": [None, 8, 8, 1536], "description": "8×8×1536" },
        "outputShape": { "dimensions": [None, 1536], "description": "1536" },
        "config": {},
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": make_note("GAP averaging channels.", "Averages maps.", "Decreases parameter sizes.", "Averages activations.")
    })
    connections.append({ "id": "c_last_gap", "sourceId": last_id, "targetId": "global_average_pooling2d", "type": "sequential" })
    y_ptr += 150

    pred_weights = 1536 * 1000
    layers.append({
        "id": "predictions",
        "type": "dense",
        "name": "predictions",
        "inputShape": { "dimensions": [None, 1536], "description": "1536" },
        "outputShape": { "dimensions": [None, 1000], "description": "1000" },
        "config": { "units": 1000, "activation": "softmax", "useBias": True },
        "parameters": {
            "total": pred_weights + 1000,
            "weights": pred_weights,
            "biases": 1000,
            "formula": "(input_features + 1) × output_units",
            "calculationSteps": []
        },
        "educationalNote": make_note("Predictions.", "Outputs class scores.", "Decision output layer.", "Classification layer.")
    })
    connections.append({ "id": "c_gap_pred", "sourceId": "global_average_pooling2d", "targetId": "predictions", "type": "sequential" })

    groups.append({
        "id": "group_classifier",
        "name": "Global Pooling & Classification",
        "description": "GAP followed by the predictions.",
        "layerIds": ["global_average_pooling2d", "predictions"],
        "color": "#8B5CF6"
    })

    model_data = {
        "id": "inceptionresnetv2",
        "name": "InceptionResNetV2",
        "fullName": "Inception-v4, Inception-ResNet and the Impact of Residual Connections on Learning",
        "paperYear": 2016,
        "authors": ["Christian Szegedy", "Sergey Ioffe", "Vincent Vanhoucke", "Alex Alemi"],
        "paperUrl": "https://arxiv.org/abs/1602.07261",
        "depth": 164,
        "totalParameters": 55873736,
        "totalFLOPs": 13100000000,
        "inputShape": { "channels": 3, "height": 299, "width": 299 },
        "top1Accuracy": 0.803,
        "top5Accuracy": 0.953,
        "memoryUsage": 215,
        "description": "InceptionResNetV2 merges parallel multi-branch Inception blocks with ResNet residual sum operations, optimizing training stability and visual extraction capabilities.",
        "colorTheme": "#D97706",
        "tags": ["CNN", "Classification", "Inception", "Residual", "ImageNet"],
        "architecture": {
            "layers": layers,
            "connections": connections,
            "groups": groups
        }
    }
    write_json(os.path.join(os.path.dirname(__file__), "inceptionresnetv2.json"), model_data)

# 3. GENERATE XCEPTION
def generate_xception():
    layers = []
    connections = []
    groups = []
    y_ptr = 0

    # Input layer
    layers.append({
        "id": "input_1",
        "type": "input",
        "name": "input_1",
        "inputShape": { "dimensions": [None, 299, 299, 3], "description": "299×299×3 RGB Image" },
        "outputShape": { "dimensions": [None, 299, 299, 3], "description": "299×299×3 RGB Image" },
        "config": { "shape": [299, 299, 3] },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": make_note(
            "Xception input stage receiving normalized RGB matrices.",
            "Standard size of 299x299.",
            "Sets coordinates boundaries.",
            "Defines visual input."
        ),
        "position": { "x": 250, "y": y_ptr },
        "color": "emerald",
        "icon": "image"
    })
    y_ptr += 150

    # Stem: Entry Flow convs
    last_id = "input_1"
    last_id = add_conv_bn_act(layers, connections, "block1_conv1", "block1_conv1", 3, 32, [3, 3], 2, "valid", False, "relu", 250, y_ptr)
    connections.append({ "id": "c_in_conv1", "sourceId": "input_1", "targetId": "block1_conv1_conv", "type": "sequential" })
    y_ptr += 200

    last_id = add_conv_bn_act(layers, connections, "block1_conv2", "block1_conv2", 32, 64, [3, 3], 1, "same", False, "relu", 250, y_ptr)
    y_ptr += 200

    stem_ids = ["block1_conv1_conv", "block1_conv1_bn", "block1_conv1_act", "block1_conv2_conv", "block1_conv2_bn", "block1_conv2_act"]
    groups.append({
        "id": "group_stem",
        "name": "Entry Flow Stem",
        "description": "Standard convolutions for early representations.",
        "layerIds": stem_ids,
        "color": "#EC4899"
    })

    # Middle Separable Blocks with Skip connections
    # We represent the Separable Blocks of Xception entry, middle, and exit flow.
    # A block features: SepConv -> BN -> ReLU -> SepConv -> BN -> MaxPool (if stride=2)
    # Shortcut: Conv2D 1x1 -> BN
    block_prefix = "block2_"
    block_l_ids = []

    # Main path
    # SepConv1
    # Separable Conv is modeled as: DepthwiseConv2D + PointwiseConv2D
    # Keras calls it SeparableConv2D, but we can decompose it or model it as a custom separable type
    # Let's model it as a 'conv2d' with config details for Separable to comply with schema types.
    # In Xception, separable convs have no bias.
    s1_weights = 3 * 3 * 64 + 64 * 128
    s1_id = f"{block_prefix}sep1"
    layers.append({
        "id": s1_id,
        "type": "conv2d",
        "name": f"{block_name(block_prefix)}sep1",
        "inputShape": { "dimensions": [None, 147, 147, 64], "description": "147×147×64" },
        "outputShape": { "dimensions": [None, 147, 147, 128], "description": "147×147×128" },
        "config": {
            "filters": 128,
            "kernelSize": [3, 3],
            "strides": [1, 1],
            "padding": "same",
            "useBias": False,
            "activation": "linear"
        },
        "parameters": {
            "total": s1_weights,
            "weights": s1_weights,
            "biases": 0,
            "formula": "kernel_height × kernel_width × input_channels + input_channels × output_filters",
            "calculationSteps": []
        },
        "educationalNote": make_note(
            "Separable convolution.",
            "Decomposes convolving into depthwise spatial filtering and pointwise channel mixing.",
            "Reduces weights by over 80%.",
            "Separates spatial filtering from channel mixing."
        ),
        "position": { "x": 250, "y": y_ptr },
        "color": "blue",
        "icon": "layers"
    })
    connections.append({ "id": f"c_{last_id}_{s1_id}", "sourceId": last_id, "targetId": s1_id, "type": "sequential" })
    block_l_ids.append(s1_id)
    y_ptr += 150

    s1_bn = f"{s1_id}_bn"
    layers.append({
        "id": s1_bn,
        "type": "batch_norm",
        "name": f"{block_name(block_prefix)}sep1_bn",
        "inputShape": { "dimensions": [None, 147, 147, 128], "description": "147×147×128" },
        "outputShape": { "dimensions": [None, 147, 147, 128], "description": "147×147×128" },
        "config": { "axis": 3, "momentum": 0.99, "epsilon": 0.001 },
        "parameters": { "total": 128 * 4, "weights": 128 * 2, "biases": 128 * 2, "formula": "4 × channels", "calculationSteps": [] },
        "educationalNote": make_note("Normalizes separable outputs.", "Keeps channel activations balanced.", "Prevents covariate shifts.", "Normalizes features.")
    })
    connections.append({ "id": f"c_{s1_id}_{s1_bn}", "sourceId": s1_id, "targetId": s1_bn, "type": "sequential" })
    block_l_ids.append(s1_bn)
    y_ptr += 150

    # ReLU
    s1_act = f"{s1_id}_act"
    layers.append({
        "id": s1_act,
        "type": "activation",
        "name": f"{block_name(block_prefix)}sep1_act",
        "inputShape": { "dimensions": [None, 147, 147, 128], "description": "147×147×128" },
        "outputShape": { "dimensions": [None, 147, 147, 128], "description": "147×147×128" },
        "config": { "activation": "relu" },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": make_note("ReLU activation.", "Locks positive activations.", "Essential for learning non-linear visual primitives.", "Non-linear activation.")
    })
    connections.append({ "id": f"c_{s1_bn}_{s1_act}", "sourceId": s1_bn, "targetId": s1_act, "type": "sequential" })
    block_l_ids.append(s1_act)
    y_ptr += 150

    # SepConv2
    s2_weights = 3 * 3 * 128 + 128 * 128
    s2_id = f"{block_prefix}sep2"
    layers.append({
        "id": s2_id,
        "type": "conv2d",
        "name": f"{block_name(block_prefix)}sep2",
        "inputShape": { "dimensions": [None, 147, 147, 128], "description": "147×147×128" },
        "outputShape": { "dimensions": [None, 147, 147, 128], "description": "147×147×128" },
        "config": {
            "filters": 128,
            "kernelSize": [3, 3],
            "strides": [1, 1],
            "padding": "same",
            "useBias": False,
            "activation": "linear"
        },
        "parameters": { "total": s2_weights, "weights": s2_weights, "biases": 0, "formula": "Decomposed weights", "calculationSteps": [] },
        "educationalNote": make_note("Second separable convolution.", "Builds deep spatial features.", "Reduces parameter growth.", "Separable spatial convolution.")
    })
    connections.append({ "id": f"c_{s1_act}_{s2_id}", "sourceId": s1_act, "targetId": s2_id, "type": "sequential" })
    block_l_ids.append(s2_id)
    y_ptr += 150

    s2_bn = f"{s2_id}_bn"
    layers.append({
        "id": s2_bn,
        "type": "batch_norm",
        "name": f"{block_name(block_prefix)}sep2_bn",
        "inputShape": { "dimensions": [None, 147, 147, 128], "description": "147×147×128" },
        "outputShape": { "dimensions": [None, 147, 147, 128], "description": "147×147×128" },
        "config": { "axis": 3, "momentum": 0.99, "epsilon": 0.001 },
        "parameters": { "total": 128 * 4, "weights": 128 * 2, "biases": 128 * 2, "formula": "4 × channels", "calculationSteps": [] },
        "educationalNote": make_note("Normalizes second separable step.", "Keeps stats balanced.", "Maintains gradient flows.", "Normalizes features.")
    })
    connections.append({ "id": f"c_{s2_id}_{s2_bn}", "sourceId": s2_id, "targetId": s2_bn, "type": "sequential" })
    block_l_ids.append(s2_bn)
    y_ptr += 150

    # Max Pooling
    pool_id = f"{block_prefix}pool"
    layers.append({
        "id": pool_id,
        "type": "max_pooling2d",
        "name": f"{block_name(block_prefix)}pool",
        "inputShape": { "dimensions": [None, 147, 147, 128], "description": "147×147×128" },
        "outputShape": { "dimensions": [None, 74, 74, 128], "description": "74×74×128" },
        "config": { "poolSize": [3, 3], "strides": [2, 2], "padding": "same" },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": make_note("Downsamples main block features.", "Filters representation to 74x74.", "Reduces spatial computations.", "Reduces spatial dims.")
    })
    connections.append({ "id": f"c_{s2_bn}_{pool_id}", "sourceId": s2_bn, "targetId": pool_id, "type": "sequential" })
    block_l_ids.append(pool_id)

    # Shortcut: 1x1 conv (128 filters, stride 2)
    short_id = f"{block_prefix}shortcut"
    short_weights = 64 * 128
    layers.append({
        "id": short_id,
        "type": "conv2d",
        "name": f"{block_name(block_prefix)}shortcut",
        "inputShape": { "dimensions": [None, 147, 147, 64], "description": "147×147×64" },
        "outputShape": { "dimensions": [None, 74, 74, 128], "description": "74×74×128" },
        "config": {
            "filters": 128,
            "kernelSize": [1, 1],
            "strides": [2, 2],
            "padding": "same",
            "useBias": False,
            "activation": "linear"
        },
        "parameters": { "total": short_weights, "weights": short_weights, "biases": 0, "formula": "input_channels × output_filters", "calculationSteps": [] },
        "educationalNote": make_note("1x1 shortcut projection.", "Projects channels and strides to match shapes.", "Required for summation.", "Shortcut projection.")
    })
    connections.append({ "id": f"c_{last_id}_{short_id}", "sourceId": last_id, "targetId": short_id, "type": "skip" })

    # Short BN
    short_bn_id = f"{short_id}_bn"
    layers.append({
        "id": short_bn_id,
        "type": "batch_norm",
        "name": f"{block_name(block_prefix)}shortcut_bn",
        "inputShape": { "dimensions": [None, 74, 74, 128], "description": "74×74×128" },
        "outputShape": { "dimensions": [None, 74, 74, 128], "description": "74×74×128" },
        "config": { "axis": 3, "momentum": 0.99, "epsilon": 0.001 },
        "parameters": { "total": 128 * 4, "weights": 128 * 2, "biases": 128 * 2, "formula": "4 × channels", "calculationSteps": [] },
        "educationalNote": make_note("Normalizes shortcut.", "Restores normalization.", "Prevents covariate shifts in skip path.", "Normalizes skip path.")
    })
    connections.append({ "id": f"c_{short_id}_{short_bn_id}", "sourceId": short_id, "targetId": short_bn_id, "type": "sequential" })

    # Add
    add_id = f"{block_prefix}add"
    layers.append({
        "id": add_id,
        "type": "add",
        "name": add_id,
        "inputShape": { "dimensions": [None, 74, 74, 128], "description": "128 channels" },
        "outputShape": { "dimensions": [None, 74, 74, 128], "description": "128 channels" },
        "config": {},
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": make_note("Residual sum.", "Adds main branch features directly to skip connection.", "Avoids vanishing gradients.", "Combines branches.")
    })
    connections.append({ "id": f"c_{pool_id}_{add_id}", "sourceId": pool_id, "targetId": add_id, "type": "sequential" })
    connections.append({ "id": f"c_{short_bn_id}_{add_id}", "sourceId": short_bn_id, "targetId": add_id, "type": "sequential" })
    block_l_ids.append(add_id)

    groups.append({
        "id": "group_block2",
        "name": "Entry Flow Block 1",
        "description": "Applies stacked Separable Convolutions and projection skip connection.",
        "layerIds": block_l_ids + [short_id, short_bn_id],
        "color": "#F472B6"
    })

    y_ptr += 300
    last_id = add_id

    # GAP & Predictions
    layers.append({
        "id": "global_average_pooling2d",
        "type": "global_average_pooling2d",
        "name": "global_average_pooling2d",
        "inputShape": { "dimensions": [None, 10, 10, 2048], "description": "10×10×2048" },
        "outputShape": { "dimensions": [None, 2048], "description": "2048" },
        "config": {},
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": make_note("GAP averaging channels.", "Averages maps.", "Reduces parameter footprints.", "Spatially collapses maps.")
    })
    connections.append({ "id": "c_last_gap", "sourceId": last_id, "targetId": "global_average_pooling2d", "type": "sequential" })
    y_ptr += 150

    pred_weights = 2048 * 1000
    layers.append({
        "id": "predictions",
        "type": "dense",
        "name": "predictions",
        "inputShape": { "dimensions": [None, 2048], "description": "2048" },
        "outputShape": { "dimensions": [None, 1000], "description": "1000" },
        "config": { "units": 1000, "activation": "softmax", "useBias": True },
        "parameters": {
            "total": pred_weights + 1000,
            "weights": pred_weights,
            "biases": 1000,
            "formula": "(input_features + 1) × output_units",
            "calculationSteps": []
        },
        "educationalNote": make_note("Predictions.", "Outputs class probabilities.", "Final decision head.", "Classification layer.")
    })
    connections.append({ "id": "c_gap_pred", "sourceId": "global_average_pooling2d", "targetId": "predictions", "type": "sequential" })

    groups.append({
        "id": "group_classifier",
        "name": "Global Pooling & Classification",
        "description": "GAP followed by the dense predictions.",
        "layerIds": ["global_average_pooling2d", "predictions"],
        "color": "#8B5CF6"
    })

    model_data = {
        "id": "xception",
        "name": "Xception",
        "fullName": "Xception: Deep Learning with Depthwise Separable Convolutions",
        "paperYear": 2016,
        "authors": ["François Chollet"],
        "paperUrl": "https://arxiv.org/abs/1610.02357",
        "depth": 71,
        "totalParameters": 22910480,
        "totalFLOPs": 8400000000,
        "inputShape": { "channels": 3, "height": 299, "width": 299 },
        "top1Accuracy": 0.790,
        "top5Accuracy": 0.945,
        "memoryUsage": 88,
        "description": "Xception replaces standard Inception modules with Depthwise Separable Convolutions, significantly reducing parameters and accelerating feature mapping capabilities.",
        "colorTheme": "#EC4899",
        "tags": ["CNN", "Classification", "Depthwise-Separable", "ImageNet"],
        "architecture": {
            "layers": layers,
            "connections": connections,
            "groups": groups
        }
    }
    write_json(os.path.join(os.path.dirname(__file__), "xception.json"), model_data)

# 4. GENERATE NASNET MOBILE & LARGE
def generate_nasnet(model_id, name, fullName, depth, totalParameters, totalFLOPs, top1Accuracy, top5Accuracy, memoryUsage, description, tags, colorTheme, cell_repeats, stem_filters):
    layers = []
    connections = []
    groups = []
    y_ptr = 0

    # Input layer
    res = 331 if model_id == "nasnetlarge" else 224
    layers.append({
        "id": "input_1",
        "type": "input",
        "name": "input_1",
        "inputShape": { "dimensions": [None, res, res, 3], "description": f"{res}×{res}×3 RGB Image" },
        "outputShape": { "dimensions": [None, res, res, 3], "description": f"{res}×{res}×3 RGB Image" },
        "config": { "shape": [res, res, 3] },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": make_note(
            "Input layer receiving normalized RGB matrices.",
            f"Image dimensions of {res}x{res}.",
            "Sets image bounds.",
            "Sets bounds."
        ),
        "position": { "x": 250, "y": y_ptr },
        "color": "emerald",
        "icon": "image"
    })
    y_ptr += 150

    # Stem Conv (use_bias=False)
    stem_conv_id = "stem_conv1"
    stem_weights = 3 * 3 * 3 * stem_filters
    layers.append({
        "id": stem_conv_id,
        "type": "conv2d",
        "name": stem_conv_id,
        "inputShape": { "dimensions": [None, res, res, 3], "description": f"{res}×{res}×3" },
        "outputShape": { "dimensions": [None, res // 2, res // 2, stem_filters], "description": f"{res // 2}×{res // 2}×{stem_filters}" },
        "config": {
            "filters": stem_filters,
            "kernelSize": [3, 3],
            "strides": [2, 2],
            "padding": "same",
            "useBias": False,
            "activation": "linear"
        },
        "parameters": {
            "total": stem_weights,
            "weights": stem_weights,
            "biases": 0,
            "formula": "kernel_height × kernel_width × input_channels × output_filters",
            "calculationSteps": []
        },
        "educationalNote": make_note("Stem downsampling convolution.", "Reduces resolution spatially.", "Reduces computing footprint.", "Downsamples stem features.")
    })
    connections.append({ "id": "c_in_stemconv", "sourceId": "input_1", "targetId": stem_conv_id, "type": "sequential" })
    y_ptr += 150

    stem_bn_id = "stem_bn1"
    layers.append({
        "id": stem_bn_id,
        "type": "batch_norm",
        "name": stem_bn_id,
        "inputShape": { "dimensions": [None, res // 2, res // 2, stem_filters], "description": f"{res // 2}×{res // 2}×{stem_filters}" },
        "outputShape": { "dimensions": [None, res // 2, res // 2, stem_filters], "description": f"{res // 2}×{res // 2}×{stem_filters}" },
        "config": { "axis": 3, "momentum": 0.99, "epsilon": 0.001 },
        "parameters": { "total": stem_filters * 4, "weights": stem_filters * 2, "biases": stem_filters * 2, "formula": "4 × channels", "calculationSteps": [] },
        "educationalNote": make_note("Normalizes stem.", "Keeps channel variables balanced.", "Maintains gradient scales.", "Normalizes features.")
    })
    connections.append({ "id": f"c_{stem_conv_id}_{stem_bn_id}", "sourceId": stem_conv_id, "targetId": stem_bn_id, "type": "sequential" })
    y_ptr += 150

    # Cell structures
    # We represent the Normal Cell and Reduction Cell conceptually using standard multi-branch connections.
    # In NASNet normal cell, we apply:
    # - Branch 1: SepConv 3x3
    # - Branch 2: SepConv 5x5
    # - Add & Concat
    block_prefix = "cell_1_"
    cell_l_ids = []

    # Br 1: SepConv 3x3 (filters_out = stem_filters)
    br1_weights = 3 * 3 * stem_filters + stem_filters * stem_filters
    br1_id = f"{block_prefix}sep3x3"
    layers.append({
        "id": br1_id,
        "type": "conv2d",
        "name": f"{block_name(block_prefix)}sep3x3",
        "inputShape": { "dimensions": [None, res // 2, res // 2, stem_filters], "description": f"×{stem_filters}" },
        "outputShape": { "dimensions": [None, res // 2, res // 2, stem_filters], "description": f"×{stem_filters}" },
        "config": {
            "filters": stem_filters,
            "kernelSize": [3, 3],
            "strides": [1, 1],
            "padding": "same",
            "useBias": False,
            "activation": "linear"
        },
        "parameters": { "total": br1_weights, "weights": br1_weights, "biases": 0, "formula": "Separable weights", "calculationSteps": [] },
        "educationalNote": make_note("Separable 3x3 conv discovered by NAS.", "Processes features spatially without channel mixing.", "Controls parameter overhead.", "Separable 3x3 conv.")
    })
    connections.append({ "id": f"c_{stem_bn_id}_{br1_id}", "sourceId": stem_bn_id, "targetId": br1_id, "type": "skip" })
    cell_l_ids.append(br1_id)

    # Br 2: SepConv 5x5 (filters_out = stem_filters)
    br2_weights = 5 * 5 * stem_filters + stem_filters * stem_filters
    br2_id = f"{block_prefix}sep5x5"
    layers.append({
        "id": br2_id,
        "type": "conv2d",
        "name": f"{block_name(block_prefix)}sep5x5",
        "inputShape": { "dimensions": [None, res // 2, res // 2, stem_filters], "description": f"×{stem_filters}" },
        "outputShape": { "dimensions": [None, res // 2, res // 2, stem_filters], "description": f"×{stem_filters}" },
        "config": {
            "filters": stem_filters,
            "kernelSize": [5, 5],
            "strides": [1, 1],
            "padding": "same",
            "useBias": False,
            "activation": "linear"
        },
        "parameters": { "total": br2_weights, "weights": br2_weights, "biases": 0, "formula": "Separable weights", "calculationSteps": [] },
        "educationalNote": make_note("Separable 5x5 conv discovered by NAS.", "Large spatial receptive field convolving.", "Captures wider contexts.", "Separable 5x5 conv.")
    })
    connections.append({ "id": f"c_{stem_bn_id}_{br2_id}", "sourceId": stem_bn_id, "targetId": br2_id, "type": "skip" })
    cell_l_ids.append(br2_id)

    # Add combiner
    add_id = f"{block_prefix}add"
    layers.append({
        "id": add_id,
        "type": "add",
        "name": add_id,
        "inputShape": { "dimensions": [None, res // 2, res // 2, stem_filters], "description": f"{stem_filters} channels" },
        "outputShape": { "dimensions": [None, res // 2, res // 2, stem_filters], "description": f"{stem_filters} channels" },
        "config": {},
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": make_note("Combiner summing parallel cell branches.", "Adds separable convolution paths.", "Combines spatial representations.", "Residual summation.")
    })
    connections.append({ "id": f"c_br1_{add_id}", "sourceId": br1_id, "targetId": add_id, "type": "sequential" })
    connections.append({ "id": f"c_br2_{add_id}", "sourceId": br2_id, "targetId": add_id, "type": "sequential" })
    cell_l_ids.append(add_id)

    groups.append({
        "id": "group_cell_1",
        "name": "NASNet Normal Cell",
        "description": "Combines parallel separable convolutions (3x3 and 5x5) discovered via automated architecture search.",
        "layerIds": cell_l_ids,
        "color": "#06B6D4"
    })

    y_ptr += 300
    last_id = add_id

    # GAP & Predictions
    gap_filters = stem_filters * 6 # NASNet channels expand in cell concatenations
    layers.append({
        "id": "global_average_pooling2d",
        "type": "global_average_pooling2d",
        "name": "global_average_pooling2d",
        "inputShape": { "dimensions": [None, 7, 7, gap_filters], "description": f"7×7×{gap_filters}" },
        "outputShape": { "dimensions": [None, gap_filters], "description": str(gap_filters) },
        "config": {},
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": make_note("GAP averaging channels.", "Averages maps.", "Saves parameter footprints.", "Spatially collapses maps.")
    })
    connections.append({ "id": "c_last_gap", "sourceId": last_id, "targetId": "global_average_pooling2d", "type": "sequential" })
    y_ptr += 150

    pred_weights = gap_filters * 1000
    layers.append({
        "id": "predictions",
        "type": "dense",
        "name": "predictions",
        "inputShape": { "dimensions": [None, gap_filters], "description": str(gap_filters) },
        "outputShape": { "dimensions": [None, 1000], "description": "1000" },
        "config": { "units": 1000, "activation": "softmax", "useBias": True },
        "parameters": {
            "total": pred_weights + 1000,
            "weights": pred_weights,
            "biases": 1000,
            "formula": "(input_features + 1) × output_units",
            "calculationSteps": []
        },
        "educationalNote": make_note("Predictions.", "Outputs class probabilities.", "Final decision head.", "Classification layer.")
    })
    connections.append({ "id": "c_gap_pred", "sourceId": "global_average_pooling2d", "targetId": "predictions", "type": "sequential" })

    groups.append({
        "id": "group_classifier",
        "name": "Global Pooling & Classification",
        "description": "GAP followed by prediction layer.",
        "layerIds": ["global_average_pooling2d", "predictions"],
        "color": "#8B5CF6"
    })

    model_data = {
        "id": model_id,
        "name": name,
        "fullName": fullName,
        "paperYear": 2017,
        "authors": ["Barret Zoph", "Vijay Vasudevan", "Jonathon Shlens", "Quoc V. Le"],
        "paperUrl": "https://arxiv.org/abs/1707.07012",
        "depth": depth,
        "totalParameters": totalParameters,
        "totalFLOPs": totalFLOPs,
        "inputShape": { "channels": 3, "height": res, "width": res },
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
    write_json(os.path.join(os.path.dirname(__file__), f"{model_id}.json"), model_data)


if __name__ == "__main__":
    print("Generating Inception V3...")
    generate_inception_v3()

    print("\nGenerating InceptionResNetV2...")
    generate_inception_resnet_v2()

    print("\nGenerating Xception...")
    generate_xception()

    print("\nGenerating NASNet Mobile & Large...")
    generate_nasnet(
        "nasnetmobile", "NASNetMobile", "Learning Transferable Architectures for Scalable Image Recognition (Mobile)",
        81, 5326564, 470000000, 0.744, 0.919, 20,
        "Mobile-optimized neural architecture found through automated architecture search. Achieves good accuracy-to-efficiency ratio for mobile deployment.",
        ["CNN", "Classification", "NAS", "Mobile", "ImageNet"], "#06B6D4", 4, 32
    )

    generate_nasnet(
        "nasnetlarge", "NASNetLarge", "Learning Transferable Architectures for Scalable Image Recognition (Large)",
        389, 88949818, 24040000000, 0.825, 0.960, 340,
        "Large architecture discovered through neural architecture search. Achieves state-of-the-art accuracy through automated design rather than manual engineering.",
        ["CNN", "Classification", "NAS", "ImageNet"], "#0891B2", 6, 96
    )

    print("\nAll generations completed!")
