Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var _nuclideUiLibDiagnosticsMessage2;

function _nuclideUiLibDiagnosticsMessage() {
  return _nuclideUiLibDiagnosticsMessage2 = require('../../nuclide-ui/lib/DiagnosticsMessage');
}

function renderMessage(fixer, goToLocation, message, index) {
  var className = (0, (_classnames2 || _classnames()).default)(
  // native-key-bindings and tabIndex=-1 are both needed to allow copying the text in the popup.
  'native-key-bindings', 'nuclide-diagnostics-gutter-ui-popup-diagnostic', {
    'nuclide-diagnostics-gutter-ui-popup-error': message.type === 'Error',
    'nuclide-diagnostics-gutter-ui-popup-warning': message.type !== 'Error'
  });
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'div',
    { className: className, key: index, tabIndex: -1 },
    (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibDiagnosticsMessage2 || _nuclideUiLibDiagnosticsMessage()).DiagnosticsMessage, {
      fixer: fixer,
      goToLocation: goToLocation,
      key: index,
      message: message
    })
  );
}

// TODO move LESS styles to nuclide-ui
var DiagnosticsPopup = function DiagnosticsPopup(props) {
  var fixer = props.fixer;
  var goToLocation = props.goToLocation;
  var left = props.left;
  var messages = props.messages;
  var top = props.top;

  var rest = _objectWithoutProperties(props, ['fixer', 'goToLocation', 'left', 'messages', 'top']);

  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'div',
    _extends({
      className: 'nuclide-diagnostics-gutter-ui-popup',
      style: {
        left: left,
        top: top
      }
    }, rest),
    messages.map(renderMessage.bind(null, fixer, goToLocation))
  );
};
exports.DiagnosticsPopup = DiagnosticsPopup;