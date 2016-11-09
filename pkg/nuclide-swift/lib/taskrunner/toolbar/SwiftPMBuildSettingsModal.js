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

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('../../../../nuclide-ui/AtomInput');
}

var _Button;

function _load_Button() {
  return _Button = require('../../../../nuclide-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('../../../../nuclide-ui/ButtonGroup');
}

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('../../../../nuclide-ui/Dropdown');
}

var _Modal;

function _load_Modal() {
  return _Modal = require('../../../../nuclide-ui/Modal');
}

let SwiftPMBuildSettingsModal = class SwiftPMBuildSettingsModal extends _reactForAtom.React.Component {

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
    return _reactForAtom.React.createElement(
      (_Modal || _load_Modal()).Modal,
      { onDismiss: this.props.onDismiss },
      _reactForAtom.React.createElement(
        'div',
        { className: 'block' },
        _reactForAtom.React.createElement(
          'label',
          null,
          'Build configuration:'
        ),
        _reactForAtom.React.createElement(
          'div',
          { className: 'block' },
          _reactForAtom.React.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
            className: 'inline-block',
            value: this.state.configuration,
            options: [{ label: 'Debug', value: 'debug' }, { label: 'Release', value: 'release' }],
            onChange: this._onConfigurationChange.bind(this),
            title: 'Choose build configuration'
          })
        ),
        _reactForAtom.React.createElement(
          'label',
          null,
          'C compiler flags:'
        ),
        _reactForAtom.React.createElement(
          'div',
          { className: 'block' },
          _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
            initialValue: this.state.Xcc,
            placeholderText: 'Flags that are passed through to all C compiler invocations',
            onDidChange: this._onXccChange.bind(this),
            onConfirm: this._onSave.bind(this)
          })
        ),
        _reactForAtom.React.createElement(
          'label',
          null,
          'Linker flags:'
        ),
        _reactForAtom.React.createElement(
          'div',
          { className: 'block' },
          _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
            initialValue: this.state.Xlinker,
            placeholderText: 'Flags that are passed through to all linker invocations',
            onDidChange: this._onXlinkerChange.bind(this),
            onConfirm: this._onSave.bind(this)
          })
        ),
        _reactForAtom.React.createElement(
          'label',
          null,
          'Swift compiler flags:'
        ),
        _reactForAtom.React.createElement(
          'div',
          { className: 'block' },
          _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
            initialValue: this.state.Xswiftc,
            placeholderText: 'Flags that are passed through to all Swift compiler invocations',
            onDidChange: this._onXswiftcChange.bind(this),
            onConfirm: this._onSave.bind(this)
          })
        ),
        _reactForAtom.React.createElement(
          'label',
          null,
          'Build path:'
        ),
        _reactForAtom.React.createElement(
          'div',
          { className: 'block' },
          _reactForAtom.React.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
            initialValue: this.state.buildPath,
            placeholderText: 'Build directory path',
            onDidChange: this._onBuildPathChange.bind(this),
            onConfirm: this._onSave.bind(this)
          })
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

  _onConfigurationChange(configuration) {
    this.setState({ configuration: configuration });
  }

  _onXccChange(Xcc) {
    this.setState({ Xcc: Xcc });
  }

  _onXlinkerChange(Xlinker) {
    this.setState({ Xlinker: Xlinker });
  }

  _onXswiftcChange(Xswiftc) {
    this.setState({ Xswiftc: Xswiftc });
  }

  _onBuildPathChange(buildPath) {
    this.setState({ buildPath: buildPath });
  }

  _onSave() {
    this.props.onSave(this.state.configuration, this.state.Xcc, this.state.Xlinker, this.state.Xswiftc, this.state.buildPath);
  }
};
exports.default = SwiftPMBuildSettingsModal;
module.exports = exports['default'];