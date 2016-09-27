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

exports.convertDefinitions = convertDefinitions;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _HackHelpers2;

function _HackHelpers() {
  return _HackHelpers2 = require('./HackHelpers');
}

var _simpleTextBuffer2;

function _simpleTextBuffer() {
  return _simpleTextBuffer2 = require('simple-text-buffer');
}

function convertDefinitions(hackDefinitions, filePath, projectRoot) {
  function convertDefinition(definition) {
    (0, (_assert2 || _assert()).default)(definition.definition_pos != null);
    return {
      path: definition.definition_pos.filename || filePath,
      position: new (_simpleTextBuffer2 || _simpleTextBuffer()).Point(definition.definition_pos.line - 1, definition.definition_pos.char_start - 1),
      // TODO: range, definition_id
      id: definition.name,
      name: definition.name,
      language: 'php',
      projectRoot: projectRoot
    };
  }

  var filteredDefinitions = hackDefinitions.filter(function (definition) {
    return definition.definition_pos != null;
  });
  if (filteredDefinitions.length === 0) {
    return null;
  }

  var definitions = filteredDefinitions.map(convertDefinition);

  return {
    queryRange: (0, (_HackHelpers2 || _HackHelpers()).hackRangeToAtomRange)(filteredDefinitions[0].pos),
    definitions: definitions
  };
}