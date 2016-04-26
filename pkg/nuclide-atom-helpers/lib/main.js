'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// It's impactful to memoize our requires here since these commons are so often used.
const requireCache: {[id: string]: any} = {};
function requireFromCache(id: string): any {
  if (!requireCache.hasOwnProperty(id)) {
    // $FlowIgnore
    requireCache[id] = require(id);
  }
  return requireCache[id];
}

module.exports = {
  get projects() {
    return requireFromCache('./projects');
  },

  get atomEventDebounce() {
    return requireFromCache('./atom-event-debounce');
  },

  get browser() {
    return requireFromCache('./browser');
  },

  get createScriptBufferedProcessWithEnv() {
    return requireFromCache('./script-buffered-process').createScriptBufferedProcessWithEnv;
  },

  get createPaneContainer() {
    return requireFromCache('./create-pane-container');
  },

  get existingEditorForUri() {
    return requireFromCache('./text-editor').existingEditorForUri;
  },

  get existingBufferForUri() {
    return requireFromCache('./text-editor').existingBufferForUri;
  },

  get bufferForUri() {
    return requireFromCache('./text-editor').bufferForUri;
  },

  get formatEnoentNotification() {
    return requireFromCache('./format-enoent-notification').formatEnoentNotification;
  },

  get loadBufferForUri() {
    return requireFromCache('./text-editor').loadBufferForUri;
  },

  get observeActiveEditorsDebounced() {
    return requireFromCache('./text-editor').observeActiveEditorsDebounced;
  },

  get observeEditorChangesDebounced() {
    return requireFromCache('./text-editor').observeEditorChangesDebounced;
  },

  get destroyPaneItemWithTitle() {
    return requireFromCache('./destroy-pane-item');
  },

  get fileTypeClass() {
    return requireFromCache('./file-type-class');
  },

  get goToLocation() {
    return requireFromCache('./go-to-location').goToLocation;
  },

  get goToLocationInEditor() {
    return requireFromCache('./go-to-location').goToLocationInEditor;
  },

  get observeNavigatingEditors() {
    return requireFromCache('./go-to-location').observeNavigatingEditors;
  },

  get getPathToWorkspaceState() {
    return requireFromCache('./workspace').getPathToWorkspaceState;
  },

  get activatePaneItem() {
    return requireFromCache('./workspace').activatePaneItem;
  },

  get setPositionAndScroll() {
    return requireFromCache('./text-editor').setPositionAndScroll;
  },

  get getViewOfEditor() {
    return requireFromCache('./text-editor').getViewOfEditor;
  },

  get getScrollTop() {
    return requireFromCache('./text-editor').getScrollTop;
  },

  get getCursorPositions() {
    return requireFromCache('./text-editor').getCursorPositions;
  },

  get setScrollTop() {
    return requireFromCache('./text-editor').setScrollTop;
  },

  get extractWordAtPosition() {
    return requireFromCache('./extract-word-at-position');
  },

  get mouseListenerForTextEditor() {
    return requireFromCache('./mouse-listener-for-text-editor');
  },

  get observeLanguageTextEditors() {
    return requireFromCache('./observe-language-text-editors');
  },

  get observeGrammarForTextEditors() {
    return requireFromCache('./observe-grammar-for-text-editors');
  },

  get registerGrammarForFileExtension() {
    return requireFromCache('./register-grammar-for-file-extension');
  },

  get withLoadingNotification() {
    return requireFromCache('./with-loading-notification');
  },

  get onWillDestroyTextBuffer(): (callback: (buffer: atom$TextBuffer) => mixed) => IDisposable {
    return requireFromCache('./on-will-destroy-text-buffer');
  },

  get addTooltip() {
    return requireFromCache('./tooltip').addTooltip;
  },

  get getUiTreePathFromTargetEvent() {
    return requireFromCache('./ui-tree-path').getUiTreePathFromTargetEvent;
  },
};
