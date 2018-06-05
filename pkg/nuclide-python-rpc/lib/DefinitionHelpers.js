'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDefinition = getDefinition;

var _simpleTextBuffer;

function _load_simpleTextBuffer() {
  return _simpleTextBuffer = require('simple-text-buffer');
}

var _range;

function _load_range() {
  return _range = require('../../../modules/nuclide-commons/range');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

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

async function getDefinition(serverManager, filePath, buffer, position) {
  const wordMatch = (0, (_range || _load_range()).wordAtPositionFromBuffer)(buffer, position, (_constants || _load_constants()).IDENTIFIER_REGEXP);
  if (wordMatch == null) {
    return null;
  }

  const { range } = wordMatch;

  const line = position.row;
  const column = position.column;
  const contents = buffer.getText();

  const service = await serverManager.getJediService();
  const result = await service.get_definitions(filePath, contents, serverManager.getSysPath(filePath), line, column);
  if (result == null || result.length === 0) {
    return null;
  }

  const definitions = result.map(definition => ({
    path: definition.file,
    position: new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(definition.line, definition.column),
    id: definition.text,
    name: definition.text,
    language: 'python'
  }));

  return {
    queryRange: [range],
    definitions
  };
}