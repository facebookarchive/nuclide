'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SelectHunkChanges = undefined;

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('nuclide-commons-ui/Checkbox');
}

var _GutterCheckbox;

function _load_GutterCheckbox() {
  return _GutterCheckbox = require('./GutterCheckbox');
}

var _FileChanges;

function _load_FileChanges() {
  return _FileChanges = require('../../../nuclide-ui/FileChanges');
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _react = _interopRequireWildcard(require('react'));

var _constants;

function _load_constants() {
  return _constants = require('../constants');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

function getExtraData(props) {
  return (0, (_nullthrows || _load_nullthrows()).default)(props.extraData);
}

function getHunkData(props) {
  const hunks = (0, (_nullthrows || _load_nullthrows()).default)(getExtraData(props).fileData.chunks);
  return (0, (_nullthrows || _load_nullthrows()).default)(hunks.get(props.hunk.oldStart));
}

class SelectHunkChanges extends _react.Component {

  constructor(props) {
    super(props);

    const { actionCreators, fileData: { id: fileId }, patchId } = getExtraData(props);
    this._onToggleHunk = () => actionCreators.toggleHunk(patchId, fileId, props.hunk.oldStart);

    const hunkData = getHunkData(props);
    const firstChangeIndex = props.hunk.changes.findIndex(change => change.type !== 'normal');

    this.state = { editor: null, firstChangeIndex, hunkData };
  }

  componentWillReceiveProps(nextProps) {
    const hunkData = getHunkData(nextProps);
    this.setState({ hunkData });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.hunkData !== this.state.hunkData) {
      return true;
    }

    if (nextState.editor !== this.state.editor) {
      return true;
    }

    return false;
  }

  render() {
    const { actionCreators, fileData: { id: fileId }, patchId } = getExtraData(this.props);

    let gutterCheckboxes;
    const { editor } = this.state;
    if (editor != null) {
      gutterCheckboxes = this.state.hunkData.allChanges.map((isEnabled, index) => _react.createElement((_GutterCheckbox || _load_GutterCheckbox()).GutterCheckbox, {
        checked: isEnabled,
        editor: editor,
        key: index,
        lineNumber: index + this.state.firstChangeIndex,
        onToggleLine: () => actionCreators.toggleLine(patchId, fileId, this.props.hunk.oldStart, index)
      }));
    }

    return _react.createElement(
      'div',
      { className: 'nuclide-patch-editor-select-hunk-changes' },
      _react.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        checked: this.state.hunkData.selected === (_constants || _load_constants()).SelectedState.ALL,
        className: 'nuclide-patch-editor-hunk-checkbox',
        indeterminate: this.state.hunkData.selected === (_constants || _load_constants()).SelectedState.SOME,
        onChange: this._onToggleHunk
      }),
      _react.createElement(
        'div',
        { className: 'nuclide-patch-editor-hunk-changes' },
        _react.createElement((_FileChanges || _load_FileChanges()).HunkDiff, Object.assign({}, this.props, {
          ref: hunk => hunk && this.setState({ editor: hunk.editor })
        }))
      ),
      gutterCheckboxes
    );
  }
}
exports.SelectHunkChanges = SelectHunkChanges;