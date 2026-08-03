export interface EngineCapabilities {
  readonly supportsTimeline: boolean;
  readonly supportsSimulation: boolean;
  readonly supportsReplay: boolean;
  readonly supportsMetrics: boolean;
  readonly supportsEvents: boolean;
  readonly supportsComparison: boolean;
}
