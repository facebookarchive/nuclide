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
exports.DiagnosticsPopup = undefined;

var _reactForAtom = require('react-for-atom');

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _DiagnosticsMessage;

function _load_DiagnosticsMessage() {
  return _DiagnosticsMessage = require('../../nuclide-ui/DiagnosticsMessage');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function renderMessage(fixer, goToLocation, message, index) {
  const className = (0, (_classnames || _load_classnames()).default)(
  // native-key-bindings and tabIndex=-1 are both needed to allow copying the text in the popup.
  'native-key-bindings', 'nuclide-diagnostics-gutter-ui-popup-diagnostic', {
    'nuclide-diagnostics-gutter-ui-popup-error': message.type === 'Error',
    'nuclide-diagnostics-gutter-ui-popup-warning': message.type !== 'Error'
  });
  return _reactForAtom.React.createElement(
    'div',
    { className: className, key: index, tabIndex: -1 },
    _reactForAtom.React.createElement((_DiagnosticsMessage || _load_DiagnosticsMessage()).DiagnosticsMessage, {
      fixer: fixer,
      goToLocation: goToLocation,
      key: index,
      message: message
    })
  );
}

// TODO move LESS styles to nuclide-ui
const DiagnosticsPopup = exports.DiagnosticsPopup = props => {
  const fixer = props.fixer,
        goToLocation = props.goToLocation,
        left = props.left,
        messages = props.messages,
        top = props.top,
        rest = _objectWithoutProperties(props, ['fixer', 'goToLocation', 'left', 'messages', 'top']);

  return _reactForAtom.React.createElement(
    'div',
    Object.assign({
      className: 'nuclide-diagnostics-gutter-ui-popup',
      style: {
        left: left,
        top: top
      }
    }, rest),
    messages.map(renderMessage.bind(null, fixer, goToLocation))
  );
};