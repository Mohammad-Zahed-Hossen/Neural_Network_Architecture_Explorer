import { SearchableEntity } from './types';
import { ModelSummary } from '@/lib/schema/model.schema';

interface PaperData {
  id: string;
  modelIds: string[];
  title: string;
  authors: string[];
  year: number;
  contribution: string;
  problem: string;
  strengths?: string[];
  weaknesses?: string[];
  legacy?: string;
  relevance?: string;
  paperUrl?: string;
}

interface EvolutionData {
  id: string;
  name: string;
  year: number;
  problem: string;
  innovation: string;
  keyIdea: string;
  advantages?: string[];
  limitations?: string[];
  legacy?: string;
  exampleModelId?: string;
}

// Educational Metadata Enriched Mappings
const MODEL_METADATA_MAP: Record<string, {
  aliases: string[];
  keywords: string[];
  patterns: string[];
  components: string[];
  applications: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}> = {
  lenet: {
    aliases: ['LeNet', 'LeNet-5', 'LeNet5', 'LeCun 1998'],
    keywords: ['pioneering', 'early cnn', 'handwritten digit', 'mnist', 'first cnn'],
    patterns: [],
    components: ['convolution', 'average pooling', 'dense', 'softmax'],
    applications: ['research', 'edge'],
    difficulty: 'Beginner',
  },
  alexnet: {
    aliases: ['AlexNet', 'Krizhevsky 2012', 'ImageNet 2012 Winner'],
    keywords: ['gpu acceleration', 'relu activation', 'dropout regularization', 'deep cnn breakthrough', 'imagenet'],
    patterns: [],
    components: ['convolution', 'max pooling', 'dense', 'dropout', 'relu'],
    applications: ['research'],
    difficulty: 'Beginner',
  },
  vgg11: {
    aliases: ['VGG11', 'VGG-11', 'Oxford VGG'],
    keywords: ['homogeneous 3x3 convolutions', 'small receptive field', 'deep network'],
    patterns: [],
    components: ['convolution', 'max pooling', 'dense'],
    applications: ['server', 'research'],
    difficulty: 'Beginner',
  },
  vgg13: {
    aliases: ['VGG13', 'VGG-13'],
    keywords: ['homogeneous 3x3 convolutions', 'deep network'],
    patterns: [],
    components: ['convolution', 'max pooling', 'dense'],
    applications: ['server', 'research'],
    difficulty: 'Beginner',
  },
  vgg16: {
    aliases: ['VGG16', 'VGG-16', 'Visual Geometry Group'],
    keywords: ['homogeneous 3x3 convolutions', 'transfer learning benchmark', 'feature extractor', 'deep cnn'],
    patterns: [],
    components: ['convolution', 'max pooling', 'dense'],
    applications: ['server', 'research'],
    difficulty: 'Beginner',
  },
  vgg19: {
    aliases: ['VGG19', 'VGG-19'],
    keywords: ['homogeneous 3x3 convolutions', 'deeper vgg variant', 'style transfer'],
    patterns: [],
    components: ['convolution', 'max pooling', 'dense'],
    applications: ['server', 'research'],
    difficulty: 'Beginner',
  },
  resnet18: {
    aliases: ['ResNet18', 'ResNet-18', 'Residual Network 18'],
    keywords: ['residual connection', 'skip connection', 'shortcut', 'lightweight resnet', 'basic block'],
    patterns: ['residual'],
    components: ['skip connection', 'convolution', 'batch norm'],
    applications: ['mobile', 'edge', 'general'],
    difficulty: 'Intermediate',
  },
  resnet34: {
    aliases: ['ResNet34', 'ResNet-34'],
    keywords: ['residual connection', 'skip connection', 'shortcut', 'basic block'],
    patterns: ['residual'],
    components: ['skip connection', 'convolution', 'batch norm'],
    applications: ['general', 'server'],
    difficulty: 'Intermediate',
  },
  resnet50: {
    aliases: ['ResNet50', 'ResNet-50', 'ResNet', 'Deep Residual Learning', 'Residual Network'],
    keywords: ['skip connection', 'shortcut mapping', 'bottleneck block', 'identity mapping', 'vanishing gradient', 'he initialization', 'imagenet benchmark'],
    patterns: ['residual'],
    components: ['skip connection', 'bottleneck', 'convolution', 'batch norm'],
    applications: ['server', 'research', 'general'],
    difficulty: 'Intermediate',
  },
  resnet101: {
    aliases: ['ResNet101', 'ResNet-101'],
    keywords: ['skip connection', 'shortcut mapping', 'bottleneck block', 'deep residual network'],
    patterns: ['residual'],
    components: ['skip connection', 'bottleneck', 'convolution', 'batch norm'],
    applications: ['server', 'research'],
    difficulty: 'Intermediate',
  },
  resnet152: {
    aliases: ['ResNet152', 'ResNet-152'],
    keywords: ['ultra deep resnet', 'skip connection', 'shortcut mapping', 'bottleneck block'],
    patterns: ['residual'],
    components: ['skip connection', 'bottleneck', 'convolution', 'batch norm'],
    applications: ['server', 'research'],
    difficulty: 'Intermediate',
  },
  resnet50v2: {
    aliases: ['ResNet50V2', 'ResNet-50-V2', 'ResNet V2', 'Pre-activation ResNet'],
    keywords: ['pre-activation bottleneck', 'identity mapping', 'improved gradient propagation', 'skip connection'],
    patterns: ['residual'],
    components: ['pre-activation bottleneck', 'skip connection', 'batch norm'],
    applications: ['server', 'research'],
    difficulty: 'Intermediate',
  },
  resnet101v2: {
    aliases: ['ResNet101V2', 'ResNet-101-V2', 'Pre-activation ResNet101'],
    keywords: ['pre-activation bottleneck', 'identity mapping', 'skip connection'],
    patterns: ['residual'],
    components: ['pre-activation bottleneck', 'skip connection', 'batch norm'],
    applications: ['server', 'research'],
    difficulty: 'Intermediate',
  },
  resnet152v2: {
    aliases: ['ResNet152V2', 'ResNet-152-V2', 'Pre-activation ResNet152'],
    keywords: ['pre-activation bottleneck', 'identity mapping', 'skip connection'],
    patterns: ['residual'],
    components: ['pre-activation bottleneck', 'skip connection', 'batch norm'],
    applications: ['server', 'research'],
    difficulty: 'Intermediate',
  },
  densenet121: {
    aliases: ['DenseNet121', 'DenseNet-121', 'DenseNet', 'Densely Connected Convolutional Networks'],
    keywords: ['dense connectivity', 'feature concatenation', 'dense block', 'transition block', 'growth rate', 'feature reuse'],
    patterns: ['dense'],
    components: ['dense block', 'transition block', 'concatenate', 'batch norm'],
    applications: ['research', 'server'],
    difficulty: 'Intermediate',
  },
  densenet169: {
    aliases: ['DenseNet169', 'DenseNet-169'],
    keywords: ['dense connectivity', 'feature concatenation', 'dense block', 'transition block'],
    patterns: ['dense'],
    components: ['dense block', 'transition block', 'concatenate', 'batch norm'],
    applications: ['research', 'server'],
    difficulty: 'Intermediate',
  },
  densenet201: {
    aliases: ['DenseNet201', 'DenseNet-201'],
    keywords: ['dense connectivity', 'feature concatenation', 'dense block', 'transition block'],
    patterns: ['dense'],
    components: ['dense block', 'transition block', 'concatenate', 'batch norm'],
    applications: ['research', 'server'],
    difficulty: 'Intermediate',
  },
  mobilenet: {
    aliases: ['MobileNet', 'MobileNetV1', 'MobileNet-V1', 'Mobile CNN'],
    keywords: ['depthwise separable convolution', 'pointwise convolution', 'width multiplier', 'resolution multiplier', 'lightweight', 'mobile cnn', 'edge deployment'],
    patterns: ['depthwise'],
    components: ['depthwise conv', 'pointwise conv', 'batch norm', 'relu'],
    applications: ['mobile', 'edge'],
    difficulty: 'Intermediate',
  },
  mobilenetv2: {
    aliases: ['MobileNetV2', 'MobileNet-V2', 'Inverted Residual Network'],
    keywords: ['inverted residual', 'linear bottleneck', 'depthwise separable convolution', 'lightweight', 'mobile cnn', 'edge'],
    patterns: ['depthwise', 'residual'],
    components: ['inverted residual', 'linear bottleneck', 'depthwise conv', 'pointwise conv'],
    applications: ['mobile', 'edge'],
    difficulty: 'Intermediate',
  },
  mobilenetv3small: {
    aliases: ['MobileNetV3Small', 'MobileNetV3-Small', 'MobileNetV3 Small', 'MobileNetV3'],
    keywords: ['squeeze and excitation', 'se block', 'h-swish', 'hardware-aware nas', 'ultra lightweight', 'mobile', 'edge'],
    patterns: ['depthwise', 'residual', 'nas'],
    components: ['depthwise conv', 'se block', 'h-swish', 'inverted residual'],
    applications: ['mobile', 'edge'],
    difficulty: 'Intermediate',
  },
  mobilenetv3large: {
    aliases: ['MobileNetV3Large', 'MobileNetV3-Large', 'MobileNetV3 Large'],
    keywords: ['squeeze and excitation', 'se block', 'h-swish', 'hardware-aware nas', 'lightweight', 'mobile', 'edge'],
    patterns: ['depthwise', 'residual', 'nas'],
    components: ['depthwise conv', 'se block', 'h-swish', 'inverted residual'],
    applications: ['mobile', 'edge'],
    difficulty: 'Intermediate',
  },
  efficientnetb0: {
    aliases: ['EfficientNetB0', 'EfficientNet-B0', 'EfficientNet', 'Compound Scaling CNN'],
    keywords: ['compound scaling', 'mbconv', 'depthwise separable convolution', 'squeeze and excitation', 'se block', 'swish activation', 'efficient', 'lightweight'],
    patterns: ['compound', 'depthwise'],
    components: ['mbconv', 'depthwise conv', 'se block', 'compound scaling'],
    applications: ['mobile', 'edge', 'server'],
    difficulty: 'Intermediate',
  },
  efficientnetb1: { aliases: ['EfficientNetB1', 'EfficientNet-B1'], keywords: ['compound scaling', 'mbconv', 'se block'], patterns: ['compound', 'depthwise'], components: ['mbconv', 'depthwise conv', 'se block'], applications: ['mobile', 'edge', 'server'], difficulty: 'Intermediate' },
  efficientnetb2: { aliases: ['EfficientNetB2', 'EfficientNet-B2'], keywords: ['compound scaling', 'mbconv', 'se block'], patterns: ['compound', 'depthwise'], components: ['mbconv', 'depthwise conv', 'se block'], applications: ['mobile', 'edge', 'server'], difficulty: 'Intermediate' },
  efficientnetb3: { aliases: ['EfficientNetB3', 'EfficientNet-B3'], keywords: ['compound scaling', 'mbconv', 'se block'], patterns: ['compound', 'depthwise'], components: ['mbconv', 'depthwise conv', 'se block'], applications: ['server'], difficulty: 'Intermediate' },
  efficientnetb4: { aliases: ['EfficientNetB4', 'EfficientNet-B4'], keywords: ['compound scaling', 'mbconv', 'se block'], patterns: ['compound', 'depthwise'], components: ['mbconv', 'depthwise conv', 'se block'], applications: ['server'], difficulty: 'Intermediate' },
  efficientnetb5: { aliases: ['EfficientNetB5', 'EfficientNet-B5'], keywords: ['compound scaling', 'mbconv', 'se block'], patterns: ['compound', 'depthwise'], components: ['mbconv', 'depthwise conv', 'se block'], applications: ['server'], difficulty: 'Intermediate' },
  efficientnetb6: { aliases: ['EfficientNetB6', 'EfficientNet-B6'], keywords: ['compound scaling', 'mbconv', 'se block'], patterns: ['compound', 'depthwise'], components: ['mbconv', 'depthwise conv', 'se block'], applications: ['server'], difficulty: 'Intermediate' },
  efficientnetb7: { aliases: ['EfficientNetB7', 'EfficientNet-B7'], keywords: ['high accuracy compound scaling', 'mbconv', 'se block'], patterns: ['compound', 'depthwise'], components: ['mbconv', 'depthwise conv', 'se block'], applications: ['server'], difficulty: 'Intermediate' },
  inceptionv3: {
    aliases: ['InceptionV3', 'Inception-V3', 'GoogLeNet Inception', 'Inception'],
    keywords: ['factorized convolutions', 'multi-scale processing', 'auxiliary classifiers', 'label smoothing', '7x7 grid factorization'],
    patterns: [],
    components: ['inception module', 'factorized conv', '1x1 conv bottleneck'],
    applications: ['server', 'research'],
    difficulty: 'Advanced',
  },
  inceptionresnetv2: {
    aliases: ['InceptionResNetV2', 'Inception-ResNet-v2', 'Inception ResNet'],
    keywords: ['hybrid architecture', 'inception residual block', 'skip connection', 'multi-scale residual'],
    patterns: ['residual'],
    components: ['inception block', 'skip connection', 'bottleneck'],
    applications: ['server', 'research'],
    difficulty: 'Advanced',
  },
  xception: {
    aliases: ['Xception', 'Extreme Inception'],
    keywords: ['extreme inception', 'depthwise separable convolutions', 'decoupled spatial channel filtering'],
    patterns: ['depthwise'],
    components: ['depthwise conv', 'pointwise conv', 'residual skip'],
    applications: ['server', 'research'],
    difficulty: 'Advanced',
  },
  nasnetmobile: {
    aliases: ['NASNetMobile', 'NASNet-Mobile', 'NASNet'],
    keywords: ['neural architecture search', 'nas', 'automl', 'reinforcement learning search', 'mobile cell'],
    patterns: ['nas', 'depthwise'],
    components: ['normal cell', 'reduction cell', 'separable conv'],
    applications: ['mobile', 'edge'],
    difficulty: 'Advanced',
  },
  nasnetlarge: {
    aliases: ['NASNetLarge', 'NASNet-Large'],
    keywords: ['neural architecture search', 'nas', 'automl', 'large cell architecture'],
    patterns: ['nas', 'depthwise'],
    components: ['normal cell', 'reduction cell', 'separable conv'],
    applications: ['server', 'research'],
    difficulty: 'Advanced',
  },
  vit: {
    aliases: ['ViT', 'Vision Transformer', 'An Image is Worth 16x16 Words'],
    keywords: ['self-attention', 'multi-head attention', 'patch embedding', 'positional encoding', 'transformer encoder', 'global receptive field'],
    patterns: ['attention'],
    components: ['attention', 'patch embedding', 'layer norm', 'mlp'],
    applications: ['server', 'research'],
    difficulty: 'Advanced',
  },
  swin: {
    aliases: ['Swin', 'Swin Transformer', 'Hierarchical Vision Transformer'],
    keywords: ['shifted window attention', 'hierarchical feature maps', 'linear complexity attention', 'local window self-attention'],
    patterns: ['attention'],
    components: ['window attention', 'shifted window', 'patch merging', 'layer norm'],
    applications: ['server', 'research'],
    difficulty: 'Advanced',
  },
  maxvit: {
    aliases: ['MaxViT', 'Multi-Axis Vision Transformer'],
    keywords: ['multi-axis self-attention', 'grid attention', 'block attention', 'hybrid cnn transformer', 'mbconv attention'],
    patterns: ['attention', 'depthwise'],
    components: ['block attention', 'grid attention', 'mbconv', 'layer norm'],
    applications: ['server', 'research'],
    difficulty: 'Advanced',
  },
  convnext: {
    aliases: ['ConvNeXt', 'A ConvNet for the 2020s', 'Modern CNN'],
    keywords: ['modernized convnet', '7x7 depthwise conv', 'inverted bottleneck', 'layer norm', 'gelu activation'],
    patterns: ['residual', 'depthwise'],
    components: ['7x7 depthwise conv', 'inverted bottleneck', 'layer norm'],
    applications: ['server', 'research'],
    difficulty: 'Intermediate',
  },
};

