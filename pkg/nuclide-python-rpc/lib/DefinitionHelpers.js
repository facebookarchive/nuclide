"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDefinition = getDefinition;

function _simpleTextBuffer() {
  const data = require("simple-text-buffer");

  _simpleTextBuffer = function () {
    return data;
  };

  return data;
}

function _range() {
  const data = require("../../../modules/nuclide-commons/range");

  _range = function () {
    return data;
  };

  return data;
}

function _constants() {
  const data = require("./constants");

  _constants = function () {
    return data;
  };

  return data;
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
  const wordMatch = (0, _range().wordAtPositionFromBuffer)(buffer, position, _constants().IDENTIFIER_REGEXP);

  if (wordMatch == null) {
    return null;
  }

  const {
    range
  } = wordMatch;
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
    position: new (_simpleTextBuffer().Point)(definition.line, definition.column),
    id: definition.text,
    name: definition.text,
    language: 'python'
  }));
  return {
    queryRange: [range],
    definitions
  };
}