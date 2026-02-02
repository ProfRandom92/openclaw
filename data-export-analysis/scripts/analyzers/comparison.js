/**
 * Comparison Analysis
 */

/**
 * Period-over-period comparison
 */
export function periodOverPeriod(current, previous, metrics) {
  const comparison = {};

  for (const metric of metrics) {
    const currentValue = sumField(current, metric);
    const previousValue = sumField(previous, metric);

    const change = currentValue - previousValue;
    const changePercent = previousValue > 0
      ? (change / previousValue) * 100
      : 0;

    comparison[metric] = {
      current: currentValue,
      previous: previousValue,
      change,
      changePercent,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    };
  }

  return comparison;
}

/**
 * Year-over-year comparison
 */
export function yearOverYear(currentYear, previousYear, metrics, dateField) {
  // Group by month
  const currentByMonth = groupByMonth(currentYear, dateField);
  const previousByMonth = groupByMonth(previousYear, dateField);

  const comparison = [];

  for (let month = 0; month < 12; month++) {
    const current = currentByMonth[month] || [];
    const previous = previousByMonth[month] || [];

    const monthComparison = {
      month: month + 1,
      metrics: {}
    };

    for (const metric of metrics) {
      const currentValue = sumField(current, metric);
      const previousValue = sumField(previous, metric);

      monthComparison.metrics[metric] = {
        current: currentValue,
        previous: previousValue,
        change: currentValue - previousValue,
        changePercent: previousValue > 0
          ? ((currentValue - previousValue) / previousValue) * 100
          : 0
      };
    }

    comparison.push(monthComparison);
  }

  return comparison;
}

/**
 * Benchmark comparison
 */
export function benchmarkComparison(data, benchmarks, metrics) {
  const comparison = {};

  for (const metric of metrics) {
    const actualValue = sumField(data, metric);
    const benchmark = benchmarks[metric];

    if (benchmark !== undefined) {
      const diff = actualValue - benchmark;
      const diffPercent = benchmark > 0
        ? (diff / benchmark) * 100
        : 0;

      comparison[metric] = {
        actual: actualValue,
        benchmark,
        difference: diff,
        differencePercent: diffPercent,
        status: actualValue >= benchmark ? 'above' : 'below'
      };
    }
  }

  return comparison;
}

/**
 * Cohort analysis
 */
export function cohortAnalysis(data, cohortField, dateField, valueField) {
  const cohorts = {};

  // Group by cohort
  data.forEach(record => {
    const cohort = record[cohortField];
    if (!cohorts[cohort]) {
      cohorts[cohort] = [];
    }
    cohorts[cohort].push(record);
  });

  // Analyze each cohort
  const analysis = {};

  for (const [cohort, records] of Object.entries(cohorts)) {
    const sorted = records.sort((a, b) =>
      new Date(a[dateField]) - new Date(b[dateField])
    );

    analysis[cohort] = {
      size: records.length,
      totalValue: sumField(records, valueField),
      avgValue: avgField(records, valueField),
      firstDate: sorted[0]?.[dateField],
      lastDate: sorted[sorted.length - 1]?.[dateField]
    };
  }

  return analysis;
}

/**
 * A/B test comparison
 */
export function abTestComparison(groupA, groupB, metrics) {
  const comparison = {};

  for (const metric of metrics) {
    const aValue = avgField(groupA, metric);
    const bValue = avgField(groupB, metric);

    const diff = bValue - aValue;
    const diffPercent = aValue > 0 ? (diff / aValue) * 100 : 0;

    // Simple t-test (assumes normal distribution)
    const aValues = groupA.map(r => r[metric]).filter(v => typeof v === 'number');
    const bValues = groupB.map(r => r[metric]).filter(v => typeof v === 'number');

    const tStat = calculateTStatistic(aValues, bValues);
    const pValue = calculatePValue(tStat, aValues.length + bValues.length - 2);

    comparison[metric] = {
      groupA: aValue,
      groupB: bValue,
      difference: diff,
      differencePercent: diffPercent,
      tStatistic: tStat,
      pValue,
      significant: pValue < 0.05,
      winner: diff > 0 ? 'B' : diff < 0 ? 'A' : 'tie'
    };
  }

  return comparison;
}

/**
 * Helper: Sum field values
 */
function sumField(data, field) {
  return data.reduce((sum, record) => sum + (record[field] || 0), 0);
}

/**
 * Helper: Average field values
 */
function avgField(data, field) {
  const values = data.map(r => r[field]).filter(v => typeof v === 'number');
  return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
}

/**
 * Helper: Group by month
 */
function groupByMonth(data, dateField) {
  const byMonth = {};

  data.forEach(record => {
    const date = new Date(record[dateField]);
    const month = date.getMonth();

    if (!byMonth[month]) {
      byMonth[month] = [];
    }
    byMonth[month].push(record);
  });

  return byMonth;
}

/**
 * Calculate t-statistic
 */
function calculateTStatistic(a, b) {
  const meanA = a.reduce((sum, val) => sum + val, 0) / a.length;
  const meanB = b.reduce((sum, val) => sum + val, 0) / b.length;

  const varA = a.reduce((sum, val) => sum + Math.pow(val - meanA, 2), 0) / (a.length - 1);
  const varB = b.reduce((sum, val) => sum + Math.pow(val - meanB, 2), 0) / (b.length - 1);

  const pooledVar = ((a.length - 1) * varA + (b.length - 1) * varB) / (a.length + b.length - 2);
  const se = Math.sqrt(pooledVar * (1 / a.length + 1 / b.length));

  return (meanB - meanA) / se;
}

/**
 * Calculate p-value (simplified)
 */
function calculatePValue(tStat, df) {
  // Simplified p-value calculation
  const absTStat = Math.abs(tStat);

  if (absTStat > 2.576) return 0.01;
  if (absTStat > 1.96) return 0.05;
  if (absTStat > 1.645) return 0.10;
  return 0.20;
}
