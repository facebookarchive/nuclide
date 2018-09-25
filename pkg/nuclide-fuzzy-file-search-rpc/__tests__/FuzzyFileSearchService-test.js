"use strict";

function pathSearch() {
  const data = _interopRequireWildcard(require("../lib/FileSearchProcess"));

  pathSearch = function () {
    return data;
  };

  return data;
}

function _() {
  const data = require("..");

  _ = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 * @emails oncall+nuclide
 */
// $FlowIgnore #yolo
pathSearch().fileSearchForDirectory = () => {
  return Promise.resolve({
    query() {
      return Promise.resolve([]);
    },

    dispose() {}

  });
};

describe('FuzzyFileSearchService.isFuzzySearchAvailableFor', () => {
  it('can search existing directories', async () => {
    expect((await (0, _().isFuzzySearchAvailableFor)(__dirname))).toBe(true);
  });
  it('cant search non-existing directories', async () => {
    // eslint-disable-next-line no-path-concat
    const nonExistentPath = __dirname + 'xxx';
    expect((await (0, _().isFuzzySearchAvailableFor)(nonExistentPath))).toBe(false);
  });
  it("doesn't get confused by atom:// paths", async () => {
    expect((await (0, _().isFuzzySearchAvailableFor)('atom://about'))).toBe(false);
  });
});
describe('FuzzyFileSearchService.queryFuzzyFile', () => {
  it('finds a file in a directory that exists', async () => {
    // This test can't actually perform a search because path-search
    // uses watchman and we don't have a good way to mock dependencies.
    const fileSearchResults = await (0, _().queryFuzzyFile)({
      rootDirectory: __dirname,
      queryString: 'anything',
      ignoredNames: [],
      preferCustomSearch: false,
      context: null
    });
    expect(fileSearchResults).toEqual([]);
  });
});