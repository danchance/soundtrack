/**
 * Defines the validation schema that are used accross multiple different
 * endpoints.
 */

/**
 * Schema for timeframe matches the timeframe stored in the user table.
 */
export const timeframeSchema = {
  trim: true,
  escape: true,
  toLowerCase: true,
  isIn: {
    options: [['week', 'month', 'year', 'all']],
    errorMessage: 'Invalid timeframe. Valid values: week, month, year, all.'
  }
};

/**
 * Schema for style matches the style stored in the user table.
 */
export const styleSchema = {
  trim: true,
  escape: true,
  toLowerCase: true,
  isIn: {
    options: [['list', 'grid', 'chart']],
    errorMessage: 'Invalid style. Valid values: list, grid, chart.'
  }
};
