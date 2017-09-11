'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SelectFileChanges = undefined;

var _Checkbox;

function _load_Checkbox() {
  return _Checkbox = require('nuclide-commons-ui/Checkbox');
}

var _FileChanges;

function _load_FileChanges() {
  return _FileChanges = _interopRequireDefault(require('../../../nuclide-ui/FileChanges'));
}

var _SelectHunkChanges;

function _load_SelectHunkChanges() {
  return _SelectHunkChanges = require('./SelectHunkChanges');
}

var _react = _interopRequireWildcard(require('react'));

var _constants;

function _load_constants() {
  return _constants = require('../constants');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class SelectFileChanges extends _react.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._onToggleFile = () => {
      this.props.actionCreators.toggleFile(this.props.patchId, this.props.fileData.id);
    }, _temp;
  }

  shouldComponentUpdate(nextProps) {
    return this.props.fileData !== nextProps.fileData;
  }

  render() {
    const { actionCreators, fileData, patchId } = this.props;
    const { selected, fileDiff } = fileData;

    const extraData = {
      actionCreators,
      fileData,
      patchId
    };

    return _react.createElement(
      'div',
      { className: 'nuclide-patch-editor-select-file-changes' },
      _react.createElement((_Checkbox || _load_Checkbox()).Checkbox, {
        checked: selected === (_constants || _load_constants()).SelectedState.ALL,
        className: 'nuclide-patch-editor-file-checkbox',
        indeterminate: selected === (_constants || _load_constants()).SelectedState.SOME,
        onChange: this._onToggleFile
      }),
      _react.createElement(
        'div',
        { className: 'nuclide-patch-editor-file-changes' },
        _react.createElement((_FileChanges || _load_FileChanges()).default, {
          collapsable: true,
          diff: fileDiff,
          extraData: extraData,
          hunkComponentClass: (_SelectHunkChanges || _load_SelectHunkChanges()).SelectHunkChanges
        })
      )
    );
  }

}
exports.SelectFileChanges = SelectFileChanges; /**
                                                * Copyright (c) 2015-present, Facebook, Inc.
                                                * All rights reserved.
                                                *
                                                * This source code is licensed under the license found in the LICENSE file in
                                                * the root directory of this source tree.
                                                *
                                                * 
                                                * @format
                                                */