'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _SwiftPMTaskRunnerStore;

function _load_SwiftPMTaskRunnerStore() {
  return _SwiftPMTaskRunnerStore = _interopRequireDefault(require('../SwiftPMTaskRunnerStore'));
}

var _SourceKitten;

function _load_SourceKitten() {
  return _SourceKitten = require('../../sourcekitten/SourceKitten');
}

var _Complete;

function _load_Complete() {
  return _Complete = _interopRequireDefault(require('../../sourcekitten/Complete'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * An autocompletion provider that uses the compile commands in a built Swift
 * package's debug.yaml or release.yaml.
 */
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

class SwiftPMAutocompletionProvider {

  constructor(store) {
    this._store = store;
  }

  getAutocompleteSuggestions(request) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const filePath = request.editor.getPath();
      let compilerArgs;
      // flowlint-next-line sketchy-null-string:off
      if (filePath) {
        const commands = yield _this._store.getCompileCommands();
        compilerArgs = commands.get(filePath);
      }

      const { bufferPosition, editor, prefix } = request;
      const offset = editor.getBuffer().characterIndexForPosition(bufferPosition) - prefix.length;
      const result = yield (0, (_SourceKitten || _load_SourceKitten()).asyncExecuteSourceKitten)('complete', ['--text', request.editor.getText(), '--offset', String(offset), '--',
      // flowlint-next-line sketchy-null-string:off
      compilerArgs ? compilerArgs : '']);

      // flowlint-next-line sketchy-null-string:off
      if (!result) {
        return [];
      }

      return JSON.parse(result).filter(function (completion) {
        return completion.name.startsWith(prefix);
      }).map((_Complete || _load_Complete()).default);
    })();
  }
}
exports.default = SwiftPMAutocompletionProvider;