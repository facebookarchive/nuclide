"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FreeformRefactorComponent = void 0;

var React = _interopRequireWildcard(require("react"));

function _AtomInput() {
  const data = require("../../../../../nuclide-commons-ui/AtomInput");

  _AtomInput = function () {
    return data;
  };

  return data;
}

function _Button() {
  const data = require("../../../../../nuclide-commons-ui/Button");

  _Button = function () {
    return data;
  };

  return data;
}

function _Checkbox() {
  const data = require("../../../../../nuclide-commons-ui/Checkbox");

  _Checkbox = function () {
    return data;
  };

  return data;
}

function _Dropdown() {
  const data = require("../../../../../nuclide-commons-ui/Dropdown");

  _Dropdown = function () {
    return data;
  };

  return data;
}

function Actions() {
  const data = _interopRequireWildcard(require("../refactorActions"));

  Actions = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
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

class FreeformRefactorComponent extends React.Component {
  constructor(props) {
    super(props);

    this._execute = () => {
      const {
        editor,
        originalRange,
        refactoring
      } = this.props.phase;
      this.props.store.dispatch(Actions().execute(this.props.phase.provider, {
        kind: 'freeform',
        editor,
        originalRange,
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
    return React.createElement("div", null, this._getControls(), React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'flex-end'
      }
    }, React.createElement(_Button().Button, {
      className: "nuclide-refactorizer-execute-button",
      buttonType: _Button().ButtonTypes.PRIMARY,
      onClick: this._execute
    }, "Execute")));
  }

  _getControls() {
    return this.props.phase.refactoring.arguments.map((arg, index) => {
      switch (arg.type) {
        case 'string':
          return [React.createElement("div", {
            key: "label",
            className: "nuclide-refactorizer-freeform-label"
          }, arg.description), React.createElement(_AtomInput().AtomInput, {
            key: "input",
            autofocus: index === 0,
            startSelected: index === 0,
            className: "nuclide-refactorizer-freeform-editor",
            value: String(this.state.args.get(arg.name)),
            onDidChange: text => this._updateArg(arg.name, text),
            onConfirm: this._execute
          })];

        case 'boolean':
          return React.createElement(_Checkbox().Checkbox, {
            label: arg.description,
            checked: Boolean(this.state.args.get(arg.name)),
            onChange: checked => this._updateArg(arg.name, checked)
          });

        case 'enum':
          return [React.createElement("div", {
            key: "label",
            className: "nuclide-refactorizer-freeform-label"
          }, arg.description), React.createElement(_Dropdown().Dropdown, {
            key: "dropdown",
            value: this.state.args.get(arg.name) || arg.options[0],
            options: arg.options.map(val => ({
              value: val.value,
              label: val.description
            })),
            onChange: value => this._updateArg(arg.name, value)
          })];
      }
    }).map((elem, index) => {
      return React.createElement("div", {
        key: index,
        className: "nuclide-refactorizer-freeform-group"
      }, elem);
    });
  }

  _updateArg(name, value) {
    // A bit hacky, but immutability isn't a requirement here.
    this.state.args.set(name, value);
    this.forceUpdate();
  }

}

exports.FreeformRefactorComponent = FreeformRefactorComponent;