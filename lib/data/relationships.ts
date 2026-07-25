export interface ModelRef {
  id: string;
  name: string;
  note?: string;
  reason?: string;
}

export interface PatternRef {
  id: string;
  name: string;
  href: string;
  note?: string;
}

export interface ConceptRef {
  id: string;
  name: string;
  href: string;
  note?: string;
}

export interface RelatedPaperRef {
  title: string;
  year: number;
  url: string;
  authors?: string;
}

export interface CompareShortcut {
  label: string;
  modelIds: string[];
  description: string;
}

export interface LearningItem {
  title: string;
  type: 'model' | 'pattern' | 'concept' | 'paper' | 'evolution' | 'compare' | 'learn';
  href: string;
  description: string;
}

export interface ModelRelationships {
  modelId: string;
  family: string;
  era: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  predecessors: ModelRef[];
  successors: ModelRef[];
  influencedBy: ModelRef[];
  influenced: ModelRef[];
  relatedModels: ModelRef[];
  patterns: PatternRef[];
  concepts: ConceptRef[];
  papers: {
    originalUrl: string;
    paperPageAnchor: string;
    relatedPapers: RelatedPaperRef[];
  };
  compareShortcuts: CompareShortcut[];
  continueLearning: LearningItem[];
}

// Master map of deterministic relationships across model families and specific models
const RELATIONSHIPS_MAP: Record<string, Partial<ModelRelationships>> = {
  lenet: {
    family: 'Foundational',
    era: 'Pioneering Era (1998)',
    difficulty: 'Beginner',
    predecessors: [],
    successors: [{ id: 'alexnet', name: 'AlexNet', note: 'First GPU-accelerated deep CNN scale-up' }],
    influencedBy: [],
    influenced: [
      { id: 'alexnet', name: 'AlexNet' },
      { id: 'vgg16', name: 'VGG16' }
    ],
    relatedModels: [
      { id: 'alexnet', name: 'AlexNet', reason: 'Same foundational Conv-Pool-FC architectural paradigm' },
      { id: 'vgg16', name: 'VGG16', reason: 'Homogeneous convolutional stacking evolution' }
    ],
    patterns: [],
    concepts: [
      { id: 'receptive-field', name: 'Receptive Field', href: '/concepts/receptive-field?model=lenet', note: 'Calculates hierarchical spatial coverage across Conv layers' }
    ],
    papers: {
      originalUrl: 'http://yann.lecun.com/exdb/publis/pdf/lecun-98.pdf',
      paperPageAnchor: '/papers#lenet',
      relatedPapers: [
        { title: 'ImageNet Classification with Deep Convolutional Neural Networks', year: 2012, url: 'https://proceedings.neurips.cc/paper/2012/file/c3988bc98c4d0decb81cfc15660ba26a-Paper.pdf', authors: 'Krizhevsky et al.' }
      ]
    },
    compareShortcuts: [
      { label: 'LeNet vs AlexNet vs VGG16', modelIds: ['lenet', 'alexnet', 'vgg16'], description: 'Compare early pioneering CNN architectures' }
    ],
    continueLearning: [
      { title: 'AlexNet (2012)', type: 'model', href: '/models/alexnet', description: 'See how GPU acceleration enabled scaling LeNet ideas to ImageNet.' },
      { title: 'Receptive Field Calculator', type: 'concept', href: '/concepts/receptive-field?model=lenet', description: 'Explore how LeNet filters build spatial coverage.' },
      { title: 'Evolution Timeline', type: 'evolution', href: '/evolution', description: 'Trace CNN evolution from 1998 to present.' }
    ]
  },

  alexnet: {
    family: 'Foundational',
    era: 'GPU Deep Learning Breakthrough (2012)',
    difficulty: 'Beginner',
    predecessors: [{ id: 'lenet', name: 'LeNet-5', note: 'Original baseline ConvNet structure' }],
    successors: [{ id: 'vgg16', name: 'VGG16', note: 'Standardized 3x3 filter stacking' }],
    influencedBy: [{ id: 'lenet', name: 'LeNet-5' }],
    influenced: [
      { id: 'vgg16', name: 'VGG16' },
      { id: 'resnet50', name: 'ResNet-50' },
      { id: 'inceptionv3', name: 'InceptionV3' }
    ],
    relatedModels: [
      { id: 'lenet', name: 'LeNet-5', reason: 'Predecessor baseline model' },
      { id: 'vgg16', name: 'VGG16', reason: 'Direct successor in ImageNet benchmark history' },
      { id: 'vgg19', name: 'VGG19', reason: 'Deeper variant of early ImageNet models' }
    ],
    patterns: [],
    concepts: [
      { id: 'vanishing', name: 'Vanishing Gradient', href: '/concepts/training-dynamics?concept=vanishing', note: 'Demonstrates non-saturating ReLU activations solving gradient saturation' },
      { id: 'receptive-field', name: 'Receptive Field', href: '/concepts/receptive-field?model=alexnet', note: 'Inspect large 11x11 stride-4 initial receptive field' }
    ],
    papers: {
      originalUrl: 'https://proceedings.neurips.cc/paper/2012/file/c3988bc98c4d0decb81cfc15660ba26a-Paper.pdf',
      paperPageAnchor: '/papers#alexnet',
      relatedPapers: [
        { title: 'Very Deep Convolutional Networks for Large-Scale Image Recognition', year: 2014, url: 'https://arxiv.org/abs/1409.1556', authors: 'Simonyan & Zisserman' }
      ]
    },
    compareShortcuts: [
      { label: 'AlexNet vs VGG16 vs ResNet50', modelIds: ['alexnet', 'vgg16', 'resnet50'], description: 'Compare key ImageNet milestone architectures' }
    ],
    continueLearning: [
      { title: 'VGG16 (2014)', type: 'model', href: '/models/vgg16', description: 'Discover how VGG replaced 11x11 filters with uniform 3x3 stacks.' },
      { title: 'Training Dynamics Visualizer', type: 'concept', href: '/concepts/training-dynamics?concept=vanishing', description: 'Understand how ReLU prevented gradient degradation.' },
      { title: 'Original AlexNet Paper', type: 'paper', href: '/papers#alexnet', description: 'Read full analysis of the 2012 NeurIPS landmark paper.' }
    ]
  },

  vgg16: {
    family: 'VGG',
    era: 'Deep Homogeneous Stacks (2014)',
    difficulty: 'Beginner',
    predecessors: [{ id: 'alexnet', name: 'AlexNet', note: 'Heterogeneous early vision benchmark' }],
    successors: [{ id: 'resnet50', name: 'ResNet-50', note: 'Introduced residual skip connections to overcome VGG depth limits' }],
    influencedBy: [{ id: 'alexnet', name: 'AlexNet' }],
    influenced: [
      { id: 'resnet50', name: 'ResNet-50' },
      { id: 'densenet121', name: 'DenseNet121' }
    ],
    relatedModels: [
      { id: 'vgg19', name: 'VGG19', reason: 'Deeper 19-layer sibling architecture' },
      { id: 'alexnet', name: 'AlexNet', reason: 'Immediate predecessor' },
      { id: 'resnet50', name: 'ResNet-50', reason: 'Direct successor addressing depth bottleneck' }
    ],
    patterns: [],
    concepts: [
      { id: 'vanishing', name: 'Vanishing Gradient Problem', href: '/concepts/training-dynamics?concept=vanishing', note: 'Shows why plain VGG stacks degrade beyond 19 layers' },
      { id: 'receptive-field', name: 'Receptive Field Expansion', href: '/concepts/receptive-field?model=vgg16', note: 'Two 3x3 convolutions equal a 5x5 receptive field with fewer parameters' }
    ],
    papers: {
      originalUrl: 'https://arxiv.org/abs/1409.1556',
      paperPageAnchor: '/papers#vgg',
      relatedPapers: [
        { title: 'Deep Residual Learning for Image Recognition', year: 2015, url: 'https://arxiv.org/abs/1512.03385', authors: 'He et al.' }
      ]
    },
    compareShortcuts: [
      { label: 'VGG16 vs VGG19 vs ResNet50', modelIds: ['vgg16', 'vgg19', 'resnet50'], description: 'Compare VGG depth limits with ResNet skip connections' }
    ],
    continueLearning: [
      { title: 'ResNet-50', type: 'model', href: '/models/resnet50', description: 'See how skip connections solved VGG gradient degradation.' },
      { title: 'Vanishing Gradient Simulator', type: 'concept', href: '/concepts/training-dynamics?concept=vanishing', description: 'Simulate gradient decay across deep plain layers.' },
      { title: 'Compare VGG16 with ResNet50', type: 'compare', href: '/compare?models=vgg16,resnet50', description: 'Compare parameter efficiency and accuracy side-by-side.' }
    ]
  },

  vgg19: {
    family: 'VGG',
    era: 'Deep Homogeneous Stacks (2014)',
    difficulty: 'Beginner',
    predecessors: [{ id: 'vgg16', name: 'VGG16', note: '16-layer predecessor' }],
    successors: [{ id: 'resnet50', name: 'ResNet-50', note: 'Residual breakthrough' }],
    influencedBy: [{ id: 'vgg16', name: 'VGG16' }],
    influenced: [{ id: 'resnet50', name: 'ResNet-50' }],
    relatedModels: [
      { id: 'vgg16', name: 'VGG16', reason: '16-layer sibling model' },
      { id: 'resnet50', name: 'ResNet-50', reason: 'Residual skip connection evolution' }
    ],
    patterns: [],
    concepts: [
      { id: 'vanishing', name: 'Vanishing Gradient Problem', href: '/concepts/training-dynamics?concept=vanishing', note: '19-layer plain conv limit' }
    ],
    papers: {
      originalUrl: 'https://arxiv.org/abs/1409.1556',
      paperPageAnchor: '/papers#vgg',
      relatedPapers: []
    },
    compareShortcuts: [
      { label: 'VGG16 vs VGG19', modelIds: ['vgg16', 'vgg19'], description: 'Compare 16-layer and 19-layer VGG variants' }
    ],
    continueLearning: [
      { title: 'ResNet-50', type: 'model', href: '/models/resnet50', description: 'Learn how skip connections unlocked 50+ layer depth.' },
      { title: 'VGG16', type: 'model', href: '/models/vgg16', description: 'Inspect the 16-layer variant.' }
    ]
  },

  resnet50: {
    family: 'ResNet',
    era: 'Deep Residual Era (2015-2016)',
    difficulty: 'Intermediate',
    predecessors: [{ id: 'vgg16', name: 'VGG16', note: 'Plain stacked architecture predecessor' }],
    successors: [
      { id: 'resnet50v2', name: 'ResNet-50 V2', note: 'Pre-activation residual block design' },
      { id: 'densenet121', name: 'DenseNet121', note: 'Feature concatenation across layers' },
      { id: 'convnext', name: 'ConvNeXt', note: 'Modern 2020s redesign of ResNet' }
    ],
    influencedBy: [{ id: 'vgg16', name: 'VGG16' }],
    influenced: [
      { id: 'densenet121', name: 'DenseNet121' },
      { id: 'mobilenetv2', name: 'MobileNetV2' },
      { id: 'convnext', name: 'ConvNeXt' },
      { id: 'inceptionresnetv2', name: 'InceptionResNetV2' }
    ],
    relatedModels: [
      { id: 'resnet50v2', name: 'ResNet-50 V2', reason: 'Pre-activation improvement' },
      { id: 'densenet121', name: 'DenseNet121', reason: 'Dense feature concatenation alternative' },
      { id: 'efficientnetb0', name: 'EfficientNetB0', reason: 'Compound scaling successor' },
      { id: 'convnext', name: 'ConvNeXt', reason: 'Modernized vision transformer style CNN' }
    ],
    patterns: [
      { id: 'residual', name: 'Residual Connections (Skip Mappings)', href: '/architecture-patterns?pattern=residual', note: 'H(x) = F(x) + x identity mapping' }
    ],
    concepts: [
      { id: 'residual', name: 'Residual Learning Dynamics', href: '/concepts/training-dynamics?concept=residual', note: 'Interactive simulation of identity skip gradients' },
      { id: 'receptive-field', name: 'Receptive Field', href: '/concepts/receptive-field?model=resnet50', note: 'Receptive field expansion through 50 layers' }
    ],
    papers: {
      originalUrl: 'https://arxiv.org/abs/1512.03385',
      paperPageAnchor: '/papers#resnet',
      relatedPapers: [
        { title: 'Identity Mappings in Deep Residual Networks', year: 2016, url: 'https://arxiv.org/abs/1603.05027', authors: 'He et al.' },
        { title: 'Densely Connected Convolutional Networks', year: 2016, url: 'https://arxiv.org/abs/1608.06993', authors: 'Huang et al.' }
      ]
    },
    compareShortcuts: [
      { label: 'ResNet50 vs DenseNet121 vs EfficientNetB0', modelIds: ['resnet50', 'densenet121', 'efficientnetb0'], description: 'Compare top 3 landmark CNN paradigms' },
      { label: 'ResNet50 vs ResNet50V2', modelIds: ['resnet50', 'resnet50v2'], description: 'Compare post-activation vs pre-activation residual blocks' },
      { label: 'ResNet50 vs ConvNeXt', modelIds: ['resnet50', 'convnext'], description: 'Compare classic ResNet with modern 2022 ConvNeXt' }
    ],
    continueLearning: [
      { title: 'DenseNet121', type: 'model', href: '/models/densenet121', description: 'Explore feature concatenation instead of addition.' },
      { title: 'Residual Pattern Deep Dive', type: 'pattern', href: '/architecture-patterns?pattern=residual', description: 'Master skip connection mathematical theory.' },
      { title: 'Compare ResNet50 & EfficientNetB0', type: 'compare', href: '/compare?models=resnet50,efficientnetb0', description: 'Compare parameters vs accuracy.' },
      { title: 'ConvNeXt (2022)', type: 'model', href: '/models/convnext', description: 'See how ResNet was modernized for the 2020s.' }
    ]
  },

  densenet121: {
    family: 'DenseNet',
    era: 'Dense Connectivity Era (2016)',
    difficulty: 'Intermediate',
    predecessors: [{ id: 'resnet50', name: 'ResNet-50', note: 'Residual addition baseline' }],
    successors: [{ id: 'efficientnetb0', name: 'EfficientNetB0', note: 'Compound scaled MBConv' }],
    influencedBy: [{ id: 'resnet50', name: 'ResNet-50' }],
    influenced: [
      { id: 'mobilenetv2', name: 'MobileNetV2' }
    ],
    relatedModels: [
      { id: 'densenet169', name: 'DenseNet169', reason: 'Deeper 169-layer DenseNet' },
      { id: 'densenet201', name: 'DenseNet201', reason: '201-layer DenseNet' },
      { id: 'resnet50', name: 'ResNet-50', reason: 'Residual addition counterpart' },
      { id: 'efficientnetb0', name: 'EfficientNetB0', reason: 'Next generation parameter efficiency' }
    ],
    patterns: [
      { id: 'dense', name: 'Dense Connectivity (Feature Concatenation)', href: '/architecture-patterns?pattern=dense', note: 'Direct feature reuse across all layers' }
    ],
    concepts: [
      { id: 'dense', name: 'Dense Connection Dynamics', href: '/concepts/training-dynamics?concept=dense', note: 'Interactive feature channel concatenation' }
    ],
    papers: {
      originalUrl: 'https://arxiv.org/abs/1608.06993',
      paperPageAnchor: '/papers#densenet',
      relatedPapers: [
        { title: 'Deep Residual Learning for Image Recognition', year: 2015, url: 'https://arxiv.org/abs/1512.03385', authors: 'He et al.' }
      ]
    },
    compareShortcuts: [
      { label: 'DenseNet121 vs ResNet50', modelIds: ['densenet121', 'resnet50'], description: 'Compare feature concatenation vs addition' },
      { label: 'DenseNet Family Comparison', modelIds: ['densenet121', 'densenet169', 'densenet201'], description: 'Compare depth scaling in DenseNets' }
    ],
    continueLearning: [
      { title: 'EfficientNetB0', type: 'model', href: '/models/efficientnetb0', description: 'See how compound scaling achieved even higher parameter efficiency.' },
      { title: 'Dense Pattern Explanation', type: 'pattern', href: '/architecture-patterns?pattern=dense', description: 'Understand how concatenation preserves distinct features.' },
      { title: 'Compare ResNet50 & DenseNet121', type: 'compare', href: '/compare?models=resnet50,densenet121', description: 'Analyze parameter count vs GPU RAM tradeoffs.' }
    ]
  },

  mobilenet: {
    family: 'MobileNet',
    era: 'Mobile & Edge Efficiency Era (2017-2019)',
    difficulty: 'Intermediate',
    predecessors: [
      { id: 'vgg16', name: 'VGG16', note: 'Standard 3x3 convolution baseline' },
      { id: 'xception', name: 'Xception', note: 'Pioneered depthwise separable convolutions' }
    ],
    successors: [{ id: 'mobilenetv2', name: 'MobileNetV2', note: 'Inverted residual bottleneck design' }],
    influencedBy: [{ id: 'xception', name: 'Xception' }],
    influenced: [
      { id: 'mobilenetv2', name: 'MobileNetV2' },
      { id: 'efficientnetb0', name: 'EfficientNetB0' },
      { id: 'nasnetmobile', name: 'NASNetMobile' }
    ],
    relatedModels: [
      { id: 'mobilenetv2', name: 'MobileNetV2', reason: 'Second generation inverted residual design' },
      { id: 'xception', name: 'Xception', reason: 'Shares depthwise separable convolution core' },
      { id: 'efficientnetb0', name: 'EfficientNetB0', reason: 'Combines MBConv blocks with compound scaling' }
    ],
    patterns: [
      { id: 'depthwise', name: 'Depthwise Separable Convolutions', href: '/architecture-patterns?pattern=depthwise', note: 'Splits spatial filtering and channel mixing' }
    ],
    concepts: [
      { id: 'receptive-field', name: 'Receptive Field', href: '/concepts/receptive-field?model=mobilenet', note: 'Separable conv receptive field dynamics' }
    ],
    papers: {
      originalUrl: 'https://arxiv.org/abs/1704.04861',
      paperPageAnchor: '/papers#mobilenet',
      relatedPapers: [
        { title: 'Xception: Deep Learning with Depthwise Separable Convolutions', year: 2016, url: 'https://arxiv.org/abs/1610.02357', authors: 'François Chollet' }
      ]
    },
    compareShortcuts: [
      { label: 'MobileNet V1 vs V2 vs V3', modelIds: ['mobilenet', 'mobilenetv2', 'mobilenetv3small'], description: 'Compare evolution of mobile architectures' }
    ],
    continueLearning: [
      { title: 'MobileNetV2', type: 'model', href: '/models/mobilenetv2', description: 'See how inverted bottlenecks improved mobile feature preservation.' },
      { title: 'Depthwise Separable Pattern', type: 'pattern', href: '/architecture-patterns?pattern=depthwise', description: 'Learn how 80%+ FLOP reduction is mathematically achieved.' },
      { title: 'EfficientNetB0', type: 'model', href: '/models/efficientnetb0', description: 'See how mobile blocks scale to cloud accuracy.' }
    ]
  },

  efficientnetb0: {
    family: 'EfficientNet',
    era: 'Compound Scaling Era (2019)',
    difficulty: 'Intermediate',
    predecessors: [
      { id: 'mobilenetv2', name: 'MobileNetV2', note: 'Base MBConv bottleneck unit' },
      { id: 'densenet121', name: 'DenseNet121', note: 'High parameter efficiency predecessor' }
    ],
    successors: [
      { id: 'efficientnetb4', name: 'EfficientNetB4', note: 'Higher resolution compound scaling' },
      { id: 'convnext', name: 'ConvNeXt', note: 'Modernized 2020s ConvNet' }
    ],
    influencedBy: [
      { id: 'mobilenetv2', name: 'MobileNetV2' },
      { id: 'nasnetmobile', name: 'NASNetMobile' }
    ],
    influenced: [
      { id: 'convnext', name: 'ConvNeXt' },
      { id: 'maxvit', name: 'MaxViT' }
    ],
    relatedModels: [
      { id: 'mobilenetv2', name: 'MobileNetV2', reason: 'Uses MBConv building block' },
      { id: 'resnet50', name: 'ResNet-50', reason: 'Standard baseline benchmark model' },
      { id: 'convnext', name: 'ConvNeXt', reason: '2020s modern ConvNet competitor' },
      { id: 'vit', name: 'ViT', reason: 'Transformer competitor' }
    ],
    patterns: [
      { id: 'compound', name: 'Compound Scaling', href: '/architecture-patterns?pattern=compound', note: 'Simultaneous scaling of width, depth, and resolution' },
      { id: 'depthwise', name: 'Depthwise Separable Convolutions', href: '/architecture-patterns?pattern=depthwise', note: 'MBConv expansion & depthwise blocks' }
    ],
    concepts: [
      { id: 'receptive-field', name: 'Receptive Field', href: '/concepts/receptive-field?model=efficientnetb0', note: 'Compound scaled receptive fields' }
    ],
    papers: {
      originalUrl: 'https://arxiv.org/abs/1905.11946',
      paperPageAnchor: '/papers#efficientnet',
      relatedPapers: [
        { title: 'MobileNetV2: Inverted Residuals and Linear Bottlenecks', year: 2018, url: 'https://arxiv.org/abs/1801.04381', authors: 'Sandler et al.' }
      ]
    },
    compareShortcuts: [
      { label: 'EfficientNetB0 vs ResNet50 vs ViT', modelIds: ['efficientnetb0', 'resnet50', 'vit'], description: 'Compare compound CNNs with classic ResNet and Vision Transformer' },
      { label: 'EfficientNet Family Scaling (B0-B4)', modelIds: ['efficientnetb0', 'efficientnetb1', 'efficientnetb2', 'efficientnetb4'], description: 'Compare compound scaling levels' }
    ],
    continueLearning: [
      { title: 'Compound Scaling Pattern', type: 'pattern', href: '/architecture-patterns?pattern=compound', description: 'Study the alpha, beta, gamma scaling equation.' },
      { title: 'ViT (Vision Transformer)', type: 'model', href: '/models/vit', description: 'Explore how Transformers challenge CNN scaling.' },
      { title: 'ConvNeXt', type: 'model', href: '/models/convnext', description: 'Learn how CNNs struck back against Transformers.' }
    ]
  },

  vit: {
    family: 'Transformer',
    era: 'Vision Transformer Revolution (2020+)',
    difficulty: 'Advanced',
    predecessors: [
      { id: 'efficientnetb0', name: 'EfficientNetB0', note: 'Previous SOTA CNN baseline' },
      { id: 'resnet50', name: 'ResNet-50', note: 'Classic convolutional backbone' }
    ],
    successors: [
      { id: 'swin', name: 'Swin Transformer', note: 'Introduced shifted window attention' },
      { id: 'convnext', name: 'ConvNeXt', note: 'CNN modernized with ViT design choices' },
      { id: 'maxvit', name: 'MaxViT', note: 'Hybrid Conv-Attention architecture' }
    ],
    influencedBy: [
      { id: 'resnet50', name: 'ResNet-50' }
    ],
    influenced: [
      { id: 'swin', name: 'Swin Transformer' },
      { id: 'convnext', name: 'ConvNeXt' },
      { id: 'maxvit', name: 'MaxViT' }
    ],
    relatedModels: [
      { id: 'swin', name: 'Swin Transformer', reason: 'Shifted window attention adaptation' },
      { id: 'convnext', name: 'ConvNeXt', reason: 'Modernized CNN inspired by ViT design' },
      { id: 'maxvit', name: 'MaxViT', reason: 'Hybrid convolutional self-attention model' },
      { id: 'resnet50', name: 'ResNet-50', reason: 'Standard CNN baseline comparison' }
    ],
    patterns: [
      { id: 'attention', name: 'Self-Attention & Window Blocks', href: '/architecture-patterns?pattern=attention', note: 'Global patch-to-patch multi-head attention' }
    ],
    concepts: [
      { id: 'receptive-field', name: 'Receptive Field Dynamics', href: '/concepts/receptive-field?model=vit', note: 'Global receptive field from Layer 1' }
    ],
    papers: {
      originalUrl: 'https://arxiv.org/abs/2010.11929',
      paperPageAnchor: '/papers#vit',
      relatedPapers: [
        { title: 'Swin Transformer: Hierarchical Vision Transformer using Shifted Windows', year: 2021, url: 'https://arxiv.org/abs/2103.14030', authors: 'Liu et al.' },
        { title: 'A ConvNet for the 2020s', year: 2022, url: 'https://arxiv.org/abs/2201.03545', authors: 'Liu et al.' }
      ]
    },
    compareShortcuts: [
      { label: 'ViT vs Swin vs ConvNeXt', modelIds: ['vit', 'swin', 'convnext'], description: 'Compare modern 2020s vision paradigms' }
    ],
    continueLearning: [
      { title: 'Swin Transformer', type: 'model', href: '/models/swin', description: 'See how shifted windows reduced quadratic attention cost.' },
      { title: 'Self-Attention Pattern', type: 'pattern', href: '/architecture-patterns?pattern=attention', description: 'Master patch projection and QKV attention math.' },
      { title: 'ConvNeXt', type: 'model', href: '/models/convnext', description: 'Compare ViT with a modern pure-CNN architecture.' }
    ]
  },

  swin: {
    family: 'Transformer',
    era: 'Shifted Window Transformer (2021)',
    difficulty: 'Advanced',
    predecessors: [{ id: 'vit', name: 'Vision Transformer (ViT)', note: 'Global attention predecessor' }],
    successors: [{ id: 'maxvit', name: 'MaxViT', note: 'Multi-axis hybrid attention' }],
    influencedBy: [{ id: 'vit', name: 'Vision Transformer (ViT)' }],
    influenced: [
      { id: 'convnext', name: 'ConvNeXt' },
      { id: 'maxvit', name: 'MaxViT' }
    ],
    relatedModels: [
      { id: 'vit', name: 'ViT', reason: 'Original global vision transformer' },
      { id: 'convnext', name: 'ConvNeXt', reason: 'Modernized CNN counterpart' },
      { id: 'maxvit', name: 'MaxViT', reason: 'Hybrid grid/window attention model' }
    ],
    patterns: [
      { id: 'attention', name: 'Self-Attention & Window Blocks', href: '/architecture-patterns?pattern=attention', note: 'Local & shifted window attention' }
    ],
    concepts: [],
    papers: {
      originalUrl: 'https://arxiv.org/abs/2103.14030',
      paperPageAnchor: '/papers#swin',
      relatedPapers: []
    },
    compareShortcuts: [
      { label: 'Swin vs ViT vs MaxViT', modelIds: ['swin', 'vit', 'maxvit'], description: 'Compare Vision Transformer architectures' }
    ],
    continueLearning: [
      { title: 'ConvNeXt', type: 'model', href: '/models/convnext', description: 'Explore the modern CNN designed to rival Swin.' },
      { title: 'ViT', type: 'model', href: '/models/vit', description: 'Revisit original global attention ViT.' }
    ]
  },

  convnext: {
    family: 'Transformer', // Classified as Modern CNN / Transformer category in schema
    era: 'Modernized ConvNet Era (2022)',
    difficulty: 'Intermediate',
    predecessors: [
      { id: 'resnet50', name: 'ResNet-50', note: 'Base residual architecture modernized' },
      { id: 'vit', name: 'ViT', note: 'Provided modern macro/micro design inspiration' }
    ],
    successors: [{ id: 'maxvit', name: 'MaxViT', note: 'Hybrid multi-axis vision model' }],
    influencedBy: [
      { id: 'resnet50', name: 'ResNet-50' },
      { id: 'vit', name: 'ViT' },
      { id: 'swin', name: 'Swin Transformer' }
    ],
    influenced: [{ id: 'maxvit', name: 'MaxViT' }],
    relatedModels: [
      { id: 'resnet50', name: 'ResNet-50', reason: 'Direct modern evolution of ResNet' },
      { id: 'vit', name: 'ViT', reason: 'Main competitor and architectural inspiration' },
      { id: 'swin', name: 'Swin Transformer', reason: 'Rival vision backbone' }
    ],
    patterns: [
      { id: 'residual', name: 'Residual Connections', href: '/architecture-patterns?pattern=residual', note: 'Inverted bottleneck residual blocks' },
      { id: 'depthwise', name: 'Depthwise Convolutions', href: '/architecture-patterns?pattern=depthwise', note: 'Large 7x7 depthwise kernels' }
    ],
    concepts: [
      { id: 'residual', name: 'Residual Learning', href: '/concepts/training-dynamics?concept=residual', note: 'Modernized shortcut dynamics' }
    ],
    papers: {
      originalUrl: 'https://arxiv.org/abs/2201.03545',
      paperPageAnchor: '/papers#convnext',
      relatedPapers: [
        { title: 'Deep Residual Learning for Image Recognition', year: 2015, url: 'https://arxiv.org/abs/1512.03385', authors: 'He et al.' }
      ]
    },
    compareShortcuts: [
      { label: 'ConvNeXt vs ResNet50 vs ViT', modelIds: ['convnext', 'resnet50', 'vit'], description: 'Compare modern CNN with classic ResNet and ViT' }
    ],
    continueLearning: [
      { title: 'ResNet-50', type: 'model', href: '/models/resnet50', description: 'See the original 2015 ResNet baseline.' },
      { title: 'ViT', type: 'model', href: '/models/vit', description: 'See the Vision Transformer that inspired ConvNeXt.' }
    ]
  }
};

