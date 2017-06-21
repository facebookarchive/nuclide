'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DebugUiComponent = undefined;

var _react = _interopRequireDefault(require('react'));

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('nuclide-commons-ui/Checkbox');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
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
 * @format
 */

class DebugUiComponent extends _react.default.Component {

  constructor(props) {
    super(props);
    this._handleDebugButtonClick = this._handleDebugButtonClick.bind(this);

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this.state = {
      startPackager: false,
      tailIosLogs: false,
      tailAdbLogs: false
    };
  }

  componentDidMount() {
    this._disposables.add(atom.commands.add('atom-workspace', {
      'core:confirm': () => {
        if (this._debugButtonShouldEnable()) {
          this._handleDebugButtonClick();
        }
      }
    }));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  setState(newState) {
    super.setState(newState);
    this.props.configIsValidChanged(this._debugButtonShouldEnable());
  }

  _debugButtonShouldEnable() {
    return true;
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
  }
}

exports.DebugUiComponent = DebugUiComponent;
function callWorkspaceCommand(command) {
  atom.commands.dispatch(atom.views.getView(atom.workspace), command);
}