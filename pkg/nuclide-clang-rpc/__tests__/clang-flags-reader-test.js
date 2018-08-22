"use strict";

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _testHelpers() {
  const data = require("../../../modules/nuclide-commons/test-helpers");

  _testHelpers = function () {
    return data;
  };

  return data;
}

function _clangFlagsReader() {
  const data = require("../lib/clang-flags-reader");

  _clangFlagsReader = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
jest.setTimeout(40000);

// Generate a compilation database entry with
// given number of files and number of args per file, return the path on disk.
async function generateDbFixture(directory, files, args) {
  const filename = 'compile_commands.json'; // For very large objects, calling JSON.stringify directly will fail.
  // So we manually construct the start and end of the files.

  let dbString = '[';
  const argList = Array.from((0, _collection().range)(0, args)).map(i => `-argNumber${i}`);

  for (let i = 0; i < files; i++) {
    const entry = {
      file: `${directory}/file${i}.cpp`,
      directory,
      arguments: argList
    };
    dbString += JSON.stringify(entry);

    if (i !== files - 1) {
      // Newline not necessary but it helps if we ever have to manually inspect.
      dbString += ',\n';
    }
  }

  dbString += ']';
  const dir = await (0, _testHelpers().generateFixture)('clang_rpc', new Map([[filename, dbString]]));
  return _nuclideUri().default.join(dir, filename);
}

describe('unit tests for clang-flags-reader.js', () => {
  async function expectFallback(files, args) {
    const db = await generateDbFixture('/a/b', files, args);
    const entries = await (0, _clangFlagsReader().readCompilationFlags)(db).toArray().toPromise();
    const fallbackEntries = await (0, _clangFlagsReader().fallbackReadCompilationFlags)(db);
    expect(entries).toEqual(fallbackEntries);
  }

  async function checkLengths(files, args) {
    const db = await generateDbFixture('/a/b', files, args);
    const entries = await (0, _clangFlagsReader().readCompilationFlags)(db).toArray().toPromise();
    expect(entries.length).toEqual(files);

    for (const entry of entries) {
      expect(entry.directory).toEqual('/a/b');
      expect(entry.file.startsWith('/a/b/')).toBeTruthy();
      expect((0, _nullthrows().default)(entry.arguments).length).toEqual(args);
    }
  }

  it('works for a small file', async () => {
    await (async () => expectFallback(3, 3))();
  });
  it('works for very long arguments list', async () => {
    await (async () => expectFallback(2, 40000))();
  });
  it('works for a very large file', async () => {
    // This file is around 250 megabytes (JSON.parse would fail).
    await (async () => checkLengths(3000, 5000))();
  });
  it('fails with embedded braces, but fallback works', async () => {
    await (async () => {
      const db = await generateDbFixture('/a/{b}', 3, 3);
      const fallbackEntries = await (0, _clangFlagsReader().fallbackReadCompilationFlags)(db);
      let hadError = false;
      await (0, _clangFlagsReader().readCompilationFlags)(db).toPromise().catch(() => hadError = true);
      expect(hadError).toBeTruthy(); // ...but the fallback should still work.

      expect(fallbackEntries.length).toEqual(3);
    })();
  });
});