// Vercel Serverless Function — wraps the Express backend
let app;
try {
  app = require("../backend/server");
} catch (err) {
  // If the backend fails to load, return a helpful 500
  module.exports = (req, res) => {
    res.status(500).json({
      message: "Backend failed to initialize",
      error: err.message,
    });
  };
}

if (app) {
  module.exports = app;
}
