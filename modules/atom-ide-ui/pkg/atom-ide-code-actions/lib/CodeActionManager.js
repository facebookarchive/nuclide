'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CodeActionManager = undefined;

var _ProviderRegistry;

function _load_ProviderRegistry() {
  return _ProviderRegistry = _interopRequireDefault(require('nuclide-commons-atom/ProviderRegistry'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class CodeActionManager {

  constructor() {
    this._providerRegistry = new (_ProviderRegistry || _load_ProviderRegistry()).default();
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  dispose() {
    this._disposables.dispose();
  }

  addProvider(provider) {
    this._disposables.add(this._providerRegistry.addProvider(provider));
  }

  createCodeActionFetcher() {
    return {
      getCodeActionForDiagnostic: (diagnostic, editor) => {
        if (diagnostic.range) {
          const { range } = diagnostic;
          const codeActionRequests = [];
          for (const provider of this._providerRegistry.getAllProvidersForEditor(editor)) {
            codeActionRequests.push(provider.getCodeActions(editor, range, [diagnostic]));
          }

          return Promise.all(codeActionRequests).then(results => (0, (_collection || _load_collection()).arrayFlatten)(results));
        }
        return Promise.resolve([]);
      }
    };
  }
}
exports.CodeActionManager = CodeActionManager; /**
                                                * Copyright (c) 2017-present, Facebook, Inc.
                                                * All rights reserved.
                                                *
                                                * This source code is licensed under the BSD-style license found in the
                                                * LICENSE file in the root directory of this source tree. An additional grant
                                                * of patent rights can be found in the PATENTS file in the same directory.
                                                *
                                                * 
                                                * @format
                                                */