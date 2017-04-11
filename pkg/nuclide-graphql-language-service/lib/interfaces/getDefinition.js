'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDefinitionQueryResultForFragmentSpread = exports.LANGUAGE = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getDefinitionQueryResultForFragmentSpread = exports.getDefinitionQueryResultForFragmentSpread = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (text, fragment, dependencies) {
    const name = fragment.name.value;
    const defNodes = dependencies.filter(function ({ definition }) {
      return definition.name.value === name;
    });
    if (defNodes === []) {
      process.stderr.write(`Definition not found for GraphQL fragment ${name}`);
      return { queryRange: [], definitions: [] };
    }
    const definitions = defNodes.map(function ({ filePath, content, definition }) {
      return getDefinitionForFragmentDefinition(filePath || '', content, definition);
    });
    return {
      definitions,
      queryRange: definitions.map(function (_) {
        return (0, (_Range || _load_Range()).locToRange)(text, fragment.loc);
      })
    };
  });

  return function getDefinitionQueryResultForFragmentSpread(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})();

exports.getDefinitionQueryResultForDefinitionNode = getDefinitionQueryResultForDefinitionNode;

var _Range;

function _load_Range() {
  return _Range = require('../utils/Range');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const LANGUAGE = exports.LANGUAGE = 'GraphQL'; /**
                                                * Copyright (c) 2015-present, Facebook, Inc.
                                                * All rights reserved.
                                                *
                                                * This source code is licensed under the license found in the LICENSE file in
                                                * the root directory of this source tree.
                                                *
                                                * 
                                                */

function getDefinitionQueryResultForDefinitionNode(path, text, definition) {
  return {
    definitions: [getDefinitionForFragmentDefinition(path, text, definition)],
    queryRange: [(0, (_Range || _load_Range()).locToRange)(text, definition.name.loc)]
  };
}

function getDefinitionForFragmentDefinition(path, text, definition) {
  return {
    path,
    position: (0, (_Range || _load_Range()).offsetToPoint)(text, definition.name.loc.start),
    range: (0, (_Range || _load_Range()).locToRange)(text, definition.loc),
    name: definition.name.value,
    language: LANGUAGE,
    // This is a file inside the project root, good enough for now
    projectRoot: path
  };
}