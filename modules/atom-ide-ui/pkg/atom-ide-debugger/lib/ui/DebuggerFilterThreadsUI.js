"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _FilterThreadConditions() {
  const data = require("../vsp/FilterThreadConditions");

  _FilterThreadConditions = function () {
    return data;
  };

  return data;
}

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

function _ButtonGroup() {
  const data = require("../../../../../nuclide-commons-ui/ButtonGroup");

  _ButtonGroup = function () {
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

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
class DebuggerFilterThreadsUI extends React.Component {
  constructor(props) {
    super(props);
    const {
      currentFilterConditions
    } = this.props;
    this.state = {
      onlyPausedThreadsChecked: currentFilterConditions != null ? currentFilterConditions.onlyPausedThreads : false
    };
    this.initialRendering = true;
    this._disposables = new (_UniversalDisposable().default)();

    this._disposables.add(atom.commands.add('atom-workspace', 'core:cancel', this.props.dialogCloser));
  }

  _filterThreads() {
    const {
      onlyPausedThreadsChecked
    } = this.state;
    const conditions = new (_FilterThreadConditions().FilterThreadConditions)(this._nameFilter != null ? this._nameFilter.getText() : '', this._idFilter != null ? this._idFilter.getText() : '', onlyPausedThreadsChecked);
    this.props.updateFilters(conditions);
    this.props.dialogCloser();
  }

  render() {
    const {
      currentFilterConditions
    } = this.props;
    const initRendering = this.initialRendering;
    this.initialRendering = false;
    return React.createElement("div", null, React.createElement("div", null, React.createElement("h1", {
      className: "debugger-bp-config-header"
    }, "Filter Threads By...")), React.createElement("div", null, React.createElement("label", null, "Name:")), React.createElement("div", {
      className: "block"
    }, React.createElement(_AtomInput().AtomInput, {
      placeholderText: "(e.g. main)",
      value: initRendering && currentFilterConditions != null ? currentFilterConditions.name : this._nameFilter != null ? this._nameFilter.getText() : '',
      size: "sm",
      ref: input => {
        this._nameFilter = input;
      },
      autofocus: false
    })), React.createElement("div", null, React.createElement("label", null, "Thread ID:")), React.createElement("div", {
      className: "block"
    }, React.createElement(_AtomInput().AtomInput, {
      placeholderText: "Comma-separated list (e.g. 1, 13, 15)",
      value: initRendering && currentFilterConditions != null ? currentFilterConditions.stringOfIDs : this._idFilter != null ? this._idFilter.getText() : '',
      size: "sm",
      ref: input => {
        this._idFilter = input;
      },
      autofocus: false
    })), React.createElement("div", {
      className: "block"
    }, React.createElement("div", null, React.createElement(_Checkbox().Checkbox, {
      onChange: () => {
        const {
          onlyPausedThreadsChecked
        } = this.state;
        this.setState({
          onlyPausedThreadsChecked: !onlyPausedThreadsChecked
        });
      },
      checked: this.state.onlyPausedThreadsChecked,
      label: "Show only paused threads"
    }))), React.createElement("div", {
      className: "debugger-bp-config-actions"
    }, React.createElement(_ButtonGroup().ButtonGroup, null, React.createElement(_Button().Button, {
      onClick: this.props.dialogCloser
    }, "Cancel"), React.createElement(_Button().Button, {
      buttonType: _Button().ButtonTypes.PRIMARY,
      onClick: this._filterThreads.bind(this)
    }, "Update"))));
  }

}

exports.default = DebuggerFilterThreadsUI;