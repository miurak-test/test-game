/**
 * Pure logic functions for StatusPanel.
 * Separated from Phaser-dependent code for testability.
 */

/** Maximum axis value used for bar width calculation */
export const MAX_AXIS_VALUE = 30;
/** Full bar width in pixels */
export const BAR_FULL_WIDTH = 120;

/**
 * Calculate bar width from an axis value.
 * Returns a pixel width proportional to the axis value.
 */
export function calculateBarWidth(
  axisValue: number,
  maxValue: number = MAX_AXIS_VALUE,
  fullWidth: number = BAR_FULL_WIDTH,
): number {
  const clamped = Math.max(0, Math.min(axisValue, maxValue));
  return Math.round((clamped / maxValue) * fullWidth);
}
