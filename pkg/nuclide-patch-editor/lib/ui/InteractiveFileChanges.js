'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireDefault(require('react'));

var _FileChanges;

function _load_FileChanges() {
  return _FileChanges = _interopRequireDefault(require('../../../nuclide-ui/FileChanges'));
}

var _Button;

function _load_Button() {
  return _Button = require('../../../nuclide-ui/Button');
}

var _utils;

function _load_utils() {
  return _utils = require('../utils');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class InteractiveFileChanges extends _react.default.Component {

  constructor(props) {
    super(props);

    this._patch = Array.from(props.patchData.files.values()).map(file => file.fileDiff);

    this._onClickConfirm = this._onClickConfirm.bind(this);
    this._onClickDirectEdit = this._onClickDirectEdit.bind(this);
    this._onClickQuit = this._onClickQuit.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.patchData !== this.props.patchData;
  }

  render() {
    return _react.default.createElement(
      'div',
      { className: 'nuclide-patch-editor' },
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
      ),
      this._patch.map(file => _react.default.createElement((_FileChanges || _load_FileChanges()).default, {
        checkboxFactory: this.props.checkboxFactory,
        collapsable: true,
        diff: file,
        key: `${file.from}:${file.to}`
      }))
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
exports.default = InteractiveFileChanges; /**
                                           * Copyright (c) 2015-present, Facebook, Inc.
                                           * All rights reserved.
                                           *
                                           * This source code is licensed under the license found in the LICENSE file in
                                           * the root directory of this source tree.
                                           *
                                           * 
                                           */