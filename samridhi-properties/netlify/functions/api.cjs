const serverless = require("serverless-http");
const app = require("../../backend/server");

const handler = serverless(app);

exports.handler = async (event, context) => {
  // Normalize paths so Express sees /api/* correctly
  // Netlify rewrites /api/foo → /.netlify/functions/api/foo
  // but Express routes are mounted at /api/foo
  const fnPrefix = '/.netlify/functions/api';

  if (event.path && event.path.startsWith(fnPrefix)) {
    const stripped = event.path.slice(fnPrefix.length);
    event.path = '/api' + (stripped || '/');
  }

  if (event.rawUrl && event.rawUrl.includes(fnPrefix)) {
    event.rawUrl = event.rawUrl.replace(fnPrefix, '/api');
  }

  if (event.rawPath && event.rawPath.startsWith(fnPrefix)) {
    event.rawPath = '/api' + event.rawPath.slice(fnPrefix.length);
  }

  return handler(event, context);
};
