'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = FilterButton;

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

function FilterButton(props) {
  const { selected, type } = props;
  const typeName = getFilterTypeDisplayName(type);
  const title = props.selected ? `Hide ${typeName}` : `Show ${typeName}`;
  return _react.createElement((_Button || _load_Button()).Button, {
    icon: getIcon(type),
    size: (_Button || _load_Button()).ButtonSizes.SMALL,
    selected: selected,
    onClick: props.onClick,
    tooltip: { title }
  });
}

function getFilterTypeDisplayName(type) {
  switch (type) {
    case 'errors':
      return 'Errors';
    case 'warnings':
      return 'Warnings & Info';
    case 'feedback':
      return 'Feedback';
    default:
      throw new Error(`Invalid filter type: ${type}`);
  }
}

function getIcon(type) {
  switch (type) {
    case 'errors':
      return 'nuclicon-stop';
    case 'warnings':
      return 'alert';
    case 'feedback':
      return 'nuclicon-comment-discussion';
    default:
      throw new Error(`Invalid filter type: ${type}`);
  }
}