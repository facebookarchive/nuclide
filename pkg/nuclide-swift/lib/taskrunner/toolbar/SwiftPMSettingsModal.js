'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireDefault(require('react'));

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

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('../../../../nuclide-ui/Dropdown');
}

var _Modal;

function _load_Modal() {
  return _Modal = require('../../../../nuclide-ui/Modal');
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
 * @format
 */

class SwiftPMSettingsModal extends _react.default.Component {

  constructor(props) {
    super(props);
    this.state = {
      configuration: props.configuration,
      Xcc: props.Xcc,
      Xlinker: props.Xlinker,
      Xswiftc: props.Xswiftc,
      buildPath: props.buildPath
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
          'label',
          null,
          'Build configuration:'
        ),
        _react.default.createElement(
          'div',
          { className: 'block' },
          _react.default.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
            className: 'inline-block',
            value: this.state.configuration,
            options: [{ label: 'Debug', value: 'debug' }, { label: 'Release', value: 'release' }],
            onChange: this._onConfigurationChange.bind(this),
            title: 'Choose build configuration'
          })
        ),
        _react.default.createElement(
          'label',
          null,
          'C compiler flags:'
        ),
        _react.default.createElement(
          'div',
          { className: 'block' },
          _react.default.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
            initialValue: this.state.Xcc,
            placeholderText: 'Flags that are passed through to all C compiler invocations',
            onDidChange: this._onXccChange.bind(this),
            onConfirm: this._onSave.bind(this)
          })
        ),
        _react.default.createElement(
          'label',
          null,
          'Linker flags:'
        ),
        _react.default.createElement(
          'div',
          { className: 'block' },
          _react.default.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
            initialValue: this.state.Xlinker,
            placeholderText: 'Flags that are passed through to all linker invocations',
            onDidChange: this._onXlinkerChange.bind(this),
            onConfirm: this._onSave.bind(this)
          })
        ),
        _react.default.createElement(
          'label',
          null,
          'Swift compiler flags:'
        ),
        _react.default.createElement(
          'div',
          { className: 'block' },
          _react.default.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
            initialValue: this.state.Xswiftc,
            placeholderText: 'Flags that are passed through to all Swift compiler invocations',
            onDidChange: this._onXswiftcChange.bind(this),
            onConfirm: this._onSave.bind(this)
          })
        ),
        _react.default.createElement(
          'label',
          null,
          'Build path:'
        ),
        _react.default.createElement(
          'div',
          { className: 'block' },
          _react.default.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
            initialValue: this.state.buildPath,
            placeholderText: 'Build directory path',
            onDidChange: this._onBuildPathChange.bind(this),
            onConfirm: this._onSave.bind(this)
          })
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

  _onConfigurationChange(configuration) {
    this.setState({ configuration });
  }

  _onXccChange(Xcc) {
    this.setState({ Xcc });
  }

  _onXlinkerChange(Xlinker) {
    this.setState({ Xlinker });
  }

  _onXswiftcChange(Xswiftc) {
    this.setState({ Xswiftc });
  }

  _onBuildPathChange(buildPath) {
    this.setState({ buildPath });
  }

  _onSave() {
    this.props.onSave(this.state.configuration, this.state.Xcc, this.state.Xlinker, this.state.Xswiftc, this.state.buildPath);
  }
}
exports.default = SwiftPMSettingsModal;