import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { readFileSync } from 'fs';

/**
 * Google Analytics Data Source
 * Exports data from Google Analytics 4 (GA4)
 */
export class GoogleAnalyticsSource {
  constructor(config) {
    this.propertyId = config.propertyId || process.env.GA_PROPERTY_ID;
    this.credentialsPath = config.credentialsPath || process.env.GA_CREDENTIALS_PATH;

    if (!this.propertyId) {
      throw new Error('GA_PROPERTY_ID is required');
    }

    if (!this.credentialsPath) {
      throw new Error('GA_CREDENTIALS_PATH is required');
    }

    // Initialize GA4 client
    this.client = new BetaAnalyticsDataClient({
      keyFilename: this.credentialsPath
    });
  }

  /**
   * Export data from Google Analytics
   */
  async export(options) {
    const {
      startDate,
      endDate,
      metrics = ['sessions', 'users', 'pageviews'],
      dimensions = ['date'],
      limit = 10000
    } = options;

    try {
      const [response] = await this.client.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [
          {
            startDate: startDate || '30daysAgo',
            endDate: endDate || 'today'
          }
        ],
        dimensions: dimensions.map(name => ({ name })),
        metrics: metrics.map(name => ({ name })),
        limit
      });

      // Transform response to array of objects
      const data = this.transformResponse(response);

      return {
        success: true,
        data,
        metadata: {
          source: 'google-analytics',
          propertyId: this.propertyId,
          dateRange: { startDate, endDate },
          rowCount: data.length
        }
      };
    } catch (error) {
      throw new Error(`Google Analytics export failed: ${error.message}`);
    }
  }

  /**
   * Transform GA4 API response to array of objects
   */
  transformResponse(response) {
    const data = [];
    const dimensionHeaders = response.dimensionHeaders.map(h => h.name);
    const metricHeaders = response.metricHeaders.map(h => h.name);

    response.rows?.forEach(row => {
      const record = {};

      // Add dimensions
      row.dimensionValues.forEach((value, index) => {
        record[dimensionHeaders[index]] = value.value;
      });

      // Add metrics
      row.metricValues.forEach((value, index) => {
        record[metricHeaders[index]] = parseFloat(value.value);
      });

      data.push(record);
    });

    return data;
  }

  /**
   * Get available metrics
   */
  static getAvailableMetrics() {
    return [
      'sessions',
      'users',
      'newUsers',
      'pageviews',
      'screenPageViews',
      'bounceRate',
      'averageSessionDuration',
      'conversions',
      'eventCount'
    ];
  }

  /**
   * Get available dimensions
   */
  static getAvailableDimensions() {
    return [
      'date',
      'country',
      'city',
      'deviceCategory',
      'browser',
      'operatingSystem',
      'pagePath',
      'pageTitle',
      'source',
      'medium',
      'campaign'
    ];
  }
}
