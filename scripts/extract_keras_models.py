import json
import os
import sys

try:
    import tensorflow as tf
except ImportError:
    print("Warning: tensorflow is not installed. This script requires tensorflow to run.")

MODEL_BUILDERS = {
    "VGG16": lambda: tf.keras.applications.VGG16(weights=None, include_top=True),
    "ResNet50": lambda: tf.keras.applications.ResNet50(weights=None, include_top=True),
    # Add other Keras applications as needed
}

def summarize_model(model):
    layers = []
    for layer in model.layers:
        # Resolve inbound nodes for graph connections
        inbound_nodes = []
        if hasattr(layer, '_inbound_nodes') and layer._inbound_nodes:
            for node in layer._inbound_nodes:
                inbound_layers = node.inbound_layers
                if not isinstance(inbound_layers, list):
                    inbound_layers = [inbound_layers]
                for il in inbound_layers:
                    inbound_nodes.append(il.name)
        
        layers.append({
            "name": layer.name,
            "class_name": layer.__class__.__name__,
            "config": layer.get_config(),
            "input_shape": layer.input_shape if hasattr(layer, 'input_shape') else None,
            "output_shape": layer.output_shape if hasattr(layer, 'output_shape') else None,
            "inbound_nodes": inbound_nodes
        })
    return {
        "name": model.name,
        "input_shape": model.input_shape,
        "output_shape": model.output_shape,
        "num_params": int(model.count_params()),
        "layers": layers,
    }

def main():
    if 'tf' not in globals():
        print("TensorFlow not available. Cannot extract models.")
        sys.exit(1)
        
    out_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
    os.makedirs(out_dir, exist_ok=True)
    
    raw = {}
    for name, fn in MODEL_BUILDERS.items():
        print(f"Extracting {name} from Keras...")
        try:
            model = fn()
            raw[name.lower()] = summarize_model(model)
            print(f"Successfully extracted {name}")
        except Exception as e:
            print(f"Failed to extract {name}: {e}")
            
    out_path = os.path.join(out_dir, "models_raw.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(raw, f, indent=2)
    print(f"Raw models written to {out_path}")

if __name__ == "__main__":
    main()
