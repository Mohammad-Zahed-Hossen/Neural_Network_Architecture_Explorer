import os
import json

def get_category_from_id(model_id):
    model_id_lower = model_id.lower()
    if model_id_lower.startswith("vgg"):
        return "VGG"
    elif model_id_lower.startswith("resnet"):
        return "ResNet"
    elif model_id_lower.startswith("densenet"):
        return "DenseNet"
    elif model_id_lower.startswith("mobilenet"):
        return "MobileNet"
    elif model_id_lower.startswith("inception"):
        return "Inception"
    elif model_id_lower.startswith("xception"):
        return "Xception"
    elif model_id_lower.startswith("efficientnet"):
        return "EfficientNet"
    elif model_id_lower.startswith("nasnet"):
        return "NASNet"
    elif model_id_lower.startswith("lenet") or model_id_lower.startswith("alexnet"):
        return "Foundational"
    elif model_id_lower.startswith("vit") or model_id_lower.startswith("swin") or model_id_lower.startswith("convnext") or model_id_lower.startswith("maxvit"):
        return "Transformer"
    return "Other"

# Manual metadata for accuracy, FLOPs, memory (MB) which aren't inside tf.keras structures
MANUAL_METADATA = {
    "vgg16": {
        "family": "VGG",
        "category": "VGG",
        "year": 2014,
        "authors": ["Karen Simonyan", "Andrew Zisserman"],
        "tags": ["CNN", "Classification", "Sequential", "ImageNet"],
        "top1": 71.3,
        "top1Accuracy": 0.713,
        "top5": 90.1,
        "top5Accuracy": 0.901,
        "memory_mb": 528,
        "memoryUsage": 528,
        "flops": 15.3e9,
        "totalFLOPs": 15.3e9,
        "depth": 16,
        "colorTheme": "#3B82F6",
        "paperUrl": "https://arxiv.org/abs/1409.1556",
        "description": "A classic sequential architecture using homogeneous stacks of 3x3 convolutions and max pooling."
    },
    "resnet50": {
        "family": "ResNet",
        "category": "ResNet",
        "year": 2015,
        "authors": ["Kaiming He", "Xiangyu Zhang", "Shaoqing Ren", "Jian Sun"],
        "tags": ["CNN", "Classification", "Residual", "ImageNet"],
        "top1": 74.9,
        "top1Accuracy": 0.749,
        "top5": 92.1,
        "top5Accuracy": 0.921,
        "memory_mb": 98,
        "memoryUsage": 98,
        "flops": 4.1e9,
        "totalFLOPs": 4.1e9,
        "depth": 50,
        "colorTheme": "#10B981",
        "paperUrl": "https://arxiv.org/abs/1512.03385",
        "description": "Introduced residual (skip) connections to mitigate vanishing gradients, allowing deep layers."
    }
}

def clean_shape(shape):
    if not shape:
        return []
    # If Keras returns a list of shapes, take the first one
    if isinstance(shape[0], list):
        shape = shape[0]
    return [None if x is None else int(x) for x in shape]

