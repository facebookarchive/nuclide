"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RenameComponent = void 0;

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
class RenameComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newName: this.props.phase.symbolAtPoint.text
    };
  }

  render() {
    return React.createElement("div", null, React.createElement(_AtomInput().AtomInput, {
      autofocus: true,
      startSelected: true,
      className: "nuclide-refactorizer-rename-editor",
      initialValue: this.props.phase.symbolAtPoint.text,
      onDidChange: text => this.setState({
        newName: text
      }),
      onConfirm: () => this._runRename()
    }), React.createElement(_Button().Button // Used to identify this element in integration tests
    , {
      className: "nuclide-refactorizer-execute-button",
      onClick: () => this._runRename()
    }, "Execute"));
  }

  _runRename() {
    const {
      newName
    } = this.state;
    const {
      symbolAtPoint,
      editor,
      originalPoint
    } = this.props.phase;
    const refactoring = {
      kind: 'rename',
      newName,
      originalPoint,
      symbolAtPoint,
      editor
    };
    this.props.store.dispatch(Actions().execute(this.props.phase.provider, refactoring));
  }

}

exports.RenameComponent = RenameComponent;