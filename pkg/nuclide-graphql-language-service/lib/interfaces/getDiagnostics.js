'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDiagnostics = getDiagnostics;

var _graphql;

function _load_graphql() {
  return _graphql = require('graphql');
}

var _CharacterStream;

function _load_CharacterStream() {
  return _CharacterStream = _interopRequireDefault(require('../parser/CharacterStream'));
}

var _onlineParser;

function _load_onlineParser() {
  return _onlineParser = _interopRequireDefault(require('../parser/onlineParser'));
}

var _Range;

function _load_Range() {
  return _Range = require('../utils/Range');
}

var _validateWithCustomRules;

function _load_validateWithCustomRules() {
  return _validateWithCustomRules = require('../utils/validateWithCustomRules');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getDiagnostics(filePath, queryText, schema = null, customRules) {
  if (filePath == null) {
    return [];
  }

  let ast = null;
  try {
    ast = (0, (_graphql || _load_graphql()).parse)(queryText);
  } catch (error) {
    const range = getRange(error.locations[0], queryText);

    return [{
      name: 'graphql: Syntax',
      type: 'Error',
      text: error.message,
      range,
      filePath
    }];
  }

  const errors = schema ? (0, (_validateWithCustomRules || _load_validateWithCustomRules()).validateWithCustomRules)(schema, ast, customRules) : [];
  return mapCat(errors, error => errorAnnotations(error, filePath));
}

// General utility for map-cating (aka flat-mapping).
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

function mapCat(array, mapper) {
  return Array.prototype.concat.apply([], array.map(mapper));
}

function errorAnnotations(error, filePath) {
  if (!error.nodes) {
    return [];
  }
  return error.nodes.map(node => {
    const highlightNode = node.kind !== 'Variable' && node.name ? node.name : node.variable ? node.variable : node;

    if (!error.locations) {
      throw new Error('GraphQL validation error requires locations.');
    }

    const loc = error.locations[0];
    const end = loc.column + (highlightNode.loc.end - highlightNode.loc.start);
    return {
      name: 'graphql: Validation',
      text: error.message,
      type: 'error',
      range: new (_Range || _load_Range()).Range(new (_Range || _load_Range()).Point(loc.line - 1, loc.column), new (_Range || _load_Range()).Point(loc.line - 1, end)),
      filePath
    };
  });
}

function getRange(location, queryText) {
  const parser = (0, (_onlineParser || _load_onlineParser()).default)();
  const state = parser.startState();
  const lines = queryText.split('\n');

  if (!(lines.length >= location.line)) {
    throw new Error('Query text must have more lines than where the error happened');
  }

  let stream = null;

  for (let i = 0; i < location.line; i++) {
    stream = new (_CharacterStream || _load_CharacterStream()).default(lines[i]);
    while (!stream.eol()) {
      const style = parser.token(stream, state);
      if (style === 'invalidchar') {
        break;
      }
    }
  }

  if (!stream) {
    throw new Error('Expected Parser stream to be available.');
  }

  const line = location.line - 1;
  const start = stream.getStartOfToken();
  const end = stream.getCurrentPosition();

  return new (_Range || _load_Range()).Range(new (_Range || _load_Range()).Point(line, start), new (_Range || _load_Range()).Point(line, end));
}