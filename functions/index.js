const functions = require('firebase-functions');
const next = require('next');

const isDev = process.env.NODE_ENV !== 'production';
const app = next({ 
  dev: isDev, 
  conf: { distDir: '.next' },
  dir: __dirname + '/../'
});
const handle = app.getRequestHandler();

exports.nextServer = functions.https.onRequest(async (request, response) => {
  await app.prepare();
  return handle(request, response);
});