'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireDefault(require('react'));

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

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

class FileTreeSidebarFilterComponent extends _react.default.Component {

  render() {
    const { filter, found } = this.props;

    const classes = (0, (_classnames || _load_classnames()).default)({
      'nuclide-file-tree-filter': true,
      show: Boolean(filter && filter.length),
      'not-found': !found
    });
    const text = `search for: ${filter}`;

    return _react.default.createElement(
      'div',
      { className: classes },
      text
    );
  }
}
exports.default = FileTreeSidebarFilterComponent;