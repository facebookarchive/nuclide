'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireDefault(require('react'));

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('nuclide-commons-ui/AtomInput');
}

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('nuclide-commons-ui/ButtonGroup');
}

var _Modal;

function _load_Modal() {
  return _Modal = require('../../../nuclide-ui/Modal');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class BuckToolbarSettings extends _react.default.Component {

  constructor(props) {
    super(props);
    const { buildArguments, runArguments } = props.settings;
    this.state = {
      buildArguments: buildArguments == null ? '' : (0, (_string || _load_string()).shellQuote)(buildArguments),
      runArguments: runArguments == null ? '' : (0, (_string || _load_string()).shellQuote)(runArguments)
    };
  }

  render() {
    const extraSettingsUi = this.props.platformProviderSettings != null ? this.props.platformProviderSettings.ui : null;
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
            'Build Arguments:'
          ),
          _react.default.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
            tabIndex: '0',
            initialValue: this.state.buildArguments,
            placeholderText: 'Extra arguments to Buck itself (e.g. --num-threads 4)',
            onDidChange: this._onBuildArgsChange.bind(this),
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
          ),
          extraSettingsUi
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

  _onBuildArgsChange(args) {
    this.setState({ buildArguments: args });
  }

  _onRunArgsChange(args) {
    this.setState({ runArguments: args });
  }

  _onSave() {
    try {
      this.props.onSave({
        buildArguments: (0, (_string || _load_string()).shellParse)(this.state.buildArguments),
        runArguments: (0, (_string || _load_string()).shellParse)(this.state.runArguments)
      });
    } catch (err) {
      atom.notifications.addError('Could not parse arguments', {
        detail: err.stack
      });
    }
    if (this.props.platformProviderSettings != null) {
      this.props.platformProviderSettings.onSave();
    }
  }
}
exports.default = BuckToolbarSettings; /**
                                        * Copyright (c) 2015-present, Facebook, Inc.
                                        * All rights reserved.
                                        *
                                        * This source code is licensed under the license found in the LICENSE file in
                                        * the root directory of this source tree.
                                        *
                                        * 
                                        * @format
                                        */