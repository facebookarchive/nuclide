'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DebugUiComponent = undefined;

var _react = _interopRequireDefault(require('react'));

var _Button;

function _load_Button() {
  return _Button = require('../../../nuclide-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('../../../nuclide-ui/ButtonGroup');
}

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('../../../nuclide-ui/Checkbox');
}

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../../nuclide-debugger-base');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO: All this needs to be serialized by the package, so we're going to need to hoist it and use
//   actions.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class DebugUiComponent extends _react.default.Component {

  constructor(props) {
    super(props);
    this._handleCancelButtonClick = this._handleCancelButtonClick.bind(this);
    this._handleDebugButtonClick = this._handleDebugButtonClick.bind(this);

    this.state = {
      startPackager: false,
      tailIosLogs: false,
      tailAdbLogs: false
    };
  }

  componentWillMount() {
    this.props.parentEmitter.on((_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerLaunchAttachEventTypes.ENTER_KEY_PRESSED, this._handleDebugButtonClick);
  }

  componentWillUnmount() {
    this.props.parentEmitter.removeListener((_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerLaunchAttachEventTypes.ENTER_KEY_PRESSED, this._handleDebugButtonClick);
  }

  render() {
    return _react.default.createElement(
      'div',
      { className: 'block' },
      _react.default.createElement(
        'div',
        { className: 'block' },
        _react.default.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
          checked: this.state.startPackager,
          label: 'Start Packager',
          onChange: startPackager => this.setState({ startPackager })
        })
      ),
      _react.default.createElement(
        'div',
        { className: 'block' },
        _react.default.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
          checked: this.state.tailIosLogs,
          label: 'Tail iOS Simulator Logs',
          onChange: tailIosLogs => this.setState({ tailIosLogs })
        })
      ),
      _react.default.createElement(
        'div',
        { className: 'block' },
        _react.default.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
          checked: this.state.tailAdbLogs,
          label: 'Tail adb Logcat Logs',
          onChange: tailAdbLogs => this.setState({ tailAdbLogs })
        })
      ),
      _react.default.createElement(
        'div',
        { className: 'text-left text-smaller text-subtle' },
        'After starting the debugger, enable JS debugging from the developer menu of your React Native app'
      ),
      _react.default.createElement(
        'div',
        { className: 'nuclide-react-native-debugging-launch-attach-actions' },
        _react.default.createElement(
          (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
          null,
          _react.default.createElement(
            (_Button || _load_Button()).Button,
            {
              onClick: this._handleCancelButtonClick },
            'Cancel'
          ),
          _react.default.createElement(
            (_Button || _load_Button()).Button,
            {
              buttonType: (_Button || _load_Button()).ButtonTypes.PRIMARY,
              onClick: this._handleDebugButtonClick },
            'Attach'
          )
        )
      )
    );
  }

  _handleDebugButtonClick() {
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

  _handleCancelButtonClick() {
    callWorkspaceCommand('nuclide-debugger:toggle-launch-attach');
  }
}

exports.DebugUiComponent = DebugUiComponent;
function callWorkspaceCommand(command) {
  atom.commands.dispatch(atom.views.getView(atom.workspace), command);
}