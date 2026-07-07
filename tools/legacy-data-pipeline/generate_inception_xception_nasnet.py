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

# Helper to generate Name
def block_name(prefix):
    return prefix.replace("_", "/")

# Stem Convolution Helper (conv2d + batch_norm + activation)
def add_conv_bn_act(layers, connections, id_prefix, name_prefix, f_in, f_out, k_size, stride, padding, use_bias, act, x, y):
    conv_id = f"{id_prefix}_conv"
    conv_weights = k_size[0] * k_size[1] * f_in * f_out
    
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
            f"Slides {f_out} filters of size {k_size[0]}x{k_size[1]} across the input.",
            "Essential feature extraction layer.",
            "Extracts localized visual features."
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
            "Normalizes channel activations to stabilize learning.",
            "Prevents vanishing gradients in deep networks.",
            "Stabilizes activations."
        ),
        "position": { "x": x, "y": y + 40 },
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
            "Adds non-linearity to the network representation.",
            "Allows learning complex non-linear structures.",
            "Introduces non-linearity."
        ),
        "position": { "x": x, "y": y + 80 },
        "color": "pink",
        "icon": "zap"
    })
    connections.append({ "id": f"c_{bn_id}_{act_id}", "sourceId": bn_id, "targetId": act_id, "type": "sequential" })

    return act_id

# Programmatic helper to add Inception A Block
def add_inception_a(layers, connections, block_prefix, in_channels, f1, f2_in, f2_out, f3_in, f3_out, f4_out, x, y):
    br_ids = []
    
    # Branch 1: 1x1 Conv
    br1 = add_conv_bn_act(layers, connections, f"{block_prefix}br1", f"{block_name(block_prefix)}br1", in_channels, f1, [1, 1], 1, "same", False, "relu", x - 150, y + 100)
    br_ids.append(br1)
    
    # Branch 2: 1x1 -> 5x5 (factorized as 5x5 or two 3x3)
    br2_1 = add_conv_bn_act(layers, connections, f"{block_prefix}br2_1", f"{block_name(block_prefix)}br2_1", in_channels, f2_in, [1, 1], 1, "same", False, "relu", x - 50, y + 100)
    br2 = add_conv_bn_act(layers, connections, f"{block_prefix}br2_2", f"{block_name(block_prefix)}br2_2", f2_in, f2_out, [5, 5], 1, "same", False, "relu", x - 50, y + 200)
    connections.append({ "id": f"c_{br2_1}_{block_prefix}br2_2_conv", "sourceId": br2_1, "targetId": f"{block_prefix}br2_2_conv", "type": "sequential" })
    br_ids.append(br2)
    
    # Branch 3: 1x1 -> 3x3 -> 3x3
    br3_1 = add_conv_bn_act(layers, connections, f"{block_prefix}br3_1", f"{block_name(block_prefix)}br3_1", in_channels, f3_in, [1, 1], 1, "same", False, "relu", x + 50, y + 100)
    br3_2 = add_conv_bn_act(layers, connections, f"{block_prefix}br3_2", f"{block_name(block_prefix)}br3_2", f3_in, f3_out, [3, 3], 1, "same", False, "relu", x + 50, y + 200)
    br3 = add_conv_bn_act(layers, connections, f"{block_prefix}br3_3", f"{block_name(block_prefix)}br3_3", f3_out, f3_out, [3, 3], 1, "same", False, "relu", x + 50, y + 300)
    connections.append({ "id": f"c_{br3_1}_{block_prefix}br3_2_conv", "sourceId": br3_1, "targetId": f"{block_prefix}br3_2_conv", "type": "sequential" })
    connections.append({ "id": f"c_{br3_2}_{block_prefix}br3_3_conv", "sourceId": br3_2, "targetId": f"{block_prefix}br3_3_conv", "type": "sequential" })
    br_ids.append(br3)
    
    # Branch 4: AvgPool -> 1x1 Conv
    pool_id = f"{block_prefix}br4_pool"
    layers.append({
        "id": pool_id,
        "type": "average_pooling2d",
        "name": f"{block_name(block_prefix)}br4_pool",
        "inputShape": { "dimensions": [None, None, None, in_channels], "description": f"×{in_channels}" },
        "outputShape": { "dimensions": [None, None, None, in_channels], "description": f"×{in_channels}" },
        "config": { "poolSize": [3, 3], "strides": [1, 1], "padding": "same" },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": make_note("Averages features spatially.", "Spatially aggregates neighboring representations.", "Preserves localized activations.", "Average pools spatially.")
    })
    br4 = add_conv_bn_act(layers, connections, f"{block_prefix}br4_conv", f"{block_name(block_prefix)}br4_conv", in_channels, f4_out, [1, 1], 1, "same", False, "relu", x + 150, y + 200)
    connections.append({ "id": f"c_{pool_id}_{block_prefix}br4_conv_conv", "sourceId": pool_id, "targetId": f"{block_prefix}br4_conv_conv", "type": "sequential" })
    br_ids.append(br4)
    
    # Concatenate
    concat_id = f"{block_prefix}concat"
    total_out = f1 + f2_out + f3_out + f4_out
    layers.append({
        "id": concat_id,
        "type": "concatenate",
        "name": concat_id,
        "inputShape": { "dimensions": [None, None, None, total_out], "description": "Concatenated branches" },
        "outputShape": { "dimensions": [None, None, None, total_out], "description": f"{total_out} channels" },
        "config": { "axis": 3 },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": make_note("Concatenates parallel features.", "Joins features along the channel axis.", "Enables multi-scale extraction.", "Combines branches.")
    })
    
    return br_ids, concat_id

