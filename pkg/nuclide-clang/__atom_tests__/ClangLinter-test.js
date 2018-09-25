"use strict";

var _atom = require("atom");

function _ClangLinter() {
  const data = _interopRequireDefault(require("../lib/ClangLinter"));

  _ClangLinter = function () {
    return data;
  };

  return data;
}

function range() {
  const data = _interopRequireWildcard(require("../../../modules/nuclide-commons-atom/range"));

  range = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
describe('ClangDiagnosticsProvider', () => {
  const TEST_PATH = '/path/test.cpp';
  const TEST_PATH2 = '/path/asdf';
  const fakeEditor = {
    getBuffer: () => ({
      isDestroyed: () => false,
      getPath: () => TEST_PATH,
      rangeForRow: row => new _atom.Range([row, 0], [row + 1, 0])
    })
  };
  beforeEach(() => {
    jest.spyOn(range(), 'wordAtPosition').mockImplementation((editor, pos, regex) => {
      return {
        range: new _atom.Range(pos, [pos.row, pos.column + 1])
      };
    });
  });
  describe('processDiagnostics', () => {
    it('should group diagnostics by file', () => {
      const messages = _ClangLinter().default._processDiagnostics({
        diagnostics: [{
          severity: 2,
          location: {
            file: '',
            point: new _atom.Point(-1, -1)
          },
          ranges: null,
          spelling: 'whole file'
        }, {
          severity: 1,
          // severity < 2 is ignored
          location: {
            file: '',
            point: new _atom.Point(0, 0)
          },
          ranges: [],
          spelling: 'ignore me'
        }, {
          severity: 2,
          location: {
            file: TEST_PATH2,
            point: new _atom.Point(0, 0)
          },
          ranges: null,
          // use the entire line
          spelling: 'other file',
          fixits: [{
            range: {
              file: TEST_PATH2,
              // Do not touch fixit ranges.
              range: new _atom.Range([3, 4], [3, 4])
            },
            value: 'fixit'
          }],
          children: [{
            spelling: 'child error',
            location: {
              file: TEST_PATH2,
              point: new _atom.Point(0, 0)
            },
            ranges: []
          }]
        }, {
          severity: 2,
          location: {
            file: TEST_PATH,
            point: new _atom.Point(0, 0)
          },
          // Invalid ranges should use the point as fallback.
          ranges: [{
            file: null,
            range: new _atom.Range([-1, -1], [-1, -1])
          }],
          spelling: 'test error'
        }, {
          severity: 3,
          location: {
            file: TEST_PATH,
            point: new _atom.Point(0, 0)
          },
          ranges: [{
            file: TEST_PATH,
            range: new _atom.Range([1, 0], [1, 2])
          }],
          spelling: 'test error 2'
        }],
        accurateFlags: true
      }, fakeEditor);

      expect(messages).toEqual([{
        type: 'Warning',
        filePath: TEST_PATH,
        text: 'whole file',
        range: new _atom.Range([0, 0], [1, 0]),
        fix: undefined,
        trace: undefined
      }, {
        type: 'Warning',
        filePath: TEST_PATH2,
        text: 'other file',
        range: new _atom.Range([0, 0], [0, 1]),
        trace: [{
          type: 'Trace',
          text: 'child error',
          filePath: TEST_PATH2,
          range: new _atom.Range([0, 0], [0, 1])
        }],
        fix: {
          range: new _atom.Range([3, 4], [3, 4]),
          newText: 'fixit'
        }
      }, {
        type: 'Warning',
        filePath: TEST_PATH,
        text: 'test error',
        range: new _atom.Range([0, 0], [0, 1]),
        fix: undefined,
        trace: undefined
      }, {
        type: 'Error',
        filePath: TEST_PATH,
        text: 'test error 2',
        range: new _atom.Range([1, 0], [1, 2]),
        fix: undefined,
        trace: undefined
      }]);
    });
  });
});