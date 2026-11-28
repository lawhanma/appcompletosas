import app, { startServer } from "./server.js";

if (!process.env.VERCEL) {
  void startServer();
}

export default app;
