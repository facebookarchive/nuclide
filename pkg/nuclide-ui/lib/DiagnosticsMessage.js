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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _Button2;

function _Button() {
  return _Button2 = require('./Button');
}

var _DiagnosticsMessageText2;

function _DiagnosticsMessageText() {
  return _DiagnosticsMessageText2 = require('./DiagnosticsMessageText');
}

var _DiagnosticsTraceItem2;

function _DiagnosticsTraceItem() {
  return _DiagnosticsTraceItem2 = require('./DiagnosticsTraceItem');
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

function plainTextForItem(item) {
  var mainComponent = undefined;
  if (item.html != null) {
    // Quick and dirty way to get an approximation for the plain text from HTML.
    // This will work in simple cases, anyway.
    mainComponent = item.html.replace('<br/>', '\n').replace(/<[^>]*>/g, '');
  } else {
    (0, (_assert2 || _assert()).default)(item.text != null);
    mainComponent = item.text;
  }

  var pathComponent = undefined;
  if (item.filePath == null) {
    pathComponent = '';
  } else {
    var lineComponent = item.range != null ? ':' + (item.range.start.row + 1) : '';
    pathComponent = ': ' + (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.getPath(item.filePath) + lineComponent;
  }
  return mainComponent + pathComponent;
}

function plainTextForDiagnostic(message) {
  var trace = message.trace != null ? message.trace : [];
  return [message].concat(_toConsumableArray(trace)).map(plainTextForItem).join('\n');
}

/**
 * Visually groups Buttons passed in as children.
 */
var DiagnosticsMessage = function DiagnosticsMessage(props) {
  var message = props.message;
  var goToLocation = props.goToLocation;
  var fixer = props.fixer;

  var providerClassName = message.type === 'Error' ? 'highlight-error' : 'highlight-warning';
  var copy = function copy() {
    var text = plainTextForDiagnostic(message);
    atom.clipboard.write(text);
  };
  var fixButton = null;
  if (message.fix != null) {
    var applyFix = function applyFix() {
      fixer(message);
    };
    fixButton = (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Button2 || _Button()).Button,
      { size: 'EXTRA_SMALL', onClick: applyFix },
      'Fix'
    );
  }
  var header = (_reactForAtom2 || _reactForAtom()).React.createElement(
    'div',
    { className: 'nuclide-diagnostics-gutter-ui-popup-header' },
    fixButton,
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Button2 || _Button()).Button,
      { size: 'EXTRA_SMALL', onClick: copy },
      'Copy'
    ),
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      'span',
      { className: 'pull-right ' + providerClassName },
      message.providerName
    )
  );
  var traceElements = message.trace ? message.trace.map(function (traceItem, i) {
    return (_reactForAtom2 || _reactForAtom()).React.createElement((_DiagnosticsTraceItem2 || _DiagnosticsTraceItem()).DiagnosticsTraceItem, {
      key: i,
      trace: traceItem,
      goToLocation: goToLocation
    });
  }) : null;
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'div',
    null,
    header,
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      'div',
      null,
      (_reactForAtom2 || _reactForAtom()).React.createElement((_DiagnosticsMessageText2 || _DiagnosticsMessageText()).DiagnosticsMessageText, { message: message })
    ),
    traceElements
  );
};
exports.DiagnosticsMessage = DiagnosticsMessage;