/**
 * Data Merging and Joining
 */

/**
 * Merge two datasets
 */
export function mergeData(left, right, options = {}) {
  const {
    leftKey = 'id',
    rightKey = 'id',
    type = 'inner', // inner, left, right, outer
    prefix = { left: '', right: '_right' }
  } = options;

  const merged = [];

  if (type === 'inner' || type === 'left') {
    for (const leftRecord of left) {
      const rightRecord = right.find(r => r[rightKey] === leftRecord[leftKey]);

      if (rightRecord) {
        // Match found
        merged.push(combineRecords(leftRecord, rightRecord, prefix));
      } else if (type === 'left') {
        // Left join: include left record even without match
        merged.push(combineRecords(leftRecord, {}, prefix));
      }
    }
  }

  if (type === 'right' || type === 'outer') {
    for (const rightRecord of right) {
      const leftRecord = left.find(l => l[leftKey] === rightRecord[rightKey]);

      if (!leftRecord) {
        if (type === 'right' || type === 'outer') {
          merged.push(combineRecords({}, rightRecord, prefix));
        }
      } else if (type === 'outer') {
        // Outer join: only add if not already added
        const exists = merged.some(m => m[leftKey] === leftRecord[leftKey]);
        if (!exists) {
          merged.push(combineRecords(leftRecord, rightRecord, prefix));
        }
      }
    }
  }

  return merged;
}

/**
 * Combine two records with prefixes
 */
function combineRecords(left, right, prefix) {
  const combined = {};

  // Add left record fields
  for (const [key, value] of Object.entries(left)) {
    combined[`${prefix.left}${key}`] = value;
  }

  // Add right record fields
  for (const [key, value] of Object.entries(right)) {
    const newKey = `${prefix.right}${key}`;
    // Handle conflicts
    if (combined[newKey] !== undefined) {
      combined[`${newKey}_conflict`] = value;
    } else {
      combined[newKey] = value;
    }
  }

  return combined;
}

/**
 * Auto-detect common key between datasets
 */
export function detectCommonKey(left, right) {
  if (left.length === 0 || right.length === 0) return null;

  const leftKeys = Object.keys(left[0]);
  const rightKeys = Object.keys(right[0]);

  // Check for exact key name matches
  const commonKeys = leftKeys.filter(key => rightKeys.includes(key));

  if (commonKeys.length > 0) {
    // Prefer 'id' if it exists
    if (commonKeys.includes('id')) return 'id';

    // Otherwise return first common key
    return commonKeys[0];
  }

  // Check for similar key names (e.g., 'customer_id' and 'id')
  for (const leftKey of leftKeys) {
    for (const rightKey of rightKeys) {
      if (leftKey.includes(rightKey) || rightKey.includes(leftKey)) {
        return { left: leftKey, right: rightKey };
      }
    }
  }

  return null;
}

/**
 * Union: Combine datasets vertically (append)
 */
export function unionData(datasets, options = {}) {
  const { removeDuplicates = false, keyField = 'id' } = options;

  let combined = [];

  for (const dataset of datasets) {
    combined = combined.concat(dataset);
  }

  if (removeDuplicates && keyField) {
    const seen = new Set();
    combined = combined.filter(record => {
      const key = record[keyField];
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  return combined;
}

/**
 * Group by and aggregate
 */
export function groupBy(data, groupFields, aggregations) {
  const groups = {};

  // Group data
  for (const record of data) {
    const groupKey = groupFields.map(field => record[field]).join('|');

    if (!groups[groupKey]) {
      groups[groupKey] = {
        records: [],
        key: {}
      };

      // Store group key fields
      groupFields.forEach(field => {
        groups[groupKey].key[field] = record[field];
      });
    }

    groups[groupKey].records.push(record);
  }

  // Aggregate
  const result = [];

  for (const group of Object.values(groups)) {
    const aggregated = { ...group.key };

    for (const [field, aggType] of Object.entries(aggregations)) {
      const values = group.records.map(r => r[field]).filter(v => typeof v === 'number');

      switch (aggType) {
        case 'sum':
          aggregated[`${field}_sum`] = values.reduce((a, b) => a + b, 0);
          break;
        case 'avg':
        case 'average':
          aggregated[`${field}_avg`] = values.reduce((a, b) => a + b, 0) / values.length;
          break;
        case 'min':
          aggregated[`${field}_min`] = Math.min(...values);
          break;
        case 'max':
          aggregated[`${field}_max`] = Math.max(...values);
          break;
        case 'count':
          aggregated[`${field}_count`] = group.records.length;
          break;
      }
    }

    result.push(aggregated);
  }

  return result;
}

/**
 * Pivot data
 */
export function pivot(data, rowField, columnField, valueField, aggFunc = 'sum') {
  const pivoted = [];
  const columns = new Set();

  // Get unique column values
  data.forEach(record => columns.add(record[columnField]));

  // Group by row field
  const groups = {};
  data.forEach(record => {
    const row = record[rowField];
    if (!groups[row]) {
      groups[row] = {};
      groups[row][rowField] = row;
    }

    const col = record[columnField];
    const value = record[valueField];

    if (!groups[row][col]) {
      groups[row][col] = [];
    }
    groups[row][col].push(value);
  });

  // Aggregate
  for (const row of Object.values(groups)) {
    const pivotedRow = { ...row };

    for (const col of columns) {
      if (row[col]) {
        const values = row[col];
        if (aggFunc === 'sum') {
          pivotedRow[col] = values.reduce((a, b) => a + b, 0);
        } else if (aggFunc === 'avg') {
          pivotedRow[col] = values.reduce((a, b) => a + b, 0) / values.length;
        } else if (aggFunc === 'count') {
          pivotedRow[col] = values.length;
        }
      } else {
        pivotedRow[col] = 0;
      }
    }

    // Remove the array fields
    for (const col of columns) {
      if (Array.isArray(pivotedRow[col])) {
        delete pivotedRow[col];
      }
    }

    pivoted.push(pivotedRow);
  }

  return pivoted;
}
