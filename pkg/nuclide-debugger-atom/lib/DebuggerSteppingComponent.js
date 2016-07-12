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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _nuclideUiLibButton2;

function _nuclideUiLibButton() {
  return _nuclideUiLibButton2 = require('../../nuclide-ui/lib/Button');
}

var _nuclideUiLibButtonGroup2;

function _nuclideUiLibButtonGroup() {
  return _nuclideUiLibButtonGroup2 = require('../../nuclide-ui/lib/ButtonGroup');
}

var _ChromeActionRegistryActions2;

function _ChromeActionRegistryActions() {
  return _ChromeActionRegistryActions2 = _interopRequireDefault(require('./ChromeActionRegistryActions'));
}

var _DebuggerStore2;

function _DebuggerStore() {
  return _DebuggerStore2 = require('./DebuggerStore');
}

var DebuggerSteppingComponent = (function (_React$Component) {
  _inherits(DebuggerSteppingComponent, _React$Component);

  function DebuggerSteppingComponent(props) {
    _classCallCheck(this, DebuggerSteppingComponent);

    _get(Object.getPrototypeOf(DebuggerSteppingComponent.prototype), 'constructor', this).call(this, props);
  }

  _createClass(DebuggerSteppingComponent, [{
    key: 'render',
    value: function render() {
      var _props = this.props;
      var actions = _props.actions;
      var debuggerMode = _props.debuggerMode;

      var isPaused = debuggerMode === (_DebuggerStore2 || _DebuggerStore()).DebuggerMode.PAUSED;
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_nuclideUiLibButtonGroup2 || _nuclideUiLibButtonGroup()).ButtonGroup,
          null,
          (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibButton2 || _nuclideUiLibButton()).Button, {
            icon: isPaused ? 'playback-play' : 'playback-pause',
            title: isPaused ? 'pause' : 'continue',
            onClick: actions.triggerDebuggerAction.bind(actions, (_ChromeActionRegistryActions2 || _ChromeActionRegistryActions()).default.PAUSE // Toggles paused state
            )
          }),
          (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibButton2 || _nuclideUiLibButton()).Button, {
            icon: 'arrow-right',
            title: 'step over',
            onClick: actions.triggerDebuggerAction.bind(actions, (_ChromeActionRegistryActions2 || _ChromeActionRegistryActions()).default.STEP_OVER)
          }),
          (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibButton2 || _nuclideUiLibButton()).Button, {
            icon: 'arrow-down',
            title: 'step into',
            onClick: actions.triggerDebuggerAction.bind(actions, (_ChromeActionRegistryActions2 || _ChromeActionRegistryActions()).default.STEP_INTO)
          }),
          (_reactForAtom2 || _reactForAtom()).React.createElement((_nuclideUiLibButton2 || _nuclideUiLibButton()).Button, {
            icon: 'arrow-up',
            title: 'step out',
            onClick: actions.triggerDebuggerAction.bind(actions, (_ChromeActionRegistryActions2 || _ChromeActionRegistryActions()).default.STEP_OUT)
          })
        )
      );
    }
  }]);

  return DebuggerSteppingComponent;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.DebuggerSteppingComponent = DebuggerSteppingComponent;