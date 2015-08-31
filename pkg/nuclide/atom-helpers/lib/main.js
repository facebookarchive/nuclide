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
  get ScriptBufferedProcessStore() {
    return require('./ScriptBufferedProcessStore');
  },

  get atomEventDebounce() {
    return require('./atom-event-debounce');
  },

  get createScriptBufferedProcessWithEnv() {
    return require('./script-buffered-process').createScriptBufferedProcessWithEnv;
  },

  get fileTypeClass() {
    return require('./file-type-class');
  },

  get goToLocation() {
    return require('./go-to-location');
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

  get sysinfo() {
    return require('./sysinfo');
  },

  get withLoadingNotification() {
    return require('./with-loading-notification');
  },
};
