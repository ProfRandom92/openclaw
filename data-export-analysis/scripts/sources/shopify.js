import axios from 'axios';

/**
 * Shopify Data Source
 * Exports data from Shopify stores
 */
export class ShopifySource {
  constructor(config) {
    this.shopUrl = config.shopUrl || process.env.SHOPIFY_SHOP_URL;
    this.accessToken = config.accessToken || process.env.SHOPIFY_ACCESS_TOKEN;

    if (!this.shopUrl || !this.accessToken) {
      throw new Error('SHOPIFY_SHOP_URL and SHOPIFY_ACCESS_TOKEN are required');
    }

    this.baseUrl = `https://${this.shopUrl}/admin/api/2024-01`;
    this.headers = {
      'X-Shopify-Access-Token': this.accessToken,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Export data from Shopify
   */
  async export(options) {
    const {
      type = 'orders',
      startDate,
      endDate,
      status = 'any',
      limit = 250
    } = options;

    try {
      let data = [];

      switch (type) {
        case 'orders':
          data = await this.getOrders({ startDate, endDate, status, limit });
          break;
        case 'products':
          data = await this.getProducts({ limit });
          break;
        case 'customers':
          data = await this.getCustomers({ limit });
          break;
        default:
          throw new Error(`Unknown export type: ${type}`);
      }

      return {
        success: true,
        data,
        metadata: {
          source: 'shopify',
          shop: this.shopUrl,
          type,
          rowCount: data.length
        }
      };
    } catch (error) {
      throw new Error(`Shopify export failed: ${error.message}`);
    }
  }

  /**
   * Get orders
   */
  async getOrders(options) {
    const params = {
      status: options.status,
      limit: Math.min(options.limit, 250)
    };

    if (options.startDate) {
      params.created_at_min = new Date(options.startDate).toISOString();
    }
    if (options.endDate) {
      params.created_at_max = new Date(options.endDate).toISOString();
    }

    const response = await axios.get(`${this.baseUrl}/orders.json`, {
      headers: this.headers,
      params
    });

    // Transform orders to flat structure
    return response.data.orders.map(order => ({
      id: order.id,
      name: order.name,
      email: order.email,
      created_at: order.created_at,
      total_price: parseFloat(order.total_price),
      subtotal_price: parseFloat(order.subtotal_price),
      total_tax: parseFloat(order.total_tax),
      currency: order.currency,
      financial_status: order.financial_status,
      fulfillment_status: order.fulfillment_status,
      item_count: order.line_items.length,
      customer_id: order.customer?.id
    }));
  }

  /**
   * Get products
   */
  async getProducts(options) {
    const params = {
      limit: Math.min(options.limit, 250)
    };

    const response = await axios.get(`${this.baseUrl}/products.json`, {
      headers: this.headers,
      params
    });

    return response.data.products.map(product => ({
      id: product.id,
      title: product.title,
      vendor: product.vendor,
      product_type: product.product_type,
      created_at: product.created_at,
      updated_at: product.updated_at,
      status: product.status,
      variants_count: product.variants.length,
      total_inventory: product.variants.reduce((sum, v) => sum + (v.inventory_quantity || 0), 0)
    }));
  }

  /**
   * Get customers
   */
  async getCustomers(options) {
    const params = {
      limit: Math.min(options.limit, 250)
    };

    const response = await axios.get(`${this.baseUrl}/customers.json`, {
      headers: this.headers,
      params
    });

    return response.data.customers.map(customer => ({
      id: customer.id,
      email: customer.email,
      first_name: customer.first_name,
      last_name: customer.last_name,
      orders_count: customer.orders_count,
      total_spent: parseFloat(customer.total_spent),
      created_at: customer.created_at,
      updated_at: customer.updated_at,
      state: customer.state
    }));
  }

  /**
   * Rate limiting helper
   */
  async delay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
