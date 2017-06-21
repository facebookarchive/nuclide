'use strict';

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('nuclide-commons-atom/go-to-location');
}

var _ProviderRegistry;

function _load_ProviderRegistry() {
  return _ProviderRegistry = _interopRequireDefault(require('nuclide-commons-atom/ProviderRegistry'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// position is the first char of the definition's identifier, while range
// includes the entire definition. For example in:
//   class Foo { }
// position should be the 'F' in Foo, while range should span the 'c' in class
// to the '}'
// id is a string which uniquely identifies this symbol in a project. It is not suitable
// for display to humans.
// name is a string suitable for display to humans.
// projectRoot is the root directory of the project containing this definition.
// name is required, and projectRoot is encouraged, when returning multiple results.


// Definition queries supply a point.
// The returned queryRange is the range within which the returned definition is valid.
// Typically queryRange spans the containing identifier around the query point.


// Provides definitions for a set of language grammars.
class Activation {

  constructor() {
    this._providers = new (_ProviderRegistry || _load_ProviderRegistry()).default();
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  dispose() {
    this._disposables.dispose();
  }

  getSuggestion(editor, position) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const provider = _this._providers.getProviderForEditor(editor);
      if (provider == null) {
        return null;
      }
      const result = yield provider.getDefinition(editor, position);
      if (result == null) {
        return null;
      }
      const { definitions } = result;

      if (!(definitions.length > 0)) {
        throw new Error('Invariant violation: "definitions.length > 0"');
      }

      function createCallback(definition) {
        return () => {
          (0, (_goToLocation || _load_goToLocation()).goToLocation)(definition.path, definition.position.row, definition.position.column);
        };
      }

      function createTitle(definition) {
        if (!(definition.name != null)) {
          throw new Error('must include name when returning multiple definitions');
        }

        const filePath = definition.projectRoot == null ? definition.path : (_nuclideUri || _load_nuclideUri()).default.relative(definition.projectRoot, definition.path);
        return `${definition.name} (${filePath})`;
      }

      if (definitions.length === 1) {
        return {
          range: result.queryRange,
          callback: createCallback(definitions[0])
        };
      } else {
        return {
          range: result.queryRange,
          callback: definitions.map(function (definition) {
            return {
              title: createTitle(definition),
              callback: createCallback(definition)
            };
          })
        };
      }
    })();
  }

  consumeDefinitionProvider(provider) {
    const disposable = this._providers.addProvider(provider);
    this._disposables.add(disposable);
    return disposable;
  }

  getHyperclickProvider() {
    return {
      priority: 20,
      providerName: 'atom-ide-definitions',
      getSuggestion: (editor, position) => this.getSuggestion(editor, position)
    };
  }
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

// This package provides Hyperclick results for any language which provides a
// DefinitionProvider.

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);