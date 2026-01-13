import { execSync, spawnSync } from "node:child_process";
import * as readline from "node:readline/promises";
import { z } from "zod/v4";

// ==== Readline Interface Setup ====
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// ==== Constants and Types ====
export const COMMIT_TYPES = [
  "feat",
  "fix",
  "docs",
  "style",
  "refactor",
  "test",
  "chore",
] as const;

export const CommitSchema = z.enum(COMMIT_TYPES);

// export type CommitType = (typeof COMMIT_TYPES)[number];
export type CommitType = z.infer<typeof CommitSchema>;

export const AbortErrorSchema = z
  .object({
    code: z.string().optional(),
    name: z.string().optional(),
  })
  .loose(); // Allows other properties like .message or .stack to exist

export type AbortError = z.infer<typeof AbortErrorSchema>;

// User Input Functions
export async function ask(question: string): Promise<string | undefined> {
  try {
    return await rl.question(question);
  } catch (err: unknown) {
    const result = AbortErrorSchema.safeParse(err);
    if (!result.success) throw err;

    const error = result.data;
    if (error.code === "ABORT_ERR" || error.name === "AbortError") {
      closePrompt();
      process.exit(0);
    }
  }
}

export async function confirm(question: string): Promise<boolean> {
  const answer = await ask(`${question} (y/n): `);
  if (answer === undefined) {
    throw new Error("Ask undefined");
  }
  return answer.toLowerCase() === "y";
}

export function closePrompt(): void {
  rl.close();
}

// ==== Process Management ====
export function run(fn: Function) {
  process.on("SIGINT", () => {
    closePrompt();
    process.exit(0);
  });

  fn().catch((error: Error) => {
    if (error.name === "AbortError") {
      closePrompt();
      process.exit(0);
    }
    throw error;
  });
}

// ==== Git Commit Functions ====
export function runCommit(message: string): void {
  spawnSync("git", ["add", "-A"], { stdio: "inherit" });
  const result = spawnSync("git", ["commit", "-F", "-"], {
    input: message,
    stdio: ["pipe", "inherit", "inherit"],
  });
  if (result.status !== 0) process.exit(result.status || 1);
}

/* CHANGESET */
export function executeGitPush(): string {
  const command = "git push";
  const result = execSync(command).toString();
  console.log("git push run", command, result);
  return result;
}

export async function selectCommitType(): Promise<CommitType> {
  console.log("Available types:");
  COMMIT_TYPES.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));

  const askk = await ask("Select type (number): ");
  if (askk === undefined) throw new Error("Ask undefined");
  const typeIndex = parseInt(askk, 10) - 1;
  return CommitSchema.parse(COMMIT_TYPES[typeIndex]);
}

export async function confirmAndCommit(fullMessage: string): Promise<void> {
  console.log("\nPreview:\n", fullMessage, "\n");

  if (await confirm("Proceed with commit?")) {
    runCommit(fullMessage);
  }
}

export async function getCommitMessage(): Promise<string> {
  const msg = await ask("Enter commit message: ");
  if (msg === undefined) throw new Error("Ask undefined");
  return msg;
}

export async function getCustomInstructions(): Promise<string> {
  const msg = await ask("Enter custom instructions: ");
  if (msg === undefined) throw new Error("Ask undefined");
  return msg;
}
