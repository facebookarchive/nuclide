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

var _JumpToRelatedFile = require('./JumpToRelatedFile');

var _JumpToRelatedFile2 = _interopRequireDefault(_JumpToRelatedFile);

var _RelatedFileFinder = require('./RelatedFileFinder');

var _RelatedFileFinder2 = _interopRequireDefault(_RelatedFileFinder);

var jumpToRelatedFile = null;

function activate() {
  // Make it a const for Flow
  var local = jumpToRelatedFile = new _JumpToRelatedFile2['default'](new _RelatedFileFinder2['default']());

  atom.workspace.observeTextEditors(function (textEditor) {
    local.enableInTextEditor(textEditor);
  });
}

function deactivate() {
  if (jumpToRelatedFile) {
    jumpToRelatedFile.dispose();
    jumpToRelatedFile = null;
  }
}