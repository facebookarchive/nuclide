/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 * @emails oncall+nuclide
 */
import type {HackDefinition} from '../lib/Definitions';

import {convertDefinitions} from '../lib/Definitions';

describe('convertDefinitions', () => {
  const filePath = '/tmp/file1';
  const defPath = '/tmp/file2';
  const projectRoot = '/tmp';

  const filteredDef: HackDefinition = {
    definition_pos: null,
    name: 'filtered',
    pos: {
      filename: filePath,
      line: 1,
      char_start: 10,
      char_end: 13,
    },
  };

  const def: HackDefinition = {
    definition_pos: {
      filename: defPath,
      line: 10,
      char_start: 42,
      char_end: 52,
    },
    definition_span: {
      filename: defPath,
      line_start: 10,
      char_start: 42,
      line_end: 11,
      char_end: 1,
    },
    name: 'hack-name',
    pos: {
      filename: filePath,
      line: 1,
      char_start: 10,
      char_end: 13,
    },
    projectRoot,
  };

  const defaultName: HackDefinition = {
    definition_pos: {
      filename: (null: any),
      line: 10,
      char_start: 42,
      char_end: 52,
    },
    name: 'hack-name',
    pos: {
      filename: filePath,
      line: 1,
      char_start: 10,
      char_end: 13,
    },
    projectRoot,
  };

  it('no definitions', () => {
    expect(convertDefinitions([], filePath, projectRoot)).toBe(null);
  });

  it('filtered definitions', () => {
    expect(convertDefinitions([filteredDef], filePath, projectRoot)).toBe(null);
  });

  it('valid definition', () => {
    expect(
      convertDefinitions([filteredDef, def], filePath, projectRoot),
    ).toMatchSnapshot();
  });

  it('default name definition', () => {
    expect(
      convertDefinitions([defaultName], filePath, projectRoot),
    ).toMatchSnapshot();
  });
});
