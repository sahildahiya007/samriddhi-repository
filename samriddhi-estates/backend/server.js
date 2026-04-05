const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "K@9971647910";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;
const JWT_SECRET = process.env.JWT_SECRET || "samridhi_jwt_secret";

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

const uploadsDir =
  process.env.NODE_ENV === "production"
    ? path.join("/tmp", "uploads")
    : path.join(__dirname, "uploads");
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch {
  // Non-writable filesystem (serverless) — disk upload will use /tmp fallback
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname || "").toLowerCase();
    const safeExtension = extension || ".jpg";
    cb(
      null,
      `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExtension}`,
    );
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if ((file.mimetype || "").startsWith("image/")) {
      cb(null, true);
      return;
    }
    cb(new Error("Only image files are allowed"));
  },
});

app.use("/uploads", express.static(uploadsDir));

const properties = require("./data/properties");
let users = require("./data/users");
let constructionRates = require("./data/constructionRates");
const constructionProjects = require("./data/constructionProjects");

const PROTECTED_PRIME_ADMIN = Object.freeze({
  id: 1,
  name: "Lukesh",
  username: "lukeshprime",
  password: "$2a$10$ecuKv8ZyRaVmCsYZ10xoI.Ih.pxLdcWyIKiaLEPcHVMdTK8Otz3PC",
  email: "samriddhiproperties9@gmail.com",
  phone: "+91 9971647910",
  role: "prime-admin",
  immutable: true,
});

function isProtectedPrimeAdmin(user) {
  return Boolean(
    user &&
      (user.id === PROTECTED_PRIME_ADMIN.id ||
        user.username === PROTECTED_PRIME_ADMIN.username),
  );
}

function ensureProtectedPrimeAdmin() {
  const existingIndex = users.findIndex(isProtectedPrimeAdmin);
  const protectedAdmin = { ...PROTECTED_PRIME_ADMIN };

  if (existingIndex === -1) {
    users.unshift(protectedAdmin);
    return;
  }

  users[existingIndex] = {
    ...users[existingIndex],
    ...protectedAdmin,
  };
}

ensureProtectedPrimeAdmin();

/* ── In-memory stores for regular users & wishlists ── */
let registeredUsers = []; // { id, name, email, password (bcrypt), wishlist: [propertyId,...] }
let nextUserId = 1;

/* ── Auth middleware (admin JWT) ── */
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

/* ── Auth middleware (regular user JWT) ── */
function userAuthMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer "))
    return res.status(401).json({ message: "Missing token" });
  try {
    const decoded = jwt.verify(auth.replace("Bearer ", ""), JWT_SECRET);
    req.user = decoded;
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

/* ── User Registration & Login ── */
app.post("/api/users/register", async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password)
    return res
      .status(400)
      .json({ message: "Name, email, and password are required" });
  const emailLower = email.toLowerCase().trim();
  if (registeredUsers.find((u) => u.email === emailLower))
    return res
      .status(409)
      .json({ message: "An account with this email already exists" });
  const hash = await bcrypt.hash(password, 10);
  const newUser = {
    id: nextUserId++,
    name: name.trim(),
    email: emailLower,
    password: hash,
    wishlist: [],
  };
  registeredUsers.push(newUser);
  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, type: "user" },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
  return res
    .status(201)
    .json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        wishlist: newUser.wishlist,
      },
    });
});

app.post("/api/users/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });
  const user = registeredUsers.find(
    (u) => u.email === email.toLowerCase().trim(),
  );
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });
  const token = jwt.sign(
    { id: user.id, email: user.email, type: "user" },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      wishlist: user.wishlist,
    },
  });
});

app.get("/api/users/me", userAuthMiddleware, (req, res) => {
  const user = registeredUsers.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    wishlist: user.wishlist,
  });
});

/* ── Wishlist ── */
app.post("/api/wishlist/:propertyId", userAuthMiddleware, (req, res) => {
  const user = registeredUsers.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  const propId = Number(req.params.propertyId);
  if (!user.wishlist.includes(propId)) user.wishlist.push(propId);
  return res.json({ wishlist: user.wishlist });
});

app.delete("/api/wishlist/:propertyId", userAuthMiddleware, (req, res) => {
  const user = registeredUsers.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  const propId = Number(req.params.propertyId);
  user.wishlist = user.wishlist.filter((id) => id !== propId);
  return res.json({ wishlist: user.wishlist });
});

app.get("/api/wishlist", userAuthMiddleware, (req, res) => {
  const user = registeredUsers.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  const wishlisted = properties.filter((p) => user.wishlist.includes(p.id));
  return res.json({ wishlist: user.wishlist, properties: wishlisted });
});

// Admin endpoint — list all registered users + their wishlists
app.get("/api/registered-users", authMiddleware, (req, res) => {
  const safeUsers = registeredUsers.map(({ password, ...rest }) => rest);
  return res.json(safeUsers);
});

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
    res.json(constructionRates);
  },
);

// Construction Projects API (recent project photos gallery)
app.get("/api/construction-projects", (req, res) => {
  res.json(constructionProjects);
});

app.post("/api/construction-projects", authMiddleware, (req, res) => {
  const { name, image, location, type, size, status } = req.body || {};
  if (!name || !image) {
    return res.status(400).json({ message: "Name and image are required" });
  }
  const newProject = {
    id: nextId(constructionProjects),
    name,
    image,
    location: location || "Gurgaon",
    type: type || "Residential",
    size: size || "",
    status: status || "Ongoing",
  };
  constructionProjects.push(newProject);
  res.status(201).json(newProject);
});

