import ReactCodeMirror, {
  Extension,
  ReactCodeMirrorRef,
} from "@uiw/react-codemirror";
import { useCallback, useEffect, useRef, useState } from "react";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";

import React from "react";
import { codeInlineSuggestionExtension } from "../lib/codemirror-extensions/code-inline-suggestion";
import { getLanguageExtension } from "../lib/codemirror-extensions/get-language-extension";
import { DelayedTrigger } from "../lib/delayed-trigger";
import {
  useAgents,
  useRegisterAction,
  useTheme,
  useFile,
} from "@pulse-editor/react-api";
import {
  inlineSuggestionAgent,
  InlineSuggestionAgentReturns,
} from "../lib/agents/inline-suggestion-agent";
import { diffLines } from "diff";
import { preRegisteredActions } from "../../pregistered-actions";

export default function CodeEditorView({ uri }: { uri: string }) {
  /* Set up theme */
  const cmRef = useRef<ReactCodeMirrorRef>(null);
  // setup a timer for delayed saving
  const saveTriggerRef = useRef<DelayedTrigger | undefined>(
    new DelayedTrigger(200)
  );

  const { theme: pulseTheme } = useTheme();
  const { runAgentMethod } = useAgents();
  const { file, saveFile } = useFile(uri);

  const [fileContent, setFileContent] = useState("");
  const [theme, setTheme] = useState(vscodeDark);
  /* Set editor content */
  // const [viewModel, setViewModel] = useState<ViewModel | undefined>(undefined);
  const [cmFileExtension, setCmFileExtension] = useState<Extension | undefined>(
    undefined
  );

  const codeAgentHandler = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (args: any) => {
      const {
        userMessage,
        knowledge,
      }: { userMessage: string; knowledge: string } = args;

      const selections = cmRef.current?.view?.state.selection.ranges.map(
        (range) => {
          const lineStart = cmRef.current?.view?.state.doc.lineAt(
            range.from
          ).number;
          const lineEnd = cmRef.current?.view?.state.doc.lineAt(
            range.to
          ).number;
          const text = cmRef.current?.view?.state.doc.sliceString(
            range.from,
            range.to
          );

          return {
            lineStart: lineStart ?? 0,
            lineEnd: lineEnd ?? 0,
            text: text ?? "",
          };
        }
      );

      const {
        updatedFile,
        explanation,
      }: { updatedFile: string; explanation: string } = await runAgentMethod(
        "code-editor-agent",
        "assistCoding",
        {
          fileContent: fileContent,
          selectionInformationList: selections,
          instruction: userMessage,
          knowledge: knowledge,
        }
      );

      const lineChanges = diffLines(fileContent, updatedFile);
      console.log("Found changes", lineChanges);

      applyFileChanges(updatedFile);

      return explanation;
    },
    [file]
  );

  useRegisterAction(
    preRegisteredActions["coding-using-file-content"],
    codeAgentHandler,
    [codeAgentHandler]
  );

  useEffect(() => {
    if (pulseTheme === "dark") {
      setTheme(vscodeDark);
    } else {
      setTheme(vscodeLight);
    }
  }, [pulseTheme]);

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
    saveTriggerRef.current?.reset(() => {
      saveFile(value);
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
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-content2 ">
      {
        <ReactCodeMirror
          ref={cmRef}
          value={fileContent}
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
