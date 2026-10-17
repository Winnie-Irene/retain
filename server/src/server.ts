import { createApp } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";

async function start() {
  await connectDatabase();

  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`Retain API listening on port ${env.PORT}`);
  });
}

start().catch((error: unknown) => {
  console.error("Failed to start the server", error);
  process.exit(1);
});