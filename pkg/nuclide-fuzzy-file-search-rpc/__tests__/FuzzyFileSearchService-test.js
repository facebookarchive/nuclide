'use strict';

var _FileSearchProcess;

function _load_FileSearchProcess() {
  return _FileSearchProcess = _interopRequireWildcard(require('../lib/FileSearchProcess'));
}

var _;

function _load_() {
  return _ = require('..');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// $FlowIgnore #yolo
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

(_FileSearchProcess || _load_FileSearchProcess()).fileSearchForDirectory = () => {
  return Promise.resolve({
    query() {
      return Promise.resolve([]);
    },
    dispose() {}
  });
};

describe('FuzzyFileSearchService.isFuzzySearchAvailableFor', () => {
  it('can search existing directories', async () => {
    await (async () => {
      expect((await (0, (_ || _load_()).isFuzzySearchAvailableFor)(__dirname))).toBe(true);
    })();
  });

  it('cant search non-existing directories', async () => {
    await (async () => {
      // eslint-disable-next-line no-path-concat
      const nonExistentPath = __dirname + 'xxx';
      expect((await (0, (_ || _load_()).isFuzzySearchAvailableFor)(nonExistentPath))).toBe(false);
    })();
  });

  it("doesn't get confused by atom:// paths", async () => {
    await (async () => {
      expect((await (0, (_ || _load_()).isFuzzySearchAvailableFor)('atom://about'))).toBe(false);
    })();
  });
});

describe('FuzzyFileSearchService.queryFuzzyFile', () => {
  it('finds a file in a directory that exists', async () => {
    await (async () => {
      // This test can't actually perform a search because path-search
      // uses watchman and we don't have a good way to mock dependencies.
      const fileSearchResults = await (0, (_ || _load_()).queryFuzzyFile)({
        rootDirectory: __dirname,
        queryString: 'anything',
        ignoredNames: [],
        preferCustomSearch: false
      });
      expect(fileSearchResults).toEqual([]);
    })();
  });
});