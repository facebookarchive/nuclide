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

  get createTextEditor() {
    return requireFromCache('./text-editor').createTextEditor;
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

  get loadBufferForUri() {
    return requireFromCache('./text-editor').loadBufferForUri;
  },

  get destroyPaneItemWithTitle() {
    return requireFromCache('./destroy-pane-item');
  },

  get fileTypeClass() {
    return requireFromCache('./file-type-class');
  },

  get goToLocation() {
    return requireFromCache('./go-to-location');
  },

  get getPathToWorkspaceState() {
    return requireFromCache('./workspace').getPathToWorkspaceState;
  },

  get isTextEditor() {
    return requireFromCache('./text-editor').isTextEditor;
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

  get addTooltip() {
    return requireFromCache('./tooltip').addTooltip;
  },
};
