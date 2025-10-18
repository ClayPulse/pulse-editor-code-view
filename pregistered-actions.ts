import { Action } from "@pulse-editor/shared-utils";

export const preRegisteredActions: Record<string, Action> = {
  "coding-using-file-content": {
    name: "Coding Using File Content",
    description: "Generate or modify code using file content",
    parameters: {
      userMessage: {
        type: "string",
        description: "The message to send to the agent.",
      },
      knowledge: {
        type: "string",
        description:
          "Additional knowledge that might be useful for the agent to understand user's instruction. \
This is to give the agent more context about the task so they don't hallucinate. ",
      },
    },
    returns: {
      response: {
        type: "string",
        description: "The result of the example action.",
      },
    },
  },
  "vibe-code-pulse-app": {
    name: "Vibe Code Pulse App",
    description: "Develop a Pulse App with vibe coding",
    parameters: {
      userMessage: {
        type: "string",
        description: "The user message to send to the agent.",
      },
      terminal: {
        type: "app-instance",
        description: "The Pulse App terminal instance to run commands in.",
      },
    },
    returns: {
      response: {
        type: "string",
        description: "Agent's response to the user message.",
      },
    },
  },
};
