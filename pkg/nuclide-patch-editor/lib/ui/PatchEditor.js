'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireDefault(require('react'));

var _Button;

function _load_Button() {
  return _Button = require('../../../nuclide-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('../../../nuclide-ui/ButtonGroup');
}

var _utils;

function _load_utils() {
  return _utils = require('../utils');
}

var _SelectFileChanges;

function _load_SelectFileChanges() {
  return _SelectFileChanges = require('./SelectFileChanges');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class PatchEditor extends _react.default.Component {

  constructor(props) {
    super(props);

    this._onClickConfirm = this._onClickConfirm.bind(this);
    this._onClickDirectEdit = this._onClickDirectEdit.bind(this);
    this._onClickQuit = this._onClickQuit.bind(this);
  }

  render() {
    const files = Array.from(this.props.patchData.files.values());
    return _react.default.createElement(
      'div',
      { className: 'nuclide-patch-editor' },
      _react.default.createElement(
        (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
        null,
        _react.default.createElement(
          (_Button || _load_Button()).Button,
          { onClick: this._onClickConfirm },
          'Confirm'
        ),
        _react.default.createElement(
          (_Button || _load_Button()).Button,
          { onClick: this._onClickQuit },
          'Quit'
        ),
        _react.default.createElement(
          (_Button || _load_Button()).Button,
          { onClick: this._onClickDirectEdit },
          'Direct Edit'
        )
      ),
      files.map(file => {
        return _react.default.createElement((_SelectFileChanges || _load_SelectFileChanges()).SelectFileChanges, {
          actionCreators: this.props.actionCreators,
          fileData: file,
          key: file.id,
          patchId: this.props.patchId
        });
      })
    );
  }

  _onClickConfirm() {
    this.props.onConfirm((0, (_utils || _load_utils()).patchToString)(this.props.patchData));
  }

  // The "Direct Edit" button removes the patch editor UI and allows the user
  // to edit the text representation of the patch directly
  _onClickDirectEdit() {
    this.props.onManualEdit();
  }

  _onClickQuit() {
    this.props.onQuit();
  }
}
exports.default = PatchEditor; /**
                                * Copyright (c) 2015-present, Facebook, Inc.
                                * All rights reserved.
                                *
                                * This source code is licensed under the license found in the LICENSE file in
                                * the root directory of this source tree.
                                *
                                * 
                                */