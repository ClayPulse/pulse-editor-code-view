import {
  useAgents,
  useFile,
  useLoading,
  useOwnedAppView,
  useReceiveFile,
  useRegisterAction,
} from "@pulse-editor/react-api";
import CodeEditorView from "./code-editor-view";
import React, { useEffect, useState } from "react";
import { preRegisteredActions } from "../../pregistered-actions";
import { ViewModel } from "@pulse-editor/shared-utils";
import { vibeCodeAgent } from "../lib/agents/vibe-code-agent";
import { Extension } from "@uiw/react-codemirror";
import { getLanguageExtension } from "../lib/codemirror-extensions/get-language-extension";

export default function ViewIndex() {
  const { toggleLoading, isReady } = useLoading();
  const { receivedFileUri } = useReceiveFile();

  const { file, saveFile } = useFile(receivedFileUri, 200);
  const { runAppAction } = useOwnedAppView();
  const { runAgentMethod } = useAgents();

  const [fileContent, setFileContent] = useState("");
  const [cmFileExtension, setCmFileExtension] = useState<Extension | undefined>(
    undefined
  );

  useRegisterAction(
    preRegisteredActions["vibe-code-pulse-app"],
    async (args: { userMessage: string; terminal: ViewModel }) => {
      const {
        userMessage,
        terminal,
      }: {
        userMessage: string;
        terminal: ViewModel;
      } = args;

      const action = terminal.appConfig.preRegisteredActions?.find(
        (action) => action.name === "Execute Command in Terminal"
      );
      if (!action) {
        throw new Error("Execute Command action not found in terminal app.");
      }

      const agentResult = await runAgentMethod(
        vibeCodeAgent.name,
        "vibeCodePulseApp",
        {
          userMessage,
          code: fileContent,
          isFileOpen: !!file,
        }
      );

      console.log("Agent Result:", agentResult);

      const {
        response,
        code,
        command,
      }: {
        response: string;
        code?: string;
        command?: string;
      } = agentResult;

      if (code) {
        saveFile(code);
      }

      // Run command in terminal
      if (command) {
        await runAppAction(terminal, action.name, {
          command,
        });
      }

      return {
        response,
      };
    },
    [runAppAction, fileContent, saveFile]
  );

  useEffect(() => {
    if (isReady) {
      toggleLoading(false);
    }
  }, [isReady]);

  useEffect(() => {
    if (file) {
      file.text().then((content) => setFileContent(content));
    }
  }, [file]);

  useEffect(() => {
    if (file) {
      setCmFileExtension(getLanguageExtension(file.name));
    }
  }, [file]);

  if (!receivedFileUri || !file) {
    return (
      <div className="text-center text-black bg-white dark:text-white dark:bg-black h-full w-full flex flex-col items-center justify-center">
        Select a file from side panel to get started.
      </div>
    );
  }

  return (
    <CodeEditorView
      fileContent={fileContent}
      saveFile={saveFile}
      cmFileExtension={cmFileExtension}
    />
  );
}
