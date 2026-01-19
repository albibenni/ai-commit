import dotenv from "dotenv";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";

// 1. Try loading from the current working directory (project-specific)
dotenv.config();

// 2. If the key is not present, try loading from the global configuration
// Standard location: ~/.config/ai-commit/.env
if (!process.env.AI_GATEWAY_API_KEY) {
  const homeDir = os.homedir();
  const globalConfigPath = path.join(homeDir, ".config", "ai-commit", ".env");

  if (fs.existsSync(globalConfigPath)) {
    dotenv.config({ path: globalConfigPath });
  }
}
