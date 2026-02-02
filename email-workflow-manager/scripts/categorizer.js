import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load categories configuration
const categoriesPath = path.join(__dirname, '../config/categories.json');
const categoriesConfig = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));

/**
 * Categorizes an email based on its content and metadata
 * @param {Object} email - Gmail message object
 * @returns {string} Category name
 */
export function categorizeEmail(email) {
  const headers = email.payload?.headers || [];
  const subject = getHeader(headers, 'Subject') || '';
  const from = getHeader(headers, 'From') || '';
  const snippet = email.snippet || '';

  const content = `${subject} ${from} ${snippet}`.toLowerCase();

  // Check each category
  for (const [category, config] of Object.entries(categoriesConfig.categories)) {
    if (matchesCategory(content, from, config)) {
      return category;
    }
  }

  // Default to Work if no match
  return 'Work';
}

/**
 * Check if email matches category criteria
 */
function matchesCategory(content, from, config) {
  // Check keywords
  if (config.keywords && config.keywords.length > 0) {
    const hasKeyword = config.keywords.some(keyword =>
      content.includes(keyword.toLowerCase())
    );
    if (hasKeyword) return true;
  }

  // Check sender patterns
  if (config.senderPatterns && config.senderPatterns.length > 0) {
    const matchesSender = config.senderPatterns.some(pattern =>
      from.toLowerCase().includes(pattern.toLowerCase())
    );
    if (matchesSender) return true;
  }

  // Check subject patterns
  if (config.subjectPatterns && config.subjectPatterns.length > 0) {
    const matchesSubject = config.subjectPatterns.some(pattern =>
      content.includes(pattern.toLowerCase())
    );
    if (matchesSubject) return true;
  }

  return false;
}

/**
 * Get header value by name
 */
function getHeader(headers, name) {
  const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
  return header ? header.value : null;
}

/**
 * Create or get label ID for a category
 */
export async function ensureLabel(gmail, categoryName) {
  try {
    // List existing labels
    const labelsResponse = await gmail.users.labels.list({ userId: 'me' });
    const labels = labelsResponse.data.labels || [];

    // Check if label exists
    const existingLabel = labels.find(l => l.name === categoryName);
    if (existingLabel) {
      return existingLabel.id;
    }

    // Create new label
    const createResponse = await gmail.users.labels.create({
      userId: 'me',
      requestBody: {
        name: categoryName,
        labelListVisibility: 'labelShow',
        messageListVisibility: 'show',
        color: getCategoryColor(categoryName)
      }
    });

    return createResponse.data.id;
  } catch (error) {
    throw new Error(`Failed to ensure label: ${error.message}`);
  }
}

/**
 * Get color scheme for a category
 */
function getCategoryColor(category) {
  const colors = {
    'Urgent': { textColor: '#ffffff', backgroundColor: '#dc2626' },
    'Work': { textColor: '#000000', backgroundColor: '#3b82f6' },
    'Personal': { textColor: '#ffffff', backgroundColor: '#8b5cf6' },
    'Newsletter': { textColor: '#000000', backgroundColor: '#fbbf24' },
    'Social': { textColor: '#ffffff', backgroundColor: '#ec4899' },
    'Promotional': { textColor: '#ffffff', backgroundColor: '#10b981' }
  };

  return colors[category] || { textColor: '#000000', backgroundColor: '#9ca3af' };
}

/**
 * Apply label to email
 */
export async function applyLabel(gmail, messageId, labelId, dryRun = false) {
  if (dryRun) {
    return { dryRun: true };
  }

  try {
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        addLabelIds: [labelId]
      }
    });
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to apply label: ${error.message}`);
  }
}

/**
 * Batch categorize emails
 */
export async function batchCategorizeEmails(gmail, emails, dryRun = false) {
  const results = {
    total: emails.length,
    categorized: 0,
    byCategory: {},
    errors: []
  };

  // Create labels cache
  const labelCache = {};

  for (const email of emails) {
    try {
      const category = categorizeEmail(email);

      // Ensure label exists
      if (!labelCache[category]) {
        labelCache[category] = await ensureLabel(gmail, category);
      }

      // Apply label
      await applyLabel(gmail, email.id, labelCache[category], dryRun);

      // Update results
      results.categorized++;
      results.byCategory[category] = (results.byCategory[category] || 0) + 1;

      // Rate limiting
      await delay(250);
    } catch (error) {
      results.errors.push({
        emailId: email.id,
        error: error.message
      });
    }
  }

  return results;
}

/**
 * Delay helper
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get all available categories
 */
export function getCategories() {
  return Object.keys(categoriesConfig.categories);
}
