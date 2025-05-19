import ReactCodeMirror, {
  Extension,
  ReactCodeMirrorRef,
} from "@uiw/react-codemirror";
import { useEffect, useRef, useState } from "react";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";

import React from "react";
import { codeInlineSuggestionExtension } from "../lib/codemirror-extensions/code-inline-suggestion";
import { getLanguageExtension } from "../lib/codemirror-extensions/get-language-extension";
import { DelayedTrigger } from "../lib/delayed-trigger";

import {
  useAgents,
  useExtCommand,
  useFileView,
  useNotification,
  useTheme,
} from "@pulse-editor/react-api";
import { ViewModel } from "@pulse-editor/shared-utils";
import {
  inlineSuggestionAgent,
  InlineSuggestionAgentReturns,
} from "../lib/agents/inline-suggestion-agent";
import { codingAgentCommandInfo } from "../lib/commands";
import { diffLines } from "diff";

export default function CodeEditorView() {
  /* Set up theme */
  const [theme, setTheme] = useState(vscodeDark);
  const { theme: pulseTheme } = useTheme();
  const cmRef = useRef<ReactCodeMirrorRef>(null);
  /* Set editor content */
  const [viewModel, setViewModel] = useState<ViewModel | undefined>(undefined);
  const { runAgentMethod } = useAgents();
  // setup a timer for delayed saving
  const saveTriggerRef = useRef<DelayedTrigger | undefined>(
    new DelayedTrigger(200)
  );
  const { openNotification } = useNotification();
  const {
    viewModel: savedViewModel,
    updateViewModel,
    setIsLoaded,
  } = useFileView();

  const [cmFileExtension, setCmFileExtension] = useState<Extension | undefined>(
    undefined
  );

  const { updateHandler } = useExtCommand(codingAgentCommandInfo);

  // Update codemirror doc when the view model changes
  useEffect(() => {
    if (savedViewModel?.file) {
      console.log("View file updated", savedViewModel);
      setIsLoaded(true);
      setViewModel(savedViewModel);
      setCmFileExtension(getLanguageExtension(savedViewModel.file.path));
    }
  }, [savedViewModel]);

  useEffect(() => {
    if (pulseTheme === "dark") {
      setTheme(vscodeDark);
    } else {
      setTheme(vscodeLight);
    }
  }, [pulseTheme]);

  // Update view upon view document changes
  useEffect(() => {
    if (viewModel !== undefined) {
      updateViewModel(viewModel);

      // Update the handler
      updateHandler(getHandler());
    }
  }, [viewModel]);

  function getHandler() {
    const handler = async (args: any) => {
      const { userMessage }: { userMessage: string } = args;

      const {
        updatedFile,
        explanation,
      }: { updatedFile: string; explanation: string } = await runAgentMethod(
        "code-editor-agent",
        "assistCoding",
        {
          fileContent: viewModel?.file?.content ?? "",
          selectionInformationList: viewModel?.file?.selections?.map(
            (selection) => ({
              lineStart: selection.lineStart,
              lineEnd: selection.lineEnd,
              text: selection.text,
            })
          ),
          instruction: userMessage,
        }
      );

      const lineChanges = diffLines(
        viewModel?.file?.content ?? "",
        updatedFile
      );
      console.log("Found changes", lineChanges);

      applyFileChanges(updatedFile);

      return explanation;
    };
    return handler;
  }

  async function agentFunc(
    codeContent: string,
    cursorX: number,
    cursorY: number,
    abortSignal: AbortSignal
  ) {
    const fileContentWithIndicator = getContentWithIndicator(
      codeContent,
      cursorX,
      cursorY
    );
    const result = (await runAgentMethod(
      inlineSuggestionAgent.name,
      "predictLine",
      { fileContentWithIndicator },
      abortSignal
    )) as InlineSuggestionAgentReturns;

    return result;
  }

  function getContentWithIndicator(
    fileContent: string,
    cursorX: number,
    cursorY: number
  ): string {
    const lines = fileContent.split("\n");
    const cursorXNormalized = cursorX - 1;
    const cursorYNormalized = cursorY - 1;

    // Indicate where the agent should suggest the code at
    const suggestIndication = "<FILL>";
    lines[cursorYNormalized] =
      lines[cursorYNormalized].slice(0, cursorXNormalized) +
      suggestIndication +
      lines[cursorYNormalized].slice(cursorXNormalized);

    return lines.join("\n");
  }

  function onContentChange(value: string) {
    setViewModel((prev) => {
      // Return undefined if viewDocument is not set
      if (!prev) {
        return prev;
      }

      const updatedFileViewModel: ViewModel = {
        ...prev,
        file: {
          path: prev.file?.path ?? "",
          content: value,
          selections: prev.file?.selections,
        },
      };

      // Notify Pulse Editor that the content has changed
      // Reset the save trigger
      saveTriggerRef.current?.reset(() => {
        updateViewModel(updatedFileViewModel);
      });
      return updatedFileViewModel;
    });
  }

  function applyFileChanges(updatedFile: string) {
    const cmView = cmRef.current?.view;

    if (!cmView) {
      return;
    }

    // Remove the old content
    const modifyTransaction = cmView.state.update({
      changes: {
        from: 0,
        to: cmView.state.doc.length,
        insert: updatedFile,
      },
    });

    // Apply the transactions
    cmView.dispatch([modifyTransaction]);
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-content2">
      {
        <ReactCodeMirror
          ref={cmRef}
          value={viewModel?.file?.content ?? ""}
          onChange={onContentChange}
          extensions={
            cmFileExtension
              ? [
                  cmFileExtension,
                  codeInlineSuggestionExtension({
                    delay: 1000,
                    agentFunc: agentFunc,
                  }),
                ]
              : [
                  codeInlineSuggestionExtension({
                    delay: 1000,
                    agentFunc: agentFunc,
                  }),
                ]
          }
          theme={theme}
          height="100%"
          style={{
            height: "100%",
          }}
        />
      }
    </div>
  );
}
