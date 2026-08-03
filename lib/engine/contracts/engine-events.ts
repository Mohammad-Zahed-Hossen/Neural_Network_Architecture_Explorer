import type { BaseEngineState } from './engine-state';

export type EngineEventType =
  | 'EngineStarted'
  | 'EngineStopped'
  | 'EngineUpdated'
  | 'EpochCompleted'
  | 'EpisodeCompleted'
  | 'StateChanged';

export interface EngineEvent<T extends BaseEngineState = BaseEngineState> {
  readonly type: EngineEventType;
  readonly timestamp: number;
  readonly payload: T;
  readonly message?: string;
}
