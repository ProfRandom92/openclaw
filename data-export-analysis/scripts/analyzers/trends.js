/**
 * Trend Analysis
 */

/**
 * Analyze time series trend
 */
export function analyzeTrend(data, valueField, dateField) {
  if (data.length < 2) {
    return { trend: 'insufficient_data', direction: null, strength: 0 };
  }

  // Sort by date
  const sorted = [...data].sort((a, b) =>
    new Date(a[dateField]) - new Date(b[dateField])
  );

  // Calculate linear regression
  const regression = calculateLinearRegression(
    sorted.map((_, i) => i),
    sorted.map(r => r[valueField])
  );

  // Determine trend direction and strength
  const direction = regression.slope > 0 ? 'increasing' :
                   regression.slope < 0 ? 'decreasing' : 'stable';

  return {
    trend: direction,
    slope: regression.slope,
    r_squared: regression.rSquared,
    strength: Math.abs(regression.rSquared),
    forecast: (periods) => forecast(sorted, valueField, periods, regression)
  };
}

/**
 * Calculate linear regression
 */
function calculateLinearRegression(x, y) {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared
  const yMean = sumY / n;
  const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
  const ssResidual = y.reduce((sum, yi, i) => {
    const predicted = slope * x[i] + intercept;
    return sum + Math.pow(yi - predicted, 2);
  }, 0);
  const rSquared = 1 - (ssResidual / ssTotal);

  return { slope, intercept, rSquared };
}

/**
 * Forecast future values
 */
function forecast(data, valueField, periods, regression) {
  const lastIndex = data.length - 1;
  const forecasts = [];

  for (let i = 1; i <= periods; i++) {
    const predictedValue = regression.slope * (lastIndex + i) + regression.intercept;
    forecasts.push({
      period: i,
      forecast: Math.max(0, predictedValue)
    });
  }

  return forecasts;
}

/**
 * Detect seasonality
 */
export function detectSeasonality(data, valueField, dateField, period = 7) {
  const sorted = [...data].sort((a, b) =>
    new Date(a[dateField]) - new Date(b[dateField])
  );

  if (sorted.length < period * 2) {
    return { hasSeasonality: false, pattern: null };
  }

  // Group by period position
  const groups = Array(period).fill(0).map(() => []);

  sorted.forEach((record, index) => {
    const position = index % period;
    groups[position].push(record[valueField]);
  });

  // Calculate averages for each position
  const averages = groups.map(group =>
    group.reduce((a, b) => a + b, 0) / group.length
  );

  // Calculate coefficient of variation
  const mean = averages.reduce((a, b) => a + b, 0) / averages.length;
  const variance = averages.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / averages.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean;

  return {
    hasSeasonality: cv > 0.15, // Threshold for seasonality
    pattern: averages,
    strength: cv,
    period
  };
}

/**
 * Calculate moving average
 */
export function calculateMovingAverage(data, valueField, window = 7) {
  return data.map((record, index) => {
    const start = Math.max(0, index - window + 1);
    const windowData = data.slice(start, index + 1);
    const values = windowData.map(r => r[valueField]).filter(v => typeof v === 'number');
    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    return {
      ...record,
      moving_average: avg
    };
  });
}

/**
 * Calculate exponential moving average
 */
export function calculateEMA(data, valueField, span = 7) {
  const alpha = 2 / (span + 1);
  let ema = null;

  return data.map((record, index) => {
    const value = record[valueField];

    if (index === 0) {
      ema = value;
    } else {
      ema = alpha * value + (1 - alpha) * ema;
    }

    return {
      ...record,
      ema
    };
  });
}
