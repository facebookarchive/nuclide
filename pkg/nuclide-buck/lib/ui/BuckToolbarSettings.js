'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireDefault(require('react'));

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class BuckToolbarSettings extends _react.default.Component {

  constructor(props) {
    super(props);
    const { arguments: args, runArguments } = props.settings;
    this.state = {
      arguments: args == null ? '' : (0, (_shellQuote || _load_shellQuote()).quote)(args),
      runArguments: runArguments == null ? '' : (0, (_shellQuote || _load_shellQuote()).quote)(runArguments)
    };
  }

  render() {
    return _react.default.createElement(
      (_Modal || _load_Modal()).Modal,
      { onDismiss: this.props.onDismiss },
      _react.default.createElement(
        'div',
        { className: 'block' },
        _react.default.createElement(
          'div',
          { className: 'block' },
          _react.default.createElement(
            'label',
            null,
            'Current Buck root:'
          ),
          _react.default.createElement(
            'p',
            null,
            _react.default.createElement(
              'code',
              null,
              this.props.currentBuckRoot || 'No Buck project found.'
            )
          ),
          _react.default.createElement(
            'label',
            null,
            'Buck Arguments:'
          ),
          _react.default.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
            tabIndex: '0',
            initialValue: this.state.arguments,
            placeholderText: 'Extra arguments to Buck (e.g. --num-threads 4)',
            onDidChange: this._onArgsChange.bind(this),
            onConfirm: this._onSave.bind(this)
          }),
          _react.default.createElement(
            'div',
            null,
            _react.default.createElement(
              'label',
              null,
              'Run Arguments:'
            ),
            _react.default.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
              tabIndex: '0',
              initialValue: this.state.runArguments,
              placeholderText: 'Custom command-line arguments to pass to the app/binary',
              onDidChange: this._onRunArgsChange.bind(this),
              onConfirm: this._onSave.bind(this)
            })
          )
        ),
        _react.default.createElement(
          'div',
          { style: { display: 'flex', justifyContent: 'flex-end' } },
          _react.default.createElement(
            (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
            null,
            _react.default.createElement(
              (_Button || _load_Button()).Button,
              { onClick: this.props.onDismiss },
              'Cancel'
            ),
            _react.default.createElement(
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
}
exports.default = BuckToolbarSettings;