/**
 * Format a number with commas (e.g., 138357544 -> "138,357,544")
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Format large metric counts in engineering notation (K, M, B)
 * e.g., 138357544 -> "138.4M"
 */
export function formatShortNumber(value: number, decimals: number = 1): string {
  if (value >= 1e9) {
    return (value / 1e9).toFixed(decimals) + 'B';
  }
  if (value >= 1e6) {
    return (value / 1e6).toFixed(decimals) + 'M';
  }
  if (value >= 1e3) {
    return (value / 1e3).toFixed(decimals) + 'K';
  }
  return value.toString();
}

/**
 * Format floating-point accuracy to percentage (e.g., 0.713 -> "71.3%")
 */
export function formatAccuracy(value: number): string {
  return (value * 100).toFixed(1) + '%';
}

/**
 * Format memory usage (MB)
 * e.g., 528 -> "528 MB", 1024 -> "1.0 GB"
 */
export function formatMemory(mb: number): string {
  if (mb >= 1024) {
    return (mb / 1024).toFixed(1) + ' GB';
  }
  return mb + ' MB';
}

/**
 * Format floating point operations (FLOPs)
 * e.g., 15300000000 -> "15.3B FLOPs"
 */
export function formatFLOPs(flops: number): string {
  return formatShortNumber(flops, 1) + ' FLOPs';
}
