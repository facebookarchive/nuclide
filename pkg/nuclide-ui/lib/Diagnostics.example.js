Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _Block = require('./Block');

var _DiagnosticsMessage = require('./DiagnosticsMessage');

var GOTOLOCATION = function GOTOLOCATION(path, line) {
  atom.notifications.addInfo('Let\'s pretend I opened "' + path + '" at line ' + line + '.');
};
var FIXER = function FIXER() {
  atom.notifications.addInfo('TADA! Fixed.');
};

var messageWarning = {
  scope: 'file',
  providerName: 'CoolLinter',
  type: 'Warning',
  filePath: 'path/to/some/file.js',
  text: 'A word of warning: Something might be broken here.'
};

var messageError = {
  scope: 'file',
  providerName: 'CoolLinter',
  type: 'Error',
  filePath: 'path/to/some/file.js',
  text: 'Error! Something is definitely broken here.'
};

var messageFixable = {
  scope: 'file',
  providerName: 'CoolLinter',
  type: 'Warning',
  filePath: 'path/to/some/file.js',
  text: 'Something looks broken here, but it can be fixed automatically via the "fix" button.',
  fix: {
    oldRange: new _atom.Range([1, 1], [1, 6]),
    newText: 'fixed'
  }
};

var messageWithTrace = {
  scope: 'file',
  providerName: 'CoolLinter',
  type: 'Warning',
  filePath: 'path/to/some/file.js',
  text: 'Something is broken here.',
  trace: [{
    type: 'Trace',
    text: 'A diagnostics message can contain multiple trace lines',
    filePath: 'path/to/random/file.js',
    range: new _atom.Range([1, 1], [1, 6])
  }, {
    type: 'Trace',
    text: 'Trace lines can have paths and ranges, too.',
    filePath: 'path/to/another/file.js',
    range: new _atom.Range([2, 1], [2, 6])
  }, {
    type: 'Trace',
    text: 'Paths and ranges are optional.'
  }]
};

var DiagnosticMessageWarningExample = function DiagnosticMessageWarningExample() {
  return _reactForAtom.React.createElement(
    'div',
    null,
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_DiagnosticsMessage.DiagnosticsMessage, {
        message: messageWarning,
        goToLocation: GOTOLOCATION,
        fixer: FIXER
      })
    )
  );
};

var DiagnosticMessageErrorExample = function DiagnosticMessageErrorExample() {
  return _reactForAtom.React.createElement(
    'div',
    null,
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_DiagnosticsMessage.DiagnosticsMessage, {
        message: messageError,
        goToLocation: GOTOLOCATION,
        fixer: FIXER
      })
    )
  );
};

var DiagnosticMessageFixableExample = function DiagnosticMessageFixableExample() {
  return _reactForAtom.React.createElement(
    'div',
    null,
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_DiagnosticsMessage.DiagnosticsMessage, {
        message: messageFixable,
        goToLocation: GOTOLOCATION,
        fixer: FIXER
      })
    )
  );
};

var DiagnosticMessageTraceExample = function DiagnosticMessageTraceExample() {
  return _reactForAtom.React.createElement(
    'div',
    null,
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_DiagnosticsMessage.DiagnosticsMessage, {
        message: messageWithTrace,
        goToLocation: GOTOLOCATION,
        fixer: FIXER
      })
    )
  );
};

var DiagnosticsExamples = {
  sectionName: 'DiagnosticsMessage',
  description: 'Display warnings & error messages',
  examples: [{
    title: 'Warning',
    component: DiagnosticMessageWarningExample
  }, {
    title: 'Error',
    component: DiagnosticMessageErrorExample
  }, {
    title: 'Fixable warning:',
    component: DiagnosticMessageFixableExample
  }, {
    title: 'Warning with traces',
    component: DiagnosticMessageTraceExample
  }]
};
exports.DiagnosticsExamples = DiagnosticsExamples;