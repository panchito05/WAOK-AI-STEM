const functions = require('firebase-functions');
const next = require('next');
const { join } = require('path');

const isDev = process.env.NODE_ENV !== 'production';
const nextjsDistDir = join(__dirname, '../.next');
const nextjsPublicDir = join(__dirname, '../public');

const app = next({
  dev: isDev,
  conf: {
    distDir: nextjsDistDir,
    publicRuntimeConfig: {
      // Will be available on both server and client
      staticFolder: '/public',
    },
  },
});

const handle = app.getRequestHandler();

exports.nextServer = functions
  .runWith({
    memory: '1GB',
    timeoutSeconds: 60,
  })
  .https.onRequest(async (req, res) => {
    try {
      await app.prepare();
      await handle(req, res);
    } catch (error) {
      console.error('Error in nextServer function:', error);
      res.status(500).send('Internal Server Error');
    }
  });