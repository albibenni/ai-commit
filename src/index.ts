import {
  closePrompt,
  confirmAndCommit,
  getCommitMessage,
  run,
  selectCommitType,
} from "./common.ts";
import { getCommitTypeFromMessage, improveCommitMessage } from "./utils";

async function main() {
  console.log("\n🚀 Conventional Commit Generator\n");

  const message = await getCommitMessage();
  const improvedCommitMessage = await improveCommitMessage(message);

  const type = await getCommitTypeFromMessage(improvedCommitMessage);
  const fullMessage = `${type}: ${improvedCommitMessage}`;

  await confirmAndCommit(fullMessage);
  closePrompt();
}

run(main);
