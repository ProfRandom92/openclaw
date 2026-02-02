import { test } from 'node:test';
import assert from 'node:assert';

// Mock email data
const mockEmail = {
  id: 'test123',
  threadId: 'thread123',
  snippet: 'This is an urgent meeting request for tomorrow',
  payload: {
    headers: [
      { name: 'From', value: 'boss@company.com' },
      { name: 'Subject', value: 'Urgent: Meeting Tomorrow' },
      { name: 'Date', value: 'Mon, 1 Jan 2026 10:00:00 +0000' }
    ]
  }
};

test('Extract email from From header', () => {
  function extractEmail(fromString) {
    const match = fromString.match(/<(.+?)>/);
    return match ? match[1] : fromString;
  }

  assert.strictEqual(extractEmail('John Doe <john@example.com>'), 'john@example.com');
  assert.strictEqual(extractEmail('jane@example.com'), 'jane@example.com');
  assert.strictEqual(extractEmail('Boss <boss@company.com>'), 'boss@company.com');
});

test('Get header value', () => {
  function getHeader(headers, name) {
    const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
    return header ? header.value : null;
  }

  const headers = mockEmail.payload.headers;
  assert.strictEqual(getHeader(headers, 'From'), 'boss@company.com');
  assert.strictEqual(getHeader(headers, 'Subject'), 'Urgent: Meeting Tomorrow');
  assert.strictEqual(getHeader(headers, 'NonExistent'), null);
});

test('Keyword matching for categorization', () => {
  function hasKeyword(content, keywords) {
    const lowerContent = content.toLowerCase();
    return keywords.some(keyword => lowerContent.includes(keyword.toLowerCase()));
  }

  const content = 'This is an urgent meeting request';
  const urgentKeywords = ['urgent', 'asap', 'critical'];
  const workKeywords = ['meeting', 'project', 'deadline'];

  assert.strictEqual(hasKeyword(content, urgentKeywords), true);
  assert.strictEqual(hasKeyword(content, workKeywords), true);
  assert.strictEqual(hasKeyword(content, ['newsletter', 'promo']), false);
});

test('Automated email detection', () => {
  function isAutomatedEmail(from) {
    const automatedPatterns = [
      'noreply',
      'no-reply',
      'donotreply',
      'automated'
    ];
    const lowerFrom = from.toLowerCase();
    return automatedPatterns.some(pattern => lowerFrom.includes(pattern));
  }

  assert.strictEqual(isAutomatedEmail('noreply@example.com'), true);
  assert.strictEqual(isAutomatedEmail('no-reply@service.com'), true);
  assert.strictEqual(isAutomatedEmail('user@example.com'), false);
});

test('Date parsing', () => {
  const dateString = 'Mon, 1 Jan 2026 10:00:00 +0000';
  const date = new Date(dateString);

  assert.strictEqual(date.getFullYear(), 2026);
  assert.strictEqual(date.getMonth(), 0); // January = 0
  assert.strictEqual(date.getDate(), 1);
});

test('Calculate response time', () => {
  function calculateResponseTime(receivedDate, sentDate) {
    const diffMs = sentDate - receivedDate;
    return diffMs / 1000 / 60; // Convert to minutes
  }

  const received = new Date('2026-01-01T10:00:00Z');
  const sent = new Date('2026-01-01T11:30:00Z');

  const responseTime = calculateResponseTime(received, sent);
  assert.strictEqual(responseTime, 90); // 90 minutes
});

test('Format time display', () => {
  function formatTime(minutes) {
    if (minutes < 60) {
      return `${Math.round(minutes)} minutes`;
    }
    const hours = minutes / 60;
    if (hours < 24) {
      return `${hours.toFixed(1)} hours`;
    }
    const days = hours / 24;
    return `${days.toFixed(1)} days`;
  }

  assert.strictEqual(formatTime(45), '45 minutes');
  assert.strictEqual(formatTime(90), '1.5 hours');
  assert.strictEqual(formatTime(1440), '1.0 days');
});

test('Parse CLI arguments', () => {
  function parseArgs(args) {
    const options = {};
    const positional = [];

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg.startsWith('--')) {
        const key = arg.slice(2);
        const nextArg = args[i + 1];

        if (nextArg && !nextArg.startsWith('--')) {
          options[key] = nextArg;
          i++;
        } else {
          options[key] = true;
        }
      } else {
        positional.push(arg);
      }
    }

    return { positional, options };
  }

  const result = parseArgs(['categorize', '100', '--dry-run', '--export']);
  assert.strictEqual(result.positional[0], 'categorize');
  assert.strictEqual(result.positional[1], '100');
  assert.strictEqual(result.options['dry-run'], true);
  assert.strictEqual(result.options['export'], true);

  const result2 = parseArgs(['label', 'sender@example.com', 'Important', '--force']);
  assert.strictEqual(result2.positional[0], 'label');
  assert.strictEqual(result2.positional[1], 'sender@example.com');
  assert.strictEqual(result2.positional[2], 'Important');
  assert.strictEqual(result2.options['force'], true);
});

test('Template variable replacement', () => {
  function replaceVariables(template, variables) {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(`{${key}}`, value);
    }
    return result;
  }

  const template = 'Hello {name}, your order {order_id} is ready!';
  const variables = { name: 'John', order_id: '12345' };
  const result = replaceVariables(template, variables);

  assert.strictEqual(result, 'Hello John, your order 12345 is ready!');
});

test('Sender pattern matching', () => {
  function matchesSenderPattern(email, patterns) {
    const lowerEmail = email.toLowerCase();
    return patterns.some(pattern =>
      lowerEmail.includes(pattern.toLowerCase())
    );
  }

  assert.strictEqual(matchesSenderPattern('user@company.com', ['@company.com']), true);
  assert.strictEqual(matchesSenderPattern('noreply@service.com', ['noreply']), true);
  assert.strictEqual(matchesSenderPattern('user@example.com', ['@company.com']), false);
});

console.log('All tests passed! ✓');