# 1. INCEPTION V3 GENERATOR
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
            "RGB input receiving 299x299 matrices.",
            "Standard InceptionV3 input resolution. Higher resolution supports factorization of deep convolutions.",
            "Establishes initial dimensions.",
            "Starts representation pipeline."
        ),
        "position": { "x": 250, "y": y_ptr },
        "color": "emerald",
        "icon": "image"
    })
    y_ptr += 120

    # Stem Layers
    last_id = "input_1"
    last_id = add_conv_bn_act(layers, connections, "conv2d_1", "conv2d_1", 3, 32, [3, 3], 2, "valid", False, "relu", 250, y_ptr)
    connections.append({ "id": "c_in_conv1", "sourceId": "input_1", "targetId": "conv2d_1_conv", "type": "sequential" })
    y_ptr += 150

    last_id = add_conv_bn_act(layers, connections, "conv2d_2", "conv2d_2", 32, 32, [3, 3], 1, "valid", False, "relu", 250, y_ptr)
    y_ptr += 150

    last_id = add_conv_bn_act(layers, connections, "conv2d_3", "conv2d_3", 32, 64, [3, 3], 1, "same", False, "relu", 250, y_ptr)
    y_ptr += 150

    # max_pooling2d_1
    layers.append({
        "id": "max_pooling2d_1",
        "type": "max_pooling2d",
        "name": "max_pooling2d_1",
        "inputShape": { "dimensions": [None, 147, 147, 64], "description": "147×147×64" },
        "outputShape": { "dimensions": [None, 73, 73, 64], "description": "73×73×64" },
        "config": { "poolSize": [3, 3], "strides": [2, 2], "padding": "valid" },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": make_note("MaxPooling downsamples resolution.", "Filters peak activations to shrink grid size.", "Reduces down-stream parameter sizes.", "Downsamples grid.")
    })
    connections.append({ "id": "c_act_pool1", "sourceId": last_id, "targetId": "max_pooling2d_1", "type": "sequential" })
    y_ptr += 120
    last_id = "max_pooling2d_1"

    last_id = add_conv_bn_act(layers, connections, "conv2d_4", "conv2d_4", 64, 80, [1, 1], 1, "valid", False, "relu", 250, y_ptr)
    y_ptr += 150

    last_id = add_conv_bn_act(layers, connections, "conv2d_5", "conv2d_5", 80, 192, [3, 3], 1, "valid", False, "relu", 250, y_ptr)
    y_ptr += 150

    # max_pooling2d_2
    layers.append({
        "id": "max_pooling2d_2",
        "type": "max_pooling2d",
        "name": "max_pooling2d_2",
        "inputShape": { "dimensions": [None, 71, 71, 192], "description": "71×71×192" },
        "outputShape": { "dimensions": [None, 35, 35, 192], "description": "35×35×192" },
        "config": { "poolSize": [3, 3], "strides": [2, 2], "padding": "valid" },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": make_note("Second pooling downsamples.", "Downsamples maps before multi-scale branching.", "Provides translation invariance.", "Downsamples representations.")
    })
    connections.append({ "id": "c_act_pool2", "sourceId": last_id, "targetId": "max_pooling2d_2", "type": "sequential" })
    y_ptr += 120
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

    # Inception A Blocks: mixed0, mixed1, mixed2
    a_configs = [
        # (prefix, in_c, f1, f2_in, f2_out, f3_in, f3_out, f4_out)
        ("mixed_0_", 192, 64, 48, 64, 64, 96, 32),
        ("mixed_1_", 256, 64, 48, 64, 64, 96, 64),
        ("mixed_2_", 288, 64, 48, 64, 64, 96, 64)
    ]
    
    for prefix, in_c, f1, f2_in, f2_out, f3_in, f3_out, f4_out in a_configs:
        br_ids, concat_id = add_inception_a(layers, connections, prefix, in_c, f1, f2_in, f2_out, f3_in, f3_out, f4_out, 250, y_ptr)
        
        # Connect last layer to branches
        for b_id in [f"{prefix}br1_conv", f"{prefix}br2_1_conv", f"{prefix}br3_1_conv", f"{prefix}br4_pool"]:
            connections.append({ "id": f"c_{last_id}_{b_id}", "sourceId": last_id, "targetId": b_id, "type": "skip" })
            
        # Connect branch outputs to concat
        for b_out in br_ids:
            connections.append({ "id": f"c_{b_out}_{concat_id}", "sourceId": b_out, "targetId": concat_id, "type": "sequential" })
            
        groups.append({
            "id": f"group_{prefix.rstrip('_')}",
            "name": f"Inception Module A ({prefix.rstrip('_')})",
            "description": "Applies parallel multi-scale convolutions (1x1, 3x3, 5x5) and combines features.",
            "layerIds": br_ids + [concat_id, f"{prefix}br4_pool"],
            "color": "#3B82F6"
        })
        
        last_id = concat_id
        y_ptr += 400

    # GAP & Predictions
    layers.append({
        "id": "global_average_pooling2d",
        "type": "global_average_pooling2d",
        "name": "global_average_pooling2d",
        "inputShape": { "dimensions": [None, 8, 8, 2048], "description": "8×8×2048" },
        "outputShape": { "dimensions": [None, 2048], "description": "2048" },
        "config": {},
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": make_note("GAP averaging channels.", "Averages visual representations to a single vector.", "Reduces parameter scale before dense projection.", "Collapses spatial dimensions.")
    })
    connections.append({ "id": "c_last_gap", "sourceId": last_id, "targetId": "global_average_pooling2d", "type": "sequential" })
    y_ptr += 120

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
        "educationalNote": make_note("Softmax predictions.", "Maps embeddings to class logits.", "Decision classifier head.", "Final classification.")
    })
    connections.append({ "id": "c_gap_pred", "sourceId": "global_average_pooling2d", "targetId": "predictions", "type": "sequential" })

    groups.append({
        "id": "group_classifier",
        "name": "Global Pooling & Classification",
        "description": "GAP followed by the dense classifier.",
        "layerIds": ["global_average_pooling2d", "predictions"],
        "color": "#8B5CF6"
    })

    model_data = {
        "id": "inceptionv3",
        "name": "InceptionV3",
        "fullName": "Rethinking the Inception Architecture for Computer Vision",
        "paperYear": 2015,
        "authors": ["Christian Szegedy", "Vincent Vanhoucke", "Sergey Ioffe", "Jonathon Shlens", "Zbigniew Wojna"],
        "paperUrl": "https://arxiv.org/abs/1512.00567",
        "depth": 48,
        "totalParameters": 23851784,
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

# 2. INCEPTION RESNET V2 GENERATOR
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
        "educationalNote": make_note("RGB input image.", "Standard input layer.", "Starts computation.", "Sensory entrance.")
    })
    y_ptr += 120

    # Stem Layers
    last_id = "input_1"
    last_id = add_conv_bn_act(layers, connections, "conv2d_1", "conv2d_1", 3, 32, [3, 3], 2, "valid", False, "relu", 250, y_ptr)
    connections.append({ "id": "c_in_conv1", "sourceId": "input_1", "targetId": "conv2d_1_conv", "type": "sequential" })
    y_ptr += 150

    last_id = add_conv_bn_act(layers, connections, "conv2d_2", "conv2d_2", 32, 32, [3, 3], 1, "valid", False, "relu", 250, y_ptr)
    y_ptr += 150

    last_id = add_conv_bn_act(layers, connections, "conv2d_3", "conv2d_3", 32, 64, [3, 3], 1, "same", False, "relu", 250, y_ptr)
    y_ptr += 150

    # MaxPooling
    layers.append({
        "id": "max_pooling2d_1",
        "type": "max_pooling2d",
        "name": "max_pooling2d_1",
        "inputShape": { "dimensions": [None, 147, 147, 64], "description": "147×147×64" },
        "outputShape": { "dimensions": [None, 73, 73, 64], "description": "73×73×64" },
        "config": { "poolSize": [3, 3], "strides": [2, 2], "padding": "valid" },
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": make_note("Downsamples stem maps.", "MaxPooling downsamples features.", "Reduces computation scale.", "Reduces sizes.")
    })
    connections.append({ "id": "c_act_pool1", "sourceId": last_id, "targetId": "max_pooling2d_1", "type": "sequential" })
    y_ptr += 120
    last_id = "max_pooling2d_1"

    stem_ids = ["conv2d_1_conv", "conv2d_1_bn", "conv2d_1_act", "conv2d_2_conv", "conv2d_2_bn", "conv2d_2_act", "conv2d_3_conv", "conv2d_3_bn", "conv2d_3_act", "max_pooling2d_1"]
    groups.append({
        "id": "group_stem",
        "name": "Input Stem",
        "description": "First feature downsampling convolutions.",
        "layerIds": stem_ids,
        "color": "#D97706"
    })

    # Inception-ResNet Block A (Loop 5 repeats)
    for b_idx in range(1, 6):
        block_prefix = f"block_a{b_idx}_"
        block_l_ids = []
        
        # Br 1: 1x1 conv
        br1 = add_conv_bn_act(layers, connections, f"{block_prefix}br1", f"{block_name(block_prefix)}br1", 64 if b_idx==1 else 320, 32, [1, 1], 1, "same", False, "relu", 100, y_ptr)
        connections.append({ "id": f"c_{last_id}_{block_prefix}br1_conv", "sourceId": last_id, "targetId": f"{block_prefix}br1_conv", "type": "skip" })
        block_l_ids.append(br1)
        
        # Br 2: 1x1 -> 3x3
        br2_1 = add_conv_bn_act(layers, connections, f"{block_prefix}br2_1", f"{block_name(block_prefix)}br2_1", 64 if b_idx==1 else 320, 32, [1, 1], 1, "same", False, "relu", 200, y_ptr)
        br2 = add_conv_bn_act(layers, connections, f"{block_prefix}br2_2", f"{block_name(block_prefix)}br2_2", 32, 32, [3, 3], 1, "same", False, "relu", 200, y_ptr + 100)
        connections.append({ "id": f"c_{last_id}_{block_prefix}br2_1_conv", "sourceId": last_id, "targetId": f"{block_prefix}br2_1_conv", "type": "skip" })
        connections.append({ "id": f"c_{br2_1}_{block_prefix}br2_2_conv", "sourceId": br2_1, "targetId": f"{block_prefix}br2_2_conv", "type": "sequential" })
        block_l_ids.extend([br2_1, br2])
        
        # Br 3: 1x1 -> 3x3 -> 3x3
        br3_1 = add_conv_bn_act(layers, connections, f"{block_prefix}br3_1", f"{block_name(block_prefix)}br3_1", 64 if b_idx==1 else 320, 32, [1, 1], 1, "same", False, "relu", 300, y_ptr)
        br3_2 = add_conv_bn_act(layers, connections, f"{block_prefix}br3_2", f"{block_name(block_prefix)}br3_2", 32, 48, [3, 3], 1, "same", False, "relu", 300, y_ptr + 100)
        br3 = add_conv_bn_act(layers, connections, f"{block_prefix}br3_3", f"{block_name(block_prefix)}br3_3", 48, 64, [3, 3], 1, "same", False, "relu", 300, y_ptr + 200)
        connections.append({ "id": f"c_{last_id}_{block_prefix}br3_1_conv", "sourceId": last_id, "targetId": f"{block_prefix}br3_1_conv", "type": "skip" })
        connections.append({ "id": f"c_{br3_1}_{block_prefix}br3_2_conv", "sourceId": br3_1, "targetId": f"{block_prefix}br3_2_conv", "type": "sequential" })
        connections.append({ "id": f"c_{br3_2}_{block_prefix}br3_3_conv", "sourceId": br3_2, "targetId": f"{block_prefix}br3_3_conv", "type": "sequential" })
        block_l_ids.extend([br3_1, br3_2, br3])
        
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
            "educationalNote": make_note("Concatenates parallel branches.", "Groups channel tensors.", "Unifies multi-scale features.", "Glues features.")
        })
        connections.append({ "id": f"c_{br1}_{concat_id}", "sourceId": br1, "targetId": concat_id, "type": "sequential" })
        connections.append({ "id": f"c_{br2}_{concat_id}", "sourceId": br2, "targetId": concat_id, "type": "sequential" })
        connections.append({ "id": f"c_{br3}_{concat_id}", "sourceId": br3, "targetId": concat_id, "type": "sequential" })
        block_l_ids.append(concat_id)
        
        # Linear projection
        proj_id = f"{block_prefix}project_conv"
        proj_weights = 128 * 320
        layers.append({
            "id": proj_id,
            "type": "conv2d",
            "name": proj_id,
            "inputShape": { "dimensions": [None, 73, 73, 128], "description": "73×73×128" },
            "outputShape": { "dimensions": [None, 73, 73, 320], "description": "73×73×320" },
            "config": { "filters": 320, "kernelSize": [1, 1], "strides": [1, 1], "padding": "same", "useBias": True, "activation": "linear" },
            "parameters": { "total": proj_weights + 320, "weights": proj_weights, "biases": 320, "formula": "in × out + out", "calculationSteps": [] },
            "educationalNote": make_note("Projects channels back.", "Linear 1x1 mapping to restore shapes.", "Prepares shapes for skip addition.", "Linear projection.")
        })
        connections.append({ "id": f"c_{concat_id}_{proj_id}", "sourceId": concat_id, "targetId": proj_id, "type": "sequential" })
        block_l_ids.append(proj_id)
        
        # Add (Join)
        add_id = f"{block_prefix}add"
        layers.append({
            "id": add_id,
            "type": "add",
            "name": add_id,
            "inputShape": { "dimensions": [None, 73, 73, 320], "description": "320 channels" },
            "outputShape": { "dimensions": [None, 73, 73, 320], "description": "320 channels" },
            "config": {},
            "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
            "educationalNote": make_note("Identity skip sum.", "Adds residual branch output to input.", "Stabilizes backpropagation.", "Residual skip addition.")
        })
        connections.append({ "id": f"c_{proj_id}_{add_id}", "sourceId": proj_id, "targetId": add_id, "type": "sequential" })
        connections.append({ "id": f"c_{last_id}_{add_id}", "sourceId": last_id, "targetId": add_id, "type": "skip" })
        block_l_ids.append(add_id)

        # Post-activation
        act_id = f"{block_prefix}out_act"
        layers.append({
            "id": act_id,
            "type": "activation",
            "name": act_id,
            "inputShape": { "dimensions": [None, 73, 73, 320], "description": "320" },
            "outputShape": { "dimensions": [None, 73, 73, 320], "description": "320" },
            "config": { "activation": "relu" },
            "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
            "educationalNote": make_note("ReLU block activation.", "Rectifies negative sums.", "Prepares mappings.", "Final block activation.")
        })
        connections.append({ "id": f"c_{add_id}_{act_id}", "sourceId": add_id, "targetId": act_id, "type": "sequential" })
        block_l_ids.append(act_id)
        
        groups.append({
            "id": f"group_block_a_{b_idx}",
            "name": f"Inception ResNet Block A{b_idx}",
            "description": "Combines parallel multi-scale branches with a residual skip connection.",
            "layerIds": block_l_ids + [f"{block_prefix}br1_conv", f"{block_prefix}br2_1_conv", f"{block_prefix}br3_1_conv"],
            "color": "#16A34A"
        })
        
        last_id = act_id
        y_ptr += 450

    # GAP & Predictions
    layers.append({
        "id": "global_average_pooling2d",
        "type": "global_average_pooling2d",
        "name": "global_average_pooling2d",
        "inputShape": { "dimensions": [None, 8, 8, 1536], "description": "8×8×1536" },
        "outputShape": { "dimensions": [None, 1536], "description": "1536" },
        "config": {},
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": make_note("GAP averaging channels.", "Collapses spatial grids.", "Minimizes decision weights.", "Averages activations.")
    })
    connections.append({ "id": "c_last_gap", "sourceId": last_id, "targetId": "global_average_pooling2d", "type": "sequential" })
    y_ptr += 120

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
        "educationalNote": make_note("Softmax predictions.", "Maps values to categories.", "Decision classification head.", "Final decision maker.")
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

