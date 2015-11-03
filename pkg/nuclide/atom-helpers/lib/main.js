'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

module.exports = {
  get projects() {
    return require('./projects');
  },

  get atomEventDebounce() {
    return require('./atom-event-debounce');
  },

  get createScriptBufferedProcessWithEnv() {
    return require('./script-buffered-process').createScriptBufferedProcessWithEnv;
  },

  get createPaneContainer() {
    return require('./create-pane-container');
  },

  get createTextEditor() {
    return require('./text-editor').createTextEditor;
  },

  get destroyPaneItemWithTitle() {
    return require('./destroy-pane-item');
  },

  get fileTypeClass() {
    return require('./file-type-class');
  },

  get goToLocation() {
    return require('./go-to-location');
  },

  get getPathToWorkspaceState() {
    return require('./workspace').getPathToWorkspaceState;
  },

  get isTextEditor() {
    return require('./text-editor').isTextEditor;
  },

  get closeTabForBuffer() {
    return require('./close-tab-buffer');
  },

  get extractWordAtPosition() {
    return require('./extract-word-at-position');
  },

  get mouseListenerForTextEditor() {
    return require('./mouse-listener-for-text-editor');
  },

  get observeLanguageTextEditors() {
    return require('./observe-language-text-editors');
  },

  get observeGrammarForTextEditors() {
    return require('./observe-grammar-for-text-editors');
  },

  get registerGrammarForFileExtension() {
    return require('./register-grammar-for-file-extension');
  },

  get withLoadingNotification() {
    return require('./with-loading-notification');
  },
};
