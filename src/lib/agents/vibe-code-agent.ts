import { AccessEnum, Agent } from "@pulse-editor/shared-utils";

export const vibeCodeAgent: Agent = {
  name: "vibe-code-agent",
  version: "0.0.1",
  description: "Agent to help user develop Pulse Apps using vibe coding.",
  systemPrompt: `\
You are a helpful agent who is helping a developer to develop Pulse Apps using vibe coding.
You are given a user message, and you have access to a terminal. You will write out code
and/or command whenever appropriate to help the developer, as well as a text response to the user.

For using Pulse Apps, you have access to the following cli tool:
\`\`\`
                                                    Pulse Editor CLI
                                                     Version: 0.0.1
                                                https://pulse-editor.com

  Usage
    pulse [command] [flags]

  Commands
    help [command]  Show help for a command.
    chat [message]  (WIP) Chat with the Pulse Editor AI assistant.

                    Flags:
                      --interactive, -i
                        Start an interactive chat session

    login           Login to the Pulse Editor Platform.

                    Flags:
                      --token [token]
                        Login using an access token. This is the default if the
                        token is set in the environment variable PE_ACCESS_TOKEN.
                      --flow
                        Login using a browser flow.

    logout          Logout from the Pulse Editor Platform.
    publish         Publish Pulse Editor Extension in current directory to the Pulse Editor Platform.
    create          Create a new Pulse App using the starter template.
                    Flags:
                      --framework, -f [framework]
                        The framework to use for the new app.
                        Currently available options: react.
                        Future options: vue, angular, etc.
                      --name, -n [project-name]
                        The name of the new project.
                      --visibility, -v [visibility]
                        The visibility of the new project. Options are private,
                        public, and unlisted.

  Examples
    pulse help publish
\`\`\`

`,
  availableMethods: [
    {
      access: AccessEnum.public,
      name: "vibeCodePulseApp",
      parameters: {
        userMessage: {
          type: "string",
          description: "The user message to process.",
        },
        code: {
          type: "string",
          description: "The current code of the Pulse App being developed.",
        },
      },
      prompt: `\
User message:
\`\`\`
{userMessage}
\`\`\`
Current code:
\`\`\`
{code}
\`\`\`
`,
      returns: {
        response: {
          type: "string",
          description: "The agent's response to the user message.",
        },
        code: {
          type: "string",
          description:
            "The code that the agent writes to code editor. ",
          optional: true,
        },
        command: {
          type: "string",
          description:
            "The terminal command that the agent writes to help the developer. ",
          optional: true,
        },
      },
    },
  ],
  LLMConfig: {
    provider: "openai",
    modelName: "gpt-4o",
    temperature: 0.95,
  },
};
