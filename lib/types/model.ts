import { Layer } from './layer';

export interface ImageShape {
  channels: number;
  height: number;
  width: number;
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'sequential' | 'skip' | 'concatenate' | 'add';  // Connections for ResNet/DenseNet
  label?: string;
}

export interface LayerGroup {
  id: string;
  name: string;
  description: string;
  layerIds: string[];
  color: string;
}

export interface Architecture {
  layers: Layer[];
  connections: Connection[];          // Explicit edges between layers
  groups: LayerGroup[];               // Named groups (e.g. "Conv Block 1")
}

export interface NeuralNetworkModel {
  id: string;                         // "vgg16", "resnet50", "densenet121"
  name: string;                       // "VGG16"
  fullName: string;                   // "Very Deep Convolutional Networks for Large-Scale Image Recognition"
  paperYear: number;                  // 2014
  authors: string[];                  // ["Karen Simonyan", "Andrew Zisserman"]
  paperUrl: string;                   // arXiv / paper link
  docsUrl?: string;                   // API documentation link
  depth: number;                      // Number of layers with weights (e.g., 16 for VGG16)
  totalParameters: number;            // Total trainable parameters
  trainableParameters?: number;       // Total trainable parameters
  nonTrainableParameters?: number;    // Total non-trainable parameters
  totalFLOPs: number;                 // Total FLOPs (approximate)
  inputShape: ImageShape;             // { channels: 3, height: 224, width: 224 }
  top1Accuracy: number;               // ImageNet top-1 accuracy (0-1)
  top5Accuracy: number;               // ImageNet top-5 accuracy (0-1)
  memoryUsage: number;                // Approximate inference memory (MB)
  description: string;                // Short educational summary
  tags: string[];                     // ["cnn", "classification", "imagenet"]
  colorTheme: string;                 // Primary color theme (hex)
  architecture: Architecture;
}
