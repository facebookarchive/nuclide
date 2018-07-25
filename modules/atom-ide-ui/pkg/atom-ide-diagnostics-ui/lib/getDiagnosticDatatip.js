"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

function _event() {
  const data = require("../../../../nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _goToLocation() {
  const data = require("../../../../nuclide-commons-atom/go-to-location");

  _goToLocation = function () {
    return data;
  };

  return data;
}

function _bindObservableAsProps() {
  const data = require("../../../../nuclide-commons-ui/bindObservableAsProps");

  _bindObservableAsProps = function () {
    return data;
  };

  return data;
}

function _DiagnosticsPopup() {
  const data = require("./ui/DiagnosticsPopup");

  _DiagnosticsPopup = function () {
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
const gotoLine = (file, line) => (0, _goToLocation().goToLocation)(file, {
  line
});

function makeDatatipComponent(messages, diagnosticUpdater) {
  const fixer = message => diagnosticUpdater.applyFix(message);

  return (0, _bindObservableAsProps().bindObservableAsProps)((0, _event().observableFromSubscribeFunction)(cb => diagnosticUpdater.observeCodeActionsForMessage(cb)).map(codeActionsForMessage => ({
    messages,
    fixer,
    goToLocation: gotoLine,
    codeActionsForMessage
  })), _DiagnosticsPopup().DiagnosticsPopup);
}

var getDiagnosticDatatip = async function getDiagnosticDatatip(editor, position, messagesAtPosition, diagnosticUpdater) {
  let range = null;

  for (const message of messagesAtPosition) {
    if (message.range != null) {
      range = range == null ? message.range : message.range.union(range);
    }
  }

  diagnosticUpdater.fetchCodeActions(editor, messagesAtPosition);

  if (!(range != null)) {
    throw new Error("Invariant violation: \"range != null\"");
  }

  return {
    component: makeDatatipComponent(messagesAtPosition, diagnosticUpdater),
    pinnable: false,
    range
  };
};

exports.default = getDiagnosticDatatip;