app.put("/api/construction-projects/:id", authMiddleware, (req, res) => {
  const id = parseId(req.params.id);
  const index = constructionProjects.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Project not found" });
  }
  constructionProjects[index] = { ...constructionProjects[index], ...req.body };
  res.json(constructionProjects[index]);
});

app.delete("/api/construction-projects/:id", authMiddleware, (req, res) => {
  const id = parseId(req.params.id);
  const index = constructionProjects.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Project not found" });
  }
  const deleted = constructionProjects.splice(index, 1)[0];
  res.json(deleted);
});

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
  res.json({ ok: true, service: "samriddhi-estates-backend" });
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

app.post(
  "/api/uploads/property-image",
  authMiddleware,
  upload.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    return res.status(201).json({
      message: "Image uploaded",
      url: imageUrl,
      filename: req.file.filename,
    });
  },
);

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

app.put("/api/users/:id", authMiddleware, requirePrimeAdmin, (req, res) => {
  const id = parseId(req.params.id);
  const index = users.findIndex((u) => u.id === id);
  if (index !== -1) {
    if (isProtectedPrimeAdmin(users[index])) {
      return res.status(403).json({
        message: "Prime admin is protected and cannot be changed",
      });
    }
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

app.delete("/api/users/:id", authMiddleware, requirePrimeAdmin, (req, res) => {
  const id = parseId(req.params.id);
  const index = users.findIndex((u) => u.id === id);
  if (index !== -1) {
    if (isProtectedPrimeAdmin(users[index])) {
      return res.status(403).json({
        message: "Prime admin is protected and cannot be removed",
      });
    }
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

/* ── Unified login endpoint ──
   Accepts { identifier, password } where identifier can be email or username.
   Tries admin (username match) first, then regular user (email match).
   Returns { token, user, type: "admin" | "user" } so frontend knows which flow. */
app.post("/api/auth/unified-login", async (req, res) => {
  ensureProtectedPrimeAdmin();
  const { identifier, password } = req.body || {};
  if (!identifier || !password)
    return res
      .status(400)
      .json({ message: "Identifier and password are required" });

  const identifierLower = identifier.toLowerCase().trim();
  const isBcryptHash = (str) =>
    typeof str === "string" && /^\$2[ab]\$\d+\$/.test(str);

  // 1) Try admin users (match by username OR email)
  const adminUser = users.find(
    (u) =>
      u.username === identifierLower ||
      (u.email && u.email.toLowerCase() === identifierLower),
  );
  if (adminUser && adminUser.role) {
    let match = false;
    if (adminUser.password && isBcryptHash(adminUser.password)) {
      match = await bcrypt.compare(password, adminUser.password);
    } else if (adminUser.password) {
      match = password === adminUser.password;
    }
    if (
      !match &&
      adminUser.role === "prime-admin"
    ) {
      match = password === ADMIN_PASSWORD;
    }
    if (match) {
      const token = jwt.sign(
        {
          id: adminUser.id,
          username: adminUser.username,
          role: adminUser.role,
        },
        JWT_SECRET,
        { expiresIn: "2h" },
      );
      return res.json({
        token,
        type: "admin",
        user: {
          id: adminUser.id,
          username: adminUser.username,
          role: adminUser.role,
          name: adminUser.name,
        },
      });
    }
  }

  // 2) Try regular registered user (match by email)
  const regUser = registeredUsers.find((u) => u.email === identifierLower);
  if (regUser) {
    const match = await bcrypt.compare(password, regUser.password);
    if (match) {
      const token = jwt.sign(
        { id: regUser.id, email: regUser.email, type: "user" },
        JWT_SECRET,
        { expiresIn: "7d" },
      );
      return res.json({
        token,
        type: "user",
        user: {
          id: regUser.id,
          name: regUser.name,
          email: regUser.email,
          wishlist: regUser.wishlist,
        },
      });
    }
  }

  return res.status(401).json({ message: "Invalid credentials" });
});

// Admin login (returns JWT)
app.post("/api/auth/login", async (req, res) => {
  ensureProtectedPrimeAdmin();
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
  const user = users.find((u) => u.username === username.toLowerCase().trim());
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const isBcryptHash = (str) =>
    typeof str === "string" && /^\$2[ab]\$\d+\$/.test(str);

  let match = false;
  if (user.password && isBcryptHash(user.password)) {
    // Stored as a proper bcrypt hash — compare securely
    match = await bcrypt.compare(password, user.password);
  } else if (user.password) {
    // Stored as plain text — compare directly
    match = password === user.password;
  }
  // Prime-admin: also accept ADMIN_PASSWORD constant as fallback
  if (!match && user.role === "prime-admin") {
    match = password === ADMIN_PASSWORD;
  }
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
  ensureProtectedPrimeAdmin();
  const admins = users.filter((u) => u.role);
  res.json(admins.map(({ password, ...rest }) => rest));
});

// Prime Admin creates new admin
app.post("/api/admins", authMiddleware, requirePrimeAdmin, async (req, res) => {
  ensureProtectedPrimeAdmin();
  const { username, password, name } = req.body || {};
  if (!username || !password || !name)
    return res.status(400).json({ message: "Missing fields" });
  if (username.toLowerCase().trim() === PROTECTED_PRIME_ADMIN.username)
    return res.status(409).json({ message: "Username is reserved" });
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
