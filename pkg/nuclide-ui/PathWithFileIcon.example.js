'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PathWithFileIconExamples = undefined;

var _react = _interopRequireDefault(require('react'));

var _Block;

function _load_Block() {
  return _Block = require('nuclide-commons-ui/Block');
}

var _PathWithFileIcon;

function _load_PathWithFileIcon() {
  return _PathWithFileIcon = _interopRequireDefault(require('./PathWithFileIcon'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function PathWithFileIconExample() {
  return _react.default.createElement(
    'div',
    null,
    _react.default.createElement(
      (_Block || _load_Block()).Block,
      null,
      _react.default.createElement(
        'p',
        null,
        'Simply wrap paths in <PathWithFileIcon /> to get the appropriate icons:'
      ),
      _react.default.createElement(
        'div',
        null,
        _react.default.createElement((_PathWithFileIcon || _load_PathWithFileIcon()).default, { path: 'maybe/some/javascript.js' }),
        _react.default.createElement((_PathWithFileIcon || _load_PathWithFileIcon()).default, { path: 'how/about/php.php' }),
        _react.default.createElement((_PathWithFileIcon || _load_PathWithFileIcon()).default, { path: 'text.txt' }),
        _react.default.createElement((_PathWithFileIcon || _load_PathWithFileIcon()).default, { path: 'markdown.md' }),
        _react.default.createElement((_PathWithFileIcon || _load_PathWithFileIcon()).default, { path: 'emptiness' }),
        _react.default.createElement((_PathWithFileIcon || _load_PathWithFileIcon()).default, { path: '.dotfile' }),
        _react.default.createElement((_PathWithFileIcon || _load_PathWithFileIcon()).default, { isFolder: true, path: 'how/about/a/folder/' })
      )
    )
  );
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

const PathWithFileIconExamples = exports.PathWithFileIconExamples = {
  sectionName: 'PathWithFileIcon',
  description: 'Renders a file icon for a given path iff the file-icons package is installed.',
  examples: [{
    title: 'File icon wrapper example',
    component: PathWithFileIconExample
  }]
};