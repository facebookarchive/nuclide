'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.consumeRelatedFilesProvider = consumeRelatedFilesProvider;
exports.deactivate = deactivate;

var _atom = require('atom');

var _JumpToRelatedFile;

function _load_JumpToRelatedFile() {
  return _JumpToRelatedFile = _interopRequireDefault(require('./JumpToRelatedFile'));
}

var _RelatedFileFinder;

function _load_RelatedFileFinder() {
  return _RelatedFileFinder = _interopRequireDefault(require('./RelatedFileFinder'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

let subscriptions = null;

// Only expose a context menu for files in languages that have header files.
const GRAMMARS_WITH_HEADER_FILES = new Set(['source.c', 'source.cpp', 'source.objc', 'source.objcpp', 'source.ocaml']);

function activate() {
  subscriptions = new _atom.CompositeDisposable(new (_JumpToRelatedFile || _load_JumpToRelatedFile()).default(), atom.contextMenu.add({
    'atom-text-editor': [{
      label: 'Switch Between Header/Source',
      command: 'nuclide-related-files:jump-to-next-related-file',
      shouldDisplay() {
        const editor = atom.workspace.getActiveTextEditor();
        return editor != null && GRAMMARS_WITH_HEADER_FILES.has(editor.getGrammar().scopeName);
      }
    }, { type: 'separator' }]
  }), (_RelatedFileFinder || _load_RelatedFileFinder()).default.getRelatedFilesProvidersDisposable());
}

function consumeRelatedFilesProvider(provider) {
  return (_RelatedFileFinder || _load_RelatedFileFinder()).default.registerRelatedFilesProvider(provider);
}

function deactivate() {
  if (subscriptions != null) {
    subscriptions.dispose();
    subscriptions = null;
  }
}