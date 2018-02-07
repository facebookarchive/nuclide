'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getIgnoredNames = getIgnoredNames;
exports.parseFileNameQuery = parseFileNameQuery;
function getIgnoredNames() {
  // $FlowIssue: Filter predicates
  const ignoredNames = atom.config.get('core.ignoredNames');
  if (Array.isArray(ignoredNames)) {
    return ignoredNames.filter(x => typeof x === 'string');
  } else {
    return [];
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

function parseFileNameQuery(query) {
  const [fileName, line, column] = query.split(/:+/);
  const lineNumber = parseInt(line, 10);
  const columnNumber = parseInt(column, 10);

  return {
    fileName,
    line: !Number.isNaN(lineNumber) ? lineNumber - 1 : undefined,
    column: !Number.isNaN(columnNumber) ? columnNumber - 1 : undefined
  };
}