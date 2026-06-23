#!/usr/bin/env python3
import os
import json
import re
import shutil
from datetime import datetime

def clean_url(url):
    # Strip trailing punctuation often captured by simple regexes
    url = url.rstrip(".,;)'\">]}")
    return url

def validate_url(url):
    # Basic syntax check allowing localhost
    pattern = re.compile(r"^https?://(localhost(:\d+)?|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(:\d+)?(/.*)?$")
    return bool(pattern.match(url))

def get_receptive_field_details(model_id):
    # Some extra metadata for reports
    receptive_fields = {
        "lenet": "32x32",
        "alexnet": "224x224",
        "vgg16": "224x224",
        "vgg19": "224x224",
        "resnet50": "224x224",
        "resnet50v2": "224x224",
        "densenet121": "224x224",
        "mobilenet": "224x224",
        "mobilenetv2": "224x224",
        "efficientnetb0": "224x224",
        "efficientnetb7": "600x600",
        "vit": "224x224",
        "swin": "224x224",
        "convnext": "224x224",
        "maxvit": "224x224",
    }
    return receptive_fields.get(model_id, "224x224")

def parse_architecture_patterns(file_path):
    """
    Parses PATTERNS array from architecture-patterns/page.tsx using regex.
    """
    if not os.path.exists(file_path):
        return []
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Locate the PATTERNS array start
    patterns_match = re.search(r"const PATTERNS:\s*PatternInfo\[\]\s*=\s*\[([\s\S]*?)\]\s*;\s*\n", content)
    if not patterns_match:
        # Fallback to general search if TSX variable layout differs slightly
        patterns_match = re.search(r"const PATTERNS\s*=\s*\[([\s\S]*?)\]\s*;\s*\n", content)
        if not patterns_match:
            return []
            
    patterns_str = patterns_match.group(1)
    
    # Find all pattern blocks: { ... }
    # Since blocks contain sub-braces (e.g. tradeoffs), we use a balance-brace parser
    pattern_blocks = []
    brace_count = 0
    in_string = False
    string_char = ""
    current_block = []
    
    for i, char in enumerate(patterns_str):
        if char in ["'", '"', '`'] and (i == 0 or patterns_str[i-1] != "\\"):
            if not in_string:
                in_string = True
                string_char = char
            elif string_char == char:
                in_string = False
        
        if not in_string:
            if char == "{":
                brace_count += 1
            elif char == "}":
                brace_count -= 1
                if brace_count == 0:
                    current_block.append(char)
                    pattern_blocks.append("".join(current_block))
                    current_block = []
                    continue
        
        if brace_count > 0:
            current_block.append(char)
            
    parsed_patterns = []
    for block in pattern_blocks:
        # Extract fields using regex helpers
        pid = re.search(r"id:\s*['\"`](.*?)['\"`]", block)
        name = re.search(r"name:\s*['\"`](.*?)['\"`]", block)
        math = re.search(r"math:\s*['\"`](.*?)['\"`]", block)
        problem = re.search(r"problem:\s*['\"`](.*?)['\"`]", block)
        solution = re.search(r"solution:\s*['\"`](.*?)['\"`]", block)
        
        # Extract list of models
        models_match = re.search(r"models:\s*\[([\s\S]*?)\]", block)
        models = []
        if models_match:
            models = [m.strip().strip("'\"`") for m in models_match.group(1).split(",") if m.strip()]
            
        # Extract tradeoffs
        pros = []
        cons = []
        pros_match = re.search(r"pros:\s*\[([\s\S]*?)\]", block)
        if pros_match:
            # Match list elements separated by commas
            # Some items might stretch over multiple lines
            pros = [p.strip().strip("'\"`").replace("\\'", "'") for p in re.findall(r"['\"`](.*?)['\"`]\s*(?:,|$)", pros_match.group(1), re.DOTALL) if p.strip()]
        cons_match = re.search(r"cons:\s*\[([\s\S]*?)\]", block)
        if cons_match:
            cons = [c.strip().strip("'\"`").replace("\\'", "'") for c in re.findall(r"['\"`](.*?)['\"`]\s*(?:,|$)", cons_match.group(1), re.DOTALL) if c.strip()]
            
        parsed_patterns.append({
            "id": pid.group(1) if pid else "",
            "name": name.group(1) if name else "",
            "math": math.group(1) if math else "",
            "problem": problem.group(1) if problem else "",
            "solution": solution.group(1) if solution else "",
            "tradeoffs": {
                "pros": pros,
                "cons": cons
            },
            "models": models
        })
    return parsed_patterns