def main():
    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
    raw_path = os.path.join(data_dir, "models_raw.json")
    
    if not os.path.exists(raw_path):
        print(f"Error: {raw_path} not found. Please run Keras raw extraction first.")
        return
        
    with open(raw_path, "r", encoding="utf-8") as f:
        raw_data = json.load(f)
        
    os.makedirs(os.path.join(data_dir, "graphs"), exist_ok=True)
    
    models_summary = []
    
    for model_id, model_raw in raw_data.items():
        print(f"Processing raw model structure for {model_id}...")
        meta = MANUAL_METADATA.get(model_id, {
            "family": get_category_from_id(model_id),
            "category": get_category_from_id(model_id),
            "year": 2020,
            "authors": ["Unknown"],
            "tags": ["CNN"],
            "top1": 70.0,
            "top1Accuracy": 0.70,
            "top5": 90.0,
            "top5Accuracy": 0.90,
            "memory_mb": 100,
            "memoryUsage": 100,
            "flops": 1.0e9,
            "totalFLOPs": 1.0e9,
            "depth": len(model_raw.get("layers", [])),
            "colorTheme": "#64748B",
            "paperUrl": "",
            "description": "Custom neural network architecture."
        })
        
        # 1. Summary info
        summary = {
            "id": model_id,
            "name": model_raw.get("name"),
            "family": meta["family"],
            "category": meta["category"],
            "year": meta["year"],
            "paperYear": meta["year"],
            "releaseYear": meta.get("releaseYear", meta["year"]),
            "authors": meta["authors"],
            "tags": meta["tags"],
            "params": model_raw.get("num_params", 0),
            "totalParameters": model_raw.get("num_params", 0),
            "top1": meta["top1"],
            "top1Accuracy": meta["top1Accuracy"],
            "top5": meta["top5"],
            "top5Accuracy": meta["top5Accuracy"],
            "memory_mb": meta["memory_mb"],
            "memoryUsage": meta["memoryUsage"],
            "flops": meta["flops"],
            "totalFLOPs": meta["flops"],
            "depth": meta["depth"],
            "paperUrl": meta["paperUrl"],
            "colorTheme": meta["colorTheme"],
            "docsUrl": f"https://www.tensorflow.org/api_docs/python/tf/keras/applications/{model_raw.get('name')}",
            "description": meta["description"]
        }
        models_summary.append(summary)
        
        # 2. Graph topology
        nodes = []
        edges = []
        
        # Simple heuristic mapping to groups (Stem, Blocks, Classifier)
        groups = [
            {"id": "stem", "name": "Input Stem", "description": "Stem layers downsampling the high-resolution input", "layerIds": [], "color": meta["colorTheme"]},
            {"id": "blocks", "name": "Feature Blocks", "description": "Core convolutional block feature extractors", "layerIds": [], "color": meta["colorTheme"]},
            {"id": "classifier", "name": "Classifier Head", "description": "Global pooling and classification output layers", "layerIds": [], "color": meta["colorTheme"]}
        ]
        
        layers = model_raw.get("layers", [])
        num_layers = len(layers)
        
        for idx, l in enumerate(layers):
            layer_id = l["name"]
            class_name = l["class_name"].lower()
            
            # Determine group
            if idx < 5:
                group_id = "stem"
            elif idx > num_layers - 4:
                group_id = "classifier"
            else:
                group_id = "blocks"
                
            for g in groups:
                if g["id"] == group_id:
                    g["layerIds"].append(layer_id)
                    
            # Set node type representation
            node_type = "conv2d"
            if "pool" in class_name:
                node_type = "max_pooling2d"
            elif "input" in class_name:
                node_type = "input"
            elif "dense" in class_name:
                node_type = "dense"
            elif "batchnorm" in class_name or "normalization" in class_name:
                node_type = "batch_norm"
            elif "activation" in class_name or "relu" in class_name:
                node_type = "activation"
            elif "flatten" in class_name:
                node_type = "flatten"
            elif "add" in class_name:
                node_type = "add"
            elif "concat" in class_name:
                node_type = "concatenate"
                
            # Node coordinate positions
            x = 250
            y = idx * 160
            
            # Stagger branch items slightly to make graph readable if inbound layers are side-by-side
            inbound = l.get("inbound_nodes", [])
            if len(inbound) > 1:
                # Add node branch layout details
                pass
                
            label = l["name"]
            config = l.get("config", {})
            if "conv" in class_name and config.get("kernel_size"):
                k = config.get("kernel_size")
                f = config.get("filters")
                label = f"Conv {k[0]}x{k[1]}, {f}"
            elif "input" in class_name:
                label = "Input (224x224x3)"
                
            # Params calculations
            total_params = 0
            # Basic parameter estimator for summary calculation step details if not present
            # Conv: (kh * kw * cin + 1) * cout
            
            nodes.append({
                "id": layer_id,
                "label": label,
                "type": node_type,
                "groupId": group_id,
                "outputShape": clean_shape(l.get("output_shape")),
                "config": config,
                "parameters": {
                    "total": total_params,
                    "weights": total_params,
                    "biases": 0,
                    "formula": "",
                    "calculationSteps": []
                },
                "position": {"x": x, "y": y}
            })
            
            # Connections
            for src in inbound:
                edges.append({
                    "id": f"c_{src}_{layer_id}",
                    "source": src,
                    "target": layer_id,
                    "type": "skip" if "add" in class_name and src != layers[idx-1]["name"] else "sequential"
                })
                
            # Add simple sequential edge if no inbound connections explicitly provided (fallback sequential)
            if idx > 0 and not inbound:
                prev_id = layers[idx-1]["name"]
                edges.append({
                    "id": f"c_{prev_id}_{layer_id}",
                    "source": prev_id,
                    "target": layer_id,
                    "type": "sequential"
                })
                
        # Simple macro grouped nodes/edges
        grouped_nodes = []
        grouped_edges = []
        for idx, g in enumerate(groups):
            grouped_nodes.append({
                "id": g["id"],
                "label": g["name"],
                "type": "group_node",
                "description": g["description"],
                "color": g["color"],
                "position": {"x": 250, "y": idx * 250},
                "layerIds": g["layerIds"]
            })
        for idx in range(len(groups) - 1):
            grouped_edges.append({
                "id": f"c_{groups[idx]['id']}_{groups[idx+1]['id']}",
                "source": groups[idx]["id"],
                "target": groups[idx+1]["id"],
                "type": "sequential"
            })
            
        graph_data = {
            "nodes": nodes,
            "edges": edges,
            "groups": groups,
            "groupedNodes": grouped_nodes,
            "groupedEdges": grouped_edges
        }
        
        with open(os.path.join(data_dir, "graphs", f"{model_id}.json"), "w", encoding="utf-8") as gf:
            json.dump(graph_data, gf, indent=2)
            
    # Write summary
    with open(os.path.join(data_dir, "models.json"), "w", encoding="utf-8") as f:
        json.dump(models_summary, f, indent=2)
        
    print("Process successfully finished. Models data files generated.")

if __name__ == "__main__":
    main()
