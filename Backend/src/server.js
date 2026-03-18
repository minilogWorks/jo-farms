require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { randomUUID } = require("crypto");
const { validateRegistration, validateContact } = require("./validation");
const { appendRecord } = require("./storage");

const app = express();
const port = Number(process.env.PORT) || 4000;

const corsOrigin = process.env.CORS_ORIGIN || "*";

app.use(helmet());
app.use(
  cors({
    origin: corsOrigin,
  }),
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    message: "JO Farms backend is running",
  });
});

app.post("/api/registration", async (req, res) => {
  const { isValid, errors, data } = validateRegistration(req.body || {});

  if (!isValid) {
    return res.status(400).json({
      ok: false,
      message: "Registration validation failed",
      errors,
    });
  }

  try {
    const record = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      ...data,
    };

    await appendRecord("registrations.json", record);

    return res.status(201).json({
      ok: true,
      message: "Registration submitted successfully",
    });
  } catch (error) {
    console.error("Registration save failed", error);
    return res.status(500).json({
      ok: false,
      message: "Failed to save registration",
    });
  }
});

app.post("/api/contact", async (req, res) => {
  const { isValid, errors, data } = validateContact(req.body || {});

  if (!isValid) {
    return res.status(400).json({
      ok: false,
      message: "Contact validation failed",
      errors,
    });
  }

  try {
    const record = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      ...data,
    };

    await appendRecord("contacts.json", record);

    return res.status(201).json({
      ok: true,
      message: "Message submitted successfully",
    });
  } catch (error) {
    console.error("Contact save failed", error);
    return res.status(500).json({
      ok: false,
      message: "Failed to save contact message",
    });
  }
});

app.use((_req, res) => {
  res.status(404).json({
    ok: false,
    message: "Route not found",
  });
});

app.listen(port, () => {
  console.log(`JO Farms backend listening on port ${port}`);
});
