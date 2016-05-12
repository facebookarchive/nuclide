Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// It's impactful to memoize our requires here since these commons are so often used.
var requireCache = {};
function requireFromCache(id) {
  if (!requireCache.hasOwnProperty(id)) {
    // $FlowIgnore
    requireCache[id] = require(id);
  }
  return requireCache[id];
}

// A map of targets to command maps. We use an object (instead of a Map) to be more consistent with
// Atom's API. See <https://atom.io/docs/api/v1.2.0/CommandRegistry#instance-add>

module.exports = Object.defineProperties({}, {
  projects: {
    get: function get() {
      return requireFromCache('./projects');
    },
    configurable: true,
    enumerable: true
  },
  atomEventDebounce: {
    get: function get() {
      return requireFromCache('./atom-event-debounce');
    },
    configurable: true,
    enumerable: true
  },
  browser: {
    get: function get() {
      return requireFromCache('./browser');
    },
    configurable: true,
    enumerable: true
  },
  createScriptBufferedProcessWithEnv: {
    get: function get() {
      return requireFromCache('./script-buffered-process').createScriptBufferedProcessWithEnv;
    },
    configurable: true,
    enumerable: true
  },
  createPaneContainer: {
    get: function get() {
      return requireFromCache('./create-pane-container');
    },
    configurable: true,
    enumerable: true
  },
  existingEditorForUri: {
    get: function get() {
      return requireFromCache('./text-editor').existingEditorForUri;
    },
    configurable: true,
    enumerable: true
  },
  existingBufferForUri: {
    get: function get() {
      return requireFromCache('./text-editor').existingBufferForUri;
    },
    configurable: true,
    enumerable: true
  },
  bufferForUri: {
    get: function get() {
      return requireFromCache('./text-editor').bufferForUri;
    },
    configurable: true,
    enumerable: true
  },
  formatEnoentNotification: {
    get: function get() {
      return requireFromCache('./format-enoent-notification').formatEnoentNotification;
    },
    configurable: true,
    enumerable: true
  },
  loadBufferForUri: {
    get: function get() {
      return requireFromCache('./text-editor').loadBufferForUri;
    },
    configurable: true,
    enumerable: true
  },
  destroyPaneItemWithTitle: {
    get: function get() {
      return requireFromCache('./destroy-pane-item');
    },
    configurable: true,
    enumerable: true
  },
  fileTypeClass: {
    get: function get() {
      return requireFromCache('./file-type-class');
    },
    configurable: true,
    enumerable: true
  },
  goToLocation: {
    get: function get() {
      return requireFromCache('./go-to-location').goToLocation;
    },
    configurable: true,
    enumerable: true
  },
  goToLocationInEditor: {
    get: function get() {
      return requireFromCache('./go-to-location').goToLocationInEditor;
    },
    configurable: true,
    enumerable: true
  },
  observeNavigatingEditors: {
    get: function get() {
      return requireFromCache('./go-to-location').observeNavigatingEditors;
    },
    configurable: true,
    enumerable: true
  },
  getPathToWorkspaceState: {
    get: function get() {
      return requireFromCache('./workspace').getPathToWorkspaceState;
    },
    configurable: true,
    enumerable: true
  },
  activatePaneItem: {
    get: function get() {
      return requireFromCache('./workspace').activatePaneItem;
    },
    configurable: true,
    enumerable: true
  },
  setPositionAndScroll: {
    get: function get() {
      return requireFromCache('./text-editor').setPositionAndScroll;
    },
    configurable: true,
    enumerable: true
  },
  getViewOfEditor: {
    get: function get() {
      return requireFromCache('./text-editor').getViewOfEditor;
    },
    configurable: true,
    enumerable: true
  },
  getScrollTop: {
    get: function get() {
      return requireFromCache('./text-editor').getScrollTop;
    },
    configurable: true,
    enumerable: true
  },
  getCursorPositions: {
    get: function get() {
      return requireFromCache('./text-editor').getCursorPositions;
    },
    configurable: true,
    enumerable: true
  },
  setScrollTop: {
    get: function get() {
      return requireFromCache('./text-editor').setScrollTop;
    },
    configurable: true,
    enumerable: true
  },
  extractWordAtPosition: {
    get: function get() {
      return requireFromCache('./extract-word-at-position');
    },
    configurable: true,
    enumerable: true
  },
  mouseListenerForTextEditor: {
    get: function get() {
      return requireFromCache('./mouse-listener-for-text-editor');
    },
    configurable: true,
    enumerable: true
  },
  observeLanguageTextEditors: {
    get: function get() {
      return requireFromCache('./observe-language-text-editors');
    },
    configurable: true,
    enumerable: true
  },
  observeGrammarForTextEditors: {
    get: function get() {
      return requireFromCache('./observe-grammar-for-text-editors');
    },
    configurable: true,
    enumerable: true
  },
  registerGrammarForFileExtension: {
    get: function get() {
      return requireFromCache('./register-grammar-for-file-extension');
    },
    configurable: true,
    enumerable: true
  },
  withLoadingNotification: {
    get: function get() {
      return requireFromCache('./with-loading-notification');
    },
    configurable: true,
    enumerable: true
  },
  onWillDestroyTextBuffer: {
    get: function get() {
      return requireFromCache('./on-will-destroy-text-buffer');
    },
    configurable: true,
    enumerable: true
  },
  addTooltip: {
    get: function get() {
      return requireFromCache('./tooltip').addTooltip;
    },
    configurable: true,
    enumerable: true
  },
  getUiTreePathFromTargetEvent: {
    get: function get() {
      return requireFromCache('./ui-tree-path').getUiTreePathFromTargetEvent;
    },
    configurable: true,
    enumerable: true
  },
  syncAtomCommands: {
    get: function get() {
      return requireFromCache('./sync-atom-commands').syncAtomCommands;
    },
    configurable: true,
    enumerable: true
  }
});