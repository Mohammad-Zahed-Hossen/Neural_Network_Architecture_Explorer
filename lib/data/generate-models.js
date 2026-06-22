/* eslint-disable */
const fs = require('fs');
const path = require('path');

// Read the metadata to get all model info
const metadataPath = path.join(__dirname, 'model-metadata.ts');
const metadataContent = fs.readFileSync(metadataPath, 'utf-8');

// Extract model definitions from TypeScript
const modelMatches = metadataContent.match(/id:\s*"([^"]+)"/g) || [];
const modelIds = modelMatches.map(match => match.match(/"([^"]+)"/)[1]);

// Base template for a model JSON
const createModelTemplate = (id, name, metadata) => ({
  id,
  name,
  fullName: metadata.fullName,
  paperYear: metadata.paperYear,
  category: metadata.category,
  efficiency: metadata.efficiency,
  releaseYear: metadata.releaseYear,
  authors: metadata.authors,
  paperUrl: metadata.paperUrl,
  depth: metadata.depth,
  totalParameters: metadata.totalParameters,
  totalFLOPs: metadata.totalFLOPs,
  top1Accuracy: metadata.top1Accuracy,
  top5Accuracy: metadata.top5Accuracy,
  memoryUsage: metadata.memoryUsage,
  description: metadata.description,
  tags: metadata.tags,
  colorTheme: metadata.colorTheme,
  architecture: {
    layers: [
      {
        id: "input",
        type: "input",
        name: "Input",
        inputShape: { dimensions: [null, 224, 224, 3], description: "224×224×3 RGB Image" },
        outputShape: { dimensions: [null, 224, 224, 3], description: "224×224×3 RGB Image" },
        config: { shape: [224, 224, 3] },
        parameters: { total: 0, weights: 0, biases: 0, formula: "None", calculationSteps: [] },
        educationalNote: {
          summary: `The input is a 224×224 pixel RGB image.`,
          detailed: `The network receives a standard ImageNet-sized image with 3 color channels (Red, Green, Blue). Each pixel is normalized to a range suitable for training.`,
          analogy: `Think of this as the retina of the neural network — the raw visual information enters here.`,
          whyItMatters: `Standard input size ensures consistent feature extraction across all images.`,
          keyTakeaway: `224×224×3 is the canonical input size for many modern CNNs.`
        }
      },
      {
        id: "output",
        type: "output",
        name: "Output Classification",
        inputShape: { dimensions: [null, 1000], description: "1000 ImageNet classes" },
        outputShape: { dimensions: [null, 1000], description: "Class probabilities" },
        config: { units: 1000, activation: "softmax", useBias: true },
        parameters: {
          total: 0,
          weights: 0,
          biases: 0,
          formula: "Computed by model",
          calculationSteps: []
        },
        educationalNote: {
          summary: `Outputs 1000 class probabilities for ImageNet classification.`,
          detailed: `The output layer produces a probability distribution over 1000 ImageNet classes using softmax activation. Each value represents the model's confidence for that class.`,
          analogy: `Like a weatherman giving probabilities for different weather conditions.`,
          whyItMatters: `This final layer converts raw features into human-interpretable predictions.`,
          keyTakeaway: `Softmax ensures all outputs sum to 1, making them interpretable as probabilities.`
        }
      }
    ],
    connections: [
      { id: "c1", sourceId: "input", targetId: "output", type: "sequential" }
    ],
    groups: [
      {
        id: "group1",
        name: "Network Structure",
        description: `${name} architecture for image classification`,
        layerIds: ["input", "output"],
        color: metadata.colorTheme
      }
    ]
  }
});

// Read existing model for reference
let referenceModel = null;
if (fs.existsSync(path.join(__dirname, 'vgg16.json'))) {
  referenceModel = JSON.parse(fs.readFileSync(path.join(__dirname, 'vgg16.json'), 'utf-8'));
}

// Create a basic model from metadata
const createModelFromMetadata = (modelInfo) => {
  const template = {
    ...modelInfo,
    architecture: {
      layers: [
        {
          id: "input",
          type: "input",
          name: "Input",
          inputShape: { dimensions: [null, 224, 224, 3], description: "224×224×3 RGB Image" },
          outputShape: { dimensions: [null, 224, 224, 3], description: "224×224×3 RGB Image" },
          config: { shape: [224, 224, 3] },
          parameters: { total: 0, weights: 0, biases: 0, formula: "None", calculationSteps: [] },
          educationalNote: {
            summary: `Input layer accepting 224×224 RGB images`,
            detailed: `Receives ImageNet-standard 224×224 pixel images with 3 color channels. Pixel values are typically normalized before being fed to the network.`,
            analogy: `The sensory input stage of the network`,
            whyItMatters: `Standardized input ensures consistent feature extraction`,
            keyTakeaway: `224×224×3 is a universal standard for ImageNet models`
          }
        },
        {
          id: "classifier",
          type: "dense",
          name: "Classification Head",
          inputShape: { dimensions: [null, 2048], description: "Feature vector" },
          outputShape: { dimensions: [null, 1000], description: "1000 ImageNet classes" },
          config: { units: 1000, activation: "softmax", useBias: true },
          parameters: {
            total: Math.round(2048 * 1000),
            weights: Math.round(2048 * 1000),
            biases: 1000,
            formula: "(input_features × output_units) + output_units",
            calculationSteps: [
              {
                label: "Weight matrix",
                expression: `2048 × 1000`,
                result: Math.round(2048 * 1000),
                explanation: "Connections from 2048 features to 1000 classes"
              },
              {
                label: "Biases",
                expression: "1000",
                result: 1000,
                explanation: "One bias per output class"
              }
            ]
          },
          educationalNote: {
            summary: `Final softmax layer for classification`,
            detailed: `Converts learned features into class probabilities for 1000 ImageNet categories using softmax activation.`,
            analogy: `Decision-making layer that outputs confidence scores`,
            whyItMatters: `Bridges learned representations and human-readable predictions`,
            keyTakeaway: `Softmax produces a probability distribution summing to 1`
          }
        }
      ],
      connections: [
        { id: "c1", sourceId: "input", targetId: "classifier", type: "sequential" }
      ],
      groups: [
        {
          id: "group1",
          name: "Input Layer",
          description: "Image input",
          layerIds: ["input"],
          color: modelInfo.colorTheme
        },
        {
          id: "group2",
          name: "Feature Extraction",
          description: "Core network processing",
          layerIds: [],
          color: modelInfo.colorTheme
        },
        {
          id: "group3",
          name: "Classification",
          description: "Output prediction head",
          layerIds: ["classifier"],
          color: modelInfo.colorTheme
        }
      ]
    }
  };

  return template;
};

console.log(`Found ${modelIds.length} models to process`);