def parse_learning_paths(file_path):
    """
    Parses learningPaths array from learn/page.tsx using regex.
    """
    if not os.path.exists(file_path):
        return []
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    paths_match = re.search(r"const learningPaths\s*=\s*\[([\s\S]*?)\]\s*;\s*\n", content)
    if not paths_match:
        return []
        
    paths_str = paths_match.group(1)
    
    # Simple brace balance parsing
    path_blocks = []
    brace_count = 0
    in_string = False
    string_char = ""
    current_block = []
    
    for i, char in enumerate(paths_str):
        if char in ["'", '"', '`'] and (i == 0 or paths_str[i-1] != "\\"):
            if not in_string:
                in_string = True
                string_char = char
            elif string_char == char:
                in_string = False
                
        if not in_string:
            if char == "{":
                brace_count += 1
            elif char == "}":
                brace_count -= 1
                if brace_count == 0:
                    current_block.append(char)
                    path_blocks.append("".join(current_block))
                    current_block = []
                    continue
                    
        if brace_count > 0:
            current_block.append(char)
            
    parsed_paths = []
    for block in path_blocks:
        title = re.search(r"title:\s*['\"`](.*?)['\"`]", block)
        subtitle = re.search(r"subtitle:\s*['\"`](.*?)['\"`]", block)
        description = re.search(r"description:\s*['\"`](.*?)['\"`]", block)
        theme_color = re.search(r"themeColor:\s*['\"`](.*?)['\"`]", block)
        
        # Extract recommended models list
        models = []
        models_list_match = re.search(r"models:\s*\[([\s\S]*?)\]", block)
        if models_list_match:
            model_items_str = models_list_match.group(1)
            # Find sub-objects { id: '...', name: '...', desc: '...' }
            model_blocks = re.findall(r"\{\s*id:\s*['\"`](.*?)['\"`]\s*,\s*name:\s*['\"`](.*?)['\"`]\s*,\s*desc:\s*['\"`](.*?)['\"`]\s*\}", model_items_str)
            for item in model_blocks:
                models.append({
                    "id": item[0],
                    "name": item[1],
                    "desc": item[2]
                })
                
        parsed_paths.append({
            "title": title.group(1) if title else "",
            "subtitle": subtitle.group(1) if subtitle else "",
            "description": description.group(1) if description else "",
            "themeColor": theme_color.group(1) if theme_color else "",
            "models": models
        })
    return parsed_paths

