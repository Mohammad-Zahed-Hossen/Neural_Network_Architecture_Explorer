import React from 'react';
import ContinueLearning from '@/components/ui/continue-learning';

export default function ArchitectureReferences() {
  return (
    <ContinueLearning
      items={[
        {
          title: 'Training Dynamics Simulator',
          type: 'concept',
          href: '/concepts/training-dynamics',
          description: 'Simulate vanishing vs residual gradient propagation.',
        },
        {
          title: 'Receptive Field Explorer',
          type: 'concept',
          href: '/concepts/receptive-field',
          description: 'Calculate spatial receptive fields for pattern networks.',
        },
        {
          title: 'Research Map',
          type: 'paper',
          href: '/research-map',
          description: 'Trace landmark paper lineage across patterns.',
        },
        {
          title: 'Evolution Timeline',
          type: 'evolution',
          href: '/evolution',
          description: 'Follow architectural innovations chronologically.',
        },
        {
          title: 'Compare Model Benchmarks',
          type: 'compare',
          href: '/compare',
          description: 'Compare parameters vs accuracy across design patterns.',
        },
      ]}
    />
  );
}
