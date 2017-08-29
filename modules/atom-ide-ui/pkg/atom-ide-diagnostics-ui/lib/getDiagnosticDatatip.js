'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getCodeActionsForDiagnostic = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (codeActionFetcher, message, editor) {
    const codeActions = yield codeActionFetcher.getCodeActionForDiagnostic(message, editor);
    // For RPC reasons, the getTitle function of a CodeAction is async. Therefore,
    // we immediately request the title after we have each CodeAction.
    return new Map((yield Promise.all(codeActions.map((() => {
      var _ref2 = (0, _asyncToGenerator.default)(function* (codeAction) {
        return Promise.resolve([yield codeAction.getTitle(), codeAction]);
      });

      return function (_x4) {
        return _ref2.apply(this, arguments);
      };
    })()))));
  });

  return function getCodeActionsForDiagnostic(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})(); /**
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

var _react = _interopRequireWildcard(require('react'));

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('nuclide-commons-atom/go-to-location');
}

var _DiagnosticsPopup;

function _load_DiagnosticsPopup() {
  return _DiagnosticsPopup = require('./ui/DiagnosticsPopup');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function makeDatatipComponent(messages, fixer, codeActionsForMessage) {
  return _react.createElement((_DiagnosticsPopup || _load_DiagnosticsPopup()).DiagnosticsPopup, {
    messages: messages,
    fixer: fixer,
    goToLocation: (_goToLocation || _load_goToLocation()).goToLocation,
    codeActionsForMessage: codeActionsForMessage
  });
}

exports.default = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (editor, position, messagesForFile, fixer, codeActionFetcher) {
    const messagesAtPosition = messagesForFile.filter(function (message) {
      return message.range != null && message.range.containsPoint(position);
    });
    if (messagesAtPosition.length === 0) {
      return null;
    }
    const codeActionsForMessage = new Map((yield Promise.all(messagesAtPosition.map((() => {
      var _ref4 = (0, _asyncToGenerator.default)(function* (message) {
        return [message, codeActionFetcher != null ? yield getCodeActionsForDiagnostic(codeActionFetcher, message, editor) : new Map()];
      });

      return function (_x10) {
        return _ref4.apply(this, arguments);
      };
    })()))));
    let range = null;
    for (const message of messagesAtPosition) {
      if (message.range != null) {
        range = range == null ? message.range : message.range.union(range);
      }
    }

    if (!(range != null)) {
      throw new Error('Invariant violation: "range != null"');
    }

    return {
      component: makeDatatipComponent.bind(null, messagesAtPosition, fixer, codeActionsForMessage),
      pinnable: false,
      range
    };
  });

  function getDiagnosticDatatip(_x5, _x6, _x7, _x8, _x9) {
    return _ref3.apply(this, arguments);
  }

  return getDiagnosticDatatip;
})();