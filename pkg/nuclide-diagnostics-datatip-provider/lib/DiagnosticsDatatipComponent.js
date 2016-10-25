'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DiagnosticsDatatipComponent = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.makeDiagnosticsDatatipComponent = makeDiagnosticsDatatipComponent;

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('../../commons-atom/go-to-location');
}

var _reactForAtom = require('react-for-atom');

var _DiagnosticsMessage;

function _load_DiagnosticsMessage() {
  return _DiagnosticsMessage = require('../../nuclide-ui/DiagnosticsMessage');
}

const NOOP = () => {};

let DiagnosticsDatatipComponent = exports.DiagnosticsDatatipComponent = class DiagnosticsDatatipComponent extends _reactForAtom.React.Component {

  render() {
    // Remove the `fix` property to prevent the fix button from showing up (for now).
    const message = _extends({}, this.props.message, { fix: undefined });
    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-diagnostics-datatip' },
      _reactForAtom.React.createElement((_DiagnosticsMessage || _load_DiagnosticsMessage()).DiagnosticsMessage, {
        message: message,
        goToLocation: (_goToLocation || _load_goToLocation()).goToLocation,
        fixer: NOOP
      })
    );
  }
};
function makeDiagnosticsDatatipComponent(message) {
  return () => _reactForAtom.React.createElement(DiagnosticsDatatipComponent, { message: message });
}