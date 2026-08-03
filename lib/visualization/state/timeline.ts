/**
 * @module TimelineState
 * @purpose Timeline playback position and marker tracking helper.
 * @layer Layer 7 Visualizer / State
 * @dependencies None
 * @api TimelineStateManager
 */

export class TimelineStateManager {
  private currentEpoch: number = 1;
  private currentStep: number = 0;
  private isPlaybackActive: boolean = false;

  public setPosition(epoch: number, step: number): void {
    this.currentEpoch = epoch;
    this.currentStep = step;
  }

  public setPlaybackActive(active: boolean): void {
    this.isPlaybackActive = active;
  }

  public getPosition(): { epoch: number; step: number } {
    return { epoch: this.currentEpoch, step: this.currentStep };
  }

  public getPlaybackActive(): boolean {
    return this.isPlaybackActive;
  }
}
