'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));


















var _react = _interopRequireWildcard(require('react'));var _event;
function _load_event() {return _event = require('../../../../nuclide-commons/event');}var _goToLocation;
function _load_goToLocation() {return _goToLocation = require('../../../../nuclide-commons-atom/go-to-location');}var _bindObservableAsProps;
function _load_bindObservableAsProps() {return _bindObservableAsProps = require('../../../../nuclide-commons-ui/bindObservableAsProps');}var _DiagnosticsPopup;
function _load_DiagnosticsPopup() {return _DiagnosticsPopup = require('./ui/DiagnosticsPopup');}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

const gotoLine = (file, line) => (0, (_goToLocation || _load_goToLocation()).goToLocation)(file, { line }); /**
                                                                                                             * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                             * All rights reserved.
                                                                                                             *
                                                                                                             * This source code is licensed under the BSD-style license found in the
                                                                                                             * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                             * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                             *
                                                                                                             *  strict-local
                                                                                                             * @format
                                                                                                             */function makeDatatipComponent(messages, diagnosticUpdater) {const fixer = message => diagnosticUpdater.applyFix(message);return (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)((0, (_event || _load_event()).observableFromSubscribeFunction)(cb => diagnosticUpdater.observeCodeActionsForMessage(cb)).map(codeActionsForMessage => ({
    messages,
    fixer,
    goToLocation: gotoLine,
    codeActionsForMessage })), (_DiagnosticsPopup || _load_DiagnosticsPopup()).DiagnosticsPopup);



}exports.default = (() => {var _ref = (0, _asyncToGenerator.default)(

  function* (
  editor,
  position,
  messagesAtPosition,
  diagnosticUpdater)
  {
    let range = null;
    for (const message of messagesAtPosition) {
      if (message.range != null) {
        range = range == null ? message.range : message.range.union(range);
      }
    }
    diagnosticUpdater.fetchCodeActions(editor, messagesAtPosition);if (!(
    range != null)) {throw new Error('Invariant violation: "range != null"');}
    return {
      component: makeDatatipComponent(messagesAtPosition, diagnosticUpdater),
      pinnable: false,
      range };

  });function getDiagnosticDatatip(_x, _x2, _x3, _x4) {return _ref.apply(this, arguments);}return getDiagnosticDatatip;})();