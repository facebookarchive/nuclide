'use strict';

var _atom = require('atom');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _diagnosticRange;

function _load_diagnosticRange() {
  return _diagnosticRange = require('../lib/diagnostic-range');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Diagnostic range', () => {
  const fixturePath = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../__mocks__/fixtures', 'bad_syntax_land.py');
  let editor = null;

  beforeEach(async () => {
    editor = await atom.workspace.open(fixturePath);
  });

  function checkRange(diagnostic, expectedRange) {
    if (!editor) {
      throw new Error('Invariant violation: "editor"');
    }

    const range = (0, (_diagnosticRange || _load_diagnosticRange()).getDiagnosticRange)(diagnostic, editor);
    expect(range).toEqual(expectedRange);
  }

  function makeDiagnostic(code, message, line, column) {
    return {
      file: fixturePath,
      type: 'Warning',
      code,
      message,
      line,
      column
    };
  }

  it('Underlines leading whitespace for indentation messages', () => {
    checkRange(makeDiagnostic('E116', '', 24, 0), new _atom.Range([24, 0], [24, 8]));
    checkRange(makeDiagnostic('E901', 'IndentationError: blahblah', 25, 0), new _atom.Range([25, 0], [25, 8]));
  });

  it('Underlines the entire line for line length message', () => {
    checkRange(makeDiagnostic('E501', '', 22, 0), new _atom.Range([22, 0], [22, 117]));
  });

  it('Underlines the whitespace when there is extra whitespace', () => {
    checkRange(makeDiagnostic('E202', '', 20, 10), new _atom.Range([20, 10], [20, 11]));
    checkRange(makeDiagnostic('E222', '', 31, 4), new _atom.Range([31, 3], [31, 5]));
  });

  it('Underlines the whitespace when there is trailing whitespace', () => {
    checkRange(makeDiagnostic('W291', '', 37, 5), new _atom.Range([37, 5], [37, 9]));
  });

  it('Underlines the comment for comment spacing issues', () => {
    checkRange(makeDiagnostic('E261', '', 27, 12), new _atom.Range([27, 12], [27, 85]));
    checkRange(makeDiagnostic('E262', '', 28, 16), new _atom.Range([28, 16], [28, 58]));
  });

  it('Underlines the word for possibly undefined references', () => {
    checkRange(makeDiagnostic('F405', '', 40, 4), new _atom.Range([40, 4], [40, 14]));
  });

  it('Underlines the symbol name for undefined references', () => {
    checkRange(makeDiagnostic('F821', '', 40, 4), new _atom.Range([40, 4], [40, 14]));
  });

  it('Underlines the entire non-empty line contents for unused assignments', () => {
    checkRange(makeDiagnostic('F841', '', 42, 0), new _atom.Range([42, 0], [42, 9]));
  });

  it('Underlines the entire non-empty line contents for syntax errors', () => {
    checkRange(makeDiagnostic('E901', 'SyntaxError', 45, 4), new _atom.Range([45, 4], [45, 14]));
  });
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     * 
     * @format
     */