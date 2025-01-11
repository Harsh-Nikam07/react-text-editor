
import React, { useState, useEffect, useCallback } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  Modifier,
  convertToRaw,
  convertFromRaw,
  getDefaultKeyBinding,
  KeyBindingUtil,
} from "draft-js";
import "draft-js/dist/Draft.css";
import Toast from "./components/Toast";

const AUTOSAVE_DELAY = 1000;
const TOAST_DURATION = 3000;

const App = () => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSavedContent();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (editorState.getCurrentContent().hasText()) {
        saveContent(true);
      }
    }, AUTOSAVE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [editorState]);

  useEffect(() => {
    if (showToast) {
      const timeoutId = setTimeout(() => {
        setShowToast(false);
      }, TOAST_DURATION);

      return () => clearTimeout(timeoutId);
    }
  }, [showToast]);

  const loadSavedContent = () => {
    try {
      const savedContent = localStorage.getItem("editorContent");
      if (savedContent) {
        const parsedContent = JSON.parse(savedContent);
        const contentState = convertFromRaw(parsedContent);
        setEditorState(EditorState.createWithContent(contentState));
      }
    } catch (error) {
      console.error("Failed to load content:", error);
      showToastMessage("Error loading saved content. Starting with empty editor.");
      setEditorState(EditorState.createEmpty());
    }
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const handleEditorChange = (state) => {
    setEditorState(state);
  };

  const keyBindingFn = (e) => {
    if (KeyBindingUtil.hasCommandModifier(e)) {
      switch (e.keyCode) {
        case 66: // B key
          return "toggle-bold";
        case 85: // U key
          return "toggle-underline";
        case 83: // S key
          e.preventDefault();
          saveContent();
          return "save";
      }
    }
    return getDefaultKeyBinding(e);
  };

  const handleKeyCommand = (command, state) => {
    switch (command) {
      case "toggle-bold":
        handleEditorChange(RichUtils.toggleInlineStyle(state, "BOLD"));
        return "handled";
      case "toggle-underline":
        handleEditorChange(RichUtils.toggleInlineStyle(state, "UNDERLINE"));
        return "handled";
      case "save":
        saveContent();
        return "handled";
      default:
        const newState = RichUtils.handleKeyCommand(state, command);
        if (newState) {
          handleEditorChange(newState);
          return "handled";
        }
    }
    return "not-handled";
  };

  const handlePastedText = (text, html, editorState) => {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const newContent = Modifier.replaceText(contentState, selection, text);
    const newEditorState = EditorState.push(
      editorState,
      newContent,
      "insert-text"
    );
    handleEditorChange(newEditorState);
    return "handled";
  };

  const handleBeforeInput = (chars, editorState) => {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const blockKey = selection.getStartKey();
    const block = contentState.getBlockForKey(blockKey);
    const blockText = block.getText();

    if (chars === " ") {
      // Heading style - check for exact "#" at the start of line
      if (blockText === "#") {
        setTimeout(() => applyBlockStyle("header-one"), 0);
        return "handled";
      }
      // Bold style
      if (blockText === "*") {
        applyInlineStyle("BOLD");
        return "handled";
      }
      // Red line style
      if (blockText === "**") {
        applyRedLineStyle();
        return "handled";
      }
      // Underline style
      if (blockText === "***") {
        applyInlineStyle("UNDERLINE");
        return "handled";
      }
    }
    return "not-handled";
  };

  const applyRedLineStyle = () => {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    
    let newState = editorState;
    const currentStyles = editorState.getCurrentInlineStyle();
    if (currentStyles.has("RED_LINE")) {
      newState = RichUtils.toggleInlineStyle(newState, "RED_LINE");
    }

    const newContent = Modifier.replaceText(
      contentState,
      selection.merge({
        anchorOffset: 0,
        focusOffset: 2,
      }),
      ""
    );

    const newEditorState = EditorState.push(
      newState,
      newContent,
      "change-inline-style"
    );
    handleEditorChange(RichUtils.toggleInlineStyle(newEditorState, "RED_LINE"));
  };

  const applyInlineStyle = (style) => {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const newContent = Modifier.replaceText(
      contentState,
      selection.merge({
        anchorOffset: 0,
        focusOffset: style === "UNDERLINE" ? 3 : 1,
      }),
      ""
    );

    const newEditorState = EditorState.push(
      editorState,
      newContent,
      "change-inline-style"
    );
    handleEditorChange(RichUtils.toggleInlineStyle(newEditorState, style));
  };

  const applyBlockStyle = (blockType) => {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    
    // First apply the block style
    const newEditorState = RichUtils.toggleBlockType(editorState, blockType);
    
    // Then clear the trigger character
    const newContent = Modifier.replaceText(
      newEditorState.getCurrentContent(),
      selection.merge({
        anchorOffset: 0,
        focusOffset: 1,
      }),
      ""
    );

    const finalEditorState = EditorState.push(
      newEditorState,
      newContent,
      "change-block-data"
    );

    handleEditorChange(finalEditorState);
  };

  const saveContent = async (isAutosave = false) => {
    try {
      setIsLoading(true);
      const contentState = editorState.getCurrentContent();
      const rawContent = convertToRaw(contentState);
      localStorage.setItem("editorContent", JSON.stringify(rawContent));
      
      if (!isAutosave) {
        showToastMessage("Content saved successfully!");
      }
    } catch (error) {
      console.error("Failed to save content:", error);
      showToastMessage("Error saving content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const blockStyleFn = (contentBlock) => {
    const type = contentBlock.getType();
    if (type === 'header-one') {
      return 'text-2xl font-bold mb-2';
    }
    return '';
  };

  const customStyleMap = {
    RED_LINE: {
      color: "red",
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl md:font-bold font-normal">
          React Demo Editor by Harsh Nikam
        </h1>
        <button
          className={`px-4 py-2 pt-1 bg-black text-white rounded ${
            isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"
          }`}
          onClick={() => saveContent()}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="border rounded-lg p-4 min-h-[200px] border-gray-300">
        <Editor
          editorState={editorState}
          onChange={handleEditorChange}
          handleKeyCommand={handleKeyCommand}
          handleBeforeInput={handleBeforeInput}
          handlePastedText={handlePastedText}
          keyBindingFn={keyBindingFn}
          blockStyleFn={blockStyleFn}
          customStyleMap={customStyleMap}
          placeholder="Start typing... Use markdown-style formatting:
          # for heading
          * for bold
          ** for red text
          *** for underline"
        />
      </div>

      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
    </div>
  );
};

export default App;