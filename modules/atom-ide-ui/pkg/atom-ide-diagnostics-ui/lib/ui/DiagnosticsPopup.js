'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DiagnosticsPopup = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _react = _interopRequireWildcard(require('react'));

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _DiagnosticsMessage;

function _load_DiagnosticsMessage() {
  return _DiagnosticsMessage = require('./DiagnosticsMessage');
}

var _DiagnosticsCodeActions;

function _load_DiagnosticsCodeActions() {
  return _DiagnosticsCodeActions = _interopRequireDefault(require('./DiagnosticsCodeActions'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; } /**
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

function renderMessage(fixer, goToLocation, codeActionsForMessage, message, index) {
  const className = (0, (_classnames || _load_classnames()).default)(
  // native-key-bindings and tabIndex=-1 are both needed to allow copying the text in the popup.
  'native-key-bindings', 'diagnostics-popup-diagnostic', {
    'diagnostics-popup-error': message.type === 'Error',
    'diagnostics-popup-warning': message.type === 'Warning',
    'diagnostics-popup-info': message.type === 'Info'
  });
  const codeActions = getCodeActions(message, codeActionsForMessage);
  return _react.createElement(
    'div',
    { className: className, key: index, tabIndex: -1 },
    _react.createElement(
      (_DiagnosticsMessage || _load_DiagnosticsMessage()).DiagnosticsMessage,
      {
        fixer: fixer,
        goToLocation: goToLocation,
        message: message },
      codeActions && codeActions.size ? _react.createElement((_DiagnosticsCodeActions || _load_DiagnosticsCodeActions()).default, { codeActions: codeActions }) : null
    )
  );
}

function getCodeActions(message, codeActionsForMessage) {
  const codeActionMaps = [];
  if (message.actions != null && message.actions.length > 0) {
    codeActionMaps.push(new Map(message.actions.map(action => {
      return [action.title, {
        getTitle() {
          return (0, _asyncToGenerator.default)(function* () {
            return action.title;
          })();
        },
        apply() {
          return (0, _asyncToGenerator.default)(function* () {
            action.apply();
          })();
        },
        dispose() {}
      }];
    })));
  }
  if (codeActionsForMessage) {
    const actions = codeActionsForMessage.get(message);
    if (actions != null) {
      codeActionMaps.push(actions);
    }
  }
  return codeActionMaps.length > 0 ? (0, (_collection || _load_collection()).mapUnion)(...codeActionMaps) : null;
}

// TODO move LESS styles to nuclide-ui
const DiagnosticsPopup = props => {
  const { fixer, goToLocation, codeActionsForMessage, messages } = props,
        rest = _objectWithoutProperties(props, ['fixer', 'goToLocation', 'codeActionsForMessage', 'messages']);
  return _react.createElement(
    'div',
    Object.assign({ className: 'diagnostics-popup' }, rest),
    messages.map(renderMessage.bind(null, fixer, goToLocation, codeActionsForMessage))
  );
};
exports.DiagnosticsPopup = DiagnosticsPopup;