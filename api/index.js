// Vercel Serverless Function - wraps the nested Express backend.
let app;

try {
  app = require("../samriddhi-estates/backend/server");
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
