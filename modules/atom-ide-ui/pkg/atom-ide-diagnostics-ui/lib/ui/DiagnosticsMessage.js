'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.DiagnosticsMessageNoHeader = exports.DiagnosticsMessage = undefined;













var _react = _interopRequireWildcard(require('react'));var _Button;
function _load_Button() {return _Button = require('../../../../../nuclide-commons-ui/Button');}var _ButtonGroup;
function _load_ButtonGroup() {return _ButtonGroup = require('../../../../../nuclide-commons-ui/ButtonGroup');}var _DiagnosticsMessageText;
function _load_DiagnosticsMessageText() {return _DiagnosticsMessageText = require('./DiagnosticsMessageText');}var _DiagnosticsTraceItem;
function _load_DiagnosticsTraceItem() {return _DiagnosticsTraceItem = require('./DiagnosticsTraceItem');}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}} /**
                                                                                                                                                                                                                                                                                                                                                                           * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                           * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                           *
                                                                                                                                                                                                                                                                                                                                                                           * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                           * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                           * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                           *
                                                                                                                                                                                                                                                                                                                                                                           *  strict-local
                                                                                                                                                                                                                                                                                                                                                                           * @format
                                                                                                                                                                                                                                                                                                                                                                           */

const PROVIDER_CLASS_NAME = {
  Error: 'highlight-error',
  Warning: 'highlight-warning',
  Info: 'highlight-info',
  Hint: '' };


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
    fixButton =
    _react.createElement((_Button || _load_Button()).Button, { buttonType: buttonType, size: 'EXTRA_SMALL', onClick: applyFix },
      // flowlint-next-line sketchy-null-string:off
      message.fix.title || 'Fix');


  }
  return (
    _react.createElement('div', { className: 'diagnostics-popup-header' },
      _react.createElement((_ButtonGroup || _load_ButtonGroup()).ButtonGroup, null, fixButton),
      _react.createElement('span', { className: providerClassName }, message.providerName)));


}

function traceElements(props) {
  const { message, goToLocation } = props;
  return message.trace && message.trace.length ?
  _react.createElement('div', { className: 'diagnostics-popup-trace' },
    message.trace.map((traceItem, i) =>
    _react.createElement((_DiagnosticsTraceItem || _load_DiagnosticsTraceItem()).DiagnosticsTraceItem, {
      key: i,
      trace: traceItem,
      goToLocation: goToLocation }))) :



  null;
}

const DiagnosticsMessage = exports.DiagnosticsMessage = props => {
  return (
    _react.createElement('div', null,
      diagnosticHeader(props),
      _react.createElement('div', { className: 'diagnostics-popup-message' },
        _react.createElement((_DiagnosticsMessageText || _load_DiagnosticsMessageText()).DiagnosticsMessageText, { message: props.message })),

      traceElements(props),
      props.children));


};

const DiagnosticsMessageNoHeader = exports.DiagnosticsMessageNoHeader = props => {
  return (
    _react.createElement('div', null,
      _react.createElement((_DiagnosticsMessageText || _load_DiagnosticsMessageText()).DiagnosticsMessageText, { message: props.message }),
      traceElements(props)));


};