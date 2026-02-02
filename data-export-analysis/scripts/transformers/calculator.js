/**
 * Custom Calculations and KPI Computations
 */

/**
 * Add calculated field
 */
export function addCalculatedField(data, fieldName, formula) {
  return data.map(record => ({
    ...record,
    [fieldName]: formula(record)
  }));
}

/**
 * Calculate growth rate
 */
export function calculateGrowth(data, valueField, dateField, period = 'day') {
  const sorted = [...data].sort((a, b) =>
    new Date(a[dateField]) - new Date(b[dateField])
  );

  return sorted.map((record, index) => {
    if (index === 0) {
      return { ...record, growth_rate: 0 };
    }

    const current = record[valueField];
    const previous = sorted[index - 1][valueField];

    const growthRate = previous !== 0
      ? ((current - previous) / previous) * 100
      : 0;

    return {
      ...record,
      growth_rate: growthRate,
      growth_absolute: current - previous
    };
  });
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
      [`${valueField}_ma${window}`]: avg
    };
  });
}

/**
 * Calculate cumulative sum
 */
export function calculateCumulativeSum(data, valueField) {
  let sum = 0;

  return data.map(record => {
    sum += record[valueField] || 0;
    return {
      ...record,
      [`${valueField}_cumsum`]: sum
    };
  });
}

/**
 * Calculate percentage of total
 */
export function calculatePercentageOfTotal(data, valueField) {
  const total = data.reduce((sum, record) => sum + (record[valueField] || 0), 0);

  return data.map(record => ({
    ...record,
    [`${valueField}_pct`]: total > 0 ? (record[valueField] / total) * 100 : 0
  }));
}

/**
 * Calculate ROI (Return on Investment)
 */
export function calculateROI(data, revenueField, costField) {
  return data.map(record => {
    const revenue = record[revenueField] || 0;
    const cost = record[costField] || 0;

    const roi = cost > 0 ? ((revenue - cost) / cost) * 100 : 0;

    return {
      ...record,
      roi,
      profit: revenue - cost
    };
  });
}

/**
 * Calculate Customer Acquisition Cost (CAC)
 */
export function calculateCAC(data, marketingSpendField, newCustomersField) {
  return data.map(record => {
    const spend = record[marketingSpendField] || 0;
    const customers = record[newCustomersField] || 0;

    const cac = customers > 0 ? spend / customers : 0;

    return {
      ...record,
      cac
    };
  });
}

/**
 * Calculate Lifetime Value (LTV)
 */
export function calculateLTV(data, avgRevenueField, retentionRateField, churnRateField) {
  return data.map(record => {
    const avgRevenue = record[avgRevenueField] || 0;
    const churnRate = record[churnRateField] || 0.1;

    const ltv = churnRate > 0 ? avgRevenue / churnRate : 0;

    return {
      ...record,
      ltv
    };
  });
}

/**
 * Calculate Churn Rate
 */
export function calculateChurnRate(data, customersStartField, customersEndField, customersLostField) {
  return data.map(record => {
    const start = record[customersStartField] || 0;
    const lost = record[customersLostField] || 0;

    const churnRate = start > 0 ? (lost / start) * 100 : 0;

    return {
      ...record,
      churn_rate: churnRate
    };
  });
}

/**
 * Calculate conversion rate
 */
export function calculateConversionRate(data, conversionsField, visitsField) {
  return data.map(record => {
    const conversions = record[conversionsField] || 0;
    const visits = record[visitsField] || 0;

    const conversionRate = visits > 0 ? (conversions / visits) * 100 : 0;

    return {
      ...record,
      conversion_rate: conversionRate
    };
  });
}

/**
 * Calculate average order value (AOV)
 */
export function calculateAOV(data, revenueField, ordersField) {
  return data.map(record => {
    const revenue = record[revenueField] || 0;
    const orders = record[ordersField] || 0;

    const aov = orders > 0 ? revenue / orders : 0;

    return {
      ...record,
      aov
    };
  });
}

/**
 * Rank records
 */
export function rankRecords(data, valueField, ascending = false) {
  const sorted = [...data].sort((a, b) => {
    const diff = b[valueField] - a[valueField];
    return ascending ? -diff : diff;
  });

  return sorted.map((record, index) => ({
    ...record,
    rank: index + 1
  }));
}

/**
 * Calculate percentile
 */
export function calculatePercentile(data, valueField, percentile) {
  const values = data.map(r => r[valueField]).filter(v => typeof v === 'number').sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * values.length) - 1;
  return values[Math.max(0, index)];
}

/**
 * Apply multiple calculations
 */
export function applyCalculations(data, calculations) {
  let result = [...data];

  for (const calc of calculations) {
    switch (calc.type) {
      case 'growth':
        result = calculateGrowth(result, calc.valueField, calc.dateField);
        break;
      case 'moving-average':
        result = calculateMovingAverage(result, calc.valueField, calc.window);
        break;
      case 'cumsum':
        result = calculateCumulativeSum(result, calc.valueField);
        break;
      case 'percentage':
        result = calculatePercentageOfTotal(result, calc.valueField);
        break;
      case 'roi':
        result = calculateROI(result, calc.revenueField, calc.costField);
        break;
      case 'custom':
        result = addCalculatedField(result, calc.fieldName, calc.formula);
        break;
    }
  }

  return result;
}
