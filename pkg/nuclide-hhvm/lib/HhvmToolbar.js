'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _electron = require('electron');

var _constants;

function _load_constants() {
  return _constants = require('../../nuclide-hack-common/lib/constants.js');
}

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('nuclide-commons-ui/AtomInput');
}

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('../../nuclide-ui/Dropdown');
}

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('nuclide-commons-ui/Checkbox');
}

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const WEB_SERVER_OPTION = { label: 'Attach to WebServer', value: 'webserver' }; /**
                                                                                 * Copyright (c) 2015-present, Facebook, Inc.
                                                                                 * All rights reserved.
                                                                                 *
                                                                                 * This source code is licensed under the license found in the LICENSE file in
                                                                                 * the root directory of this source tree.
                                                                                 *
                                                                                 * 
                                                                                 * @format
                                                                                 */

const SCRIPT_OPTION = { label: 'Launch Script', value: 'script' };

const DEBUG_OPTIONS = [WEB_SERVER_OPTION, SCRIPT_OPTION];

const NO_LAUNCH_DEBUG_OPTIONS = [WEB_SERVER_OPTION];

class HhvmToolbar extends _react.Component {
  constructor(props) {
    super(props);

    this._updateLastScriptCommand = command => {
      if (this.props.projectStore.getDebugMode() !== 'webserver') {
        if (this.state.stickyScript) {
          this.props.projectStore.setStickyCommand(command, true);
        } else {
          this.props.projectStore.updateLastScriptCommand(command);
        }
      }
    };

    this._handleDropdownChange = value => {
      this.props.projectStore.setDebugMode(value);
      this._suggestTargetIfCustomDebugMode(value);
    };

    this.state = {
      stickyScript: false
    };
  }

  _getMenuItems() {
    const additionalOptions = [];
    try {
      // $FlowFB: This is suppressed elsewhere, so vary the filename.
      const helpers = require('./fb-hhvm.js');
      additionalOptions.push(...helpers.getAdditionalLaunchOptions());
    } catch (e) {}

    return (this._isTargetLaunchable(this.props.projectStore.getCurrentFilePath()) ? DEBUG_OPTIONS : NO_LAUNCH_DEBUG_OPTIONS).concat(additionalOptions);
  }

  _isTargetLaunchable(targetFilePath) {
    if (targetFilePath.endsWith('.php') || targetFilePath.endsWith('.hh')) {
      return true;
    }
    return atom.workspace.getTextEditors().some(editor => {
      const editorPath = editor.getPath();
      if (editorPath != null && editorPath.endsWith(targetFilePath)) {
        const grammar = editor.getGrammar();
        return (_constants || _load_constants()).HACK_GRAMMARS.indexOf(grammar.scopeName) >= 0;
      }
      return false;
    });
  }

  componentWillReceiveProps(nextProps) {
    // Reset selected item to webserver if target is not launchable anymore.
    // TODO[jeffreytan]: this is ugly, refactor to make it more elegant.
    const store = this.props.projectStore;
    if (store.getDebugMode() === 'script' && !this._isTargetLaunchable(store.getCurrentFilePath())) {
      store.setDebugMode('webserver');
    }
    this._suggestTargetIfCustomDebugMode(store.getDebugMode());
    this.refs.debugTarget.setText(store.getDebugTarget());
  }

  render() {
    const store = this.props.projectStore;
    const isDebugScript = store.getDebugMode() !== 'webserver';
    const isDisabled = !isDebugScript;
    const value = store.getDebugTarget();

    return _react.createElement(
      'div',
      { className: 'hhvm-toolbar' },
      _react.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
        className: 'inline-block',
        options: this._getMenuItems(),
        value: store.getDebugMode(),
        onChange: this._handleDropdownChange,
        ref: 'dropdown',
        size: 'sm'
      }),
      _react.createElement(
        'div',
        { className: 'inline-block', style: { width: '300px' } },
        _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
          ref: 'debugTarget',
          value: value
          // Ugly hack: prevent people changing the value without disabling so
          // that they can copy and paste.
          , onDidChange: isDisabled ? () => {
            if (this.refs.debugTarget.getText() !== value) {
              this.refs.debugTarget.setText(value);
            }
          } : this._updateLastScriptCommand,
          size: 'sm'
        })
      ),
      !isDebugScript ? _react.createElement(
        (_Button || _load_Button()).Button,
        {
          size: 'SMALL',
          onClick: () => {
            _electron.shell.openExternal('https://' + store.getDebugTarget());
          } },
        'Open'
      ) : _react.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        checked: this.state.stickyScript,
        label: 'Sticky',
        onChange: isChecked => {
          this.props.projectStore.setStickyCommand(this.refs.debugTarget.getText(), isChecked);
          this.setState({ stickyScript: isChecked });
        },
        tooltip: {
          title: 'When checked, the target script will not change when switching to another editor tab'
        }
      })
    );
  }

  _suggestTargetIfCustomDebugMode(debugMode) {
    // If a custom debug mode is selected, suggest a debug target for the user.
    if (DEBUG_OPTIONS.find(option => option.value === debugMode) == null) {
      try {
        // $FlowFB
        const helpers = require('./fb-hhvm');
        const store = this.props.projectStore;
        const suggestedTarget = helpers.suggestDebugTargetName(debugMode, store.getCurrentFilePath());
        if (suggestedTarget != null) {
          store.updateLastScriptCommand(suggestedTarget);
        }
      } catch (e) {}
    }
  }

}
exports.default = HhvmToolbar;