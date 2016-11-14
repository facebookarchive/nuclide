'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _constants;

function _load_constants() {
  return _constants = require('../../nuclide-hack-common/lib/constants.js');
}

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('../../nuclide-ui/AtomInput');
}

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('../../nuclide-ui/Dropdown');
}

var _reactForAtom = require('react-for-atom');

const WEB_SERVER_OPTION = { label: 'Attach to WebServer', value: 'webserver' };
const SCRIPT_OPTION = { label: 'Launch Script', value: 'script' };

const DEBUG_OPTIONS = [WEB_SERVER_OPTION, SCRIPT_OPTION];

const NO_LAUNCH_DEBUG_OPTIONS = [WEB_SERVER_OPTION];

let HhvmToolbar = class HhvmToolbar extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._handleDropdownChange = this._handleDropdownChange.bind(this);
    this._updateLastScriptCommand = this._updateLastScriptCommand.bind(this);
  }

  _updateLastScriptCommand(command) {
    if (this.props.projectStore.getDebugMode() === 'script') {
      this.props.projectStore.updateLastScriptCommand(command);
    }
  }

  _getMenuItems() {
    return this._isTargetLaunchable(this.props.projectStore.getCurrentFilePath()) ? DEBUG_OPTIONS : NO_LAUNCH_DEBUG_OPTIONS;
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
    this.refs.debugTarget.setText(store.getDebugTarget());
  }

  render() {
    const store = this.props.projectStore;
    const isDebugScript = store.getDebugMode() === 'script';
    return _reactForAtom.React.createElement(
      'div',
      { className: 'hhvm-toolbar block' },
      _reactForAtom.React.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
        className: 'inline-block',
        options: this._getMenuItems(),
        value: store.getDebugMode(),
        onChange: this._handleDropdownChange,
        ref: 'dropdown',
        size: 'sm'
      }),
      _reactForAtom.React.createElement(
        'div',
        { className: 'inline-block', style: { width: '500px' } },
        _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
          ref: 'debugTarget',
          initialValue: store.getDebugTarget(),
          disabled: !isDebugScript,
          onDidChange: this._updateLastScriptCommand,
          size: 'sm'
        })
      )
    );
  }

  _handleDropdownChange(value) {
    this.props.projectStore.setDebugMode(value);
  }
};


module.exports = HhvmToolbar;