import os
import json
import re

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
    return "Other"

def main():
    lib_data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "lib", "data"))
    out_data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
    out_graphs_dir = os.path.join(out_data_dir, "graphs")
    
    os.makedirs(out_data_dir, exist_ok=True)
    os.makedirs(out_graphs_dir, exist_ok=True)
    
    print(f"Reading existing model definitions from {lib_data_dir}...")
    
    models_summary = []
    models_raw = {}
    
    # Read files in lib/data
    for filename in sorted(os.listdir(lib_data_dir)):
        if not filename.endswith(".json") or filename == "model.schema.json":
            continue
            
        file_path = os.path.join(lib_data_dir, filename)
        with open(file_path, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
            except Exception as e:
                print(f"Error loading {filename}: {e}")
                continue
                
        model_id = data.get("id")
        if not model_id:
            continue
            
        print(f"Processing model: {model_id}")
        
        # 1. Add to models summary list
        # Map values according to the requested data/models.json schema and original ModelMetadata
        category = data.get("category") or get_category_from_id(model_id)
        summary = {
            "id": model_id,
            "name": data.get("name"),
            "fullName": data.get("fullName", data.get("name")),
            "family": category,
            "category": category,
            "efficiency": data.get("efficiency", "balanced"),
            "year": data.get("paperYear"),
            "paperYear": data.get("paperYear"),
            "releaseYear": data.get("releaseYear", data.get("paperYear")),
            "authors": data.get("authors"),
            "tags": data.get("tags"),
            "params": data.get("totalParameters"),
            "totalParameters": data.get("totalParameters"),
            "top1": data.get("top1Accuracy") * 100 if data.get("top1Accuracy", 0) < 1 else data.get("top1Accuracy", 0),
            "top1Accuracy": data.get("top1Accuracy", 0),
            "top5": data.get("top5Accuracy") * 100 if data.get("top5Accuracy", 0) < 1 else data.get("top5Accuracy", 0),
            "top5Accuracy": data.get("top5Accuracy", 0),
            "memory_mb": data.get("memoryUsage"),
            "memoryUsage": data.get("memoryUsage"),
            "flops": data.get("totalFLOPs"),
            "totalFLOPs": data.get("totalFLOPs"),
            "depth": data.get("depth"),
            "paperUrl": data.get("paperUrl"),
            "colorTheme": data.get("colorTheme"),
            "docsUrl": f"https://www.tensorflow.org/api_docs/python/tf/keras/applications/{data.get('name').replace(' ', '')}",
            "description": data.get("description")
        }

        models_summary.append(summary)
        
        # 2. Extract layers for models_raw.json
        raw_layers = []
        for l in data.get("architecture", {}).get("layers", []):
            # Map type to Keras class_name
            class_name = l.get("type")
            if class_name == "conv2d":
                class_name = "Conv2D"
            elif class_name == "batch_norm":
                class_name = "BatchNormalization"
            elif class_name == "activation":
                class_name = "Activation"
            elif class_name == "max_pooling2d":
                class_name = "MaxPooling2D"
            elif class_name == "average_pooling2d":
                class_name = "AveragePooling2D"
            elif class_name == "global_average_pooling2d":
                class_name = "GlobalAveragePooling2D"
            elif class_name == "flatten":
                class_name = "Flatten"
            elif class_name == "dense":
                class_name = "Dense"
            elif class_name == "dropout":
                class_name = "Dropout"
            elif class_name == "input":
                class_name = "InputLayer"
            else:
                class_name = class_name.capitalize() if class_name else "Layer"
                
            raw_layers.append({
                "name": l.get("id"),
                "class_name": class_name,
                "config": {
                    "filters": l.get("config", {}).get("filters"),
                    "kernel_size": l.get("config", {}).get("kernelSize"),
                    "strides": l.get("config", {}).get("strides"),
                    "padding": l.get("config", {}).get("padding"),
                    "activation": l.get("config", {}).get("activation"),
                    "use_bias": l.get("config", {}).get("useBias"),
                    "units": l.get("config", {}).get("units"),
                    "rate": l.get("config", {}).get("rate"),
                    "pool_size": l.get("config", {}).get("poolSize")
                },
                "output_shape": l.get("outputShape", {}).get("dimensions", []),
                "input_shape": l.get("inputShape", {}).get("dimensions", []),
                "parameters": l.get("parameters"),
                "educationalNote": l.get("educationalNote")
            })
            
        models_raw[model_id] = {
            "name": data.get("name"),
            "input_shape": [None, 224, 224, 3],
            "output_shape": [None, 1000],
            "num_params": data.get("totalParameters"),
            "layers": raw_layers
        }
        
        # 3. Create graph topology json file: data/graphs/<model_id>.json
        # Format nodes and edges in detailed structure, and store groups
        nodes = []
        for l in data.get("architecture", {}).get("layers", []):
            # Find group of this layer
            group_id = None
            for g in data.get("architecture", {}).get("groups", []):
                if l.get("id") in g.get("layerIds", []):
                    group_id = g.get("id")
                    break
                    
            label = l.get("name")
            if l.get("type") == "conv2d" and l.get("config", {}).get("kernelSize"):
                k = l.get("config", {}).get("kernelSize")
                f = l.get("config", {}).get("filters")
                label = f"Conv {k[0]}x{k[1]}, {f}"
            elif l.get("type") == "input":
                label = f"Input (224x224x3)"
                
            nodes.append({
                "id": l.get("id"),
                "label": label,
                "type": l.get("type"),
                "groupId": group_id,
                "outputShape": l.get("outputShape", {}).get("dimensions", []),
                "config": l.get("config", {}),
                "parameters": l.get("parameters"),
                "position": l.get("position", {"x": 250, "y": 0})
            })
            
        edges = []
        for conn in data.get("architecture", {}).get("connections", []):
            edges.append({
                "id": conn.get("id"),
                "source": conn.get("sourceId"),
                "target": conn.get("targetId"),
                "type": conn.get("type", "sequential")
            })
            
        # Grouped view logic (simple topology)
        # Create macro-nodes representing the blocks/groups
        grouped_nodes = []
        grouped_edges = []
        
        groups_data = data.get("architecture", {}).get("groups", [])
        for idx, g in enumerate(groups_data):
            # Calculate average position of layers in group
            layer_positions = [l.get("position") for l in data.get("architecture", {}).get("layers", []) if l.get("id") in g.get("layerIds", []) and l.get("position")]
            x = sum(pos["x"] for pos in layer_positions) / len(layer_positions) if layer_positions else 250
            y = sum(pos["y"] for pos in layer_positions) / len(layer_positions) if layer_positions else idx * 200
            
            grouped_nodes.append({
                "id": g.get("id"),
                "label": g.get("name"),
                "type": "group_node",
                "description": g.get("description"),
                "color": g.get("color"),
                "position": {"x": x, "y": y},
                "layerIds": g.get("layerIds", [])
            })
            
        # Determine edges between groups
        # If there's an edge from a layer in group A to a layer in group B, create an edge from group A to group B
        group_connections = {}
        for conn in data.get("architecture", {}).get("connections", []):
            src_group = None
            tgt_group = None
            for g in groups_data:
                if conn.get("sourceId") in g.get("layerIds", []):
                    src_group = g.get("id")
                if conn.get("targetId") in g.get("layerIds", []):
                    tgt_group = g.get("id")
            if src_group and tgt_group and src_group != tgt_group:
                pair = (src_group, tgt_group)
                conn_type = conn.get("type", "sequential")
                # Prioritize skip or non-sequential links if they exist between these groups
                if pair not in group_connections or conn_type in ['skip', 'concatenate', 'add']:
                    group_connections[pair] = conn_type
                
        for (s, t), t_type in group_connections.items():
            grouped_edges.append({
                "id": f"c_{s}_{t}",
                "source": s,
                "target": t,
                "type": t_type
            })

            
        graph_data = {
            "nodes": nodes,
            "edges": edges,
            "groups": groups_data,
            "groupedNodes": grouped_nodes,
            "groupedEdges": grouped_edges
        }
        
        with open(os.path.join(out_graphs_dir, f"{model_id}.json"), "w", encoding="utf-8") as gf:
            json.dump(graph_data, gf, indent=2)
            
    # Save models.json and models_raw.json
    with open(os.path.join(out_data_dir, "models.json"), "w", encoding="utf-8") as f:
        json.dump(models_summary, f, indent=2)
    with open(os.path.join(out_data_dir, "models_raw.json"), "w", encoding="utf-8") as f:
        json.dump(models_raw, f, indent=2)
        
    print("Data directory initialization successfully completed!")

if __name__ == "__main__":
    main()
