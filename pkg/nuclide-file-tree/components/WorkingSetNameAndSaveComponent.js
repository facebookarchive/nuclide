'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WorkingSetNameAndSaveComponent = undefined;

var _react = _interopRequireWildcard(require('react'));

var _AtomInput;

function _load_AtomInput() {
  return _AtomInput = require('nuclide-commons-ui/AtomInput');
}

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class WorkingSetNameAndSaveComponent extends _react.Component {
  constructor(props) {
    super(props);

    this._trackName = text => {
      this.setState({ name: text });
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
      setNameText = _react.createElement(
        'atom-panel',
        { 'class': 'nuclide-file-tree-working-set-name-missing' },
        'Name is missing'
      );
    }

    return _react.createElement(
      'div',
      null,
      _react.createElement(
        'div',
        { className: 'nuclide-file-tree-working-set-name-outline' },
        _react.createElement((_AtomInput || _load_AtomInput()).AtomInput, {
          placeholderText: 'name',
          size: 'sm',
          className: 'nuclide-file-tree-working-set-name inline-block-tight',
          onDidChange: this._trackName,
          initialValue: this.props.initialName,
          onConfirm: this._saveWorkingSet,
          onCancel: this.props.onCancel
        })
      ),
      _react.createElement((_Button || _load_Button()).Button, {
        buttonType: (_Button || _load_Button()).ButtonTypes.SUCCESS,
        disabled: this.state.name === '',
        icon: 'check',
        onClick: this._saveWorkingSet
      }),
      setNameText
    );
  }

}
exports.WorkingSetNameAndSaveComponent = WorkingSetNameAndSaveComponent; /**
                                                                          * Copyright (c) 2015-present, Facebook, Inc.
                                                                          * All rights reserved.
                                                                          *
                                                                          * This source code is licensed under the license found in the LICENSE file in
                                                                          * the root directory of this source tree.
                                                                          *
                                                                          * 
                                                                          * @format
                                                                          */