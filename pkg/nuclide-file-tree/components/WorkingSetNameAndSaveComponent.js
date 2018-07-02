"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WorkingSetNameAndSaveComponent = void 0;

var React = _interopRequireWildcard(require("react"));

function _AtomInput() {
  const data = require("../../../modules/nuclide-commons-ui/AtomInput");

  _AtomInput = function () {
    return data;
  };

  return data;
}

function _Button() {
  const data = require("../../../modules/nuclide-commons-ui/Button");

  _Button = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
class WorkingSetNameAndSaveComponent extends React.Component {
  constructor(props) {
    super(props);

    this._trackName = text => {
      this.setState({
        name: text
      });
    };

    this._saveWorkingSet = () => {
      if (this.state.name === '') {
        atom.notifications.addWarning('Name is missing', {
          detail: 'Please provide a name for the Working Set'
        });
        return;
      }

      if (this.props.isEditing) {
        this.props.onUpdate(this.props.initialName, this.state.name);
      } else {
        this.props.onSave(this.state.name);
      }
    };

    this.state = {
      name: props.initialName
    };
  }

  componentDidMount() {}

  componentWillUnmount() {}

  render() {
    let setNameText;

    if (this.state.name === '') {
      setNameText = React.createElement("atom-panel", {
        "class": "nuclide-file-tree-working-set-name-missing"
      }, "Name is missing");
    }

    return React.createElement("div", null, React.createElement("div", {
      className: "nuclide-file-tree-working-set-name-outline"
    }, React.createElement(_AtomInput().AtomInput, {
      placeholderText: "name",
      size: "sm",
      className: "nuclide-file-tree-working-set-name inline-block-tight",
      onDidChange: this._trackName,
      initialValue: this.props.initialName,
      onConfirm: this._saveWorkingSet,
      onCancel: this.props.onCancel
    })), React.createElement(_Button().Button, {
      buttonType: _Button().ButtonTypes.SUCCESS,
      disabled: this.state.name === '',
      icon: "check",
      onClick: this._saveWorkingSet
    }), setNameText);
  }

}

exports.WorkingSetNameAndSaveComponent = WorkingSetNameAndSaveComponent;