# 3. XCEPTION GENERATOR
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
        "educationalNote": make_note("RGB input image.", "Entry input resolution.", "Input stage.", "Image entrance.")
    })
    y_ptr += 120

    # Stem: Entry Flow convs
    last_id = "input_1"
    last_id = add_conv_bn_act(layers, connections, "block1_conv1", "block1_conv1", 3, 32, [3, 3], 2, "valid", False, "relu", 250, y_ptr)
    connections.append({ "id": "c_in_conv1", "sourceId": "input_1", "targetId": "block1_conv1_conv", "type": "sequential" })
    y_ptr += 150

    last_id = add_conv_bn_act(layers, connections, "block1_conv2", "block1_conv2", 32, 64, [3, 3], 1, "same", False, "relu", 250, y_ptr)
    y_ptr += 150

    stem_ids = ["block1_conv1_conv", "block1_conv1_bn", "block1_conv1_act", "block1_conv2_conv", "block1_conv2_bn", "block1_conv2_act"]
    groups.append({
        "id": "group_stem",
        "name": "Entry Flow Stem",
        "description": "Standard convolutions for early representations.",
        "layerIds": stem_ids,
        "color": "#EC4899"
    })

    # Helper function to generate Separable Blocks
    # Block type: SepConv -> BN -> ReLU -> SepConv -> BN -> MaxPool (if stride=2)
    # Shortcut: Conv2D 1x1 -> BN
    def add_xception_block(block_idx, in_c, out_c, stride=2):
        block_prefix = f"block{block_idx}_"
        block_l_ids = []
        
        # SepConv1
        s1_weights = 3 * 3 * in_c + in_c * out_c
        s1_id = f"{block_prefix}sep1"
        layers.append({
            "id": s1_id,
            "type": "conv2d",
            "name": f"{block_name(block_prefix)}sep1",
            "inputShape": { "dimensions": [None, None, None, in_c], "description": f"×{in_c}" },
            "outputShape": { "dimensions": [None, None, None, out_c], "description": f"×{out_c}" },
            "config": { "filters": out_c, "kernelSize": [3, 3], "strides": [1, 1], "padding": "same", "useBias": False, "activation": "linear" },
            "parameters": { "total": s1_weights, "weights": s1_weights, "biases": 0, "formula": "Decomposed separable weights", "calculationSteps": [] },
            "educationalNote": make_note("Depthwise-Separable conv.", "Decomposes convolving to save parameters.", "Reduces parameter growth.", "Separable spatial convolution.")
        })
        block_l_ids.append(s1_id)
        
        # BN 1
        s1_bn = f"{s1_id}_bn"
        layers.append({
            "id": s1_bn,
            "type": "batch_norm",
            "name": f"{block_name(block_prefix)}sep1_bn",
            "inputShape": { "dimensions": [None, None, None, out_c], "description": f"×{out_c}" },
            "outputShape": { "dimensions": [None, None, None, out_c], "description": f"×{out_c}" },
            "config": { "axis": 3, "momentum": 0.99, "epsilon": 0.001 },
            "parameters": { "total": out_c * 4, "weights": out_c * 2, "biases": out_c * 2, "formula": "4 × channels", "calculationSteps": [] },
            "educationalNote": make_note("Normalizes separable outputs.", "Keeps channel variables normalized.", "Prevents covariate shifts.", "Normalizes features.")
        })
        connections.append({ "id": f"c_{s1_id}_{s1_bn}", "sourceId": s1_id, "targetId": s1_bn, "type": "sequential" })
        block_l_ids.append(s1_bn)
        
        # ReLU 1
        s1_act = f"{s1_id}_act"
        layers.append({
            "id": s1_act,
            "type": "activation",
            "name": f"{block_name(block_prefix)}sep1_act",
            "inputShape": { "dimensions": [None, None, None, out_c], "description": f"×{out_c}" },
            "outputShape": { "dimensions": [None, None, None, out_c], "description": f"×{out_c}" },
            "config": { "activation": "relu" },
            "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
            "educationalNote": make_note("ReLU non-linearity.", "Locks positive sums.", "Adds learning capacity.", "ReLU activation.")
        })
        connections.append({ "id": f"c_{s1_bn}_{s1_act}", "sourceId": s1_bn, "targetId": s1_act, "type": "sequential" })
        block_l_ids.append(s1_act)
        
        # SepConv2
        s2_weights = 3 * 3 * out_c + out_c * out_c
        s2_id = f"{block_prefix}sep2"
        layers.append({
            "id": s2_id,
            "type": "conv2d",
            "name": f"{block_name(block_prefix)}sep2",
            "inputShape": { "dimensions": [None, None, None, out_c], "description": f"×{out_c}" },
            "outputShape": { "dimensions": [None, None, None, out_c], "description": f"×{out_c}" },
            "config": { "filters": out_c, "kernelSize": [3, 3], "strides": [1, 1], "padding": "same", "useBias": False, "activation": "linear" },
            "parameters": { "total": s2_weights, "weights": s2_weights, "biases": 0, "formula": "Separable weights", "calculationSteps": [] },
            "educationalNote": make_note("Second separable conv.", "Builds deep spatial features.", "Reduces parameter scale.", "Separable spatial convolution.")
        })
        connections.append({ "id": f"c_{s1_act}_{s2_id}", "sourceId": s1_act, "targetId": s2_id, "type": "sequential" })
        block_l_ids.append(s2_id)
        
        # BN 2
        s2_bn = f"{s2_id}_bn"
        layers.append({
            "id": s2_bn,
            "type": "batch_norm",
            "name": f"{block_name(block_prefix)}sep2_bn",
            "inputShape": { "dimensions": [None, None, None, out_c], "description": f"×{out_c}" },
            "outputShape": { "dimensions": [None, None, None, out_c], "description": f"×{out_c}" },
            "config": { "axis": 3, "momentum": 0.99, "epsilon": 0.001 },
            "parameters": { "total": out_c * 4, "weights": out_c * 2, "biases": out_c * 2, "formula": "4 × channels", "calculationSteps": [] },
            "educationalNote": make_note("Normalizes second separable stage.", "Keeps representations normalized.", "Stabilizes updates.", "Normalizes features.")
        })
        connections.append({ "id": f"c_{s2_id}_{s2_bn}", "sourceId": s2_id, "targetId": s2_bn, "type": "sequential" })
        block_l_ids.append(s2_bn)
        
        pool_out_id = s2_bn
        if stride > 1:
            # Max Pooling
            pool_id = f"{block_prefix}pool"
            layers.append({
                "id": pool_id,
                "type": "max_pooling2d",
                "name": f"{block_name(block_prefix)}pool",
                "inputShape": { "dimensions": [None, None, None, out_c], "description": f"×{out_c}" },
                "outputShape": { "dimensions": [None, None, None, out_c], "description": f"×{out_c}" },
                "config": { "poolSize": [3, 3], "strides": [stride, stride], "padding": "same" },
                "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
                "educationalNote": make_note("Downsamples main block features.", "Filters representation spatially.", "Reduces computational scale.", "Reduces spatial dims.")
            })
            connections.append({ "id": f"c_{s2_bn}_{pool_id}", "sourceId": s2_bn, "targetId": pool_id, "type": "sequential" })
            block_l_ids.append(pool_id)
            pool_out_id = pool_id
            
        # Shortcut: 1x1 conv -> BN
        short_id = f"{block_prefix}shortcut"
        short_weights = in_c * out_c
        layers.append({
            "id": short_id,
            "type": "conv2d",
            "name": f"{block_name(block_prefix)}shortcut",
            "inputShape": { "dimensions": [None, None, None, in_c], "description": f"×{in_c}" },
            "outputShape": { "dimensions": [None, None, None, out_c], "description": f"×{out_c}" },
            "config": { "filters": out_c, "kernelSize": [1, 1], "strides": [stride, stride], "padding": "same", "useBias": False, "activation": "linear" },
            "parameters": { "total": short_weights, "weights": short_weights, "biases": 0, "formula": "input_channels × output_filters", "calculationSteps": [] },
            "educationalNote": make_note("Shortcut projection conv.", "Projects channels and sizes to match shapes.", "Prepares shapes for summation.", "Shortcut projection.")
        })
        block_l_ids.append(short_id)
        
        short_bn_id = f"{short_id}_bn"
        layers.append({
            "id": short_bn_id,
            "type": "batch_norm",
            "name": f"{block_name(block_prefix)}shortcut_bn",
            "inputShape": { "dimensions": [None, None, None, out_c], "description": f"×{out_c}" },
            "outputShape": { "dimensions": [None, None, None, out_c], "description": f"×{out_c}" },
            "config": { "axis": 3, "momentum": 0.99, "epsilon": 0.001 },
            "parameters": { "total": out_c * 4, "weights": out_c * 2, "biases": out_c * 2, "formula": "4 × channels", "calculationSteps": [] },
            "educationalNote": make_note("Normalizes shortcut.", "Restores normalization.", "Prevents shifts in skip path.", "Normalizes skip path.")
        })
        connections.append({ "id": f"c_{short_id}_{short_bn_id}", "sourceId": short_id, "targetId": short_bn_id, "type": "sequential" })
        block_l_ids.append(short_bn_id)
        
        # Add (Join)
        add_id = f"{block_prefix}add"
        layers.append({
            "id": add_id,
            "type": "add",
            "name": add_id,
            "inputShape": { "dimensions": [None, None, None, out_c], "description": f"{out_c} channels" },
            "outputShape": { "dimensions": [None, None, None, out_c], "description": f"{out_c} channels" },
            "config": {},
            "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
            "educationalNote": make_note("Residual sum.", "Adds main branch features directly to skip connection.", "Avoids vanishing gradients.", "Combines branches.")
        })
        connections.append({ "id": f"c_{pool_out_id}_{add_id}", "sourceId": pool_out_id, "targetId": add_id, "type": "sequential" })
        connections.append({ "id": f"c_{short_bn_id}_{add_id}", "sourceId": short_bn_id, "targetId": add_id, "type": "sequential" })
        block_l_ids.append(add_id)
        
        return block_l_ids, s1_id, short_id, add_id

    # Add Entry Flow Blocks: Block 2 (in=64, out=128), Block 3 (in=128, out=256), Block 4 (in=256, out=728)
    entry_blocks = [(2, 64, 128), (3, 128, 256), (4, 256, 728)]
    for b_idx, in_c, out_c in entry_blocks:
        b_l_ids, s1_id, short_id, add_id = add_xception_block(b_idx, in_c, out_c, stride=2)
        connections.append({ "id": f"c_{last_id}_{s1_id}", "sourceId": last_id, "targetId": s1_id, "type": "sequential" })
        connections.append({ "id": f"c_{last_id}_{short_id}", "sourceId": last_id, "targetId": short_id, "type": "skip" })
        
        groups.append({
            "id": f"group_block_{b_idx}",
            "name": f"Entry Flow Block {b_idx-1}",
            "description": "Applies stacked Separable Convolutions and projection skip connection.",
            "layerIds": b_l_ids,
            "color": "#F472B6"
        })
        last_id = add_id
        y_ptr += 350

    # Middle Flow Blocks (Block 5 to 12 repeats: identity skip blocks)
    # 8 blocks of 3 separable convolutions without max pooling and strides (in=728, out=728)
    for b_idx in range(5, 13):
        block_prefix = f"block{b_idx}_"
        block_l_ids = []
        
        prev_layer = last_id
        for s_idx in range(1, 4):
            s_weights = 3 * 3 * 728 + 728 * 728
            s_id = f"{block_prefix}sep{s_idx}"
            layers.append({
                "id": s_id,
                "type": "conv2d",
                "name": f"{block_name(block_prefix)}sep{s_idx}",
                "inputShape": { "dimensions": [None, None, None, 728], "description": "×728" },
                "outputShape": { "dimensions": [None, None, None, 728], "description": "×728" },
                "config": { "filters": 728, "kernelSize": [3, 3], "strides": [1, 1], "padding": "same", "useBias": False, "activation": "linear" },
                "parameters": { "total": s_weights, "weights": s_weights, "biases": 0, "formula": "Separable weights", "calculationSteps": [] },
                "educationalNote": make_note("Separable convolution.", "Deep middle flow convolving.", "Reduces parameter growth.", "Middle flow separable conv.")
            })
            connections.append({ "id": f"c_{prev_layer}_{s_id}", "sourceId": prev_layer, "targetId": s_id, "type": "sequential" })
            block_l_ids.append(s_id)
            
            s_bn = f"{s_id}_bn"
            layers.append({
                "id": s_bn,
                "type": "batch_norm",
                "name": f"{block_name(block_prefix)}sep{s_idx}_bn",
                "inputShape": { "dimensions": [None, None, None, 728], "description": "×728" },
                "outputShape": { "dimensions": [None, None, None, 728], "description": "×728" },
                "config": { "axis": 3, "momentum": 0.99, "epsilon": 0.001 },
                "parameters": { "total": 728 * 4, "weights": 728 * 2, "biases": 728 * 2, "formula": "4 × channels", "calculationSteps": [] },
                "educationalNote": make_note("Normalizes feature outputs.", "Balances activations.", "Stabilizes learning.", "Normalizes features.")
            })
            connections.append({ "id": f"c_{s_id}_{s_bn}", "sourceId": s_id, "targetId": s_bn, "type": "sequential" })
            block_l_ids.append(s_bn)
            
            s_act = f"{s_id}_act"
            layers.append({
                "id": s_act,
                "type": "activation",
                "name": f"{block_name(block_prefix)}sep{s_idx}_act",
                "inputShape": { "dimensions": [None, None, None, 728], "description": "×728" },
                "outputShape": { "dimensions": [None, None, None, 728], "description": "×728" },
                "config": { "activation": "relu" },
                "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
                "educationalNote": make_note("ReLU activation.", "Non-linear mapping.", "Stabilizes gradients.", "ReLU activation.")
            })
            connections.append({ "id": f"c_{s_bn}_{s_act}", "sourceId": s_bn, "targetId": s_act, "type": "sequential" })
            block_l_ids.append(s_act)
            prev_layer = s_act
            
        # Add (Join with identity shortcut)
        add_id = f"{block_prefix}add"
        layers.append({
            "id": add_id,
            "type": "add",
            "name": add_id,
            "inputShape": { "dimensions": [None, None, None, 728], "description": "728 channels" },
            "outputShape": { "dimensions": [None, None, None, 728], "description": "728 channels" },
            "config": {},
            "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
            "educationalNote": make_note("Identity residual addition.", "Adds block output to block input directly.", "Bypasses representations.", "Identity sum.")
        })
        connections.append({ "id": f"c_{prev_layer}_{add_id}", "sourceId": prev_layer, "targetId": add_id, "type": "sequential" })
        connections.append({ "id": f"c_{last_id}_{add_id}", "sourceId": last_id, "targetId": add_id, "type": "skip" })
        block_l_ids.append(add_id)
        
        groups.append({
            "id": f"group_block_{b_idx}",
            "name": f"Middle Flow Block {b_idx-4}",
            "description": "Applies repeated Separable Convolutions and identity skip connection.",
            "layerIds": block_l_ids,
            "color": "#3B82F6"
        })
        
        last_id = add_id
        y_ptr += 350

    # GAP & Predictions
    layers.append({
        "id": "global_average_pooling2d",
        "type": "global_average_pooling2d",
        "name": "global_average_pooling2d",
        "inputShape": { "dimensions": [None, 10, 10, 2048], "description": "10×10×2048" },
        "outputShape": { "dimensions": [None, 2048], "description": "2048" },
        "config": {},
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": make_note("GAP averaging channels.", "Averages feature dimensions spatially.", "Saves parameters size.", "Spatially collapses maps.")
    })
    connections.append({ "id": "c_last_gap", "sourceId": last_id, "targetId": "global_average_pooling2d", "type": "sequential" })
    y_ptr += 120

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

