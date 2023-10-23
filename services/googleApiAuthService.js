const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly','https://www.googleapis.com/auth/gmail.send'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), './credentials/token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), './credentials/credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

// /**
//  * Lists the labels in the user's account.
//  *
//  * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
//  */
// async function listLabels(auth) {
//   const gmail = google.gmail({version: 'v1', auth});
//   const res = await gmail.users.labels.list({
//     userId: 'me',
//   });
//   const labels = res.data.labels;
//   if (!labels || labels.length === 0) {
//     console.log('No labels found.');
//     return;
//   }
//   console.log('Labels:');
//   labels.forEach((label) => {
//     console.log(`- ${label.name}`);
//   });
// }

// async function listMessages(auth) {
//     const gmail = google.gmail({version: 'v1', auth});
//     const res = await gmail.users.messages.list({
//         userId: 'me',
//         maxResults: 1,
//     })

//     let latestMessageId = res.data.messages[0].id;
//     console.log(latestMessageId);
//     const message = await gmail.users.messages.get({
//         userId: 'me',
//         id: latestMessageId,
//       });

//     const body = JSON.stringify(message.data.payload.body.data);
//     console.log(body);
//     let mailBody = new Buffer.from(body, "base64").toString();
//     console.log(mailBody);
//    }


// async function sendEmail(auth){
//     const gmail = google.gmail({version: 'v1', auth});
//     const message = 'To: techtutorial2306@gmail.com\n' +
//                 'Subject: Test email\n' +
//                 'Content-Type: text/html; charset=utf-8\n\n' +
//                 '<h1>Hello World!</h1>';
// const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
// const res = await gmail.users.messages.send({
//   userId: 'me',
//   requestBody: {
//     raw: encodedMessage
//   }
// });
// console.log(res.data);
// }



authorize().then(listMessages).catch(console.error);
module.exports = authorize;