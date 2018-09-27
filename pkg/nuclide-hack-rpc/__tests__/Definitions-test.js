"use strict";

function _Definitions() {
  const data = require("../lib/Definitions");

  _Definitions = function () {
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
 * @emails oncall+nuclide
 */
describe('convertDefinitions', () => {
  const filePath = '/tmp/file1';
  const defPath = '/tmp/file2';
  const projectRoot = '/tmp';
  const filteredDef = {
    definition_pos: null,
    name: 'filtered',
    pos: {
      filename: filePath,
      line: 1,
      char_start: 10,
      char_end: 13
    }
  };
  const def = {
    definition_pos: {
      filename: defPath,
      line: 10,
      char_start: 42,
      char_end: 52
    },
    definition_span: {
      filename: defPath,
      line_start: 10,
      char_start: 42,
      line_end: 11,
      char_end: 1
    },
    name: 'hack-name',
    pos: {
      filename: filePath,
      line: 1,
      char_start: 10,
      char_end: 13
    },
    projectRoot
  };
  const defaultName = {
    definition_pos: {
      filename: null,
      line: 10,
      char_start: 42,
      char_end: 52
    },
    name: 'hack-name',
    pos: {
      filename: filePath,
      line: 1,
      char_start: 10,
      char_end: 13
    },
    projectRoot
  };
  it('no definitions', () => {
    expect((0, _Definitions().convertDefinitions)([], filePath, projectRoot)).toBe(null);
  });
  it('filtered definitions', () => {
    expect((0, _Definitions().convertDefinitions)([filteredDef], filePath, projectRoot)).toBe(null);
  });
  it('valid definition', () => {
    expect((0, _Definitions().convertDefinitions)([filteredDef, def], filePath, projectRoot)).toMatchSnapshot();
  });
  it('default name definition', () => {
    expect((0, _Definitions().convertDefinitions)([defaultName], filePath, projectRoot)).toMatchSnapshot();
  });
});