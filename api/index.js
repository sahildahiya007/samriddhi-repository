 // Vercel Serverless Function - wraps the Express backend.
let app;

try {
  app = require("../backend/server");
} catch (err) {
  module.exports = (_req, res) => {
    res.status(500).json({
      message: "Backend failed to initialize",
      error: err.message,
    });
  };
}

if (app) {
  module.exports = app;
}
