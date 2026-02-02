#!/usr/bin/env node

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// OAuth2 scopes
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.labels',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.settings.basic'
];

// Token storage path
const TOKEN_DIR = path.join(os.homedir(), '.email-workflow');
const TOKEN_PATH = path.join(TOKEN_DIR, 'tokens.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Create OAuth2 client from credentials
 */
function createOAuth2Client() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error('❌ Error: credentials.json not found');
    console.error('\nPlease follow these steps:');
    console.error('1. Go to https://console.cloud.google.com/');
    console.error('2. Create a project and enable Gmail API');
    console.error('3. Create OAuth 2.0 credentials (Desktop app)');
    console.error('4. Download and save as credentials.json in this directory\n');
    process.exit(1);
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

  return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
}

/**
 * Get new token by prompting user authorization
 */
async function getNewToken(oauth2Client) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('\n🔐 Authorize this app by visiting this URL:\n');
  console.log(authUrl);
  console.log('\n');

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    rl.question('Enter the authorization code from that page: ', async (code) => {
      rl.close();

      try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Store the token
        if (!fs.existsSync(TOKEN_DIR)) {
          fs.mkdirSync(TOKEN_DIR, { recursive: true });
        }

        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
        console.log('\n✓ Token stored to', TOKEN_PATH);
        resolve(oauth2Client);
      } catch (error) {
        reject(new Error(`Error retrieving access token: ${error.message}`));
      }
    });
  });
}

/**
 * Authorize and get OAuth2 client
 */
export async function authorize() {
  const oauth2Client = createOAuth2Client();

  // Check if we have previously stored a token
  if (fs.existsSync(TOKEN_PATH)) {
    const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
    oauth2Client.setCredentials(tokens);

    // Check if token needs refresh
    if (tokens.expiry_date && tokens.expiry_date < Date.now()) {
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        oauth2Client.setCredentials(credentials);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(credentials));
        console.log('✓ Token refreshed');
      } catch (error) {
        console.warn('⚠ Token refresh failed, requesting new authorization');
        return getNewToken(oauth2Client);
      }
    }

    return oauth2Client;
  }

  return getNewToken(oauth2Client);
}

/**
 * Get Gmail API client
 */
export async function getGmailClient() {
  const auth = await authorize();
  return google.gmail({ version: 'v1', auth });
}

/**
 * Test the authentication
 */
async function testAuth() {
  console.log('📧 Email Workflow Manager - Authentication\n');

  try {
    const gmail = await getGmailClient();

    // Test by getting user profile
    const profile = await gmail.users.getProfile({ userId: 'me' });

    console.log('\n✓ Authentication successful!');
    console.log(`\nEmail: ${profile.data.emailAddress}`);
    console.log(`Total messages: ${profile.data.messagesTotal}`);
    console.log(`Total threads: ${profile.data.threadsTotal}`);
    console.log('\n✓ Ready to use Email Workflow Manager\n');

  } catch (error) {
    console.error('\n❌ Authentication failed:', error.message);
    if (fs.existsSync(TOKEN_PATH)) {
      console.log('\nTrying to remove old token and re-authenticate...');
      fs.unlinkSync(TOKEN_PATH);
      console.log('Please run this script again.');
    }
    process.exit(1);
  }
}

// Run if executed directly
if (process.argv[1] === __filename) {
  testAuth();
}
