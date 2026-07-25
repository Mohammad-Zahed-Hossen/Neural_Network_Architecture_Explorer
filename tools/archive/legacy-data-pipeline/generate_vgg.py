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

# Conv Block helper
def add_conv_relu(layers, connections, id_str, name_str, f_in, f_out, x, y):
    conv_weights = 3 * 3 * f_in * f_out
    bias = f_out
    total_params = conv_weights + bias

    layers.append({
        "id": id_str,
        "type": "conv2d",
        "name": name_str,
        "inputShape": { "dimensions": [None, None, None, f_in], "description": f"×{f_in}" },
        "outputShape": { "dimensions": [None, None, None, f_out], "description": f"×{f_out}" },
        "config": {
            "filters": f_out,
            "kernelSize": [3, 3],
            "strides": [1, 1],
            "padding": "same",
            "useBias": True,
            "activation": "relu"
        },
        "parameters": {
            "total": total_params,
            "weights": conv_weights,
            "biases": bias,
            "formula": "(kernel_height × kernel_width × input_channels + 1) × output_filters",
            "calculationSteps": [
                { "label": "Kernel Weights", "expression": f"3 × 3 × {f_in} × {f_out}", "result": conv_weights, "explanation": f"{f_out} kernels of size 3x3 convolving over {f_in} channels." },
                { "label": "Biases", "expression": f"{f_out}", "result": bias, "explanation": "One learnable bias parameter per filter." },
                { "label": "Total Parameters", "expression": f"{conv_weights} + {bias}", "result": total_params, "explanation": "Sum of weights and biases." }
            ]
        },
        "educationalNote": make_note(
            f"3x3 convolution layer with {f_out} filters.",
            f"Slides {f_out} filters across input features to extract local patterns (like curves and edges).",
            "Foundational feature extraction step.",
            "Extracts local spatial representations."
        ),
        "position": { "x": x, "y": y },
        "color": "blue",
        "icon": "layers"
    })

