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

var _PathWithFileIcon2;

function _load_PathWithFileIcon2() {
  return _PathWithFileIcon2 = require('./PathWithFileIcon');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ListItem(props) {
  return _react.default.createElement(
    'div',
    { className: 'list-item' },
    props.children
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

function BasicExample() {
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
        _react.default.createElement(
          ListItem,
          null,
          _react.default.createElement((_PathWithFileIcon || _load_PathWithFileIcon()).default, { path: 'maybe/some/javascript.js' })
        ),
        _react.default.createElement(
          ListItem,
          null,
          _react.default.createElement((_PathWithFileIcon || _load_PathWithFileIcon()).default, { path: 'how/about/php.php' })
        ),
        _react.default.createElement(
          ListItem,
          null,
          _react.default.createElement((_PathWithFileIcon || _load_PathWithFileIcon()).default, { path: 'text.txt' })
        ),
        _react.default.createElement(
          ListItem,
          null,
          _react.default.createElement((_PathWithFileIcon || _load_PathWithFileIcon()).default, { path: 'markdown.md' })
        ),
        _react.default.createElement(
          ListItem,
          null,
          _react.default.createElement((_PathWithFileIcon || _load_PathWithFileIcon()).default, { path: 'emptiness' })
        ),
        _react.default.createElement(
          ListItem,
          null,
          _react.default.createElement((_PathWithFileIcon || _load_PathWithFileIcon()).default, { path: '.dotfile' })
        ),
        _react.default.createElement(
          ListItem,
          null,
          _react.default.createElement((_PathWithFileIcon || _load_PathWithFileIcon()).default, { isFolder: true, path: 'how/about/a/folder/' })
        )
      )
    )
  );
}

function DecorationIconExample() {
  return _react.default.createElement(
    'div',
    null,
    _react.default.createElement(
      (_Block || _load_Block()).Block,
      null,
      _react.default.createElement(
        'p',
        null,
        'PathWithFileIcon export a DecorationIcons object containing custom decorations. You can optionally pass one of those decorations to decorate the file icon with e.g. a small AtomIcon:'
      ),
      _react.default.createElement(
        'div',
        null,
        _react.default.createElement(
          ListItem,
          null,
          _react.default.createElement((_PathWithFileIcon || _load_PathWithFileIcon()).default, {
            decorationIcon: (_PathWithFileIcon2 || _load_PathWithFileIcon2()).DecorationIcons.Warning,
            path: 'fileA.js'
          })
        ),
        _react.default.createElement(
          ListItem,
          null,
          _react.default.createElement((_PathWithFileIcon || _load_PathWithFileIcon()).default, {
            decorationIcon: (_PathWithFileIcon2 || _load_PathWithFileIcon2()).DecorationIcons.Error,
            path: 'fileB.js'
          })
        ),
        _react.default.createElement(
          ListItem,
          null,
          _react.default.createElement((_PathWithFileIcon || _load_PathWithFileIcon()).default, {
            decorationIcon: (_PathWithFileIcon2 || _load_PathWithFileIcon2()).DecorationIcons.Warning,
            isFolder: true,
            path: 'folderA'
          })
        ),
        _react.default.createElement(
          ListItem,
          null,
          _react.default.createElement((_PathWithFileIcon || _load_PathWithFileIcon()).default, {
            decorationIcon: (_PathWithFileIcon2 || _load_PathWithFileIcon2()).DecorationIcons.Error,
            isFolder: true,
            path: 'folderB'
          })
        )
      )
    )
  );
}

const PathWithFileIconExamples = exports.PathWithFileIconExamples = {
  sectionName: 'PathWithFileIcon',
  description: 'Renders a file icon for a given path iff the file-icons package is installed.',
  examples: [{
    title: 'File icon wrapper example',
    component: BasicExample
  }, {
    title: 'decorationIcon',
    component: DecorationIconExample
  }]
};