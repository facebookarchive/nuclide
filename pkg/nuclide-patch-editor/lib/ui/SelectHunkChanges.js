'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SelectHunkChanges = undefined;

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('../../../nuclide-ui/Checkbox');
}

var _FileChanges;

function _load_FileChanges() {
  return _FileChanges = require('../../../nuclide-ui/FileChanges');
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _react = _interopRequireDefault(require('react'));

var _constants;

function _load_constants() {
  return _constants = require('../constants');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getExtraData(props) {
  return (0, (_nullthrows || _load_nullthrows()).default)(props.extraData);
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   */

function getHunkData(props) {
  const hunks = (0, (_nullthrows || _load_nullthrows()).default)(getExtraData(props).fileData.chunks);
  return (0, (_nullthrows || _load_nullthrows()).default)(hunks.get(props.hunk.oldStart));
}

class SelectHunkChanges extends _react.default.Component {

  constructor(props) {
    super(props);

    const { actionCreators, fileData: { id: fileId }, patchId } = getExtraData(props);
    this._onToggleHunk = () => actionCreators.toggleHunk(patchId, fileId, props.hunk.oldStart);

    this._hunkData = getHunkData(props);
  }

  shouldComponentUpdate(nextProps) {
    const newHunkData = getHunkData(nextProps);
    if (newHunkData !== this._hunkData) {
      this._hunkData = newHunkData;
      return true;
    }
    return false;
  }

  render() {
    return _react.default.createElement(
      'div',
      { className: 'nuclide-patch-editor-select-hunk-changes' },
      _react.default.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        checked: this._hunkData.selected === (_constants || _load_constants()).SelectedState.ALL,
        indeterminate: this._hunkData.selected === (_constants || _load_constants()).SelectedState.SOME,
        onChange: this._onToggleHunk
      }),
      _react.default.createElement(
        'div',
        { className: 'nuclide-patch-editor-hunk-changes' },
        _react.default.createElement((_FileChanges || _load_FileChanges()).HunkDiff, Object.assign({}, this.props, { ref: hunk => {
            this._editor = hunk && hunk.editor;
          } }))
      )
    );
  }
}
exports.SelectHunkChanges = SelectHunkChanges;