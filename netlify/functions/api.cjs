let app, handler, loadError;

try {
  const serverless = require("serverless-http");
  app = require("../../backend/server");
  handler = serverless(app);
} catch (err) {
  loadError = err;
}

exports.handler = async (event, context) => {
  // If the module failed to load, return a helpful error
  if (loadError) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Function failed to initialize",
        error: loadError.message,
        stack: loadError.stack,
      }),
    };
  }

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

  try {
    return await handler(event, context);
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Function runtime error",
        error: err.message,
      }),
    };
  }
};
