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
exports.default = undefined;

var _reactForAtom = require('react-for-atom');

var _shellQuote;

function _load_shellQuote() {
  return _shellQuote = require('shell-quote');
}

var _string;

function _load_string() {
  return _string = require('../../../commons-node/string');
}

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('../../../nuclide-ui/AtomInput');
}

var _Button;

function _load_Button() {
  return _Button = require('../../../nuclide-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('../../../nuclide-ui/ButtonGroup');
}

var _Modal;

function _load_Modal() {
  return _Modal = require('../../../nuclide-ui/Modal');
}

let BuckToolbarSettings = class BuckToolbarSettings extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    var _props$settings = props.settings;
    const args = _props$settings.arguments,
          runArguments = _props$settings.runArguments;

    this.state = {
      arguments: args == null ? '' : (0, (_shellQuote || _load_shellQuote()).quote)(args),
      runArguments: runArguments == null ? '' : (0, (_shellQuote || _load_shellQuote()).quote)(runArguments)
    };
  }

  render() {
    let runArguments;
    if (this.props.buildType === 'debug' || this.props.buildType === 'run') {
      runArguments = _reactForAtom.React.createElement(
        'div',
        null,
        _reactForAtom.React.createElement(
          'label',
          null,
          'Run Arguments:'
        ),
        _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
          tabIndex: '0',
          initialValue: this.state.runArguments,
          placeholderText: 'Custom command-line arguments to pass to the app/binary',
          onDidChange: this._onRunArgsChange.bind(this),
          onConfirm: this._onSave.bind(this)
        })
      );
    }

    return _reactForAtom.React.createElement(
      (_Modal || _load_Modal()).Modal,
      { onDismiss: this.props.onDismiss },
      _reactForAtom.React.createElement(
        'div',
        { className: 'block' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'block' },
          _reactForAtom.React.createElement(
            'h5',
            null,
            'Buck Settings for build type: ',
            _reactForAtom.React.createElement(
              'b',
              null,
              this.props.buildType
            )
          ),
          _reactForAtom.React.createElement(
            'label',
            null,
            'Current Buck root:'
          ),
          _reactForAtom.React.createElement(
            'p',
            null,
            _reactForAtom.React.createElement(
              'code',
              null,
              this.props.currentBuckRoot || 'No Buck project found.'
            )
          ),
          _reactForAtom.React.createElement(
            'label',
            null,
            'Buck Arguments:'
          ),
          _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
            tabIndex: '0',
            initialValue: this.state.arguments,
            placeholderText: 'Extra arguments to Buck (e.g. --num-threads 4)',
            onDidChange: this._onArgsChange.bind(this),
            onConfirm: this._onSave.bind(this)
          }),
          runArguments
        ),
        _reactForAtom.React.createElement(
          'div',
          { style: { display: 'flex', justifyContent: 'flex-end' } },
          _reactForAtom.React.createElement(
            (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
            null,
            _reactForAtom.React.createElement(
              (_Button || _load_Button()).Button,
              { onClick: this.props.onDismiss },
              'Cancel'
            ),
            _reactForAtom.React.createElement(
              (_Button || _load_Button()).Button,
              {
                buttonType: (_Button || _load_Button()).ButtonTypes.PRIMARY,
                onClick: this._onSave.bind(this) },
              'Save'
            )
          )
        )
      )
    );
  }

  _onArgsChange(args) {
    this.setState({ arguments: args });
  }

  _onRunArgsChange(args) {
    this.setState({ runArguments: args });
  }

  _onSave() {
    try {
      this.props.onSave({
        arguments: (0, (_string || _load_string()).shellParse)(this.state.arguments),
        runArguments: (0, (_string || _load_string()).shellParse)(this.state.runArguments)
      });
    } catch (err) {
      atom.notifications.addError('Could not parse arguments', { detail: err.stack });
    }
  }

};
exports.default = BuckToolbarSettings;
module.exports = exports['default'];