'use strict';

var _ConfigCache;

function _load_ConfigCache() {
  return _ConfigCache = require('../ConfigCache');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../nuclideUri'));
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
  const noConfigFolder = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../__mocks__/fixtures');
  const rootFolder = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../__mocks__/fixtures/ConfigCache');
  const rootFile = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../__mocks__/fixtures/ConfigCache/file');
  const nestedFolder = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../__mocks__/fixtures/ConfigCache/testFolder');
  const nestedFolder2 = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../__mocks__/fixtures/ConfigCache/testFolder2');

  it('finds the right config dir', async () => {
    const cache = new (_ConfigCache || _load_ConfigCache()).ConfigCache([CONFIG_FILE_NAME]);

    expect((await cache.getConfigDir(noConfigFolder))).toBe(null);
    expect((await cache.getConfigDir(rootFolder))).toBe(rootFolder);
    expect((await cache.getConfigDir(rootFile))).toBe(rootFolder);
  });

  it('prefers closer matches with multiple config files', async () => {
    await (async () => {
      const cache = new (_ConfigCache || _load_ConfigCache()).ConfigCache([CONFIG_FILE_NAME, CONFIG_FILE_NAME_2]);

      expect((await cache.getConfigDir(rootFolder))).toBe(rootFolder);
      expect((await cache.getConfigDir(nestedFolder2))).toBe(nestedFolder2);
    })();
  });

  it('prefers further matches when the search strategy is "furthest"', async () => {
    await (async () => {
      const cache = new (_ConfigCache || _load_ConfigCache()).ConfigCache([CONFIG_FILE_NAME, CONFIG_FILE_NAME_2], 'furthest');

      expect((await cache.getConfigDir(rootFolder))).toBe(rootFolder);
      expect((await cache.getConfigDir(nestedFolder))).toBe(rootFolder);
      expect((await cache.getConfigDir(nestedFolder2))).toBe(rootFolder);
    })();
  });

  it('prefers priority matches when the search strategy is "priority"', async () => {
    await (async () => {
      const cache = new (_ConfigCache || _load_ConfigCache()).ConfigCache([CONFIG_FILE_NAME, CONFIG_FILE_NAME_2], 'priority');

      expect((await cache.getConfigDir(rootFolder))).toBe(rootFolder);
      expect((await cache.getConfigDir(nestedFolder2))).toBe(rootFolder);
    })();
  });

  it('matches first path segment when the search strategy is "pathMatch"', async () => {
    const cache = new (_ConfigCache || _load_ConfigCache()).ConfigCache(['ConfigCache/testFolder', 'ConfigCache'], 'pathMatch');

    // matches both patterns, tie-breaks with first one
    expect((await cache.getConfigDir(nestedFolder))).toBe(nestedFolder);
    // matches second pattern
    expect((await cache.getConfigDir(nestedFolder2))).toBe(rootFolder);
  });
});