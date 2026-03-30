const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "K@9971647910";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;

// Middleware
app.use(
  cors(
    FRONTEND_ORIGIN
      ? {
          origin: FRONTEND_ORIGIN.split(",").map((origin) => origin.trim()),
        }
      : undefined,
  ),
);
app.use(express.json());

const properties = require("./data/properties");
let users = require("./data/users");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "samridhi_jwt_secret";
let constructionRates = require("./data/constructionRates");
// Construction Rates API
app.get("/api/construction-rates", (req, res) => {
  res.json(constructionRates);
});

app.put(
  "/api/construction-rates",
  authMiddleware,
  requirePrimeAdmin,
  (req, res) => {
    const { standard, premium, luxury } = req.body;
    if (
      typeof standard !== "number" ||
      typeof premium !== "number" ||
      typeof luxury !== "number"
    ) {
      return res.status(400).json({ message: "All rates must be numbers." });
    }
    constructionRates = { standard, premium, luxury };
    // Optionally, persist to file here for production
    res.json(constructionRates);
  },
);
// Simple in-memory session (for demo, not production)
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer "))
    return res.status(401).json({ message: "Missing token" });
  try {
    const decoded = jwt.verify(auth.replace("Bearer ", ""), JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

function requirePrimeAdmin(req, res, next) {
  if (req.admin && req.admin.role === "prime-admin") return next();
  return res.status(403).json({ message: "Only Prime Admin allowed" });
}
const inquiries = require("./data/inquiries");

const requiredPropertyFields = [
  "title",
  "price",
  "type",
  "location",
  "address",
];
const requiredInquiryFields = ["name", "phone", "time"];

const parseId = (idValue) => Number.parseInt(idValue, 10);
const nextId = (items) => Math.max(0, ...items.map((item) => item.id || 0)) + 1;

const missingFields = (payload, fields) =>
  fields.filter((field) => !payload[field]);

// Routes
app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "samridhi-properties-backend" });
});

app.get("/api/properties", (req, res) => {
  res.json(properties);
});

app.get("/api/users", (req, res) => {
  res.json(users);
});

app.get("/api/properties/:id", (req, res) => {
  const id = parseId(req.params.id);
  const property = properties.find((p) => p.id === id);
  if (property) {
    res.json(property);
  } else {
    res.status(404).json({ message: "Property not found" });
  }
});

app.get("/api/users/:id", (req, res) => {
  const id = parseId(req.params.id);
  const user = users.find((u) => u.id === id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

app.post("/api/properties", authMiddleware, (req, res) => {
  const missing = missingFields(req.body, requiredPropertyFields);
  if (missing.length > 0) {
    return res
      .status(400)
      .json({ message: "Missing required property fields", missing });
  }

  const newProperty = {
    id: nextId(properties),
    ...req.body,
  };
  properties.push(newProperty);
  res.status(201).json(newProperty);
});

app.post("/api/users", (req, res) => {
  const newUser = {
    id: nextId(users),
    ...req.body,
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

app.get("/api/inquiries", authMiddleware, (req, res) => {
  res.json(inquiries);
});

app.post("/api/inquiries", (req, res) => {
  const missing = missingFields(req.body, requiredInquiryFields);
  if (missing.length > 0) {
    return res
      .status(400)
      .json({ message: "Missing required inquiry fields", missing });
  }

  const newInquiry = {
    id: nextId(inquiries),
    submittedAt: req.body.submittedAt || new Date().toISOString(),
    reason: req.body.reason || "",
    leadId: req.body.leadId || "",
    password: req.body.password || "",
    propertyId: req.body.propertyId || null,
    propertyTitle: req.body.propertyTitle || "",
    ...req.body,
  };
  inquiries.push(newInquiry);
  return res.status(201).json(newInquiry);
});

app.put("/api/properties/:id", authMiddleware, (req, res) => {
  const id = parseId(req.params.id);
  const index = properties.findIndex((p) => p.id === id);
  if (index !== -1) {
    properties[index] = { ...properties[index], ...req.body };
    res.json(properties[index]);
  } else {
    res.status(404).json({ message: "Property not found" });
  }
});

app.put("/api/users/:id", (req, res) => {
  const id = parseId(req.params.id);
  const index = users.findIndex((u) => u.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...req.body };
    res.json(users[index]);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

app.delete("/api/properties/:id", authMiddleware, (req, res) => {
  const id = parseId(req.params.id);
  const index = properties.findIndex((p) => p.id === id);
  if (index !== -1) {
    const deletedProperty = properties.splice(index, 1);
    res.json(deletedProperty[0]);
  } else {
    res.status(404).json({ message: "Property not found" });
  }
});

app.delete("/api/users/:id", (req, res) => {
  const id = parseId(req.params.id);
  const index = users.findIndex((u) => u.id === id);
  if (index !== -1) {
    const deletedUser = users.splice(index, 1);
    res.json(deletedUser[0]);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

app.delete("/api/inquiries/:id", authMiddleware, (req, res) => {
  const id = parseId(req.params.id);
  const index = inquiries.findIndex((inquiry) => inquiry.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Inquiry not found" });
  }

  const deletedInquiry = inquiries.splice(index, 1)[0];
  return res.json(deletedInquiry);
});

const bcrypt = require("bcryptjs");

// Admin login (returns JWT)
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
  const user = users.find((u) => u.username === username.toLowerCase().trim());
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const match = user.password
    ? await bcrypt.compare(password, user.password)
    : user.role === "prime-admin" && password === ADMIN_PASSWORD;
  if (!match) return res.status(401).json({ message: "Invalid credentials" });
  // Only admins can login
  if (!user.role) return res.status(403).json({ message: "Not an admin" });
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "2h" },
  );
  return res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
    },
  });
});

// Get all admins (protected)
app.get("/api/admins", authMiddleware, (req, res) => {
  const admins = users.filter((u) => u.role);
  res.json(admins.map(({ password, ...rest }) => rest));
});

// Prime Admin creates new admin
app.post("/api/admins", authMiddleware, requirePrimeAdmin, async (req, res) => {
  const { username, password, name } = req.body || {};
  if (!username || !password || !name)
    return res.status(400).json({ message: "Missing fields" });
  if (users.find((u) => u.username === username))
    return res.status(409).json({ message: "Username exists" });
  const hash = await bcrypt.hash(password, 10);
  const newAdmin = {
    id: nextId(users),
    name,
    username,
    password: hash,
    role: "sub-admin",
  };
  users.push(newAdmin);
  res.status(201).json({
    id: newAdmin.id,
    username: newAdmin.username,
    name: newAdmin.name,
    role: newAdmin.role,
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
