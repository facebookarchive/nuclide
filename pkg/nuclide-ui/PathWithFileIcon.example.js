'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PathWithFileIconExamples = undefined;

var _react = _interopRequireWildcard(require('react'));

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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function ListItem(props) {
  return (
    // $FlowFixMe(>=0.53.0) Flow suppress
    _react.createElement(
      'div',
      { className: 'list-item' },
      props.children
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

function BasicExample() {
  return _react.createElement(
    'div',
    null,
    _react.createElement(
      (_Block || _load_Block()).Block,
      null,
      _react.createElement(
        'p',
        null,
        'Simply wrap paths in <PathWithFileIcon /> to get the appropriate icons:'
      ),
      _react.createElement(
        'div',
        null,
        _react.createElement(
          ListItem,
          null,
          _react.createElement((_PathWithFileIcon || _load_PathWithFileIcon()).default, { path: 'maybe/some/javascript.js' })
        ),
        _react.createElement(
          ListItem,
          null,
          _react.createElement((_PathWithFileIcon || _load_PathWithFileIcon()).default, { path: 'how/about/php.php' })
        ),
        _react.createElement(
          ListItem,
          null,
          _react.createElement((_PathWithFileIcon || _load_PathWithFileIcon()).default, { path: 'text.txt' })
        ),
        _react.createElement(
          ListItem,
          null,
          _react.createElement((_PathWithFileIcon || _load_PathWithFileIcon()).default, { path: 'markdown.md' })
        ),
        _react.createElement(
          ListItem,
          null,
          _react.createElement((_PathWithFileIcon || _load_PathWithFileIcon()).default, { path: 'emptiness' })
        ),
        _react.createElement(
          ListItem,
          null,
          _react.createElement((_PathWithFileIcon || _load_PathWithFileIcon()).default, { path: '.dotfile' })
        ),
        _react.createElement(
          ListItem,
          null,
          _react.createElement((_PathWithFileIcon || _load_PathWithFileIcon()).default, { isFolder: true, path: 'how/about/a/folder/' })
        )
      )
    )
  );
}

function DecorationIconExample() {
  return _react.createElement(
    'div',
    null,
    _react.createElement(
      (_Block || _load_Block()).Block,
      null,
      _react.createElement(
        'p',
        null,
        'PathWithFileIcon export a DecorationIcons object containing custom decorations. You can optionally pass one of those decorations to decorate the file icon with e.g. a small AtomIcon:'
      ),
      _react.createElement(
        'div',
        null,
        _react.createElement(
          ListItem,
          null,
          _react.createElement((_PathWithFileIcon || _load_PathWithFileIcon()).default, {
            decorationIcon: (_PathWithFileIcon2 || _load_PathWithFileIcon2()).DecorationIcons.Warning,
            path: 'fileA.js'
          })
        ),
        _react.createElement(
          ListItem,
          null,
          _react.createElement((_PathWithFileIcon || _load_PathWithFileIcon()).default, {
            decorationIcon: (_PathWithFileIcon2 || _load_PathWithFileIcon2()).DecorationIcons.Error,
            path: 'fileB.js'
          })
        ),
        _react.createElement(
          ListItem,
          null,
          _react.createElement((_PathWithFileIcon || _load_PathWithFileIcon()).default, {
            decorationIcon: (_PathWithFileIcon2 || _load_PathWithFileIcon2()).DecorationIcons.Warning,
            isFolder: true,
            path: 'folderA'
          })
        ),
        _react.createElement(
          ListItem,
          null,
          _react.createElement((_PathWithFileIcon || _load_PathWithFileIcon()).default, {
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