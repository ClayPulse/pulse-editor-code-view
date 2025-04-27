import ReactCodeMirror, {
  Extension,
  ReactCodeMirrorRef,
} from "@uiw/react-codemirror";
import {  useEffect, useRef, useState } from "react";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";

import React from "react";
import { codeInlineSuggestionExtension } from "../lib/codemirror-extensions/code-inline-suggestion";
import { getLanguageExtension } from "../lib/codemirror-extensions/get-language-extension";
import { DelayedTrigger } from "../lib/delayed-trigger";

import {
  useAgents,
  useFileView,
  useNotification,
  useTheme,
} from "@pulse-editor/react-api";
import { FileViewModel } from "@pulse-editor/shared-utils";
import { Config } from "../main";
import {
  InlineSuggestionAgent,
  InlineSuggestionAgentReturns,
} from "../lib/agents/inline-suggestion-agent";

// interface CodeEditorViewProps {
//   width?: string;
//   height?: string;
//   view: FileViewModel;
// }

// export type CodeEditorViewRef = ViewRef & {
//   applyChanges: (changes: LineChange[]) => void;
// };

// const CodeEditorView = forwardRef(
//   ({ width, height, view }: CodeEditorViewProps) => {
//     // useImperativeHandle(ref, () => ({
//     //   updateViewDocument(viewDocument) {
//     //     setViewDocument((prev) => {
//     //       if (!prev) {
//     //         return prev;
//     //       }
//     //       return {
//     //         ...prev,
//     //         ...viewDocument,
//     //       };
//     //     });
//     //   },
//     //   applyChanges: (lineChanges: LineChange[]) => {
//     //     console.log("Applying changes", lineChanges);
//     //     const cmView = cmRef.current?.view;

//     //     if (!cmView) {
//     //       openNotification(
//     //         "CodeMirror view not found",
//     //         NotificationTypeEnum.Error
//     //       );
//     //       return;
//     //     }

//     //     const addedLines: LineChange[] = [];
//     //     const deletedLines: LineChange[] = [];
//     //     const modifiedLines: LineChange[] = [];

//     //     for (const change of lineChanges) {
//     //       if (change.status === "added") {
//     //         addedLines.push(change);
//     //       } else if (change.status === "deleted") {
//     //         deletedLines.push(change);
//     //       } else if (change.status === "modified") {
//     //         modifiedLines.push(change);
//     //       }
//     //     }

//     //     // Process added lines
//     //     const indexNormalizedAddedLines: LineChange[] = [];
//     //     const sortedAddedLines = addedLines.sort((a, b) => a.index - b.index);
//     //     let currentLine = 0;
//     //     console.log("Sorted added lines", sortedAddedLines);
//     //     for (let i = 0; i < sortedAddedLines.length; i++) {
//     //       // The doc does not change between each transaction or change in one dispatch.
//     //       // So we need to calculate the location based on the state of the doc before
//     //       // applying the dispatch.
//     //       console.log("Current line", currentLine);
//     //       if (i === 0) {
//     //         currentLine = sortedAddedLines[i].index;
//     //         indexNormalizedAddedLines.push(sortedAddedLines[i]);
//     //         continue;
//     //       }

//     //       // The current line continues the previous line
//     //       if (sortedAddedLines[i].index === currentLine + i) {
//     //         const normalizedLine: LineChange = {
//     //           index: currentLine,
//     //           content:
//     //             indexNormalizedAddedLines.pop()?.content +
//     //             "\n" +
//     //             sortedAddedLines[i].content,
//     //           status: "added",
//     //         };
//     //         indexNormalizedAddedLines.push(normalizedLine);
//     //         console.log("Condensing lines", normalizedLine);
//     //         continue;
//     //       }

//     //       // The current line is not continuous with the previous line,
//     //       // i.e. there is a gap between the lines
//     //       currentLine = sortedAddedLines[i].index - i - 1;

//     //       indexNormalizedAddedLines.push(sortedAddedLines[i]);
//     //     }

//     //     const insertTransactions: TransactionSpec[] = [];
//     //     for (const line of indexNormalizedAddedLines) {
//     //       const location = cmView.state.doc.line(line.index).from;

