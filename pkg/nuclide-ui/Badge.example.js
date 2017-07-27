'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BadgeExamples = undefined;

var _react = _interopRequireDefault(require('react'));

var _Block;

function _load_Block() {
  return _Block = require('nuclide-commons-ui/Block');
}

var _Badge;

function _load_Badge() {
  return _Badge = require('./Badge');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const BadgeBasicExample = () => _react.default.createElement(
  'div',
  null,
  _react.default.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.default.createElement((_Badge || _load_Badge()).Badge, { value: 1 }),
    ' ',
    _react.default.createElement((_Badge || _load_Badge()).Badge, { value: 11 }),
    ' ',
    _react.default.createElement((_Badge || _load_Badge()).Badge, { value: 123 })
  )
); /**
    * Copyright (c) 2015-present, Facebook, Inc.
    * All rights reserved.
    *
    * This source code is licensed under the license found in the LICENSE file in
    * the root directory of this source tree.
    *
    * 
    * @format
    */

const BadgeColorExample = () => _react.default.createElement(
  'div',
  null,
  _react.default.createElement(
    (_Block || _load_Block()).Block,
    null,
    'Info: ',
    _react.default.createElement((_Badge || _load_Badge()).Badge, { color: (_Badge || _load_Badge()).BadgeColors.info, value: 123 })
  ),
  _react.default.createElement(
    (_Block || _load_Block()).Block,
    null,
    'Success: ',
    _react.default.createElement((_Badge || _load_Badge()).Badge, { color: (_Badge || _load_Badge()).BadgeColors.success, value: 123 })
  ),
  _react.default.createElement(
    (_Block || _load_Block()).Block,
    null,
    'Warning: ',
    _react.default.createElement((_Badge || _load_Badge()).Badge, { color: (_Badge || _load_Badge()).BadgeColors.warning, value: 123 })
  ),
  _react.default.createElement(
    (_Block || _load_Block()).Block,
    null,
    'Error: ',
    _react.default.createElement((_Badge || _load_Badge()).Badge, { color: (_Badge || _load_Badge()).BadgeColors.error, value: 123 })
  )
);

const BadgeSizeExample = () => _react.default.createElement(
  'div',
  null,
  _react.default.createElement(
    (_Block || _load_Block()).Block,
    null,
    'Small: ',
    _react.default.createElement((_Badge || _load_Badge()).Badge, { size: (_Badge || _load_Badge()).BadgeSizes.small, value: 123 })
  ),
  _react.default.createElement(
    (_Block || _load_Block()).Block,
    null,
    'Medium: ',
    _react.default.createElement((_Badge || _load_Badge()).Badge, { size: (_Badge || _load_Badge()).BadgeSizes.medium, value: 123 })
  ),
  _react.default.createElement(
    (_Block || _load_Block()).Block,
    null,
    'Large: ',
    _react.default.createElement((_Badge || _load_Badge()).Badge, { size: (_Badge || _load_Badge()).BadgeSizes.large, value: 123 })
  )
);

const BadgeIconExample = () => _react.default.createElement(
  'div',
  null,
  _react.default.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.default.createElement((_Badge || _load_Badge()).Badge, { icon: 'gear', value: 13 }),
    ' ',
    _react.default.createElement((_Badge || _load_Badge()).Badge, { icon: 'cloud-download', color: (_Badge || _load_Badge()).BadgeColors.info, value: 23 }),
    ' ',
    _react.default.createElement((_Badge || _load_Badge()).Badge, { icon: 'octoface', color: (_Badge || _load_Badge()).BadgeColors.success, value: 42 })
  )
);

const BadgeExamples = exports.BadgeExamples = {
  sectionName: 'Badges',
  description: 'Badges are typically used to display numbers.',
  examples: [{
    title: 'Basic badges',
    component: BadgeBasicExample
  }, {
    title: 'Colored badges',
    component: BadgeColorExample
  }, {
    title: 'Badges with explicit size',
    component: BadgeSizeExample
  }, {
    title: 'Badges with Icons',
    component: BadgeIconExample
  }]
};