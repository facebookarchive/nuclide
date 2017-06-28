'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DiagnosticsDatatipComponent = undefined;
exports.makeDiagnosticsDatatipComponent = makeDiagnosticsDatatipComponent;

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('nuclide-commons-atom/go-to-location');
}

var _react = _interopRequireDefault(require('react'));

var _DiagnosticsMessage;

function _load_DiagnosticsMessage() {
  return _DiagnosticsMessage = require('./DiagnosticsMessage');
}

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
 */

const NOOP = () => {};

class DiagnosticsDatatipComponent extends _react.default.Component {

  render() {
    // Remove the `fix` property to prevent the fix button from showing up (for now).
    const message = Object.assign({}, this.props.message, { fix: undefined });
    return _react.default.createElement(
      'div',
      { className: 'nuclide-diagnostics-datatip' },
      _react.default.createElement((_DiagnosticsMessage || _load_DiagnosticsMessage()).DiagnosticsMessage, {
        message: message,
        goToLocation: (_goToLocation || _load_goToLocation()).goToLocation,
        fixer: NOOP
      })
    );
  }
}

exports.DiagnosticsDatatipComponent = DiagnosticsDatatipComponent;
function makeDiagnosticsDatatipComponent(message) {
  return () => _react.default.createElement(DiagnosticsDatatipComponent, { message: message });
}