def main():
    start_time = datetime.now()
    
    # Directory paths relative to script location
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    data_dir = os.path.join(base_dir, "data")
    lib_data_dir = os.path.join(base_dir, "lib", "data")
    out_dir = os.path.join(base_dir, "audit-package")
    
    # Subdirectories of audit-package
    subfolders = ["summary", "models", "papers", "graphs", "links", "educational", "reports"]
    
    print("=" * 60)
    print("      INITIALIZING AUDIT PACKAGE EXPORT SYSTEM")
    print("=" * 60)
    
    # 1. Clear and create output structure
    if os.path.exists(out_dir):
        print(f"Clearing existing directory: {out_dir}")
        shutil.rmtree(out_dir)
        
    for sub in subfolders:
        os.makedirs(os.path.join(out_dir, sub), exist_ok=True)
    print(f"Created clean audit package structure in: {out_dir}")
    
    # Warnings repository for validation
    warnings = []
    
    # ----------------------------------------------------
    # PHASE 1: Load Raw Models Data
    # ----------------------------------------------------
    print("\nScanning architecture models...")
    
    models_summary_list = []
    models_metadata_dict = {}
    
    # Read models.json summary database
    models_summary_path = os.path.join(data_dir, "models.json")
    if os.path.exists(models_summary_path):
        with open(models_summary_path, "r", encoding="utf-8") as f:
            models_summary_list = json.load(f)
    else:
        warnings.append("[VAL_ERR] Main models.json file is missing from data directory.")
        
    # Check for duplicate model IDs in database
    model_ids = [m.get("id") for m in models_summary_list if m.get("id")]
    duplicate_models = set([x for x in model_ids if model_ids.count(x) > 1])
    for dup in duplicate_models:
        warnings.append(f"[DUP_ERR] Duplicate model ID '{dup}' detected in models.json database.")
        
    # Load detailed models from lib/data/*.json
    detailed_models = {}
    if os.path.exists(lib_data_dir):
        for filename in sorted(os.listdir(lib_data_dir)):
            if not filename.endswith(".json") or filename == "model.schema.json":
                continue
            file_path = os.path.join(lib_data_dir, filename)
            with open(file_path, "r", encoding="utf-8") as f:
                try:
                    model_data = json.load(f)
                    mid = model_data.get("id")
                    if mid:
                        detailed_models[mid] = model_data
                except Exception as e:
                    warnings.append(f"[JSON_ERR] Failed to load JSON from '{filename}': {str(e)}")
                    
    # Validate missing metadata & build normalized models
    normalized_models_count = 0
    total_layers_sum = 0
    total_params_sum = 0
    
    for summary in models_summary_list:
        mid = summary.get("id")
        if not mid:
            warnings.append(f"[SLUG_ERR] Model missing 'id' attribute in models.json")
            continue
            
        detailed = detailed_models.get(mid)
        if not detailed:
            warnings.append(f"[REF_ERR] Detailed file '{mid}.json' is missing in lib/data/ for model summary ID '{mid}'")
            # Create a stub detailed mapping from summary
            detailed = {
                "id": mid,
                "name": summary.get("name"),
                "fullName": summary.get("fullName"),
                "paperYear": summary.get("paperYear"),
                "authors": summary.get("authors"),
                "paperUrl": summary.get("paperUrl"),
                "depth": summary.get("depth", 0),
                "totalParameters": summary.get("totalParameters", 0),
                "totalFLOPs": summary.get("totalFLOPs", 0),
                "inputShape": {"channels": 3, "height": 224, "width": 224},
                "top1Accuracy": summary.get("top1Accuracy", 0),
                "top5Accuracy": summary.get("top5Accuracy", 0),
                "memoryUsage": summary.get("memoryUsage", 0),
                "description": summary.get("description", ""),
                "colorTheme": summary.get("colorTheme", "#3B82F6"),
                "tags": summary.get("tags", []),
                "architecture": {"layers": [], "connections": [], "groups": []}
            }
            
        # Metadata validation
        if not summary.get("top1Accuracy") and not summary.get("top1"):
            warnings.append(f"[META_ERR] Model '{mid}' has missing or zero Top-1 Accuracy.")
        if not summary.get("totalParameters") and not summary.get("params"):
            warnings.append(f"[META_ERR] Model '{mid}' has missing or zero parameters.")
        if not summary.get("depth"):
            warnings.append(f"[META_ERR] Model '{mid}' has missing or zero weight layer depth.")
            
        # Extract layers count
        layers = detailed.get("architecture", {}).get("layers", [])
        connections = detailed.get("architecture", {}).get("connections", [])
        
        # Validate connections pointing to valid layers
        layer_ids = {l.get("id") for l in layers if l.get("id")}
        for conn in connections:
            cid = conn.get("id", "unnamed_connection")
            source = conn.get("sourceId")
            target = conn.get("targetId")
            if source not in layer_ids:
                warnings.append(f"[REF_ERR] Model '{mid}': Connection '{cid}' sourceId '{source}' does not exist in layers list.")
            if target not in layer_ids:
                warnings.append(f"[REF_ERR] Model '{mid}': Connection '{cid}' targetId '{target}' does not exist in layers list.")
                
        # Build layer maps for incoming & outgoing connections
        incoming_map = {}
        outgoing_map = {}
        for conn in connections:
            src = conn.get("sourceId")
            tgt = conn.get("targetId")
            if src and tgt:
                outgoing_map.setdefault(src, []).append(tgt)
                incoming_map.setdefault(tgt, []).append(src)
                
        # Format layers with computed connection attributes
        normalized_layers = []
        for l in layers:
            lid = l.get("id")
            if not lid:
                warnings.append(f"[SLUG_ERR] Layer missing 'id' field in model '{mid}'")
                continue
                
            normalized_layers.append({
                "layerId": lid,
                "layerName": l.get("name", lid),
                "layerType": l.get("type", "unknown"),
                "inputShape": l.get("inputShape", {}),
                "outputShape": l.get("outputShape", {}),
                "parameters": l.get("parameters", {}),
                "hyperparameters": l.get("config", {}),
                "connections": {
                    "incoming": incoming_map.get(lid, []),
                    "outgoing": outgoing_map.get(lid, [])
                },
                "educationalNotes": l.get("educationalNote", {})
            })
            
        # Total sums for reports
        total_layers_sum += len(normalized_layers)
        total_params_sum += detailed.get("totalParameters", 0)
        
        # Normalize model schema
        norm_model = {
            "modelName": detailed.get("name"),
            "architectureFamily": detailed.get("category", summary.get("category", "Other")),
            "publicationYear": detailed.get("paperYear"),
            "inputShape": detailed.get("inputShape", {}),
            "totalParameters": detailed.get("totalParameters", 0),
            "trainableParameters": detailed.get("totalParameters", 0), # Trainable = Total in these architectures
            "FLOPs": detailed.get("totalFLOPs", 0),
            "MACs": detailed.get("totalFLOPs", 0) // 2 if detailed.get("totalFLOPs") else 0,
            "top1Accuracy": detailed.get("top1Accuracy", 0),
            "top5Accuracy": detailed.get("top5Accuracy", 0),
            "layerCount": len(normalized_layers),
            "layers": normalized_layers
        }
        
        # Save model JSON file: audit-package/models/<model_id>.json
        model_out_path = os.path.join(out_dir, "models", f"{mid}.json")
        with open(model_out_path, "w", encoding="utf-8") as out_f:
            json.dump(norm_model, out_f, indent=2)
        normalized_models_count += 1
        
    print(f"Exported {normalized_models_count} architecture models to audit-package/models/.")
    
    # Save architectural-summary.json
    arch_summary_list = []
    for summary in models_summary_list:
        mid = summary.get("id")
        detailed = detailed_models.get(mid, {})
        arch_summary_list.append({
            "modelId": mid,
            "name": summary.get("name"),
            "family": summary.get("category"),
            "year": summary.get("paperYear"),
            "totalParameters": summary.get("totalParameters"),
            "totalFLOPs": summary.get("totalFLOPs"),
            "top1Accuracy": summary.get("top1Accuracy"),
            "layerCount": len(detailed.get("architecture", {}).get("layers", []))
        })
    with open(os.path.join(out_dir, "summary", "architecture-summary.json"), "w", encoding="utf-8") as out_f:
        json.dump(arch_summary_list, out_f, indent=2)
        
    # ----------------------------------------------------
    # PHASE 2: Load Graphs and Compile Topology Metadata
    # ----------------------------------------------------
    print("Compiling graph topologies...")
    
    graph_index = {}
    topology_metadata = {}
    graphs_src_dir = os.path.join(data_dir, "graphs")
    
    total_nodes_sum = 0
    total_edges_sum = 0
    
    if os.path.exists(graphs_src_dir):
        for filename in sorted(os.listdir(graphs_src_dir)):
            if not filename.endswith(".json"):
                continue
            model_id = filename[:-5]
            src_graph_path = os.path.join(graphs_src_dir, filename)
            
            with open(src_graph_path, "r", encoding="utf-8") as gf:
                try:
                    graph_data = json.load(gf)
                except Exception as e:
                    warnings.append(f"[JSON_ERR] Failed to load graph JSON from '{filename}': {str(e)}")
                    continue
                    
            nodes = graph_data.get("nodes", [])
            edges = graph_data.get("edges", [])
            groups = graph_data.get("groups", [])
            
            node_ids = [n.get("id") for n in nodes if n.get("id")]
            edge_defs = [{"id": e.get("id"), "source": e.get("source"), "target": e.get("target"), "type": e.get("type", "sequential")} for e in edges]
            
            # Identify skip & dense connections
            skip_conns = [e for e in edge_defs if e.get("type") in ["skip", "add"]]
            dense_conns = [e for e in edge_defs if e.get("type") in ["concatenate", "dense"]]
            
            # Check for orphaned nodes (degree = 0)
            degree_map = {nid: 0 for nid in node_ids}
            for e in edge_defs:
                src = e.get("source")
                tgt = e.get("target")
                if src in degree_map:
                    degree_map[src] += 1
                if tgt in degree_map:
                    degree_map[tgt] += 1
            
            # Single-node models or inputs/outputs can be degree 1. Only report isolated degree 0 nodes
            orphans = [nid for nid, deg in degree_map.items() if deg == 0]
            for o in orphans:
                warnings.append(f"[GRAPH_ERR] Node '{o}' in graph '{model_id}' is isolated/orphaned with zero connections.")
                
            # Collect topology metadata
            topology_metadata[model_id] = {
                "nodeCount": len(nodes),
                "edgeCount": len(edges),
                "nodeIds": node_ids,
                "edgeDefinitions": edge_defs,
                "skipConnections": {
                    "count": len(skip_conns),
                    "connections": skip_conns
                },
                "denseConnections": {
                    "count": len(dense_conns),
                    "connections": dense_conns
                },
                "graphMetadata": {
                    "groupCount": len(groups),
                    "receptiveField": get_receptive_field_details(model_id)
                }
            }
            
            # Register in graph index
            graph_index[model_id] = f"graphs/{filename}"
            
            total_nodes_sum += len(nodes)
            total_edges_sum += len(edges)
            
            # Write graph file copy to audit package
            dest_graph_path = os.path.join(out_dir, "graphs", filename)
            with open(dest_graph_path, "w", encoding="utf-8") as out_gf:
                json.dump(graph_data, out_gf, indent=2)
                
    else:
        warnings.append("[VAL_ERR] Source graphs directory 'data/graphs' is missing.")
        
    with open(os.path.join(out_dir, "graphs", "graph-index.json"), "w", encoding="utf-8") as out_f:
        json.dump(graph_index, out_f, indent=2)
    with open(os.path.join(out_dir, "graphs", "topology-metadata.json"), "w", encoding="utf-8") as out_f:
        json.dump(topology_metadata, out_f, indent=2)
        
    print(f"Processed graph topology for {len(topology_metadata)} models.")
    
    # ----------------------------------------------------
    # PHASE 3: Scan Research Paper Metadata
    # ----------------------------------------------------
    print("Compiling research papers...")
    
    papers_src_path = os.path.join(data_dir, "papers.json")
    papers_raw_list = []
    
    if os.path.exists(papers_src_path):
        with open(papers_src_path, "r", encoding="utf-8") as f:
            papers_raw_list = json.load(f)
    else:
        warnings.append("[VAL_ERR] Source papers.json is missing.")
        
    # Check duplicate paper titles
    paper_titles = [p.get("title") for p in papers_raw_list if p.get("title")]
    duplicate_papers = set([x for x in paper_titles if paper_titles.count(x) > 1])
    for dup in duplicate_papers:
        warnings.append(f"[DUP_ERR] Duplicate paper title '{dup}' detected in papers.json database.")
        
    # Normalize paper summaries
    paper_index = {}
    normalized_papers = []
    
    for paper in papers_raw_list:
        pid = paper.get("id")
        if not pid:
            warnings.append("[SLUG_ERR] Research paper entry is missing an 'id' attribute.")
            continue
            
        url = paper.get("paperUrl", "")
        is_arxiv = "arxiv.org" in url.lower()
        
        # Construct complete description
        summary_text = (
            f"Problem Solved: {paper.get('problem', 'N/A')}\n"
            f"Significance: {paper.get('relevance', 'N/A')}"
        )
        
        norm_paper = {
            "title": paper.get("title"),
            "authors": paper.get("authors", []),
            "publicationYear": paper.get("year"),
            "doi": None, # Default to null as per spec, since raw data doesn't have it
            "arXivLink": url if is_arxiv else None,
            "officialUrl": url,
            "summary": summary_text,
            "keyContributions": paper.get("contribution"),
            "strengths": paper.get("strengths", []),
            "weaknesses": paper.get("weaknesses", []),
            "legacy": paper.get("legacy")
        }
        normalized_papers.append(norm_paper)
        
        # Build index mapping model IDs to this paper
        for mid in paper.get("modelIds", []):
            paper_index[mid] = pid
            
    with open(os.path.join(out_dir, "papers", "paper-summaries.json"), "w", encoding="utf-8") as out_f:
        json.dump(normalized_papers, out_f, indent=2)
    with open(os.path.join(out_dir, "papers", "paper-index.json"), "w", encoding="utf-8") as out_f:
        json.dump(paper_index, out_f, indent=2)
        
    # Save paper-summary.json
    paper_summary_list = []
    for paper in papers_raw_list:
        paper_summary_list.append({
            "paperId": paper.get("id"),
            "title": paper.get("title"),
            "year": paper.get("year"),
            "authors": paper.get("authors", []),
            "modelCount": len(paper.get("modelIds", []))
        })
    with open(os.path.join(out_dir, "summary", "paper-summary.json"), "w", encoding="utf-8") as out_f:
        json.dump(paper_summary_list, out_f, indent=2)
        
    print(f"Exported {len(normalized_papers)} research papers details.")
    
    # ----------------------------------------------------
    # PHASE 4: Compile Educational Content
    # ----------------------------------------------------
    print("Compiling educational resources...")
    
    # Compile layer-level notes
    layer_notes = {}
    for mid, detailed in detailed_models.items():
        layers = detailed.get("architecture", {}).get("layers", [])
        model_notes = {}
        for l in layers:
            lid = l.get("id")
            note = l.get("educationalNote")
            if lid and note:
                model_notes[lid] = note
        if model_notes:
            layer_notes[mid] = model_notes
            
    with open(os.path.join(out_dir, "educational", "educational-notes.json"), "w", encoding="utf-8") as out_f:
        json.dump(layer_notes, out_f, indent=2)
        
    # Compile patterns and paths from code page.tsx files
    patterns_src_path = os.path.join(base_dir, "app", "architecture-patterns", "page.tsx")
    learning_paths_src_path = os.path.join(base_dir, "app", "learn", "page.tsx")
    
    patterns_data = parse_architecture_patterns(patterns_src_path)
    learning_paths = parse_learning_paths(learning_paths_src_path)
    
    with open(os.path.join(out_dir, "educational", "architecture-patterns.json"), "w", encoding="utf-8") as out_f:
        json.dump(patterns_data, out_f, indent=2)
    with open(os.path.join(out_dir, "educational", "learning-paths.json"), "w", encoding="utf-8") as out_f:
        json.dump(learning_paths, out_f, indent=2)
        
    # Export Advisor Data
    advisor_src_path = os.path.join(data_dir, "advisor.json")
    advisor_data = {}
    if os.path.exists(advisor_src_path):
        with open(advisor_src_path, "r", encoding="utf-8") as f:
            advisor_data = json.load(f)
            
        with open(os.path.join(out_dir, "educational", "advisor-data.json"), "w", encoding="utf-8") as out_f:
            json.dump(advisor_data, out_f, indent=2)
    else:
        warnings.append("[VAL_ERR] Source advisor.json is missing.")
        
    # Export Timeline data (from evolution.json)
    evolution_src_path = os.path.join(data_dir, "evolution.json")
    evolution_data = []
    if os.path.exists(evolution_src_path):
        with open(evolution_src_path, "r", encoding="utf-8") as f:
            evolution_data = json.load(f)
        with open(os.path.join(out_dir, "educational", "timeline-data.json"), "w", encoding="utf-8") as out_f:
            json.dump(evolution_data, out_f, indent=2)
    else:
        warnings.append("[VAL_ERR] Source evolution.json is missing.")
        
    print("Compiled architectural patterns, advisor database, study pathways, and layer definitions notes.")
    
    # ----------------------------------------------------
    # PHASE 5: Walk Workspace and Extract URLs
    # ----------------------------------------------------
    print("Scanning codebase for links and external sources...")
    
    extracted_links = []
    seen_links = set()
    url_pattern = re.compile(r"https?://[a-zA-Z0-9./?=&_#%-]+")
    
    # Walk relevant source folders
    exclude_dirs = [".git", ".next", "node_modules", "out", "audit-package"]
    
    for root, dirs, files in os.walk(base_dir):
        # Exclude directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            # Only scan source/docs files
            if not file.endswith((".json", ".tsx", ".ts", ".md", ".css", ".js")):
                continue
                
            file_path = os.path.join(root, file)
            rel_file_path = os.path.relpath(file_path, base_dir).replace("\\", "/")
            
            with open(file_path, "r", encoding="utf-8", errors="ignore") as sf:
                for line_idx, line in enumerate(sf, 1):
                    matches = url_pattern.findall(line)
                    for match in matches:
                        url = clean_url(match)
                        if not url:
                            continue
                            
                        # Format checking
                        if not validate_url(url):
                            warnings.append(f"[LINK_ERR] Syntactically invalid link '{url}' in {rel_file_path}:L{line_idx}")
                            
                        # Unique check per URL + file
                        seen_key = (url, rel_file_path)
                        if seen_key in seen_links:
                            continue
                        seen_links.add(seen_key)
                        
                        # Heuristic Categorizer
                        url_lower = url.lower()
                        context_cleaned = line.strip().replace("\"", "'")
                        category = "External Sources"
                        
                        if any(dom in url_lower for dom in ["arxiv.org", "neurips.cc", "thecvf.com", "nature.com", "yann.lecun"]):
                            category = "Research Papers"
                        elif any(dom in url_lower for dom in ["tensorflow.org", "pytorch.org", "nextjs.org", "react.dev", "reactjs.org", "npmjs.com", "eslint.org"]) or "/api_docs/" in url_lower:
                            category = "Documentation"
                        elif any(dom in url_lower for dom in ["distill.pub", "towardsdatascience", "medium.com"]):
                            category = "Educational Resources"
                        elif "github.com" in url_lower or "wikipedia.org" in url_lower:
                            category = "References"
                            
                        extracted_links.append({
                            "url": url,
                            "sourceFile": rel_file_path,
                            "category": category,
                            "context": f"Line {line_idx}: {context_cleaned[:120]}..." if len(context_cleaned) > 120 else f"Line {line_idx}: {context_cleaned}"
                        })
                        
    # Filter specific lists
    paper_links = [l for l in extracted_links if l.get("category") == "Research Papers"]
    doc_links = [l for l in extracted_links if l.get("category") == "Documentation"]
    
    with open(os.path.join(out_dir, "links", "all-links.json"), "w", encoding="utf-8") as out_f:
        json.dump(extracted_links, out_f, indent=2)
    with open(os.path.join(out_dir, "links", "paper-links.json"), "w", encoding="utf-8") as out_f:
        json.dump(paper_links, out_f, indent=2)
    with open(os.path.join(out_dir, "links", "documentation-links.json"), "w", encoding="utf-8") as out_f:
        json.dump(doc_links, out_f, indent=2)
        
    # Write summary links
    links_summary = {
        "totalUniqueLinks": len(extracted_links),
        "categories": {
            "Research Papers": len(paper_links),
            "Documentation": len(doc_links),
            "References": len([l for l in extracted_links if l.get("category") == "References"]),
            "Educational Resources": len([l for l in extracted_links if l.get("category") == "Educational Resources"]),
            "External Sources": len([l for l in extracted_links if l.get("category") == "External Sources"])
        }
    }
    with open(os.path.join(out_dir, "summary", "links-summary.json"), "w", encoding="utf-8") as out_f:
        json.dump(links_summary, out_f, indent=2)
        
    print(f"Scanned source codes and found {len(extracted_links)} unique links context entries.")
    
    # ----------------------------------------------------
    # PHASE 6: Compile Statistics
    # ----------------------------------------------------
    print("Generating project statistics summary...")
    
    statistics = {
        "totalModels": normalized_models_count,
        "totalLayersCount": total_layers_sum,
        "totalParametersRepresented": total_params_sum,
        "totalResearchPapers": len(normalized_papers),
        "totalExtractedLinks": len(extracted_links),
        "totalEducationalNotes": sum(len(notes) for notes in layer_notes.values()),
        "totalGraphNodes": total_nodes_sum,
        "totalGraphEdges": total_edges_sum,
        "exportTimestamp": datetime.utcnow().isoformat() + "Z"
    }
    
    with open(os.path.join(out_dir, "summary", "statistics.json"), "w", encoding="utf-8") as out_f:
        json.dump(statistics, out_f, indent=2)
        
    # Compile full project-summary.json
    project_summary = {
        "projectName": "Neural Network Architecture Explorer",
        "description": "An interactive, educational platform for visualizing and analyzing classic neural network architectures, layer parameters, topologies, and historical paper details.",
        "objective": "Provide deep-dive layer-by-layer insights, math equations, paper summaries, and hardware deployment advisor mappings.",
        "statistics": statistics,
        "advisor": advisor_data,
        "evolution": evolution_data
    }
    with open(os.path.join(out_dir, "summary", "project-summary.json"), "w", encoding="utf-8") as out_f:
        json.dump(project_summary, out_f, indent=2)
        
    # ----------------------------------------------------
    # PHASE 7: Generate Markdown Reports
    # ----------------------------------------------------
    print("\nGenerating human-readable Markdown reports...")
    
    # 1. model-statistics.md
    model_stats_path = os.path.join(out_dir, "reports", "model-statistics.md")
    with open(model_stats_path, "w", encoding="utf-8") as mf:
        mf.write("# Model Inventory & Statistics Report\n\n")
        mf.write("This report compiles a detailed inventory of the neural network architectures, tracking parameters, depth, computational costs, and accuracy benchmarks.\n\n")
        mf.write("## 1. Quantitative Performance Overview\n\n")
        mf.write("| Model ID | Model Name | Family | Depth | Parameters | FLOPs | MACs (approx) | Top-1 Acc | Top-5 Acc | Layers |\n")
        mf.write("| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |\n")
        for summary in sorted(models_summary_list, key=lambda x: x.get("id")):
            mid = summary.get("id")
            detailed = detailed_models.get(mid, {})
            flops = detailed.get("totalFLOPs", 0)
            macs = flops // 2 if flops else 0
            t1 = detailed.get("top1Accuracy", 0)
            t5 = detailed.get("top5Accuracy", 0)
            layer_count = len(detailed.get("architecture", {}).get("layers", []))
            
            mf.write(
                f"| `{mid}` | **{summary.get('name')}** | {summary.get('category')} | {detailed.get('depth', 0)} | "
                f"{detailed.get('totalParameters', 0):,} | {flops:,} | {macs:,} | "
                f"{t1:.1%} | {t5:.1%} | {layer_count} |\n"
            )
            
        # Layer distribution charts / breakdowns
        mf.write("\n## 2. Layer Type Aggregations across Dataset\n\n")
        layer_type_counts = {}
        for detailed in detailed_models.values():
            for l in detailed.get("architecture", {}).get("layers", []):
                ltype = l.get("type", "unknown")
                layer_type_counts[ltype] = layer_type_counts.get(ltype, 0) + 1
                
        mf.write("| Layer Type | Occurrences in Dataset | Percentage |\n")
        mf.write("| :--- | :---: | :---: |\n")
        total_layers = sum(layer_type_counts.values()) or 1
        for ltype, count in sorted(layer_type_counts.items(), key=lambda x: x[1], reverse=True):
            mf.write(f"| `{ltype}` | {count} | {count/total_layers:.1%} |\n")
            
    # 2. paper-statistics.md
    paper_stats_path = os.path.join(out_dir, "reports", "paper-statistics.md")
    with open(paper_stats_path, "w", encoding="utf-8") as pf:
        pf.write("# Research Papers Index & Summaries\n\n")
        pf.write("Detailed indexing of the papers behind neural network breakthroughs represented in the database.\n\n")
        pf.write("## 1. Chronological Breakthrough Timeline\n\n")
        for paper in sorted(papers_raw_list, key=lambda x: x.get("year", 0)):
            pf.write(f"### {paper.get('year')} — {paper.get('title')}\n\n")
            pf.write(f"- **Authors**: {', '.join(paper.get('authors', []))}\n")
            pf.write(f"- **Key Contribution**: {paper.get('contribution')}\n")
            pf.write(f"- **Linked models**: {', '.join([f'`{m}`' for m in paper.get('modelIds', [])])}\n")
            pf.write(f"- **URL**: [{paper.get('paperUrl')}]({paper.get('paperUrl')})\n\n")
            
            pf.write("**Strengths & Innovations**:\n")
            for s in paper.get("strengths", []):
                pf.write(f"- {s}\n")
            pf.write("\n**Weaknesses & Constraints**:\n")
            for w in paper.get("weaknesses", []):
                pf.write(f"- {w}\n")
            pf.write(f"\n**Historical Legacy**:\n{paper.get('legacy', 'N/A')}\n\n")
            pf.write("---\n\n")
            
    # 3. graph-statistics.md
    graph_stats_path = os.path.join(out_dir, "reports", "graph-statistics.md")
    with open(graph_stats_path, "w", encoding="utf-8") as gf:
        gf.write("# Graph Topologies & Connections Analysis\n\n")
        gf.write("Analyzes neural network graphs as mathematical node-link topologies, mapping size, bypass routes, and density.\n\n")
        gf.write("## 1. Node & Edge Volumes Table\n\n")
        gf.write("| Model ID | Nodes Count | Edges Count | Skip Connections | Dense Connections | Blocks/Groups | Input Size |\n")
        gf.write("| :--- | :---: | :---: | :---: | :---: | :---: | :---: |\n")
        for model_id, top in sorted(topology_metadata.items(), key=lambda x: x[0]):
            meta = top.get("graphMetadata", {})
            gf.write(
                f"| `{model_id}` | {top.get('nodeCount')} | {top.get('edgeCount')} | "
                f"{top.get('skipConnections', {}).get('count', 0)} | "
                f"{top.get('denseConnections', {}).get('count', 0)} | "
                f"{meta.get('groupCount', 0)} | `{meta.get('receptiveField', '224x224')}` |\n"
            )
            
        gf.write("\n## 2. Residual and Dense Connection Analysis\n\n")
        gf.write("Bypass routes (residual/skip sums and dense concatenations) are the primary driver of depth stability in modern backbones:\n\n")
        gf.write("- **DenseNet** variants contain the highest density of concatenation links, creating complete routing sub-graphs.\n")
        gf.write("- **ResNet** models employ identity additions, providing a linear skip highway bypass directly to initial input layers.\n")
        gf.write("- **Vision Transformers (ViT)** use standard self-attention routing, bypassing convolutional locality constraints entirely.\n")
        
    # 4. audit-overview.md
    audit_overview_path = os.path.join(out_dir, "reports", "audit-overview.md")
    quality_score = 100
    if len(warnings) > 0:
        # Subtract quality points depending on warnings
        quality_score = max(0, 100 - len(warnings) * 4)
        
    quality_rating = "Excellent (PASSED)"
    if quality_score < 70:
        quality_rating = "Critical issues found (FAILING)"
    elif quality_score < 90:
        quality_rating = "Minor issues found (WARNING)"
        
    with open(audit_overview_path, "w", encoding="utf-8") as of:
        of.write("# Audit Export Package Overview\n\n")
        of.write("This document summarizes the results of the Neural Network Architecture Explorer Audit Pipeline.\n\n")
        
        of.write("## 1. Export Statistics\n\n")
        of.write(f"- **Generation Timestamp**: {datetime.utcnow().isoformat()}Z\n")
        of.write(f"- **Total Exported Models**: {statistics['totalModels']}\n")
        of.write(f"- **Total Dataset Layers**: {statistics['totalLayersCount']:,}\n")
        of.write(f"- **Total Parameters Represented**: {statistics['totalParametersRepresented']:,}\n")
        of.write(f"- **Total Research Papers**: {statistics['totalResearchPapers']}\n")
        of.write(f"- **Total Links/URLs Extracted**: {statistics['totalExtractedLinks']}\n")
        of.write(f"- **Total Educational Note Records**: {statistics['totalEducationalNotes']}\n")
        of.write(f"- **Total Graph Nodes**: {statistics['totalGraphNodes']}\n")
        of.write(f"- **Total Graph Edges**: {statistics['totalGraphEdges']}\n\n")
        
        of.write("## 2. Extracted Link Categories Summary\n\n")
        of.write("| Link Category | Unique URL Occurrences |\n")
        of.write("| :--- | :---: |\n")
        for cat, count in links_summary.get("categories", {}).items():
            of.write(f"| {cat} | {count} |\n")
            
        of.write(f"\n## 3. Data Quality & Audit Report\n\n")
        of.write(f"- **Quality Score**: **{quality_score}/100**\n")
        of.write(f"- **Audit Verification Rating**: **{quality_rating}**\n\n")
        
        if len(warnings) == 0:
            of.write("> [!NOTE]\n")
            of.write("> **All integrity checks passed successfully! Zero quality warnings generated.**\n")
        else:
            of.write("### Validation Warnings Log:\n\n")
            of.write("Please inspect the warnings listed below to resolve data inconsistencies or broken references:\n\n")
            for warn in warnings:
                of.write(f"- `{warn}`\n")
                
    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds()
    
    print("\n" + "=" * 60)
    print("      AUDIT GENERATION COMPLETE (duration: %.2fs)" % duration)
    print("=" * 60)
    print(f"Data Quality Score: {quality_score}/100")
    print(f"Total Warnings: {len(warnings)}")
    print(f"Audit package generated successfully in: {out_dir}\n")
    
if __name__ == "__main__":
    main()
