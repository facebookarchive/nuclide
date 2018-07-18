"use strict";

function _ConfigCache() {
  const data = require("../ConfigCache");

  _ConfigCache = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
const CONFIG_FILE_NAME = '.test_nuclide_config_file';
const CONFIG_FILE_NAME_2 = '.test_nuclide_config_file_2';
describe('ConfigCache', () => {
  const noConfigFolder = _nuclideUri().default.join(__dirname, '../__mocks__/fixtures');

  const rootFolder = _nuclideUri().default.join(__dirname, '../__mocks__/fixtures/ConfigCache');

  const rootFile = _nuclideUri().default.join(__dirname, '../__mocks__/fixtures/ConfigCache/file');

  const nestedFolder = _nuclideUri().default.join(__dirname, '../__mocks__/fixtures/ConfigCache/testFolder');

  const nestedFolder2 = _nuclideUri().default.join(__dirname, '../__mocks__/fixtures/ConfigCache/testFolder2');

  it('finds the right config dir', async () => {
    const cache = new (_ConfigCache().ConfigCache)([CONFIG_FILE_NAME]);
    expect((await cache.getConfigDir(noConfigFolder))).toBe(null);
    expect((await cache.getConfigDir(rootFolder))).toBe(rootFolder);
    expect((await cache.getConfigDir(rootFile))).toBe(rootFolder);
  });
  it('prefers closer matches with multiple config files', async () => {
    const cache = new (_ConfigCache().ConfigCache)([CONFIG_FILE_NAME, CONFIG_FILE_NAME_2]);
    expect((await cache.getConfigDir(rootFolder))).toBe(rootFolder);
    expect((await cache.getConfigDir(nestedFolder2))).toBe(nestedFolder2);
  });
  it('prefers further matches when the search strategy is "eclipse"', async () => {
    const cache = new (_ConfigCache().ConfigCache)([CONFIG_FILE_NAME, CONFIG_FILE_NAME_2], 'eclipse');
    expect((await cache.getConfigDir(rootFolder))).toBe(rootFolder);
    expect((await cache.getConfigDir(nestedFolder))).toBe(rootFolder);
    expect((await cache.getConfigDir(nestedFolder2))).toBe(rootFolder);
  });
  it('prefers priority matches when the search strategy is "ocaml"', async () => {
    const cache = new (_ConfigCache().ConfigCache)([CONFIG_FILE_NAME, CONFIG_FILE_NAME_2], 'ocaml');
    expect((await cache.getConfigDir(rootFolder))).toBe('/');
    expect((await cache.getConfigDir(nestedFolder2))).toBe('/');
  });
  it('matches first path segment when the search strategy is "thrift"', async () => {
    const cache = new (_ConfigCache().ConfigCache)(['ConfigCache/testFolder', 'ConfigCache'], 'thrift'); // matches both patterns, tie-breaks with first one

    expect((await cache.getConfigDir(nestedFolder))).toBe(nestedFolder); // matches second pattern

    expect((await cache.getConfigDir(nestedFolder2))).toBe(rootFolder);
  });
});