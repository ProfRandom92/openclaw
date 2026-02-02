import Stripe from 'stripe';

/**
 * Stripe Data Source
 * Exports payment and subscription data from Stripe
 */
export class StripeSource {
  constructor(config) {
    const apiKey = config.apiKey || process.env.STRIPE_API_KEY;

    if (!apiKey) {
      throw new Error('STRIPE_API_KEY is required');
    }

    this.stripe = new Stripe(apiKey);
  }

  /**
   * Export data from Stripe
   */
  async export(options) {
    const {
      type = 'payments',
      startDate,
      endDate,
      limit = 100
    } = options;

    try {
      let data = [];

      const dateFilter = {};
      if (startDate) {
        dateFilter.gte = Math.floor(new Date(startDate).getTime() / 1000);
      }
      if (endDate) {
        dateFilter.lte = Math.floor(new Date(endDate).getTime() / 1000);
      }

      switch (type) {
        case 'payments':
          data = await this.getPayments(dateFilter, limit);
          break;
        case 'customers':
          data = await this.getCustomers(dateFilter, limit);
          break;
        case 'subscriptions':
          data = await this.getSubscriptions(dateFilter, limit);
          break;
        case 'charges':
          data = await this.getCharges(dateFilter, limit);
          break;
        default:
          throw new Error(`Unknown export type: ${type}`);
      }

      return {
        success: true,
        data,
        metadata: {
          source: 'stripe',
          type,
          rowCount: data.length
        }
      };
    } catch (error) {
      throw new Error(`Stripe export failed: ${error.message}`);
    }
  }

  /**
   * Get payment intents
   */
  async getPayments(dateFilter, limit) {
    const payments = [];
    const params = { limit: Math.min(limit, 100) };

    if (Object.keys(dateFilter).length > 0) {
      params.created = dateFilter;
    }

    const paymentIntents = await this.stripe.paymentIntents.list(params);

    for (const payment of paymentIntents.data) {
      payments.push({
        id: payment.id,
        amount: payment.amount / 100, // Convert cents to dollars
        currency: payment.currency.toUpperCase(),
        status: payment.status,
        created: new Date(payment.created * 1000).toISOString(),
        customer: payment.customer,
        description: payment.description,
        payment_method: payment.payment_method
      });
    }

    return payments;
  }

  /**
   * Get customers
   */
  async getCustomers(dateFilter, limit) {
    const params = { limit: Math.min(limit, 100) };

    if (Object.keys(dateFilter).length > 0) {
      params.created = dateFilter;
    }

    const customers = await this.stripe.customers.list(params);

    return customers.data.map(customer => ({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      created: new Date(customer.created * 1000).toISOString(),
      balance: customer.balance / 100,
      currency: customer.currency,
      description: customer.description
    }));
  }

  /**
   * Get subscriptions
   */
  async getSubscriptions(dateFilter, limit) {
    const params = { limit: Math.min(limit, 100) };

    if (Object.keys(dateFilter).length > 0) {
      params.created = dateFilter;
    }

    const subscriptions = await this.stripe.subscriptions.list(params);

    return subscriptions.data.map(sub => ({
      id: sub.id,
      customer: sub.customer,
      status: sub.status,
      created: new Date(sub.created * 1000).toISOString(),
      current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      amount: sub.items.data[0]?.price?.unit_amount / 100,
      currency: sub.currency,
      interval: sub.items.data[0]?.price?.recurring?.interval
    }));
  }

  /**
   * Get charges
   */
  async getCharges(dateFilter, limit) {
    const params = { limit: Math.min(limit, 100) };

    if (Object.keys(dateFilter).length > 0) {
      params.created = dateFilter;
    }

    const charges = await this.stripe.charges.list(params);

    return charges.data.map(charge => ({
      id: charge.id,
      amount: charge.amount / 100,
      currency: charge.currency.toUpperCase(),
      status: charge.status,
      paid: charge.paid,
      refunded: charge.refunded,
      created: new Date(charge.created * 1000).toISOString(),
      customer: charge.customer,
      description: charge.description
    }));
  }
}
