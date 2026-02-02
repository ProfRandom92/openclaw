/**
 * Anomaly Detection
 */

/**
 * Detect outliers using Z-score method
 */
export function detectOutliersZScore(data, field, threshold = 3) {
  const values = data.map(r => r[field]).filter(v => typeof v === 'number');

  if (values.length === 0) return { outliers: [], anomalyRate: 0 };

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  );

  const outliers = data.filter(record => {
    const value = record[field];
    if (typeof value !== 'number') return false;

    const zScore = Math.abs((value - mean) / stdDev);
    return zScore > threshold;
  });

  return {
    outliers,
    anomalyRate: (outliers.length / data.length) * 100,
    statistics: { mean, stdDev, threshold }
  };
}

/**
 * Detect outliers using IQR method
 */
export function detectOutliersIQR(data, field, multiplier = 1.5) {
  const values = data.map(r => r[field]).filter(v => typeof v === 'number').sort((a, b) => a - b);

  if (values.length === 0) return { outliers: [], anomalyRate: 0 };

  const q1 = values[Math.floor(values.length * 0.25)];
  const q3 = values[Math.floor(values.length * 0.75)];
  const iqr = q3 - q1;

  const lowerBound = q1 - (multiplier * iqr);
  const upperBound = q3 + (multiplier * iqr);

  const outliers = data.filter(record => {
    const value = record[field];
    return typeof value === 'number' && (value < lowerBound || value > upperBound);
  });

  return {
    outliers,
    anomalyRate: (outliers.length / data.length) * 100,
    statistics: { q1, q3, iqr, lowerBound, upperBound }
  };
}

/**
 * Threshold-based anomaly detection
 */
export function detectThresholdAnomalies(data, field, thresholds) {
  const { min, max } = thresholds;

  const anomalies = data.filter(record => {
    const value = record[field];
    if (typeof value !== 'number') return false;

    return (min !== undefined && value < min) || (max !== undefined && value > max);
  });

  return {
    anomalies,
    anomalyRate: (anomalies.length / data.length) * 100,
    thresholds
  };
}

/**
 * Change point detection
 */
export function detectChangePoints(data, field, sensitivity = 2) {
  if (data.length < 3) return { changePoints: [] };

  const changes = [];

  for (let i = 1; i < data.length - 1; i++) {
    const prev = data[i - 1][field];
    const curr = data[i][field];
    const next = data[i + 1][field];

    if (typeof prev !== 'number' || typeof curr !== 'number' || typeof next !== 'number') {
      continue;
    }

    // Calculate rate of change
    const change1 = Math.abs(curr - prev);
    const change2 = Math.abs(next - curr);

    // Detect significant change
    const avgChange = (change1 + change2) / 2;
    const threshold = avgChange * sensitivity;

    if (change1 > threshold || change2 > threshold) {
      changes.push({
        index: i,
        record: data[i],
        magnitude: Math.max(change1, change2),
        direction: curr > prev ? 'increase' : 'decrease'
      });
    }
  }

  return {
    changePoints: changes,
    count: changes.length
  };
}

/**
 * Pattern-based anomaly detection
 */
export function detectPatternAnomalies(data, field, dateField, expectedPattern = 'weekly') {
  // This is a simplified pattern detection
  // In production, you'd want more sophisticated time series analysis

  const anomalies = [];

  if (expectedPattern === 'weekly') {
    // Check for weekly patterns
    const weeklyGroups = groupByWeekday(data, dateField);

    // Calculate average for each weekday
    const weekdayAverages = {};
    for (const [day, records] of Object.entries(weeklyGroups)) {
      const values = records.map(r => r[field]).filter(v => typeof v === 'number');
      weekdayAverages[day] = values.reduce((a, b) => a + b, 0) / values.length;
    }

    // Find anomalies (values significantly different from weekday average)
    data.forEach(record => {
      const date = new Date(record[dateField]);
      const weekday = date.getDay();
      const expected = weekdayAverages[weekday];
      const actual = record[field];

      if (typeof actual === 'number' && expected) {
        const deviation = Math.abs(actual - expected) / expected;
        if (deviation > 0.5) { // 50% deviation threshold
          anomalies.push({
            record,
            expected,
            actual,
            deviation: deviation * 100
          });
        }
      }
    });
  }

  return {
    anomalies,
    anomalyRate: (anomalies.length / data.length) * 100
  };
}

/**
 * Group by weekday
 */
function groupByWeekday(data, dateField) {
  const groups = {};

  data.forEach(record => {
    const date = new Date(record[dateField]);
    const weekday = date.getDay();

    if (!groups[weekday]) {
      groups[weekday] = [];
    }
    groups[weekday].push(record);
  });

  return groups;
}

/**
 * Comprehensive anomaly detection
 */
export function detectAnomalies(data, field, options = {}) {
  const {
    methods = ['zscore', 'iqr'],
    threshold = 3,
    multiplier = 1.5
  } = options;

  const results = {
    anomalies: [],
    byMethod: {}
  };

  if (methods.includes('zscore')) {
    const zscore = detectOutliersZScore(data, field, threshold);
    results.byMethod.zscore = zscore;
    results.anomalies.push(...zscore.outliers);
  }

  if (methods.includes('iqr')) {
    const iqr = detectOutliersIQR(data, field, multiplier);
    results.byMethod.iqr = iqr;
    results.anomalies.push(...iqr.outliers);
  }

  // Remove duplicates
  results.anomalies = [...new Set(results.anomalies)];
  results.totalAnomalies = results.anomalies.length;
  results.anomalyRate = (results.anomalies.length / data.length) * 100;

  return results;
}
