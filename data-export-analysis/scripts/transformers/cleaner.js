/**
 * Data Cleaning and Normalization
 */

/**
 * Remove duplicate records
 */
export function removeDuplicates(data, keyField = 'id') {
  const seen = new Set();
  return data.filter(record => {
    const key = record[keyField];
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Handle missing values
 */
export function handleMissingValues(data, strategy = 'drop', fillValue = null) {
  if (strategy === 'drop') {
    // Drop rows with any missing values
    return data.filter(record => {
      return Object.values(record).every(value => value !== null && value !== undefined && value !== '');
    });
  }

  if (strategy === 'fill') {
    // Fill missing values with a default
    return data.map(record => {
      const cleaned = { ...record };
      for (const key in cleaned) {
        if (cleaned[key] === null || cleaned[key] === undefined || cleaned[key] === '') {
          cleaned[key] = fillValue;
        }
      }
      return cleaned;
    });
  }

  if (strategy === 'forward-fill') {
    // Forward fill (use previous value)
    const result = [];
    const lastValues = {};

    for (const record of data) {
      const cleaned = { ...record };
      for (const key in cleaned) {
        if (cleaned[key] === null || cleaned[key] === undefined || cleaned[key] === '') {
          cleaned[key] = lastValues[key] || fillValue;
        } else {
          lastValues[key] = cleaned[key];
        }
      }
      result.push(cleaned);
    }
    return result;
  }

  return data;
}

/**
 * Normalize date formats
 */
export function normalizeDates(data, dateFields, format = 'iso') {
  return data.map(record => {
    const normalized = { ...record };

    for (const field of dateFields) {
      if (normalized[field]) {
        const date = new Date(normalized[field]);

        if (format === 'iso') {
          normalized[field] = date.toISOString();
        } else if (format === 'date') {
          normalized[field] = date.toISOString().split('T')[0];
        } else if (format === 'timestamp') {
          normalized[field] = date.getTime();
        }
      }
    }

    return normalized;
  });
}

/**
 * Normalize currency values
 */
export function normalizeCurrency(data, currencyFields, targetCurrency = 'USD', rates = {}) {
  return data.map(record => {
    const normalized = { ...record };

    for (const field of currencyFields) {
      if (normalized[field] !== null && normalized[field] !== undefined) {
        const amount = parseFloat(normalized[field]);
        const currency = normalized[`${field}_currency`] || targetCurrency;

        // Convert to target currency if rate available
        if (currency !== targetCurrency && rates[currency]) {
          normalized[field] = amount * rates[currency];
          normalized[`${field}_currency`] = targetCurrency;
        }
      }
    }

    return normalized;
  });
}

/**
 * Trim whitespace from all string fields
 */
export function trimStrings(data) {
  return data.map(record => {
    const trimmed = {};
    for (const [key, value] of Object.entries(record)) {
      trimmed[key] = typeof value === 'string' ? value.trim() : value;
    }
    return trimmed;
  });
}

/**
 * Convert data types
 */
export function convertTypes(data, typeMap) {
  return data.map(record => {
    const converted = { ...record };

    for (const [field, type] of Object.entries(typeMap)) {
      if (converted[field] !== null && converted[field] !== undefined) {
        switch (type) {
          case 'number':
            converted[field] = parseFloat(converted[field]);
            break;
          case 'integer':
            converted[field] = parseInt(converted[field], 10);
            break;
          case 'string':
            converted[field] = String(converted[field]);
            break;
          case 'boolean':
            converted[field] = Boolean(converted[field]);
            break;
          case 'date':
            converted[field] = new Date(converted[field]);
            break;
        }
      }
    }

    return converted;
  });
}

/**
 * Remove outliers using IQR method
 */
export function removeOutliers(data, field, multiplier = 1.5) {
  const values = data.map(r => r[field]).filter(v => typeof v === 'number').sort((a, b) => a - b);

  if (values.length === 0) return data;

  const q1 = values[Math.floor(values.length * 0.25)];
  const q3 = values[Math.floor(values.length * 0.75)];
  const iqr = q3 - q1;

  const lowerBound = q1 - (multiplier * iqr);
  const upperBound = q3 + (multiplier * iqr);

  return data.filter(record => {
    const value = record[field];
    return typeof value === 'number' && value >= lowerBound && value <= upperBound;
  });
}

/**
 * Standardize (z-score normalization)
 */
export function standardize(data, field) {
  const values = data.map(r => r[field]).filter(v => typeof v === 'number');

  if (values.length === 0) return data;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  );

  return data.map(record => ({
    ...record,
    [`${field}_standardized`]: (record[field] - mean) / stdDev
  }));
}

/**
 * Clean data using multiple strategies
 */
export function cleanData(data, options = {}) {
  let cleaned = [...data];

  // Remove duplicates
  if (options.removeDuplicates) {
    cleaned = removeDuplicates(cleaned, options.keyField);
  }

  // Trim strings
  cleaned = trimStrings(cleaned);

  // Handle missing values
  if (options.missingValueStrategy) {
    cleaned = handleMissingValues(cleaned, options.missingValueStrategy, options.fillValue);
  }

  // Normalize dates
  if (options.dateFields) {
    cleaned = normalizeDates(cleaned, options.dateFields, options.dateFormat);
  }

  // Convert types
  if (options.typeMap) {
    cleaned = convertTypes(cleaned, options.typeMap);
  }

  // Remove outliers
  if (options.removeOutliers && options.outlierField) {
    cleaned = removeOutliers(cleaned, options.outlierField, options.outlierMultiplier);
  }

  return cleaned;
}
