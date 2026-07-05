import { serve } from "@hono/node-server";
import { logger } from "hono/logger";
import { cors } from "hono/cors";

import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { chatRoute } from "./modules/chat/routes";

const app = new OpenAPIHono();
app.use("*", logger());
app.use("*", cors());

// List Routes
app.route("/chat", chatRoute);

// Use the middleware to serve the API Reference at /scalar
app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    title: "HealthyBuddy AI API",
    version: "1.0.0",
  },
});

app.get("/", Scalar({ url: "/openapi.json" }));

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
