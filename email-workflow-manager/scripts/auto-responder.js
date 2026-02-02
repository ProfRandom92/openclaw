import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load templates
const templatesPath = path.join(__dirname, '../config/templates.json');
const templatesConfig = JSON.parse(fs.readFileSync(templatesPath, 'utf-8'));

/**
 * Setup vacation responder
 */
export async function setupVacationResponder(gmail, options) {
  const {
    startDate,
    endDate,
    backupContact = 'your team',
    senderName = 'The Team'
  } = options;

  try {
    const template = templatesConfig.templates.vacation;
    const body = template.body
      .replace('{start_date}', startDate)
      .replace('{end_date}', endDate)
      .replace('{backup_contact}', backupContact)
      .replace('{sender_name}', senderName);

    const settings = {
      enableAutoReply: true,
      responseSubject: 'Out of Office',
      responseBodyPlainText: body,
      restrictToContacts: false,
      restrictToDomain: false,
      startTime: new Date(startDate).getTime(),
      endTime: new Date(endDate).getTime()
    };

    await gmail.users.settings.updateVacation({
      userId: 'me',
      requestBody: settings
    });

    return {
      success: true,
      message: `Vacation responder enabled from ${startDate} to ${endDate}`
    };
  } catch (error) {
    throw new Error(`Failed to setup vacation responder: ${error.message}`);
  }
}

/**
 * Disable auto-reply
 */
export async function disableAutoReply(gmail) {
  try {
    await gmail.users.settings.updateVacation({
      userId: 'me',
      requestBody: {
        enableAutoReply: false
      }
    });

    return {
      success: true,
      message: 'Auto-reply disabled'
    };
  } catch (error) {
    throw new Error(`Failed to disable auto-reply: ${error.message}`);
  }
}

/**
 * Get current vacation settings
 */
export async function getVacationSettings(gmail) {
  try {
    const response = await gmail.users.settings.getVacation({ userId: 'me' });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to get vacation settings: ${error.message}`);
  }
}

/**
 * Send auto-reply to specific email
 */
export async function sendAutoReply(gmail, messageId, templateName, variables = {}) {
  try {
    // Get the original message
    const message = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full'
    });

    const headers = message.data.payload.headers;
    const from = getHeader(headers, 'From');
    const subject = getHeader(headers, 'Subject');
    const messageIdHeader = getHeader(headers, 'Message-ID');

    if (!from) {
      throw new Error('Cannot find sender address');
    }

    // Get template
    const template = templatesConfig.templates[templateName];
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    // Replace variables
    let replySubject = template.subject.replace('{original_subject}', subject || 'Your email');
    let replyBody = template.body.replace('{original_subject}', subject || 'Your email');

    for (const [key, value] of Object.entries(variables)) {
      replyBody = replyBody.replace(`{${key}}`, value);
      replySubject = replySubject.replace(`{${key}}`, value);
    }

    // Create email message
    const email = [
      `To: ${from}`,
      `Subject: ${replySubject}`,
      messageIdHeader ? `In-Reply-To: ${messageIdHeader}` : '',
      messageIdHeader ? `References: ${messageIdHeader}` : '',
      'Content-Type: text/plain; charset=utf-8',
      '',
      replyBody
    ].filter(line => line).join('\n');

    // Encode email
    const encodedEmail = Buffer.from(email)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send reply
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail,
        threadId: message.data.threadId
      }
    });

    return {
      success: true,
      message: `Auto-reply sent using template '${templateName}'`
    };
  } catch (error) {
    throw new Error(`Failed to send auto-reply: ${error.message}`);
  }
}

/**
 * Get header value
 */
function getHeader(headers, name) {
  const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
  return header ? header.value : null;
}

/**
 * Check if email should receive auto-reply
 */
export function shouldAutoReply(email, rules = {}) {
  const headers = email.payload?.headers || [];
  const from = getHeader(headers, 'From') || '';
  const subject = getHeader(headers, 'Subject') || '';

  // Don't reply to automated emails
  const automatedPatterns = [
    'noreply',
    'no-reply',
    'donotreply',
    'do-not-reply',
    'automated',
    'notification'
  ];

  const isAutomated = automatedPatterns.some(pattern =>
    from.toLowerCase().includes(pattern)
  );

  if (isAutomated) return false;

  // Don't reply to mailing lists
  const listHeaders = ['List-Id', 'List-Unsubscribe', 'Precedence'];
  const isMailingList = listHeaders.some(header =>
    headers.find(h => h.name === header)
  );

  if (isMailingList) return false;

  // Check custom rules
  if (rules.onlyContacts && !isFromContact(from)) {
    return false;
  }

  if (rules.domainRestriction && !from.includes(rules.domainRestriction)) {
    return false;
  }

  return true;
}

/**
 * Check if sender is in contacts (simplified)
 */
function isFromContact(email) {
  // In a real implementation, this would check against Gmail contacts
  // For now, return true (would need Google People API)
  return true;
}

/**
 * Get available templates
 */
export function getAvailableTemplates() {
  return Object.keys(templatesConfig.templates);
}
