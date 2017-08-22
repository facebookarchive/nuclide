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

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('nuclide-commons-ui/ButtonGroup');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const NOOP = () => {};

// Maximum number of CodeActions to show for a given Diagnostic.
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

const MAX_CODE_ACTIONS = 4;

class DiagnosticsDatatipComponent extends _react.default.Component {

  render() {
    // Remove the `fix` property to prevent the fix button from showing up (for now).
    const message = Object.assign({}, this.props.message, { fix: undefined });
    if (this.props.codeActions.size > 0) {
      return _react.default.createElement(
        'div',
        { className: 'nuclide-diagnostics-datatip' },
        codeActionsHeader(message, this.props.codeActions),
        _react.default.createElement((_DiagnosticsMessage || _load_DiagnosticsMessage()).DiagnosticsMessageNoHeader, {
          message: message,
          goToLocation: (_goToLocation || _load_goToLocation()).goToLocation,
          fixer: NOOP
        })
      );
    }
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
function makeDiagnosticsDatatipComponent(message, codeActions) {
  return () => _react.default.createElement(DiagnosticsDatatipComponent, { message: message, codeActions: codeActions });
}

function codeActionsHeader(message, codeActions) {
  return Array.from(codeActions.entries()).splice(0, MAX_CODE_ACTIONS)
  // TODO: (seansegal) T21130259 Display a "more" indicator when there are many CodeActions.
  .map(([title, codeAction], i) => {
    return _react.default.createElement(
      (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
      { key: i },
      _react.default.createElement(
        (_Button || _load_Button()).Button,
        {
          className: 'nuclide-code-action-button',
          size: 'EXTRA_SMALL',
          onClick: () => {
            // TODO: (seansegal) T21130332 Display CodeAction status indicators
            codeAction.apply().catch(handleCodeActionFailure);
          } },
        _react.default.createElement(
          'span',
          { className: 'inline-block highlight' },
          title
        )
      )
    );
  });
}

function handleCodeActionFailure(error) {
  atom.notifications.addWarning('Unfortuantely, the action could not be applied.', {
    description: error ? error.message : '',
    dismissable: true
  });
}