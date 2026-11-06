
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve website files from public folder
app.use(express.static(path.join(__dirname, "public")));

// MongoDB Schemas
const orderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  items: [{
    itemId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }
  }],
  total: { type: Number, required: true, min: 0 },
  status: { type: String, default: "Received" }
}, { timestamps: true });

const reservationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  date: { type: String, required: true },
  time: { type: String, required: true },
  guests: { type: Number, required: true, min: 1, max: 20 },
  specialRequests: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ""
  }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
const Reservation = mongoose.model("Reservation", reservationSchema);

// Check database connection
function requireDatabase(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Database is not connected."
    });
  }
  next();
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    server: "ok",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected"
  });
});

// Save orders
app.post("/api/orders", requireDatabase, async (req, res) => {
  try {
    const { customerName, phone, items } = req.body;

    if (!customerName || !phone ||
        !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Please provide your name, phone and cart items."
      });
    }

    const cleanItems = items.map(item => ({
      itemId: String(item.itemId || ""),
      name: String(item.name || "").trim(),
      quantity: Number(item.quantity),
      price: Number(item.price)
    }));

    if (cleanItems.some(item =>
      !item.itemId ||
      !item.name ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      !Number.isFinite(item.price) ||
      item.price < 0
    )) {
      return res.status(400).json({
        message: "Invalid cart items."
      });
    }

    const total = Number(
      cleanItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ).toFixed(2)
    );

    const order = await Order.create({
      customerName: String(customerName).trim(),
      phone: String(phone).trim(),
      items: cleanItems,
      total
    });

    res.status(201).json({
      message: "Your order has been saved.",
      orderId: order._id,
      total: order.total
    });

  } catch (error) {
    console.error("Order error:", error);
    res.status(500).json({
      message: "Could not save your order."
    });
  }
});

// Save reservations
app.post("/api/reservations", requireDatabase, async (req, res) => {
  try {
    const {
      name,
      phone,
      date,
      time,
      guests,
      specialRequests = ""
    } = req.body;

    if (!name || !phone || !date || !time ||
        !Number.isInteger(Number(guests)) ||
        Number(guests) < 1 || Number(guests) > 20) {
      return res.status(400).json({
        message: "Please complete all required fields."
      });
    }

    const reservation = await Reservation.create({
      name: String(name).trim(),
      phone: String(phone).trim(),
      date,
      time,
      guests: Number(guests),
      specialRequests: String(specialRequests).trim()
    });

    res.status(201).json({
      message: "Your reservation has been saved.",
      reservationId: reservation._id
    });

  } catch (error) {
    console.error("Reservation error:", error);
    res.status(500).json({
      message: "Could not save your reservation."
    });
  }
});

// Unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({
    message: "API endpoint not found."
  });
});

// Homepage and other frontend pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Unknown page
app.use((req, res) => {
  res.status(404).send("Page not found.");
});

// Start server
async function start() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is missing.");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully.");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Dream Life Cafe running on port ${PORT}`);
    });

  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

start();
