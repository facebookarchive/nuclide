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
exports.AttachUiComponent = undefined;

var _reactForAtom = require('react-for-atom');

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

var _consumeFirstProvider;

function _load_consumeFirstProvider() {
  return _consumeFirstProvider = _interopRequireDefault(require('../../commons-atom/consumeFirstProvider'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let AttachUiComponent = exports.AttachUiComponent = class AttachUiComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._handleCancelButtonClick = this._handleCancelButtonClick.bind(this);
    this._handleAttachButtonClick = this._handleAttachButtonClick.bind(this);
    this._handlePathsDropdownChange = this._handlePathsDropdownChange.bind(this);
    this.state = {
      selectedPathIndex: 0,
      pathMenuItems: this._getPathMenuItems()
    };
  }

  render() {
    return _reactForAtom.React.createElement(
      'div',
      { className: 'block' },
      _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-debugger-iwdp-launch-attach-ui-select-project' },
        _reactForAtom.React.createElement(
          'label',
          null,
          'Selected Project Directory: '
        ),
        _reactForAtom.React.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
          className: 'inline-block nuclide-debugger-connection-box',
          options: this.state.pathMenuItems,
          onChange: this._handlePathsDropdownChange,
          value: this.state.selectedPathIndex
        })
      ),
      _reactForAtom.React.createElement(
        'div',
        { className: 'padded text-right' },
        _reactForAtom.React.createElement(
          (_Button || _load_Button()).Button,
          { onClick: this._handleCancelButtonClick },
          'Cancel'
        ),
        _reactForAtom.React.createElement(
          (_Button || _load_Button()).Button,
          {
            buttonType: (_Button || _load_Button()).ButtonTypes.PRIMARY,
            onClick: this._handleAttachButtonClick },
          'Attach'
        )
      )
    );
  }

  _getPathMenuItems() {
    return [];
  }

  _handlePathsDropdownChange(newIndex) {
    this.setState({
      selectedPathIndex: newIndex,
      pathMenuItems: this._getPathMenuItems()
    });
  }

  _handleAttachButtonClick() {
    const processInfo = new (_AttachProcessInfo || _load_AttachProcessInfo()).AttachProcessInfo(this.props.targetUri);
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
};