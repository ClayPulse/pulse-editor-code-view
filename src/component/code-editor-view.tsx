import ReactCodeMirror, {
  Extension,
  ReactCodeMirrorRef,
} from "@uiw/react-codemirror";
import { useCallback, useEffect, useRef, useState } from "react";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import { DrawnLine } from "../lib/types";
import CanvasEditor from "./canvas/canvas-editor";
import html2canvas from "html2canvas";

import React from "react";
import { createRoot } from "react-dom/client";
import { codeInlineSuggestionExtension } from "../lib/codemirror-extensions/code-inline-suggestion";
import { getLanguageExtension } from "../lib/codemirror-extensions/get-language-extension";
import { DelayedTrigger } from "../lib/delayed-trigger";

import {
  useAgent,
  useFileView,
  useNotification,
  useTheme,
} from "@pulse-editor/react-api";
import { FileViewModel, SelectionInformation } from "@pulse-editor/types";

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

// CodeEditorView.displayName = "CodeEditorView";

export default function CodeEditorView() {
  /* Set up theme */
  const [theme, setTheme] = useState(vscodeDark);
  const { theme: pulseTheme } = useTheme();
  const cmRef = useRef<ReactCodeMirrorRef>(null);
  /* Set editor content */
  const [viewDocument, setViewDocument] = useState<FileViewModel | undefined>(
    undefined
  );
  const { runAgentMethod } = useAgent("inline-suggestion");
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  // setup a timer for delayed saving
  const saveTriggerRef = useRef<DelayedTrigger | undefined>(
    new DelayedTrigger(200)
  );
  const { openNotification } = useNotification();
  const { viewFile, updateViewFile, setIsLoaded } = useFileView();

  const [isDrawing, setIsDrawing] = useState(false);
  const [isDownloadClip, setIsDownloadClip] = useState(false);
  const [isDrawHulls, setIsDrawHulls] = useState(false);

  const [cmFileExtension, setCmFileExtension] = useState<Extension | undefined>(
    undefined
  );

  useEffect(() => {
    if (viewFile) {
      console.log("View file updated", viewFile);
      setIsLoaded(true);
      setViewDocument(viewFile);
      setCmFileExtension(
        viewFile ? getLanguageExtension(viewFile.filePath) : undefined
      );
    }
  }, [viewFile]);

  useEffect(() => {
    if (pulseTheme === "dark") {
      setTheme(vscodeDark);
    } else {
      setTheme(vscodeLight);
    }
  }, [pulseTheme]);

  useEffect(() => {
    // reset drawing info when drawing mode is off
    if (!isDrawing) {
      setViewDocument((prev) => {
        // Return undefined if viewDocument is not set
        if (!prev) {
          return prev;
        }
        return {
          ...prev,
          selections: [],
        };
      });
      setIsCanvasReady(false);
      const canvasWidget = document.getElementById("canvas-widget");
      if (canvasWidget) {
        canvasWidget.remove();
      }
      return;
    }
    // Get editor canvas
    const scroller = cmRef.current?.view?.scrollDOM;
    if (!scroller) {
      throw new Error("Scroller not found");
    }
    const editorContent = cmRef.current?.view?.contentDOM;
    if (!editorContent) {
      throw new Error("Editor content not found");
    }
    const editor = document.getElementsByClassName("cm-editor")[0];
    if (!editor) {
      throw new Error("Editor not found");
    }
    // Get the background color of the editor
    const background = window.getComputedStyle(editor).backgroundColor;
    // Convert the editor content to a canvas using html2canvas
    html2canvas(editorContent, {
      windowWidth: editorContent.offsetWidth,
      windowHeight: editorContent.offsetHeight,
      backgroundColor: background,
    }).then((canvas) => {
      // Set the canvas to the state
      setIsCanvasReady(true);
      /* This finds cm-scroller and injects the canvas.
           This is doable because cm-scroller does not keep
           track of its content (?).
           It is known that injecting into cm-content will cause
           CodeMirror to lose its internal states as the content
           is directly managed by CodeMirror internals.
           A better way to do this is to make a CodeMirror decoration
           instead of injecting into its DOM. */
      // Add the canvas to the editor content
      scroller.appendChild(
        getCanvasDOM(
          editorContent.getBoundingClientRect().left -
            scroller.getBoundingClientRect().left,
          canvas,
          pulseTheme ?? "light"
        )
      );
    });
  }, [isDrawing, pulseTheme]);

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
    numberOfSuggestions: number,
    abortSignal: AbortSignal
  ) {
    return runAgentMethod(
      "suggest-inline",
      JSON.stringify({
        codeContent,
        cursorX,
        cursorY,
        numberOfSuggestions,
      }),
      abortSignal
    );
  }

  function getDrawingLocation(line: DrawnLine): {
    lineStart: number;
    lineEnd: number;
  } {
    const points = line.points;
    const pointsY = points
      .map((point) => point.y)
      .filter((point) => typeof point === "number");
    const minY = Math.min(...pointsY);
    const maxY = Math.max(...pointsY);
    const editorContent = cmRef.current?.view?.contentDOM;
    if (!editorContent) {
      throw new Error("Editor content not found");
    }
    // Go through each line and column to find the start and end
    const cmView = cmRef.current?.view;
    const cmState = cmRef.current?.state;
    const lineStartBlock = cmView?.lineBlockAtHeight(minY);
    const lineStart = lineStartBlock
      ? cmState?.doc.lineAt(lineStartBlock.from).number ?? -1
      : -1;
    const lineEndBlock = cmView?.lineBlockAtHeight(maxY);
    const lineEnd = lineEndBlock
      ? cmState?.doc.lineAt(lineEndBlock.from).number ?? -1
      : -1;
    return {
      lineStart: lineStart,
      lineEnd: lineEnd,
    };
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
  const onTextExtracted = useCallback((line: DrawnLine, text: string) => {
    // Get location information
    const editorContent = cmRef.current?.view?.contentDOM;
    if (!editorContent) {
      throw new Error("Editor content not found");
    }
    const location = getDrawingLocation(line);
    const newInfo: SelectionInformation = {
      lineStart: location.lineStart,
      lineEnd: location.lineEnd,
      text,
    };
    setViewDocument((prev) => {
      // Return undefined if viewDocument is not set
      if (!prev) {
        return prev;
      }
      return {
        ...prev,
        selections: [...(prev.selections ?? []), newInfo],
      };
    });
  }, []);
  function getCanvasDOM(
    offsetX: number,
    editorCanvas: HTMLCanvasElement,
    theme: string
  ) {
    function getCanvas(editorCanvas: HTMLCanvasElement, theme: string) {
      return (
        <div
          className="absolute left-0 top-0"
          style={{
            height: cmRef.current?.view?.contentDOM.offsetHeight,
            width: cmRef.current?.view?.contentDOM.offsetWidth,
          }}
        >
          <CanvasEditor
            onTextExtracted={onTextExtracted}
            isDownloadClip={isDownloadClip ?? false}
            isDrawHulls={isDrawHulls ?? false}
            editorCanvas={editorCanvas}
            theme={theme}
          />
        </div>
      );
    }
    const container = document.createElement("div");
    container.id = "canvas-widget";
    container.style.position = "absolute";
    container.style.left = offsetX + "px";
    const root = createRoot(container);
    const canvas = getCanvas(editorCanvas, theme);
    root.render(canvas);
    return container;
  }

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-lg bg-content2"
      style={{
        cursor: isDrawing && !isCanvasReady ? "wait" : "auto",
      }}
    >
      {viewDocument?.fileContent !== undefined ? (
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
      ) : (
        <p>No content to display. Please select a file to view.</p>
      )}
    </div>
  );
}