export function enrichModelEntity(model: ModelSummary): SearchableEntity {
  const meta = MODEL_METADATA_MAP[model.id] || {
    aliases: [model.name],
    keywords: [model.category.toLowerCase(), ...(model.family ? [model.family.toLowerCase()] : [])],
    patterns: [],
    components: [],
    applications: ['general'],
    difficulty: 'Intermediate' as const,
  };

  const year = model.releaseYear || model.paperYear || model.year || 2015;

  return {
    id: model.id,
    type: 'model',
    title: model.name,
    subtitle: model.fullName,
    description: model.description,
    url: `/models/${model.id}`,
    aliases: Array.from(new Set([model.name, model.fullName, ...meta.aliases])),
    keywords: Array.from(new Set([...model.tags, ...meta.keywords, model.category, ...(model.family ? [model.family] : [])])),
    patterns: meta.patterns,
    components: meta.components,
    applications: meta.applications,
    family: model.family || model.category,
    category: model.category,
    difficulty: meta.difficulty,
    efficiency: model.efficiency,
    year,
    tags: model.tags,
    authors: model.authors,
    colorTheme: model.colorTheme,
    rawItem: model,
  };
}

export function enrichPaperEntity(paper: PaperData): SearchableEntity {
  return {
    id: paper.id,
    type: 'paper',
    title: paper.title,
    subtitle: `Published in ${paper.year} by ${paper.authors.join(', ')}`,
    description: paper.contribution + ' ' + paper.problem,
    url: `/papers#${paper.id}`,
    aliases: [paper.title, paper.id, ...paper.modelIds],
    keywords: [paper.id, ...paper.modelIds, 'research paper', 'publication', 'paper'],
    patterns: [],
    components: [],
    applications: ['research'],
    year: paper.year,
    authors: paper.authors,
    tags: ['Paper', 'Research', ...paper.modelIds],
    rawItem: paper,
  };
}

export function enrichEvolutionEntity(node: EvolutionData): SearchableEntity {
  return {
    id: node.id,
    type: 'evolution',
    title: node.name,
    subtitle: `${node.year} Milestone – ${node.innovation}`,
    description: node.keyIdea + ' ' + node.problem,
    url: `/evolution?node=${node.id}`,
    aliases: [node.name, node.innovation],
    keywords: [node.name, node.keyIdea, 'evolution', 'milestone', 'timeline'],
    patterns: [],
    components: [],
    applications: ['learning'],
    year: node.year,
    tags: ['Evolution', 'Milestone'],
    rawItem: node,
  };
}
