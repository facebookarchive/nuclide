'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FreeformRefactorComponent = undefined;

var _react = _interopRequireWildcard(require('react'));

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('nuclide-commons-ui/AtomInput');
}

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('nuclide-commons-ui/Checkbox');
}

var _Dropdown;

function _load_Dropdown() {
  return _Dropdown = require('../../../nuclide-ui/Dropdown');
}

var _refactorActions;

function _load_refactorActions() {
  return _refactorActions = _interopRequireWildcard(require('../refactorActions'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

function getDefault(arg) {
  if (arg.default != null) {
    return arg.default;
  }

  switch (arg.type) {
    case 'string':
      return '';
    case 'boolean':
      return false;
    case 'enum':
      return arg.options[0].value;
  }

  throw new Error('unreachable');
}

class FreeformRefactorComponent extends _react.Component {
  constructor(props) {
    super(props);

    this._execute = () => {
      const { editor, originalPoint, refactoring } = this.props.phase;
      this.props.store.dispatch((_refactorActions || _load_refactorActions()).execute(this.props.phase.provider, {
        kind: 'freeform',
        editor,
        originalPoint,
        id: refactoring.id,
        range: refactoring.range,
        arguments: this.state.args
      }));
    };

    const defaultArgs = new Map(props.phase.refactoring.arguments.map(arg => [arg.name, getDefault(arg)]));
    this.state = {
      args: defaultArgs
    };
  }

  render() {
    return _react.createElement(
      'div',
      null,
      this._getControls(),
      _react.createElement(
        'div',
        { style: { display: 'flex', justifyContent: 'flex-end' } },
        _react.createElement(
          (_Button || _load_Button()).Button,
          {
            className: 'nuclide-refactorizer-execute-button',
            buttonType: (_Button || _load_Button()).ButtonTypes.PRIMARY,
            onClick: this._execute },
          'Execute'
        )
      )
    );
  }

  _getControls() {
    return this.props.phase.refactoring.arguments.map((arg, index) => {
      switch (arg.type) {
        case 'string':
          return [_react.createElement(
            'div',
            { key: 'label', className: 'nuclide-refactorizer-freeform-label' },
            arg.description
          ), _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
            key: 'input',
            autofocus: index === 0,
            startSelected: index === 0,
            className: 'nuclide-refactorizer-freeform-editor',
            value: String(this.state.args.get(arg.name)),
            onDidChange: text => this._updateArg(arg.name, text),
            onConfirm: this._execute
          })];
        case 'boolean':
          return _react.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
            label: arg.description,
            checked: Boolean(this.state.args.get(arg.name)),
            onChange: checked => this._updateArg(arg.name, checked)
          });
        case 'enum':
          return [_react.createElement(
            'div',
            { key: 'label', className: 'nuclide-refactorizer-freeform-label' },
            arg.description
          ), _react.createElement((_Dropdown || _load_Dropdown()).Dropdown, {
            key: 'dropdown',
            value: this.state.args.get(arg.name) || arg.options[0],
            options: arg.options.map(val => ({
              value: val.value,
              label: val.description
            })),
            onChange: value => this._updateArg(arg.name, value)
          })];
      }
    }).map((elem, index) => {
      return _react.createElement(
        'div',
        { key: index, className: 'nuclide-refactorizer-freeform-group' },
        elem
      );
    });
  }

  _updateArg(name, value) {
    // A bit hacky, but immutability isn't a requirement here.
    this.state.args.set(name, value);
    this.forceUpdate();
  }

}
exports.FreeformRefactorComponent = FreeformRefactorComponent;