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

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _nuclideUiButton;

function _load_nuclideUiButton() {
  return _nuclideUiButton = require('../../../nuclide-ui/Button');
}

var _nuclideUiButtonGroup;

function _load_nuclideUiButtonGroup() {
  return _nuclideUiButtonGroup = require('../../../nuclide-ui/ButtonGroup');
}

var _nuclideUiCheckbox;

function _load_nuclideUiCheckbox() {
  return _nuclideUiCheckbox = require('../../../nuclide-ui/Checkbox');
}

// TODO: All this needs to be serialized by the package, so we're going to need to hoist it and use
//   actions.

var DebugUiComponent = (function (_React$Component) {
  _inherits(DebugUiComponent, _React$Component);

  function DebugUiComponent(props) {
    _classCallCheck(this, DebugUiComponent);

    _get(Object.getPrototypeOf(DebugUiComponent.prototype), 'constructor', this).call(this, props);
    this._handleCancelButtonClick = this._handleCancelButtonClick.bind(this);
    this._handleDebugButtonClick = this._handleDebugButtonClick.bind(this);

    this.state = {
      startPackager: false,
      tailIosLogs: false,
      tailAdbLogs: false
    };
  }

  _createClass(DebugUiComponent, [{
    key: 'render',
    value: function render() {
      var _this = this;

      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        { className: 'block' },
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          'div',
          { className: 'block' },
          (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiCheckbox || _load_nuclideUiCheckbox()).Checkbox, {
            checked: this.state.startPackager,
            label: 'Start Packager',
            onChange: function (startPackager) {
              return _this.setState({ startPackager: startPackager });
            }
          })
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          'div',
          { className: 'block' },
          (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiCheckbox || _load_nuclideUiCheckbox()).Checkbox, {
            checked: this.state.tailIosLogs,
            label: 'Tail iOS Simulator Logs',
            onChange: function (tailIosLogs) {
              return _this.setState({ tailIosLogs: tailIosLogs });
            }
          })
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          'div',
          { className: 'block' },
          (_reactForAtom || _load_reactForAtom()).React.createElement((_nuclideUiCheckbox || _load_nuclideUiCheckbox()).Checkbox, {
            checked: this.state.tailAdbLogs,
            label: 'Tail adb Logcat Logs',
            onChange: function (tailAdbLogs) {
              return _this.setState({ tailAdbLogs: tailAdbLogs });
            }
          })
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          'div',
          { className: 'text-left text-smaller text-subtle' },
          'After starting the debugger, enable JS debugging from the developer menu of your React Native app'
        ),
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          'div',
          { className: 'nuclide-react-native-debugging-launch-attach-actions' },
          (_reactForAtom || _load_reactForAtom()).React.createElement(
            (_nuclideUiButtonGroup || _load_nuclideUiButtonGroup()).ButtonGroup,
            null,
            (_reactForAtom || _load_reactForAtom()).React.createElement(
              (_nuclideUiButton || _load_nuclideUiButton()).Button,
              {
                onClick: this._handleCancelButtonClick },
              'Cancel'
            ),
            (_reactForAtom || _load_reactForAtom()).React.createElement(
              (_nuclideUiButton || _load_nuclideUiButton()).Button,
              {
                buttonType: (_nuclideUiButton || _load_nuclideUiButton()).ButtonTypes.PRIMARY,
                onClick: this._handleDebugButtonClick },
              'Attach'
            )
          )
        )
      );
    }
  }, {
    key: '_handleDebugButtonClick',
    value: function _handleDebugButtonClick() {
      if (this.state.startPackager) {
        callWorkspaceCommand('nuclide-react-native:start-packager');
      }
      if (this.state.tailIosLogs) {
        callWorkspaceCommand('nuclide-ios-simulator-logs:start');
      }
      if (this.state.tailAdbLogs) {
        callWorkspaceCommand('nuclide-adb-logcat:start');
      }
      callWorkspaceCommand('nuclide-react-native:start-debugging');
      callWorkspaceCommand('nuclide-debugger:toggle-launch-attach');
    }
  }, {
    key: '_handleCancelButtonClick',
    value: function _handleCancelButtonClick() {
      callWorkspaceCommand('nuclide-debugger:toggle-launch-attach');
    }
  }]);

  return DebugUiComponent;
})((_reactForAtom || _load_reactForAtom()).React.Component);

exports.DebugUiComponent = DebugUiComponent;

function callWorkspaceCommand(command) {
  atom.commands.dispatch(atom.views.getView(atom.workspace), command);
}