def generate_vgg(model_id, name, fullName, depth, totalParameters, totalFLOPs, top1Accuracy, top5Accuracy, memoryUsage, description, block_convs):
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
        "educationalNote": make_note(
            "Retinal layer receiving raw RGB pixel matrices.",
            "Accepts normalized three-channel RGB images of size 224x224. This spatial standardization ensures weight compatibility in subsequent fully connected layers.",
            "Establishes spatial dimensions for the model.",
            "Fixed input sizes are critical to prevent spatial alignment errors."
        ),
        "position": { "x": 250, "y": y_ptr },
        "color": "emerald",
        "icon": "image"
    })
    y_ptr += 150

    last_id = "input_1"

    # We iterate over the conv block counts
    # block_convs: list of tuples (filters, conv_count)
    block_filters = [64, 128, 256, 512, 512]
    
    for block_idx, conv_count in enumerate(block_convs):
        filters = block_filters[block_idx]
        block_layer_ids = []
        
        for c_idx in range(conv_count):
            layer_id = f"block{block_idx + 1}_conv{c_idx + 1}"
            layer_name = f"block{block_idx + 1}_conv{c_idx + 1}"
            
            # Input channels calculation
            if block_idx == 0 and c_idx == 0:
                f_in = 3
            elif c_idx == 0:
                f_in = block_filters[block_idx - 1]
            else:
                f_in = filters
                
            add_conv_relu(layers, connections, layer_id, layer_name, f_in, filters, 250, y_ptr)
            connections.append({ "id": f"c_{last_id}_{layer_id}", "sourceId": last_id, "targetId": layer_id, "type": "sequential" })
            block_layer_ids.append(layer_id)
            last_id = layer_id
            y_ptr += 150
            
        # Add Pooling layer
        pool_id = f"block{block_idx + 1}_pool"
        layers.append({
            "id": pool_id,
            "type": "max_pooling2d",
            "name": f"block{block_idx + 1}_pool",
            "inputShape": { "dimensions": [None, None, None, filters], "description": f"×{filters}" },
            "outputShape": { "dimensions": [None, None, None, filters], "description": f"×{filters}" },
            "config": { "poolSize": [2, 2], "strides": [2, 2], "padding": "valid" },
            "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
            "educationalNote": make_note(
                "Halves spatial resolution while retaining peak features.",
                "Slides a 2x2 window with stride 2 over each feature map, outputting the maximum value in that cell. Downsamples resolution, decreasing compute while preserving dominant signals.",
                "Introduces spatial translation invariance.",
                "Pooling achieves downsampling and feature invariance with zero learnable parameters."
            ),
            "position": { "x": 250, "y": y_ptr },
            "color": "amber",
            "icon": "shrink"
        })
        connections.append({ "id": f"c_{last_id}_{pool_id}", "sourceId": last_id, "targetId": pool_id, "type": "sequential" })
        block_layer_ids.append(pool_id)
        last_id = pool_id
        y_ptr += 150
        
        # Add block group
        groups.append({
            "id": f"group_b{block_idx + 1}",
            "name": f"Conv Block {block_idx + 1}",
            "description": f"{conv_count}x convolutions with {filters} filters",
            "layerIds": block_layer_ids,
            "color": "#3B82F6" if block_idx % 2 == 0 else "#2563EB"
        })

    # Flatten
    flatten_id = "flatten"
    layers.append({
        "id": flatten_id,
        "type": "flatten",
        "name": "flatten",
        "inputShape": { "dimensions": [None, 7, 7, 512], "description": "7×7×512" },
        "outputShape": { "dimensions": [None, 25088], "description": "25088" },
        "config": {},
        "parameters": { "total": 0, "weights": 0, "biases": 0, "formula": "None", "calculationSteps": [] },
        "educationalNote": make_note(
            "Unrolls spatial features into a 1D vector.",
            "Converts the 3D tensor of shape 7x7x512 into a single vector of length 25088. This step transitions the model from spatial feature mapping to multi-class classification reasoning.",
            "Bridges local convolutions and dense classifiers.",
            "Flattening discards spatial dimensions while preserving the raw activation vector."
        ),
        "position": { "x": 250, "y": y_ptr },
        "color": "orange",
        "icon": "flatten"
    })
    connections.append({ "id": f"c_{last_id}_{flatten_id}", "sourceId": last_id, "targetId": flatten_id, "type": "sequential" })
    last_id = flatten_id
    y_ptr += 150

    # FC1
    fc1_id = "fc1"
    fc1_weights = 25088 * 4096
    fc1_bias = 4096
    fc1_total = fc1_weights + fc1_bias
    layers.append({
        "id": fc1_id,
        "type": "dense",
        "name": "fc1",
        "inputShape": { "dimensions": [None, 25088], "description": "25088" },
        "outputShape": { "dimensions": [None, 4096], "description": "4096" },
        "config": { "units": 4096, "activation": "relu", "useBias": True },
        "parameters": {
            "total": fc1_total,
            "weights": fc1_weights,
            "biases": fc1_bias,
            "formula": "(input_features + 1) × output_units",
            "calculationSteps": [
                { "label": "Fully Connected Weights", "expression": "25088 × 4096", "result": fc1_weights, "explanation": "Every input element is connected to all 4096 output units via a learnable weight." },
                { "label": "Biases", "expression": "4096", "result": fc1_bias, "explanation": "One bias term per output unit." },
                { "label": "Total Parameters", "expression": f"{fc1_weights} + {fc1_bias}", "result": fc1_total, "explanation": "Combined weights and biases." }
            ]
        },
        "educationalNote": make_note(
            "First dense layer containing 102.7M parameters.",
            "This single layer accounts for over 70% of VGG's total parameter count. It performs global visual reasoning across the entire set of flattened features, determining how parts relate to classes.",
            "The massive parameter footprint of this transition is why modern models prefer Global Average Pooling over Flattening.",
            "Fully connected layers contain the majority of standard CNN parameters."
        ),
        "position": { "x": 250, "y": y_ptr },
        "color": "violet",
        "icon": "key"
    })
    connections.append({ "id": f"c_{last_id}_{fc1_id}", "sourceId": last_id, "targetId": fc1_id, "type": "sequential" })
    last_id = fc1_id
    y_ptr += 150

    # FC2
    fc2_id = "fc2"
    fc2_weights = 4096 * 4096
    fc2_bias = 4096
    fc2_total = fc2_weights + fc2_bias
    layers.append({
        "id": fc2_id,
        "type": "dense",
        "name": "fc2",
        "inputShape": { "dimensions": [None, 4096], "description": "4096" },
        "outputShape": { "dimensions": [None, 4096], "description": "4096" },
        "config": { "units": 4096, "activation": "relu", "useBias": True },
        "parameters": {
            "total": fc2_total,
            "weights": fc2_weights,
            "biases": fc2_bias,
            "formula": "(input_features + 1) × output_units",
            "calculationSteps": [
                { "label": "Fully Connected Weights", "expression": "4096 × 4096", "result": fc2_weights, "explanation": "Every unit from FC1 is connected to all 4096 units of FC2." },
                { "label": "Biases", "expression": "4096", "result": fc2_bias, "explanation": "One bias term per output unit." },
                { "label": "Total Parameters", "expression": f"{fc2_weights} + {fc2_bias}", "result": fc2_total, "explanation": "Combined weights and biases." }
            ]
        },
        "educationalNote": make_note(
            "Second dense layer representing high-level semantic abstractions.",
            "Performs further non-linear mapping on the 4096-dimensional global visual representations, building high-level classification templates.",
            "Deep fully connected layers learn abstract visual classification features.",
            "Refines global visual representations."
        ),
        "position": { "x": 250, "y": y_ptr },
        "color": "violet",
        "icon": "key"
    })
    connections.append({ "id": f"c_{last_id}_{fc2_id}", "sourceId": last_id, "targetId": fc2_id, "type": "sequential" })
    last_id = fc2_id
    y_ptr += 150

    # Predictions
    pred_id = "predictions"
    pred_weights = 4096 * 1000
    pred_bias = 1000
    pred_total = pred_weights + pred_bias
    layers.append({
        "id": pred_id,
        "type": "dense",
        "name": "predictions",
        "inputShape": { "dimensions": [None, 4096], "description": "4096" },
        "outputShape": { "dimensions": [None, 1000], "description": "1000" },
        "config": { "units": 1000, "activation": "softmax", "useBias": True },
        "parameters": {
            "total": pred_total,
            "weights": pred_weights,
            "biases": pred_bias,
            "formula": "(input_features + 1) × output_units",
            "calculationSteps": [
                { "label": "Fully Connected Weights", "expression": "4096 × 1000", "result": pred_weights, "explanation": "Every unit from FC2 is connected to the 1000 final output class units." },
                { "label": "Biases", "expression": "1000", "result": pred_bias, "explanation": "One bias term per classification class." },
                { "label": "Total Parameters", "expression": f"{pred_weights} + {pred_bias}", "result": pred_total, "explanation": "Combined weights and biases." }
            ]
        },
        "educationalNote": make_note(
            "Softmax classification output layer.",
            "The final network stage. Converts learned features into a probability distribution over 1000 ImageNet categories.",
            "Provides interpretable confidence scores representing the model's decisions.",
            "Softmax maps outputs to a valid probability distribution that sums to 1."
        ),
        "position": { "x": 250, "y": y_ptr },
        "color": "violet",
        "icon": "key"
    })
    connections.append({ "id": f"c_{last_id}_{pred_id}", "sourceId": last_id, "targetId": pred_id, "type": "sequential" })

    # Add classifier group
    groups.append({
        "id": "classifier",
        "name": "Classifier",
        "description": "Flatten and fully connected classification head",
        "layerIds": [flatten_id, fc1_id, fc2_id, pred_id],
        "color": "#1D4ED8"
    })

    model_data = {
        "id": model_id,
        "name": name,
        "fullName": fullName,
        "paperYear": 2014,
        "authors": ["Karen Simonyan", "Andrew Zisserman"],
        "paperUrl": "https://arxiv.org/abs/1409.1556",
        "depth": depth,
        "totalParameters": totalParameters,
        "totalFLOPs": totalFLOPs,
        "inputShape": { "channels": 3, "height": 224, "width": 224 },
        "top1Accuracy": top1Accuracy,
        "top5Accuracy": top5Accuracy,
        "memoryUsage": memoryUsage,
        "description": description,
        "colorTheme": "#3B82F6" if model_id == "vgg16" else "#2563EB",
        "tags": ["CNN", "Classification", "Sequential", "ImageNet"],
        "architecture": {
            "layers": layers,
            "connections": connections,
            "groups": groups
        }
    }
    write_json(os.path.join(os.path.dirname(__file__), f"{model_id}.json"), model_data)


if __name__ == "__main__":
    print("Generating VGG16...")
    generate_vgg(
        "vgg16", "VGG16", "Very Deep Convolutional Networks for Large-Scale Image Recognition",
        16, 138357544, 15300000000, 0.713, 0.901, 528,
        "VGG16 is a classic CNN architecture characterized by its homogeneous stacks of 3x3 convolutions and 2x2 max pooling. Its simple, linear design demonstrates how stacking small convolutions can build powerful deep visual descriptors.",
        [2, 2, 3, 3, 3]
    )

    print("\nGenerating VGG19...")
    generate_vgg(
        "vgg19", "VGG19", "Very Deep Convolutional Networks for Large-Scale Image Recognition (19-layer)",
        19, 143667240, 19600000000, 0.715, 0.903, 549,
        "VGG19 is the 19-layer variant of the classic VGG series, adding extra convolutional layers to Blocks 3, 4, and 5. This deep stack of small 3x3 filters further expands the network's receptive fields and feature representation capabilities.",
        [2, 2, 4, 4, 4]
    )

    print("\nAll generations completed!")
