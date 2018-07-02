"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DiagnosticsMessageNoHeader = exports.DiagnosticsMessage = void 0;

var React = _interopRequireWildcard(require("react"));

function _Button() {
  const data = require("../../../../../nuclide-commons-ui/Button");

  _Button = function () {
    return data;
  };

  return data;
}

function _ButtonGroup() {
  const data = require("../../../../../nuclide-commons-ui/ButtonGroup");

  _ButtonGroup = function () {
    return data;
  };

  return data;
}

function _DiagnosticsMessageText() {
  const data = require("./DiagnosticsMessageText");

  _DiagnosticsMessageText = function () {
    return data;
  };

  return data;
}

function _DiagnosticsTraceItem() {
  const data = require("./DiagnosticsTraceItem");

  _DiagnosticsTraceItem = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
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
  Hint: ''
};

function diagnosticHeader(props) {
  const {
    message,
    fixer
  } = props;
  const providerClassName = PROVIDER_CLASS_NAME[message.type];
  let fixButton = null;

  if (message.fix != null) {
    const applyFix = () => {
      fixer(message);
    };

    const speculative = message.fix.speculative === true;
    const buttonType = speculative ? undefined : _Button().ButtonTypes.SUCCESS;
    fixButton = React.createElement(_Button().Button, {
      buttonType: buttonType,
      size: "EXTRA_SMALL",
      onClick: applyFix
    }, // flowlint-next-line sketchy-null-string:off
    message.fix.title || 'Fix');
  }

  return React.createElement("div", {
    className: "diagnostics-popup-header"
  }, React.createElement(_ButtonGroup().ButtonGroup, null, fixButton), React.createElement("span", {
    className: providerClassName
  }, message.providerName));
}

function traceElements(props) {
  const {
    message,
    goToLocation
  } = props;
  return message.trace && message.trace.length ? React.createElement("div", {
    className: "diagnostics-popup-trace"
  }, message.trace.map((traceItem, i) => React.createElement(_DiagnosticsTraceItem().DiagnosticsTraceItem, {
    key: i,
    trace: traceItem,
    goToLocation: goToLocation
  }))) : null;
}

const DiagnosticsMessage = props => {
  return React.createElement("div", null, diagnosticHeader(props), React.createElement("div", {
    className: "diagnostics-popup-message"
  }, React.createElement(_DiagnosticsMessageText().DiagnosticsMessageText, {
    message: props.message
  })), traceElements(props), props.children);
};

exports.DiagnosticsMessage = DiagnosticsMessage;

const DiagnosticsMessageNoHeader = props => {
  return React.createElement("div", {
    className: "diagnostics-full-description-message"
  }, React.createElement(_DiagnosticsMessageText().DiagnosticsMessageText, {
    message: props.message
  }), traceElements(props));
};

exports.DiagnosticsMessageNoHeader = DiagnosticsMessageNoHeader;