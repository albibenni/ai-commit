import { devToolsMiddleware } from "@ai-sdk/devtools";
import {
  gateway,
  generateText,
  Output,
  stepCountIs,
  tool,
  type ToolSet,
  wrapLanguageModel,
} from "ai";
import { execSync } from "node:child_process";
import z from "zod";
import { COMMIT_TYPES } from "./common.ts";

const model = wrapLanguageModel({
  model: gateway("openai/gpt-4o-mini"),
  middleware: devToolsMiddleware(),
});

const tools: ToolSet = {
  gitDiff: tool({
    description: "Get the git diff showing file changes.",
    inputSchema: z.object({}),
    execute: () => {
      console.log("tool git diff");
      return executeGitDiff();
    },
  }),
};

export async function improveCommitMessage(message: string): Promise<string> {
  const improvedMessage = await generateText({
    model,
    tools,
    prompt: `
    use the file changes and improve the following commit message: ${message} `,
    system: `You are a git commit message generator. Respond with ONLY a plain text commit
     message (no markdown formatting, no backticks, no code blocks). Just return the commit message text directly.`,
    stopWhen: stepCountIs(5), // stop after a maximum of 5 steps if tools were called
  });

  return improvedMessage.text;
}

export function executeGitDiff(): string {
  // --no-pager: output directly to stdout (eg https://github.com/dandavison/delta)
  // --no-ext-diff: disable external diff drivers for consistent output
  // --no-textconv: disable text conversion filters
  // --no-renames: treat renames as delete+add (simpler for LLM)
  const command =
    "git --no-pager diff --no-color --minimal --ignore-all-space --ignore-blank-lines --no-ext-diff --no-textconv --no-renames";
  return execSync(command).toString();
}

export async function getCommitTypeFromMessage(
  message: string,
): Promise<string> {
  const type = await generateText({
    model,
    prompt: `Get the commit type from the following commit message: ${message}`,
    output: Output.choice({
      options: [...COMMIT_TYPES],
      name: "commitType",
      description:
        "The type of commit based on the rules of conventional commits",
    }),
  });

  return type.output;
}
