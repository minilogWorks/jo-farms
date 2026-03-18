require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { validateRegistration, validateContact } = require("./validation");

const app = express();
const port = Number(process.env.PORT) || 4000;

const corsOrigin = process.env.CORS_ORIGIN || "*";
const registrationWebhookUrl = process.env.REGISTRATION_WEBHOOK_URL || "";
const contactWebhookUrl = process.env.CONTACT_WEBHOOK_URL || "";

async function forwardSubmission(webhookUrl, type, data) {
  if (!webhookUrl) {
    const error = new Error(`Missing webhook URL for ${type}`);
    error.code = "WEBHOOK_NOT_CONFIGURED";
    throw error;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        source: "jo-farms-website",
        type,
        submittedAt: new Date().toISOString(),
        data,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = new Error(
        `Webhook responded with status ${response.status} for ${type}`,
      );
      error.code = "WEBHOOK_REQUEST_FAILED";
      throw error;
    }
  } finally {
    clearTimeout(timeout);
  }
}

app.use(helmet());
app.use(
  cors({
    origin: corsOrigin,
  }),
);
app.disable("x-powered-by");
app.disable("etag");

app.use((_, res, next) => {
  // Do not allow API responses to be cached by browser, proxies, or CDNs.
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

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
    await forwardSubmission(registrationWebhookUrl, "registration", data);

    return res.status(201).json({
      ok: true,
      message: "Registration submitted successfully",
    });
  } catch (error) {
    console.error("Registration forwarding failed", error);

    if (error.code === "WEBHOOK_NOT_CONFIGURED") {
      return res.status(503).json({
        ok: false,
        message:
          "Registration webhook is not configured on the server. Contact support.",
      });
    }

    return res.status(502).json({
      ok: false,
      message: "Failed to forward registration to the delivery service.",
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
    await forwardSubmission(contactWebhookUrl, "contact", data);

    return res.status(201).json({
      ok: true,
      message: "Message submitted successfully",
    });
  } catch (error) {
    console.error("Contact forwarding failed", error);

    if (error.code === "WEBHOOK_NOT_CONFIGURED") {
      return res.status(503).json({
        ok: false,
        message:
          "Contact webhook is not configured on the server. Contact support.",
      });
    }

    return res.status(502).json({
      ok: false,
      message: "Failed to forward message to the delivery service.",
    });
  }
});

app.use((_req, res) => {
  res.status(404).json({
    ok: false,
    message: "Route not found",
  });
});

const server = app.listen(port, () => {
  console.log(`JO Farms backend listening on port ${port}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Port ${port} is already in use. Stop the running server or change PORT in .env.`,
    );
  } else {
    console.error("Server startup failed:", error.message);
  }

  process.exit(1);
});
