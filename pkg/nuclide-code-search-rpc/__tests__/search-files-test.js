'use strict';

var _searchTools;

function _load_searchTools() {
  return _searchTools = require('../lib/searchTools');
}

var _fs = _interopRequireDefault(require('fs'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _which;

function _load_which() {
  return _which = _interopRequireDefault(require('../../../modules/nuclide-commons/which'));
}

var _testHelpers;

function _load_testHelpers() {
  return _testHelpers = require('../../../modules/nuclide-commons/test-helpers');
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
 */

describe('Code search in files', () => {
  let folder;
  beforeEach(async () => {
    await (async () => {
      // Setup the test folder.
      folder = await (0, (_testHelpers || _load_testHelpers()).generateFixture)('grep-rpc', new Map([['file1.js', `var a = 4;
        // console.trace(x);
        console3log(b);
        // var x = a + 2;
        console.log(n); //bad
        console.error("Hello World!");`], ['directory/file2.js', `var a = console;
        // console.log(x);
        console.log();
        // next it is reading a variable
        console.log(a); // good
../file1.js:3:6: // looks like a grep output`], ['file:1:2:3:::-1', '// filename has lots of colons']]));
    })();
  });

  const tools = (_searchTools || _load_searchTools()).POSIX_TOOLS.map(t => (0, (_which || _load_which()).default)(t).then(cmd => cmd != null ? t : null));

  tools.forEach(toolPromise => {
    it('Should find results only in specified files', async () => {
      await (async () => {
        const tool = await toolPromise;
        if (tool == null) {
          return;
        }
        const results1 = await (0, (_searchTools || _load_searchTools()).searchWithTool)(tool, {
          regex: /console/,
          recursive: false,
          files: joinFolder(folder, ['file1.js'])
        }).toArray().toPromise();
        const expected1 = loadExpectedFixture(folder, 'basic-files-1.json');
        sortResults(results1);

        expect(results1).toEqual(expected1);

        const results2 = await (0, (_searchTools || _load_searchTools()).searchWithTool)(tool, {
          regex: /var\b/,
          recursive: false,
          files: joinFolder(folder, ['file1.js', 'directory/file2.js'])
        }).toArray().toPromise();
        const expected2 = loadExpectedFixture(folder, 'basic-files-2.json');
        sortResults(results2);

        expect(results2).toEqual(expected2);
      })();
    });
    it('Works with complicated regexes', async () => {
      await (async () => {
        const tool = await toolPromise;
        if (tool == null) {
          return;
        }
        // Find all call to console.log with a nonempty arguments.
        const results1 = await (0, (_searchTools || _load_searchTools()).searchWithTool)(tool, {
          regex: /console\.log\([^)]+\)/,
          recursive: false,
          files: joinFolder(folder, ['file1.js', 'directory/file2.js'])
        }).toArray().toPromise();
        const expected1 = loadExpectedFixture(folder, 'regex-files-1.json');
        sortResults(results1);

        expect(results1).toEqual(expected1);

        // Match comments with a space following a console.log.
        const results2 = await (0, (_searchTools || _load_searchTools()).searchWithTool)(tool, {
          regex: /console\.log\([^)]+\);\s*\/\/\s+/,
          recursive: false,
          files: joinFolder(folder, ['file1.js', 'directory/file2.js'])
        }).toArray().toPromise();
        const expected2 = loadExpectedFixture(folder, 'regex-files-2.json');
        sortResults(results2);

        expect(results2).toEqual(expected2);

        // Match any console.<method> calls (tests variable matchLength).
        const results3 = await (0, (_searchTools || _load_searchTools()).searchWithTool)(tool, {
          regex: /console\.[^(]+/,
          recursive: false,
          files: joinFolder(folder, ['file1.js', 'directory/file2.js'])
        }).toArray().toPromise();
        const expected3 = loadExpectedFixture(folder, 'regex-files-3.json');
        sortResults(results3);

        expect(results3).toEqual(expected3);
      })();
    });
    it('Respects result limits', async () => {
      await (async () => {
        const tool = await toolPromise;
        if (tool == null) {
          return;
        }
        const results1 = await (0, (_searchTools || _load_searchTools()).searchWithTool)(tool, {
          regex: /console/,
          recursive: false,
          limit: 2,
          files: joinFolder(folder, ['file1.js'])
        }).toArray().toPromise();
        const expected1 = loadExpectedFixture(folder, 'basic-files-1.json').slice(0, 2);
        sortResults(results1);

        expect(results1).toEqual(expected1);
      })();
    });
    it('No results with no files', async () => {
      await (async () => {
        const tool = await toolPromise;
        if (tool == null) {
          return;
        }
        const results = await (0, (_searchTools || _load_searchTools()).searchWithTool)(tool, {
          regex: /console/,
          recursive: false,
          files: []
        }).toArray().toPromise();
        expect(results).toEqual([]);
      })();
    });
    it('Parser does not fail when line contents look like grep result', async () => {
      await (async () => {
        const tool = await toolPromise;
        if (tool === 'ack') {
          return;
        }
        const results = await (0, (_searchTools || _load_searchTools()).searchWithTool)(tool, {
          regex: /looks like a grep output/,
          recursive: false,
          files: joinFolder(folder, ['file1.js', 'directory/file2.js'])
        }).toArray().toPromise();
        const expected = loadExpectedFixture(folder, 'parser-files-1.json');
        sortResults(results);

        expect(results).toEqual(expected);
      })();
    });
    it('Parser does not fail if filename has a colon', async () => {
      await (async () => {
        const tool = await toolPromise;
        if (tool === 'ack') {
          return;
        }
        const results = await (0, (_searchTools || _load_searchTools()).searchWithTool)(tool, {
          regex: /lots of colons/,
          recursive: false,
          files: joinFolder(folder, ['file:1:2:3:::-1', 'file1.js'])
        }).toArray().toPromise();
        const expected = loadExpectedFixture(folder, 'parser-files-2.json');
        sortResults(results);

        expect(results).toEqual(expected);
      })();
    });
    it('Can find context before and after matches', async () => {
      await (async () => {
        const tool = await toolPromise;
        if (tool == null) {
          return;
        }
        const results = await (0, (_searchTools || _load_searchTools()).searchWithTool)(tool, {
          regex: /var x/,
          recursive: false,
          files: joinFolder(folder, ['file1.js']),
          leadingLines: 1,
          trailingLines: 2
        }).toArray().toPromise();
        const expected = loadExpectedFixture(folder, 'context-files-1.json');
        sortResults(results);

        expect(results).toEqual(expected);
      })();
    });
    it('Leading context found for match near first line.', async () => {
      await (async () => {
        const tool = await toolPromise;
        if (tool == null) {
          return;
        }
        const results = await (0, (_searchTools || _load_searchTools()).searchWithTool)(tool, {
          regex: /console\.trace/,
          recursive: false,
          files: joinFolder(folder, ['file1.js']),
          leadingLines: 2,
          trailingLines: 2
        }).toArray().toPromise();
        const expected = loadExpectedFixture(folder, 'context-files-2.json');
        sortResults(results);

        expect(results).toEqual(expected);
      })();
    });
    it('Trailing context found for match near last line.', async () => {
      await (async () => {
        const tool = await toolPromise;
        if (tool == null) {
          return;
        }
        const results = await (0, (_searchTools || _load_searchTools()).searchWithTool)(tool, {
          regex: /console\.log/,
          recursive: false,
          files: joinFolder(folder, ['file1.js']),
          leadingLines: 2,
          trailingLines: 2
        }).toArray().toPromise();
        const expected = loadExpectedFixture(folder, 'context-files-3.json');
        sortResults(results);

        expect(results).toEqual(expected);
      })();
    });
  });
});

// Join list of paths to folder and return new array.
function joinFolder(folder, paths) {
  return paths.map(path => (_nuclideUri || _load_nuclideUri()).default.join(folder, path));
}

// Helper function to sort an array of file results by path then line.
function sortResults(results) {
  results.sort((a, b) => {
    if (a.file < b.file) {
      return -1;
    } else if (a.file > b.file) {
      return 1;
    } else {
      return a.row - b.row;
    }
  });
}

// Helper function to load a result fixture by name and absolutize its paths.
function loadExpectedFixture(folder, fixtureName) {
  const fixture = JSON.parse(_fs.default.readFileSync((_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../__mocks__/fixtures', fixtureName), 'utf8'));
  // Join paths in fixtures to make them absolute.
  for (const result of fixture) {
    result.file = (_nuclideUri || _load_nuclideUri()).default.join(folder, result.file);
  }
  return fixture;
}