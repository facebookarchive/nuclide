'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DiagnosticsExamples = undefined;

var _atom = require('atom');

var _react = _interopRequireDefault(require('react'));

var _Block;

function _load_Block() {
  return _Block = require('./Block');
}

var _DiagnosticsMessage;

function _load_DiagnosticsMessage() {
  return _DiagnosticsMessage = require('./DiagnosticsMessage');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const GOTOLOCATION = (path, line) => {
  atom.notifications.addInfo(`Let's pretend I opened "${path}" at line ${line}.`);
}; /**
    * Copyright (c) 2015-present, Facebook, Inc.
    * All rights reserved.
    *
    * This source code is licensed under the license found in the LICENSE file in
    * the root directory of this source tree.
    *
    * 
    */

const FIXER = () => {
  atom.notifications.addInfo('TADA! Fixed.');
};

const messageWarning = {
  scope: 'file',
  providerName: 'CoolLinter',
  type: 'Warning',
  filePath: 'path/to/some/file.js',
  text: 'A word of warning: Something might be broken here.'
};

const messageError = {
  scope: 'file',
  providerName: 'CoolLinter',
  type: 'Error',
  filePath: 'path/to/some/file.js',
  text: 'Error! Something is definitely broken here.'
};

const messageFixable = {
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

const messageWithTrace = {
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

const DiagnosticMessageWarningExample = () => _react.default.createElement(
  'div',
  null,
  _react.default.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.default.createElement((_DiagnosticsMessage || _load_DiagnosticsMessage()).DiagnosticsMessage, {
      message: messageWarning,
      goToLocation: GOTOLOCATION,
      fixer: FIXER
    })
  )
);

const DiagnosticMessageErrorExample = () => _react.default.createElement(
  'div',
  null,
  _react.default.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.default.createElement((_DiagnosticsMessage || _load_DiagnosticsMessage()).DiagnosticsMessage, {
      message: messageError,
      goToLocation: GOTOLOCATION,
      fixer: FIXER
    })
  )
);

const DiagnosticMessageFixableExample = () => _react.default.createElement(
  'div',
  null,
  _react.default.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.default.createElement((_DiagnosticsMessage || _load_DiagnosticsMessage()).DiagnosticsMessage, {
      message: messageFixable,
      goToLocation: GOTOLOCATION,
      fixer: FIXER
    })
  )
);

const DiagnosticMessageTraceExample = () => _react.default.createElement(
  'div',
  null,
  _react.default.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.default.createElement((_DiagnosticsMessage || _load_DiagnosticsMessage()).DiagnosticsMessage, {
      message: messageWithTrace,
      goToLocation: GOTOLOCATION,
      fixer: FIXER
    })
  )
);

const DiagnosticsExamples = exports.DiagnosticsExamples = {
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