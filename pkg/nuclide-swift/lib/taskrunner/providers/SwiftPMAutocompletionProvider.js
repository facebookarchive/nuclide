"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _SwiftPMTaskRunnerStore() {
  const data = _interopRequireDefault(require("../SwiftPMTaskRunnerStore"));

  _SwiftPMTaskRunnerStore = function () {
    return data;
  };

  return data;
}

function _SourceKitten() {
  const data = require("../../sourcekitten/SourceKitten");

  _SourceKitten = function () {
    return data;
  };

  return data;
}

function _Complete() {
  const data = _interopRequireDefault(require("../../sourcekitten/Complete"));

  _Complete = function () {
    return data;
  };

  return data;
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

/**
 * An autocompletion provider that uses the compile commands in a built Swift
 * package's debug.yaml or release.yaml.
 */
class SwiftPMAutocompletionProvider {
  constructor(store) {
    this._store = store;
  }

  async getAutocompleteSuggestions(request) {
    const filePath = request.editor.getPath();
    let compilerArgs; // flowlint-next-line sketchy-null-string:off

    if (filePath) {
      const commands = await this._store.getCompileCommands();
      compilerArgs = commands.get(filePath);
    }

    const {
      bufferPosition,
      editor,
      prefix
    } = request;
    const offset = editor.getBuffer().characterIndexForPosition(bufferPosition) - prefix.length;
    const result = await (0, _SourceKitten().asyncExecuteSourceKitten)('complete', ['--text', request.editor.getText(), '--offset', String(offset), '--', // flowlint-next-line sketchy-null-string:off
    compilerArgs ? compilerArgs : '']); // flowlint-next-line sketchy-null-string:off

    if (!result) {
      return [];
    }

    return JSON.parse(result).filter(completion => completion.name.startsWith(prefix)).map(_Complete().default);
  }

}

exports.default = SwiftPMAutocompletionProvider;