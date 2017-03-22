'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AttachUiComponent = undefined;

var _react = _interopRequireDefault(require('react'));

var _AttachProcessInfo;

function _load_AttachProcessInfo() {
  return _AttachProcessInfo = require('./AttachProcessInfo');
}

var _Button;

function _load_Button() {
  return _Button = require('../../nuclide-ui/Button');
}

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('../../nuclide-ui/Dropdown');
}

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
}

var _consumeFirstProvider;

function _load_consumeFirstProvider() {
  return _consumeFirstProvider = _interopRequireDefault(require('../../commons-atom/consumeFirstProvider'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const TARGET_ENVIRONMENTS = [{ label: 'iOS', value: 'iOS' }, { label: 'Android', value: 'Android' }]; /**
                                                                                                       * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                       * All rights reserved.
                                                                                                       *
                                                                                                       * This source code is licensed under the license found in the LICENSE file in
                                                                                                       * the root directory of this source tree.
                                                                                                       *
                                                                                                       * 
                                                                                                       */

class AttachUiComponent extends _react.default.Component {

  constructor(props) {
    super(props);
    this._handleCancelButtonClick = this._handleCancelButtonClick.bind(this);
    this._handleAttachButtonClick = this._handleAttachButtonClick.bind(this);
    this._handleDropdownChange = this._handleDropdownChange.bind(this);
    this.state = {
      selectedEnvironment: 'iOS'
    };
  }

  componentWillMount() {
    this.props.parentEmitter.on((_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerLaunchAttachEventTypes.ENTER_KEY_PRESSED, this._handleAttachButtonClick);
  }

  componentWillUnmount() {
    this.props.parentEmitter.removeListener((_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerLaunchAttachEventTypes.ENTER_KEY_PRESSED, this._handleAttachButtonClick);
  }

  render() {
    return _react.default.createElement(
      'div',
      { className: 'block' },
      _react.default.createElement(
        'div',
        { className: 'nuclide-debugger-php-launch-attach-ui-select-project' },
        _react.default.createElement(
          'label',
          null,
          'Environment: '
        ),
        _react.default.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
          options: TARGET_ENVIRONMENTS,
          onChange: this._handleDropdownChange,
          value: this.state.selectedEnvironment
        })
      ),
      _react.default.createElement(
        'div',
        { className: 'padded text-right' },
        _react.default.createElement(
          (_Button || _load_Button()).Button,
          { onClick: this._handleCancelButtonClick },
          'Cancel'
        ),
        _react.default.createElement(
          (_Button || _load_Button()).Button,
          {
            buttonType: (_Button || _load_Button()).ButtonTypes.PRIMARY,
            onClick: this._handleAttachButtonClick },
          'Attach'
        )
      )
    );
  }

  _handleDropdownChange(selectedEnvironment) {
    this.setState({
      selectedEnvironment
    });
  }

  _handleAttachButtonClick() {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-debugger-jsc-attach');
    const processInfo = new (_AttachProcessInfo || _load_AttachProcessInfo()).AttachProcessInfo(this.props.targetUri, this.state.selectedEnvironment);
    (0, (_consumeFirstProvider || _load_consumeFirstProvider()).default)('nuclide-debugger.remote').then(debuggerService => debuggerService.startDebugging(processInfo));
    this._showDebuggerPanel();
    this._handleCancelButtonClick();
  }

  _showDebuggerPanel() {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
  }

  _handleCancelButtonClick() {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:toggle-launch-attach');
  }
}
exports.AttachUiComponent = AttachUiComponent;