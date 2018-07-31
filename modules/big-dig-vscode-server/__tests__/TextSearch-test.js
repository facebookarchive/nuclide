"use strict";

var _child_process = _interopRequireDefault(require("child_process"));

function _TextSearch() {
  const data = require("../TextSearch");

  _TextSearch = function () {
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

/**
 * Attempts to determine if search (via ripgrep) is available on the system.
 * @returns true if running `rg -V` succeeds and the output contains the word
 * 'ripgrep' (e.g. "ripgrep 0.7.1").
 */
function ripgrepExistsSync() {
  try {
    const output = _child_process.default.execSync('rg -V', {
      timeout: 1500,
      maxBuffer: 1000,
      encoding: 'utf8'
    });

    return output.search(/ripgrep/) >= 0;
  } catch (error) {
    return false;
  }
}

const ripgrepExists = ripgrepExistsSync();

if (!ripgrepExists) {
  // eslint-disable-next-line no-console
  console.warn('TextSearch is not available (cannot find ripgrep)');
}

(ripgrepExists ? describe : describe.skip)('TextSearch', () => {
  let tmp;
  const defaultOptions = {
    isRegExp: false,
    isCaseSensitive: false,
    isWordMatch: false,
    includes: [],
    excludes: []
  };
  beforeEach(async () => {
    tmp = await _fsPromise().default.tempdir();
  });
  afterEach(async () => {
    await _fsPromise().default.rimraf(tmp);
  });

  function createFileHierarchy(filesystem) {
    return common().createFileHierarchy(filesystem, tmp);
  }

  function doTextSearch(query, basePath, options = {}) {
    return (0, _TextSearch().search)(query, basePath.toString(), Object.assign({}, defaultOptions, options)).toArray().toPromise();
  }

  function makeMatch(path, line, column, pre, text, post) {
    return {
      path,
      line,
      column,
      pre,
      text,
      post
    };
  }

  function makeLineTooLong(path, line) {
    return {
      path,
      line,
      error: 'line-too-long'
    };
  }

  it('empty', async () => {
    const root = await createFileHierarchy({
      subdir1: {
        foo: 'Some text'
      }
    });
    const search = await doTextSearch('aaa', root.subdir1);
    expect(search).toEqual([]);
  });
  it('basic', async () => {
    const root = await createFileHierarchy({
      subdir1: {
        foo: 'Some\n -> textual\n.'
      }
    });
    const search = await doTextSearch('text', root.subdir1);
    expect(search).toEqual([makeMatch(root.subdir1.foo, 1, 4, ' -> ', 'text', 'ual')]);
  });
  it('regexp', async () => {
    const root = await createFileHierarchy({
      subdir1: {
        foo: 'Some\n -> textual reality\n.'
      }
    });
    const search = await doTextSearch(/text.*?\b/.source, root.subdir1, {
      isRegExp: true
    });
    expect(search).toEqual([makeMatch(root.subdir1.foo, 1, 4, ' -> ', 'textual', ' reality')]);
  });
  it('case sensitive', async () => {
    const root = await createFileHierarchy({
      subdir1: {
        foo: 'Some\n -> text\n. Text.\n'
      }
    });
    const search = await doTextSearch('text', root.subdir1, {
      isCaseSensitive: true
    });
    expect(search).toEqual([makeMatch(root.subdir1.foo, 1, 4, ' -> ', 'text', '')]);
  });
  it('is word match', async () => {
    const root = await createFileHierarchy({
      subdir1: {
        foo: 'Some\n -> texting\n. Text.\n'
      }
    });
    const search = await doTextSearch('text', root.subdir1, {
      isWordMatch: true
    });
    expect(search).toEqual([makeMatch(root.subdir1.foo, 2, 2, '. ', 'Text', '.')]);
  });
  it('two matches on a line', async () => {
    const root = await createFileHierarchy({
      subdir1: {
        foo: 'Some\n -> text1 Texting\n. Txt.\n'
      }
    });
    const search = await doTextSearch('text', root.subdir1);
    expect(search).toEqual([makeMatch(root.subdir1.foo, 1, 4, ' -> ', 'text', '1 Texting'), makeMatch(root.subdir1.foo, 1, 10, ' -> text1 ', 'Text', 'ing')]);
  });
  it('two line matches', async () => {
    const root = await createFileHierarchy({
      subdir1: {
        foo: 'Some\n -> text\n. Text.\n'
      }
    });
    const search = await doTextSearch('text', root.subdir1);
    expect(search).toEqual([makeMatch(root.subdir1.foo, 1, 4, ' -> ', 'text', ''), makeMatch(root.subdir1.foo, 2, 2, '. ', 'Text', '.')]);
  });
  it('two file matches', async () => {
    const root = await createFileHierarchy({
      subdir0: {
        subdir1: {
          foo1: 'Some\n -> text\n.'
        },
        subdir2: {
          foo2: 'Other Text.'
        }
      }
    });
    const search = await doTextSearch('text', root.subdir0);
    expect(search.sort((x, y) => x.path.localeCompare(y.path))).toEqual([makeMatch(root.subdir0.subdir1.foo1, 1, 4, ' -> ', 'text', ''), makeMatch(root.subdir0.subdir2.foo2, 0, 6, 'Other ', 'Text', '.')]);
  });
  it('includes', async () => {
    const root = await createFileHierarchy({
      subdir1: {
        subdir2: {
          subdir3: {
            foo: 'Some\n -> texting\n.\n',
            food: 'Some\n -> texting\n.\n',
            dee: 'Some\n -> texting\n.\n',
            de: 'Some\n -> texting\n.\n'
          }
        },
        subdir4: {
          bee: 'Some\n -> texting\n.\n',
          bar: 'Some\n -> texting\n.\n'
        }
      }
    });
    const search = await doTextSearch('text', root, {
      includes: ['subdir2/**/foo*', '*ee']
    });

    const fileMatch = file => makeMatch(file, 1, 4, ' -> ', 'text', 'ing');

    expect(search.sort((x, y) => x.path.localeCompare(y.path))).toEqual([fileMatch(root.subdir1.subdir2.subdir3.dee), fileMatch(root.subdir1.subdir2.subdir3.foo), fileMatch(root.subdir1.subdir2.subdir3.food), fileMatch(root.subdir1.subdir4.bee)]);
  });
  it('excludes', async () => {
    const root = await createFileHierarchy({
      subdir1: {
        subdir2: {
          subdir3: {
            foo: 'Some\n -> texting\n.\n',
            dee: 'Some\n -> texting\n.\n'
          }
        },
        subdir4: {
          bar: 'Some\n -> texting\n.\n'
        }
      }
    });
    const search = await doTextSearch('text', root, {
      excludes: ['subdir2/**/foo']
    });
    expect(search.sort((x, y) => x.path.localeCompare(y.path))).toEqual([makeMatch(root.subdir1.subdir2.subdir3.dee, 1, 4, ' -> ', 'text', 'ing'), makeMatch(root.subdir1.subdir4.bar, 1, 4, ' -> ', 'text', 'ing')]);
  });
  it('line too long', async () => {
    const root = await createFileHierarchy({
      subdir1: {
        foo: ' '.repeat(500000) + 'text' + ' '.repeat(500000)
      }
    });
    const search = await doTextSearch('text', root.subdir1);
    expect(search).toEqual([makeLineTooLong(root.subdir1.foo, 0)]);
  });
});