import { useLoading, useReceiveFile } from "@pulse-editor/react-api";
import CodeEditorView from "./code-editor-view";
import React, { useEffect } from "react";

export default function ViewIndex() {
  const { toggleLoading, isReady } = useLoading();
  const { receivedFileUri } = useReceiveFile();

  useEffect(() => {
    if (isReady) {
      toggleLoading(false);
    }
  }, [isReady]);

  if (!receivedFileUri) {
    return (
      <div className="text-center text-black bg-white dark:text-white dark:bg-black h-full w-full flex flex-col items-center justify-center">
        Select a file from side panel to get started.
      </div>
    );
  }

  return <CodeEditorView uri={receivedFileUri} />;
}
