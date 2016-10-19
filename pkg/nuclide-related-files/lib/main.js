Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _JumpToRelatedFile;

function _load_JumpToRelatedFile() {
  return _JumpToRelatedFile = _interopRequireDefault(require('./JumpToRelatedFile'));
}

var subscriptions = null;

// Only expose a context menu for files in languages that have header files.
var GRAMMARS_WITH_HEADER_FILES = new Set(['source.c', 'source.cpp', 'source.objc', 'source.objcpp', 'source.ocaml']);

function activate() {
  subscriptions = new (_atom || _load_atom()).CompositeDisposable(new (_JumpToRelatedFile || _load_JumpToRelatedFile()).default(), atom.contextMenu.add({
    'atom-text-editor': [{
      label: 'Switch Between Header/Source',
      command: 'nuclide-related-files:jump-to-next-related-file',
      shouldDisplay: function shouldDisplay() {
        var editor = atom.workspace.getActiveTextEditor();
        return editor != null && GRAMMARS_WITH_HEADER_FILES.has(editor.getGrammar().scopeName);
      }
    }, { type: 'separator' }]
  }));
}

function deactivate() {
  if (subscriptions != null) {
    subscriptions.dispose();
    subscriptions = null;
  }
}