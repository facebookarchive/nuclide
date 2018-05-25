'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DiffPreviewComponent = undefined;

var _FileChanges;

function _load_FileChanges() {
  return _FileChanges = _interopRequireDefault(require('../../../nuclide-ui/FileChanges'));
}

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DiffPreviewComponent extends _react.Component {
  render() {
    const { diffs } = this.props.phase;
    return _react.createElement(
      'div',
      null,
      diffs.map((diff, i) => _react.createElement((_FileChanges || _load_FileChanges()).default, { key: i, diff: diff }))
    );
  }
}
exports.DiffPreviewComponent = DiffPreviewComponent; /**
                                                      * Copyright (c) 2015-present, Facebook, Inc.
                                                      * All rights reserved.
                                                      *
                                                      * This source code is licensed under the license found in the LICENSE file in
                                                      * the root directory of this source tree.
                                                      *
                                                      *  strict-local
                                                      * @format
                                                      */