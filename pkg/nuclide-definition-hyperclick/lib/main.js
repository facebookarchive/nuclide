'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getSuggestion = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (editor, position) {
    if (currentService == null) {
      return null;
    }
    const result = yield currentService.getDefinition(editor, position);
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
  });

  return function getSuggestion(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

exports.consumeDefinitionService = consumeDefinitionService;
exports.getHyperclickProvider = getHyperclickProvider;
exports.activate = activate;
exports.deactivate = deactivate;

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('../../commons-atom/go-to-location');
}

var _atom = require('atom');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let currentService = null; /**
                            * Copyright (c) 2015-present, Facebook, Inc.
                            * All rights reserved.
                            *
                            * This source code is licensed under the license found in the LICENSE file in
                            * the root directory of this source tree.
                            *
                            * 
                            */

// This package provides Hyperclick results for any language which provides a
// DefinitionProvider.

function consumeDefinitionService(service) {
  if (!(currentService == null)) {
    throw new Error('Invariant violation: "currentService == null"');
  }

  currentService = service;
  return new _atom.Disposable(() => {
    if (!(currentService === service)) {
      throw new Error('Invariant violation: "currentService === service"');
    }

    currentService = null;
  });
}

function getHyperclickProvider() {
  return {
    priority: 20,
    providerName: 'nuclide-definition-hyperclick',
    getSuggestion
  };
}

function activate(state) {}

function deactivate() {}