/**
 * Gets or computes deterministic relationship metadata for any given model ID.
 */
export function getModelRelationships(modelId: string, modelMeta?: { name?: string; category?: string; year?: number }): ModelRelationships {
  const specific = RELATIONSHIPS_MAP[modelId];

  // Common fallbacks by prefix/family if not explicitly defined above
  const isResNet = modelId.startsWith('resnet');
  const isDenseNet = modelId.startsWith('densenet');
  const isMobileNet = modelId.startsWith('mobilenet');
  const isEfficientNet = modelId.startsWith('efficientnet');
  const isInception = modelId.startsWith('inception');
  const isNASNet = modelId.startsWith('nasnet');

  let defaultFamily = 'CNN Architecture';
  let defaultEra = 'Deep Learning Era';
  let defaultDifficulty: 'Beginner' | 'Intermediate' | 'Advanced' = 'Intermediate';
  let defaultPatterns: PatternRef[] = [];
  const defaultConcepts: ConceptRef[] = [
    { id: 'receptive-field', name: 'Receptive Field', href: `/concepts/receptive-field?model=${modelId}`, note: 'Calculates layer-by-layer spatial coverage' }
  ];
  let defaultCompare: CompareShortcut[] = [];

  if (isResNet) {
    defaultFamily = 'ResNet';
    defaultEra = 'Deep Residual Era (2015-2016)';
    defaultPatterns = [{ id: 'residual', name: 'Residual Connections (Skip Mappings)', href: '/architecture-patterns?pattern=residual', note: 'Identity skip connections bypass weight blocks' }];
    defaultConcepts.push({ id: 'residual', name: 'Residual Learning Dynamics', href: '/concepts/training-dynamics?concept=residual', note: 'Gradient flow through skip shortcuts' });
    defaultCompare = [{ label: 'Compare ResNet variants', modelIds: [modelId, 'resnet50', 'densenet121'], description: 'Side-by-side metric comparison' }];
  } else if (isDenseNet) {
    defaultFamily = 'DenseNet';
    defaultEra = 'Dense Connectivity Era (2016)';
    defaultPatterns = [{ id: 'dense', name: 'Dense Connectivity (Feature Concatenation)', href: '/architecture-patterns?pattern=dense', note: 'Concatenates all preceding layer feature maps' }];
    defaultConcepts.push({ id: 'dense', name: 'Dense Connection Dynamics', href: '/concepts/training-dynamics?concept=dense', note: 'Channel concatenation gradient flow' });
    defaultCompare = [{ label: 'Compare DenseNet variants', modelIds: [modelId, 'densenet121', 'resnet50'], description: 'Compare parameter efficiency' }];
  } else if (isMobileNet) {
    defaultFamily = 'MobileNet';
    defaultEra = 'Mobile & Edge Efficiency Era (2017-2019)';
    defaultPatterns = [{ id: 'depthwise', name: 'Depthwise Separable Convolutions', href: '/architecture-patterns?pattern=depthwise', note: 'Spatial filtering separated from channel mixing' }];
    defaultCompare = [{ label: 'Compare MobileNet variants', modelIds: ['mobilenet', 'mobilenetv2', 'mobilenetv3small', 'mobilenetv3large'], description: 'Compare mobile generation trade-offs' }];
  } else if (isEfficientNet) {
    defaultFamily = 'EfficientNet';
    defaultEra = 'Compound Scaling Era (2019)';
    defaultPatterns = [
      { id: 'compound', name: 'Compound Scaling', href: '/architecture-patterns?pattern=compound', note: 'Balanced width, depth, and resolution scaling' },
      { id: 'depthwise', name: 'Depthwise Separable Convolutions', href: '/architecture-patterns?pattern=depthwise', note: 'MBConv expansion blocks' }
    ];
    defaultCompare = [{ label: 'Compare EfficientNet variants', modelIds: ['efficientnetb0', 'efficientnetb2', 'efficientnetb4', 'efficientnetb7'], description: 'Observe compound scaling progression' }];
  } else if (isInception) {
    defaultFamily = 'Inception';
    defaultEra = 'Multi-Scale Factorization Era (2015-2016)';
    defaultDifficulty = 'Advanced';
  } else if (isNASNet) {
    defaultFamily = 'NASNet';
    defaultEra = 'AutoML & Search Era (2017)';
    defaultDifficulty = 'Advanced';
    defaultPatterns = [{ id: 'nas', name: 'Neural Architecture Search (NAS)', href: '/architecture-patterns?pattern=nas', note: 'Discovered RL/Evolutionary cell blocks' }];
  }

  const paperUrl = specific?.papers?.originalUrl || `https://arxiv.org`;
  const paperAnchor = specific?.papers?.paperPageAnchor || `/papers#${modelId}`;

  const resolved: ModelRelationships = {
    modelId,
    family: specific?.family || modelMeta?.category || defaultFamily,
    era: specific?.era || defaultEra,
    difficulty: specific?.difficulty || defaultDifficulty,
    predecessors: specific?.predecessors || [],
    successors: specific?.successors || [],
    influencedBy: specific?.influencedBy || [],
    influenced: specific?.influenced || [],
    relatedModels: specific?.relatedModels || [
      { id: 'resnet50', name: 'ResNet-50', reason: 'Industry standard CNN benchmark' },
      { id: 'vgg16', name: 'VGG16', reason: 'Classic homogeneous baseline' }
    ],
    patterns: specific?.patterns || defaultPatterns,
    concepts: specific?.concepts || defaultConcepts,
    papers: {
      originalUrl: paperUrl,
      paperPageAnchor: paperAnchor,
      relatedPapers: specific?.papers?.relatedPapers || []
    },
    compareShortcuts: specific?.compareShortcuts || defaultCompare,
    continueLearning: specific?.continueLearning || [
      { title: 'Architecture Patterns Library', type: 'pattern', href: '/architecture-patterns', description: 'Discover foundational design motifs.' },
      { title: 'Receptive Field Explorer', type: 'concept', href: `/concepts/receptive-field?model=${modelId}`, description: 'Inspect spatial coverage calculations.' },
      { title: 'Compare with Benchmark Models', type: 'compare', href: `/compare?models=${modelId},resnet50,densenet121`, description: 'Compare metrics side-by-side.' }
    ]
  };

  return resolved;
}
