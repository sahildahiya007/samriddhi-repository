const serverless = require("serverless-http");
const app = require("../../backend/server");

const handler = serverless(app);

exports.handler = async (event, context) => {
  return handler(event, context);
};
