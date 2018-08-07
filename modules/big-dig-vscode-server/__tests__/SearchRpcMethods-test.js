"use strict";

function _SearchRpcMethods() {
  const data = require("../SearchRpcMethods");

  _SearchRpcMethods = function () {
    return data;
  };

  return data;
}

function _FileSearcher() {
  const data = require("../FileSearcher");

  _FileSearcher = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("../../nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("../../nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _TextSearchHarness() {
  const data = require("../__mocks__/TextSearchHarness");

  _TextSearchHarness = function () {
    return data;
  };

  return data;
}

function common() {
  const data = _interopRequireWildcard(require("../__mocks__/common"));

  common = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 * @emails oncall+nuclide
 */
describe('SearchRpcMethods', () => {
  describe('searchForFiles', () => {
    let rpc;
    let tmp;

    function createFileHierarchy(filesystem) {
      return common().createFileHierarchy(filesystem, tmp);
    }

    beforeEach(async () => {
      tmp = await _fsPromise().default.tempdir();
      const fileSearcher = await (0, _FileSearcher().createFileSearcher)();
      rpc = new (_SearchRpcMethods().SearchRpcMethods)({
        forFiles: fileSearcher.search.bind(fileSearcher),
        forText: (...args) => {
          throw new Error('forText should not be called');
        }
      });
    });
    afterEach(async () => {
      rpc.dispose();
      await _fsPromise().default.rimraf(tmp);
    });

    function makeResults(...paths) {
      return {
        results: paths.map(String)
      };
    }

    it('empty', async () => {
      const root = await createFileHierarchy({
        subdir1: {
          foo: 'Some text'
        }
      }); // TODO(T27743715): this should not also return the root.

      const parent = await rpc._doFileSearch({
        directory: root.subdir1.toString(),
        query: 'aaa'
      });
      expect(parent).toEqual(makeResults(root.subdir1));
    });
    it('basic', async () => {
      const root = await createFileHierarchy({
        subdir1: {
          foo: 'Some text'
        }
      });
      const parent = await rpc._doFileSearch({
        directory: root.subdir1.toString(),
        query: 'foo'
      });
      expect(parent).toEqual(makeResults(root.subdir1.foo, root.subdir1));
    });
    it('dispersed text', async () => {
      const root = await createFileHierarchy({
        subdir1: {
          afile: 'Some text'
        }
      });
      const parent = await rpc._doFileSearch({
        directory: root.subdir1.toString(),
        query: 'aile' // Subset of chars from `afile`

      }); // TODO(T27743667): dispered text ('aile') should *actually* match.

      expect(parent).toEqual(makeResults(root.subdir1));
    });
  });
  describe('searchForText', () => {
    let harness;
    beforeEach(() => {
      harness = new (_TextSearchHarness().TextSearchHarness)();
    });
    afterEach(() => {
      harness.dispose();
    });
    it('get search provider', async () => {
      expect(harness.rpc.getSearchProvider()).toEqual(harness.searcher);
    });
    it('param passing; empty results', async () => {
      harness.start('aaa', [{
        path: 'a/b/c/dee',
        includes: ['111', '222'],
        excludes: ['zzz']
      }, {
        path: 'abc',
        includes: ['333', '444'],
        excludes: ['zzz']
      }]);
      harness.completeMatches();
      expect(harness.results()).resolves.toEqual([]);
      expect(harness.forText).toHaveBeenCalledTimes(2);
      expect(harness.forText).toBeCalledWith('aaa', 'a/b/c/dee', Object.assign({}, _TextSearchHarness().TextSearchHarness.defaultOptions, {
        includes: ['111', '222'],
        excludes: ['zzz']
      }));
      expect(harness.forText).toBeCalledWith('aaa', 'abc', Object.assign({}, _TextSearchHarness().TextSearchHarness.defaultOptions, {
        includes: ['333', '444'],
        excludes: ['zzz']
      }));
    });
    it('isRegExp', async () => {
      harness.start('aaa', ['abc'], {
        isRegExp: !_TextSearchHarness().TextSearchHarness.defaultOptions.isRegExp
      });
      expect(harness.forText).toHaveBeenCalledTimes(1);
      expect(harness.forText.mock.calls[0][2]).toHaveProperty('isRegExp', !_TextSearchHarness().TextSearchHarness.defaultOptions.isRegExp);
      harness.completeMatches();
      expect(harness.results()).resolves.toEqual([]);
    });
    it('isCaseSensitive', async () => {
      harness.start('aaa', ['abc'], {
        isCaseSensitive: !_TextSearchHarness().TextSearchHarness.defaultOptions.isCaseSensitive
      });
      expect(harness.forText.mock.calls[0][2]).toHaveProperty('isCaseSensitive', !_TextSearchHarness().TextSearchHarness.defaultOptions.isCaseSensitive);
      harness.completeMatches();
      expect(harness.results()).resolves.toEqual([]);
    });
    it('isWordMatch', async () => {
      harness.start('aaa', ['abc'], {
        isWordMatch: !_TextSearchHarness().TextSearchHarness.defaultOptions.isWordMatch
      });
      expect(harness.forText.mock.calls[0][2]).toHaveProperty('isWordMatch', !_TextSearchHarness().TextSearchHarness.defaultOptions.isWordMatch);
      harness.completeMatches();
      expect(harness.results()).resolves.toEqual([]);
    });
    it('base path includes & excludes', async () => {
      harness.start('aaa', [{
        path: 'abc',
        includes: ['a', 'b'],
        excludes: ['c', 'd']
      }, 'def']);
      expect(harness.forText).toBeCalledWith('aaa', 'abc', Object.assign({}, _TextSearchHarness().TextSearchHarness.defaultOptions, {
        includes: ['a', 'b'],
        excludes: ['c', 'd']
      }));
      expect(harness.forText).toBeCalledWith('aaa', 'def', Object.assign({}, _TextSearchHarness().TextSearchHarness.defaultOptions, {
        includes: [],
        excludes: []
      }));
      harness.completeMatches();
      expect(harness.results()).resolves.toEqual([]);
    });
    it('search results', async () => {
      harness.start('aaa', ['a/b/c/dee', 'abc']);
      const expectedResult1 = {
        path: 'a/b/c/dee',
        range: {
          start: {
            line: 10,
            column: 13
          },
          end: {
            line: 10,
            column: 17
          }
        },
        preview: {
          leading: 'pre',
          matching: 'text',
          trailing: 'post'
        }
      };
      const expectedResult2 = {
        path: 'def',
        range: {
          start: {
            line: 0,
            column: 0
          },
          end: {
            line: 0,
            column: 4
          }
        },
        preview: {
          leading: '',
          matching: 'text',
          trailing: ''
        }
      };
      expect(harness.currentResults()).toEqual([]);
      harness.nextMatch(0, {
        path: expectedResult1.path,
        line: expectedResult1.range.start.line,
        column: expectedResult1.range.start.column,
        pre: 'pre',
        text: 'text',
        post: 'post'
      });
      await (0, _promise().sleep)(_SearchRpcMethods().RESULT_AGGREGATION_DELAY_MS);
      expect(harness.currentResults()).toEqual([expectedResult1]);
      harness.nextMatch(1, {
        path: expectedResult2.path,
        line: expectedResult2.range.start.line,
        column: expectedResult2.range.start.column,
        pre: '',
        text: 'text',
        post: ''
      });
      await (0, _promise().sleep)(_SearchRpcMethods().RESULT_AGGREGATION_DELAY_MS);
      expect(harness.currentResults()).toEqual([expectedResult1, expectedResult2]);
      harness.completeMatches();
      expect(harness.results()).resolves.toEqual([expectedResult1, expectedResult2]);
    });
    it('line-too-long', async () => {
      harness.start('aaa', ['a/b/c/dee']);
      harness.nextMatch(0, {
        path: 'foo',
        line: 13,
        error: 'line-too-long'
      });
      harness.completeMatches();
      expect(harness.results()).resolves.toEqual([{
        path: 'foo',
        range: {
          start: {
            line: 13,
            column: 0
          },
          end: {
            line: 13,
            column: 0
          }
        },
        preview: {
          leading: '<LINE TOO LONG>',
          matching: '',
          trailing: ''
        }
      }]);
    });
  });
});