//     //       insertTransactions.push({
//     //         changes: {
//     //           from: location,
//     //           insert: line.content + "\n",
//     //         },
//     //       });
//     //     }

//     //     // TODO: A temporary workaround to fix the out of transaction after insertion
//     //     cmView.dispatch(...insertTransactions);

//     //     const transactions: TransactionSpec[] = [];
//     //     // Process deleted lines
//     //     for (const line of deletedLines) {
//     //       // The start of deleted line
//     //       const from = cmView.state.doc.line(line.index).from;
//     //       // The end of deleted line
//     //       const to = cmView.state.doc.line(line.index).to;

//     //       transactions.push({
//     //         changes: {
//     //           from: from,
//     //           to: to,
//     //           insert: "",
//     //         },
//     //       });
//     //     }

//     //     // Process modified lines
//     //     for (const line of modifiedLines) {
//     //       // The start of modified line
//     //       const from = cmView.state.doc.line(line.index).from;
//     //       // The end of modified line
//     //       const to = cmView.state.doc.line(line.index).to;

//     //       transactions.push({
//     //         changes: {
//     //           from: from,
//     //           to: to,
//     //           insert: line.content,
//     //         },
//     //       });
//     //     }

//     //     // Apply changes to the editor
//     //     cmView.dispatch(...transactions);
//     //   },
//     // }));
// );

export default function CodeEditorView() {
  const moduleName = Config.displayName ?? Config.id;

  /* Set up theme */
  const [theme, setTheme] = useState(vscodeDark);
  const { theme: pulseTheme } = useTheme(moduleName);
  const cmRef = useRef<ReactCodeMirrorRef>(null);
  /* Set editor content */
  const [viewDocument, setViewDocument] = useState<FileViewModel | undefined>(
    undefined
  );
  const { isReady, installAgent, runAgentMethod } = useAgents(moduleName);
  // setup a timer for delayed saving
  const saveTriggerRef = useRef<DelayedTrigger | undefined>(
    new DelayedTrigger(200)
  );
  const { openNotification } = useNotification(moduleName);
  const { viewFile, updateViewFile , setIsLoaded} = useFileView(moduleName);


  const [cmFileExtension, setCmFileExtension] = useState<Extension | undefined>(
    undefined
  );

  // try install the inline-suggestion agent
  useEffect(() => {
    if (isReady) installAgent(InlineSuggestionAgent);
  }, [isReady]);

  useEffect(() => {
    if (viewFile) {
      console.log("View file updated", viewFile);
      setIsLoaded(true);
      setViewDocument(viewFile);
      setCmFileExtension(getLanguageExtension(viewFile.filePath));
    }
  }, [viewFile]);

  useEffect(() => {
    if (pulseTheme === "dark") {
      setTheme(vscodeDark);
    } else {
      setTheme(vscodeLight);
    }
  }, [pulseTheme]);

  // Update view upon view document changes
  useEffect(() => {
    if (viewDocument !== undefined) {
      updateViewFile(viewDocument);
    }
  }, [viewDocument]);

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
    const result = await runAgentMethod(
      InlineSuggestionAgent.name,
      "predictLine",
      { fileContentWithIndicator },
      abortSignal
    );

    const returns = result as InlineSuggestionAgentReturns;

    return returns;
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
    setViewDocument((prev) => {
      // Return undefined if viewDocument is not set
      if (!prev) {
        return prev;
      }
      const newDoc = {
        ...prev,
        fileContent: value,
      };

      // Notify Pulse Editor that the content has changed
      // Reset the save trigger
      saveTriggerRef.current?.reset(() => {
        const updatedFileViewModel: FileViewModel = {
          filePath: newDoc.filePath,
          fileContent: value,
          selections: newDoc.selections,
          isActive: newDoc.isActive,
        };
        updateViewFile(updatedFileViewModel);
      });
      return newDoc;
    });
  }

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-lg bg-content2"
    >
      {
        <ReactCodeMirror
          ref={cmRef}
          value={viewDocument?.fileContent}
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
