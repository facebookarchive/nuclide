'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DiagnosticsMessageNoHeader = exports.DiagnosticsMessage = undefined;

var _react = _interopRequireDefault(require('react'));

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('nuclide-commons-ui/ButtonGroup');
}

var _DiagnosticsMessageText;

function _load_DiagnosticsMessageText() {
  return _DiagnosticsMessageText = require('./DiagnosticsMessageText');
}

var _DiagnosticsTraceItem;

function _load_DiagnosticsTraceItem() {
  return _DiagnosticsTraceItem = require('./DiagnosticsTraceItem');
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

const PROVIDER_CLASS_NAME = {
  Error: 'highlight-error',
  Warning: 'highlight-warning',
  Info: 'highlight-info'
};

function diagnosticHeader(props) {
  const { message, fixer } = props;
  const providerClassName = PROVIDER_CLASS_NAME[message.type];
  let fixButton = null;
  if (message.fix != null) {
    const applyFix = () => {
      fixer(message);
    };
    const speculative = message.fix.speculative === true;
    const buttonType = speculative ? undefined : (_Button || _load_Button()).ButtonTypes.SUCCESS;
    fixButton = _react.default.createElement(
      (_Button || _load_Button()).Button,
      { buttonType: buttonType, size: 'EXTRA_SMALL', onClick: applyFix },
      message.fix.title || 'Fix'
    );
  }
  return _react.default.createElement(
    'div',
    { className: 'nuclide-diagnostics-gutter-ui-popup-header' },
    _react.default.createElement(
      (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
      null,
      fixButton
    ),
    _react.default.createElement(
      'span',
      { className: providerClassName },
      message.providerName
    )
  );
}

function traceElements(props) {
  const { message, goToLocation } = props;
  return message.trace ? message.trace.map((traceItem, i) => _react.default.createElement((_DiagnosticsTraceItem || _load_DiagnosticsTraceItem()).DiagnosticsTraceItem, {
    key: i,
    trace: traceItem,
    goToLocation: goToLocation
  })) : null;
}

/**
 * Visually groups Buttons passed in as children.
 */
const DiagnosticsMessage = exports.DiagnosticsMessage = props => {
  return _react.default.createElement(
    'div',
    null,
    diagnosticHeader(props),
    _react.default.createElement(
      'div',
      { className: 'nuclide-diagnostics-gutter-ui-popup-message' },
      _react.default.createElement((_DiagnosticsMessageText || _load_DiagnosticsMessageText()).DiagnosticsMessageText, { message: props.message })
    ),
    traceElements(props)
  );
};

/**
 * Visually groups Buttons passed in as children.
 */
const DiagnosticsMessageNoHeader = exports.DiagnosticsMessageNoHeader = props => {
  return _react.default.createElement(
    'div',
    null,
    _react.default.createElement((_DiagnosticsMessageText || _load_DiagnosticsMessageText()).DiagnosticsMessageText, { message: props.message }),
    traceElements(props)
  );
};