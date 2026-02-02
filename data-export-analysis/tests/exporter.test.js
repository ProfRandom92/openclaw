import { test } from 'node:test';
import assert from 'node:assert';

// Mock data for testing
const mockData = [
  { date: '2026-01-01', revenue: 1000, orders: 10 },
  { date: '2026-01-02', revenue: 1200, orders: 12 },
  { date: '2026-01-03', revenue: 900, orders: 9 },
  { date: '2026-01-04', revenue: 1500, orders: 15 },
  { date: '2026-01-05', revenue: 1100, orders: 11 }
];

test('Remove duplicates', () => {
  function removeDuplicates(data, keyField) {
    const seen = new Set();
    return data.filter(record => {
      const key = record[keyField];
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  const dataWithDupes = [
    { id: 1, name: 'A' },
    { id: 2, name: 'B' },
    { id: 1, name: 'C' }
  ];

  const result = removeDuplicates(dataWithDupes, 'id');
  assert.strictEqual(result.length, 2);
  assert.strictEqual(result[0].id, 1);
  assert.strictEqual(result[1].id, 2);
});

test('Calculate sum of field', () => {
  function sumField(data, field) {
    return data.reduce((sum, record) => sum + (record[field] || 0), 0);
  }

  const sum = sumField(mockData, 'revenue');
  assert.strictEqual(sum, 5700);
});

test('Calculate average', () => {
  function avgField(data, field) {
    const sum = data.reduce((sum, record) => sum + (record[field] || 0), 0);
    return data.length > 0 ? sum / data.length : 0;
  }

  const avg = avgField(mockData, 'revenue');
  assert.strictEqual(avg, 1140);
});

test('Growth rate calculation', () => {
  function calculateGrowth(current, previous) {
    return previous !== 0 ? ((current - previous) / previous) * 100 : 0;
  }

  const growth = calculateGrowth(1200, 1000);
  assert.strictEqual(growth, 20);
});

test('Filter data by date range', () => {
  function filterByDateRange(data, dateField, startDate, endDate) {
    return data.filter(record => {
      const date = new Date(record[dateField]);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });
  }

  const filtered = filterByDateRange(mockData, 'date', '2026-01-02', '2026-01-04');
  assert.strictEqual(filtered.length, 3);
});

test('Group by date', () => {
  function groupBy(data, field) {
    const groups = {};
    data.forEach(record => {
      const key = record[field];
      if (!groups[key]) groups[key] = [];
      groups[key].push(record);
    });
    return groups;
  }

  const grouped = groupBy(mockData, 'date');
  assert.strictEqual(Object.keys(grouped).length, 5);
  assert.strictEqual(grouped['2026-01-01'].length, 1);
});

test('Calculate moving average', () => {
  function calculateMovingAverage(data, field, window) {
    return data.map((record, index) => {
      const start = Math.max(0, index - window + 1);
      const windowData = data.slice(start, index + 1);
      const values = windowData.map(r => r[field]);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      return { ...record, ma: avg };
    });
  }

  const result = calculateMovingAverage(mockData, 'revenue', 3);
  assert.strictEqual(result.length, 5);
  assert.strictEqual(result[0].ma, 1000);
});

test('Detect outliers', () => {
  function detectOutliers(data, field, threshold) {
    const values = data.map(r => r[field]);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    );

    return data.filter(record => {
      const zScore = Math.abs((record[field] - mean) / stdDev);
      return zScore > threshold;
    });
  }

  const outliers = detectOutliers(mockData, 'revenue', 2);
  assert.strictEqual(Array.isArray(outliers), true);
});

test('Merge datasets', () => {
  function mergeData(left, right, leftKey, rightKey) {
    return left.map(leftRecord => {
      const rightRecord = right.find(r => r[rightKey] === leftRecord[leftKey]);
      return { ...leftRecord, ...rightRecord };
    });
  }

  const left = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];
  const right = [{ id: 1, value: 100 }, { id: 2, value: 200 }];

  const merged = mergeData(left, right, 'id', 'id');
  assert.strictEqual(merged.length, 2);
  assert.strictEqual(merged[0].value, 100);
});

test('Calculate percentage of total', () => {
  function calculatePercentage(data, field) {
    const total = data.reduce((sum, record) => sum + (record[field] || 0), 0);
    return data.map(record => ({
      ...record,
      percentage: total > 0 ? (record[field] / total) * 100 : 0
    }));
  }

  const result = calculatePercentage(mockData, 'revenue');
  assert.strictEqual(result.length, 5);
  assert.strictEqual(Math.round(result[0].percentage), 18); // 1000/5700 * 100
});

console.log('All tests passed! ✓');