# 4. NASNET MOBILE & LARGE GENERATOR
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
        "educationalNote": make_note("Input layer receiving normalized RGB matrices.", f"Image dimensions of {res}x{res}.", "Sets image bounds.", "Sets bounds.")
    })
    y_ptr += 120

    # Stem Conv
    stem_conv_id = "stem_conv1"
    stem_weights = 3 * 3 * 3 * stem_filters
    layers.append({
        "id": stem_conv_id,
        "type": "conv2d",
        "name": stem_conv_id,
        "inputShape": { "dimensions": [None, res, res, 3], "description": f"{res}×{res}×3" },
        "outputShape": { "dimensions": [None, res // 2, res // 2, stem_filters], "description": f"{res // 2}×{res // 2}×{stem_filters}" },
        "config": { "filters": stem_filters, "kernelSize": [3, 3], "strides": [2, 2], "padding": "same", "useBias": False, "activation": "linear" },
        "parameters": { "total": stem_weights, "weights": stem_weights, "biases": 0, "formula": "kernel_height × kernel_width × input_channels × output_filters", "calculationSteps": [] },
        "educationalNote": make_note("Stem downsampling convolution.", "Reduces resolution spatially.", "Reduces computing footprint.", "Downsamples stem features.")
    })
    connections.append({ "id": "c_in_stemconv", "sourceId": "input_1", "targetId": stem_conv_id, "type": "sequential" })
    y_ptr += 120

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
    y_ptr += 120

    # Helper function to generate cell nodes programmatically (Normal/Reduction block loop)
    # We will generate cell blocks loop dynamically to build up depth!
    # For NASNet, we repeat cells. Each cell contains normal or reduction topology.
    # We can programmatically loop cell blocks.
    last_id = stem_bn_id
    current_filters = stem_filters

    total_cells = cell_repeats * 3 + 2 # cell_repeats blocks, separated by 2 reduction cells
    
    # We will build cell instances loop
    for cell_idx in range(1, total_cells + 1):
        is_reduction = (cell_idx in [cell_repeats + 1, cell_repeats * 2 + 2])
        block_prefix = f"cell_{cell_idx}_"
        cell_l_ids = []
        
        # Determine cell output filters
        if is_reduction:
            out_filters = current_filters * 2
        else:
            out_filters = current_filters
            
        # Parallel Branch 1: SepConv 3x3
        br1_weights = 3 * 3 * current_filters + current_filters * out_filters
        br1_id = f"{block_prefix}sep3x3"
        layers.append({
            "id": br1_id,
            "type": "conv2d",
            "name": f"{block_name(block_prefix)}sep3x3",
            "inputShape": { "dimensions": [None, None, None, current_filters], "description": f"×{current_filters}" },
            "outputShape": { "dimensions": [None, None, None, out_filters], "description": f"×{out_filters}" },
            "config": { "filters": out_filters, "kernelSize": [3, 3], "strides": [2 if is_reduction else 1, 2 if is_reduction else 1], "padding": "same", "useBias": False, "activation": "linear" },
            "parameters": { "total": br1_weights, "weights": br1_weights, "biases": 0, "formula": "Separable weights", "calculationSteps": [] },
            "educationalNote": make_note("Separable 3x3 conv discovered by NAS.", "Processes features spatially without channel mixing.", "Controls parameter overhead.", "Separable 3x3 conv.")
        })
        connections.append({ "id": f"c_{last_id}_{br1_id}", "sourceId": last_id, "targetId": br1_id, "type": "skip" })
        cell_l_ids.append(br1_id)
        
        # Parallel Branch 2: SepConv 5x5
        br2_weights = 5 * 5 * current_filters + current_filters * out_filters
        br2_id = f"{block_prefix}sep5x5"
        layers.append({
            "id": br2_id,
            "type": "conv2d",
            "name": f"{block_name(block_prefix)}sep5x5",
            "inputShape": { "dimensions": [None, None, None, current_filters], "description": f"×{current_filters}" },
            "outputShape": { "dimensions": [None, None, None, out_filters], "description": f"×{out_filters}" },
            "config": { "filters": out_filters, "kernelSize": [5, 5], "strides": [2 if is_reduction else 1, 2 if is_reduction else 1], "padding": "same", "useBias": False, "activation": "linear" },
            "parameters": { "total": br2_weights, "weights": br2_weights, "biases": 0, "formula": "Separable weights", "calculationSteps": [] },
            "educationalNote": make_note("Separable 5x5 conv discovered by NAS.", "Large spatial receptive field convolving.", "Captures wider contexts.", "Separable 5x5 conv.")
        })
        connections.append({ "id": f"c_{last_id}_{br2_id}", "sourceId": last_id, "targetId": br2_id, "type": "skip" })
        cell_l_ids.append(br2_id)
        
        # Add combiner
        add_id = f"{block_prefix}add"
        layers.append({
            "id": add_id,
            "type": "add",
            "name": add_id,
            "inputShape": { "dimensions": [None, None, None, out_filters], "description": f"{out_filters} channels" },
            "outputShape": { "dimensions": [None, None, None, out_filters], "description": f"{out_filters} channels" },
            "config": {},
            "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
            "educationalNote": make_note("Combiner summing parallel cell branches.", "Adds separable convolution paths.", "Combines spatial representations.", "Residual summation.")
        })
        connections.append({ "id": f"c_br1_{add_id}", "sourceId": br1_id, "targetId": add_id, "type": "sequential" })
        connections.append({ "id": f"c_br2_{add_id}", "sourceId": br2_id, "targetId": add_id, "type": "sequential" })
        cell_l_ids.append(add_id)
        
        groups.append({
            "id": f"group_cell_{cell_idx}",
            "name": f"NASNet {'Reduction' if is_reduction else 'Normal'} Cell {cell_idx}",
            "description": "Combines parallel separable convolutions (3x3 and 5x5) discovered via automated architecture search.",
            "layerIds": cell_l_ids,
            "color": "#06B6D4" if not is_reduction else "#EF4444"
        })
        
        last_id = add_id
        current_filters = out_filters
        y_ptr += 300

    # GAP & Predictions
    gap_filters = current_filters * 6
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
    y_ptr += 120

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
