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
exports.LaunchUIComponent = undefined;

var _string;

function _load_string() {
  return _string = require('../../commons-node/string');
}

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
}

var _reactForAtom = require('react-for-atom');

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('../../nuclide-ui/AtomInput');
}

var _Button;

function _load_Button() {
  return _Button = require('../../nuclide-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('../../nuclide-ui/ButtonGroup');
}

let LaunchUIComponent = exports.LaunchUIComponent = class LaunchUIComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this._handleLaunchClick = this._handleLaunchClick.bind(this);
    this._cancelClick = this._cancelClick.bind(this);
  }

  componentWillMount() {
    this.props.parentEmitter.on((_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerLaunchAttachEventTypes.ENTER_KEY_PRESSED, this._handleLaunchClick);
  }

  componentDidMount() {
    const launchExecutableInput = this.refs.launchExecutable;
    if (launchExecutableInput != null) {
      launchExecutableInput.focus();
    }
  }

  componentWillUnmount() {
    this.props.parentEmitter.removeListener((_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerLaunchAttachEventTypes.ENTER_KEY_PRESSED, this._handleLaunchClick);
  }

  render() {
    // TODO: smart fill the working directory textbox.
    // TODO: make tab stop between textbox work.
    // Reserve tabIndex [1~10] to header portion of the UI so we start from "11" here.
    return _reactForAtom.React.createElement(
      'div',
      { className: 'block' },
      _reactForAtom.React.createElement(
        'label',
        null,
        'Executable: '
      ),
      _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        ref: 'launchExecutable',
        tabIndex: '11',
        placeholderText: 'Input the executable path you want to launch'
      }),
      _reactForAtom.React.createElement(
        'label',
        null,
        'Arguments: '
      ),
      _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        ref: 'launchArguments',
        tabIndex: '12',
        placeholderText: 'Arguments to the executable'
      }),
      _reactForAtom.React.createElement(
        'label',
        null,
        'Environment Variables: '
      ),
      _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        ref: 'launchEnvironmentVariables',
        tabIndex: '13',
        placeholderText: 'Environment variables (e.g., SHELL=/bin/bash PATH=/bin)'
      }),
      _reactForAtom.React.createElement(
        'label',
        null,
        'Working directory: '
      ),
      _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        ref: 'launchWorkingDirectory',
        tabIndex: '14',
        placeholderText: 'Working directory for the launched executable'
      }),
      _reactForAtom.React.createElement(
        'label',
        null,
        'Stdin file: '
      ),
      _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
        ref: 'stdinFilePath',
        tabIndex: '15',
        placeholderText: 'Redirect stdin to this file'
      }),
      _reactForAtom.React.createElement(
        'div',
        { style: { display: 'flex', flexDirection: 'row-reverse' } },
        _reactForAtom.React.createElement(
          (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
          null,
          _reactForAtom.React.createElement(
            (_Button || _load_Button()).Button,
            {
              tabIndex: '17',
              onClick: this._cancelClick },
            'Cancel'
          ),
          _reactForAtom.React.createElement(
            (_Button || _load_Button()).Button,
            {
              buttonType: (_Button || _load_Button()).ButtonTypes.PRIMARY,
              tabIndex: '16',
              onClick: this._handleLaunchClick },
            'Launch'
          )
        )
      )
    );
  }

  _cancelClick() {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:toggle-launch-attach');
  }

  _handleLaunchClick() {
    // TODO: perform some validation for the input.
    const launchExecutable = this.refs.launchExecutable.getText().trim();
    const launchArguments = (0, (_string || _load_string()).shellParse)(this.refs.launchArguments.getText());
    const launchEnvironmentVariables = (0, (_string || _load_string()).shellParse)(this.refs.launchEnvironmentVariables.getText());
    const launchWorkingDirectory = this.refs.launchWorkingDirectory.getText().trim();
    const stdinFilePath = this.refs.stdinFilePath.getText().trim();
    const launchTarget = {
      executablePath: launchExecutable,
      arguments: launchArguments,
      environmentVariables: launchEnvironmentVariables,
      workingDirectory: launchWorkingDirectory,
      stdinFilePath: stdinFilePath
    };
    // Fire and forget.
    this.props.actions.launchDebugger(launchTarget);
    this.props.actions.showDebuggerPanel();
    this.props.actions.toggleLaunchAttachDialog();
  }
};