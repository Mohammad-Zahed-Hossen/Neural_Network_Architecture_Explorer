import type { EngineCapabilities } from './engine-capabilities';
import type { BaseEngineState } from './engine-state';

export interface VisualizerEngineContract {
  readonly supportedEngineStates: readonly string[];
  readonly priority: number;
  readonly requiredCapabilities: Partial<EngineCapabilities>;
  supports(engineState: BaseEngineState): boolean;
}
