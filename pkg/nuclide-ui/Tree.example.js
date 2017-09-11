'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TreeExamples = undefined;

var _react = _interopRequireWildcard(require('react'));

var _Block;

function _load_Block() {
  return _Block = require('nuclide-commons-ui/Block');
}

var _Icon;

function _load_Icon() {
  return _Icon = require('nuclide-commons-ui/Icon');
}

var _Tree;

function _load_Tree() {
  return _Tree = require('./Tree');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

const BasicTreeExample = () => _react.createElement(
  'div',
  null,
  'Trees',
  _react.createElement(
    (_Block || _load_Block()).Block,
    null,
    _react.createElement(
      (_Tree || _load_Tree()).TreeList,
      null,
      _react.createElement(
        (_Tree || _load_Tree()).TreeItem,
        null,
        'TreeItem 1'
      ),
      _react.createElement(
        (_Tree || _load_Tree()).TreeItem,
        null,
        'TreeItem 2'
      ),
      _react.createElement(
        (_Tree || _load_Tree()).NestedTreeItem,
        { title: _react.createElement(
            'span',
            null,
            'NestedTreeItem 1'
          ), selected: true },
        _react.createElement(
          (_Tree || _load_Tree()).TreeItem,
          null,
          'TreeItem 3'
        ),
        _react.createElement(
          (_Tree || _load_Tree()).TreeItem,
          null,
          'TreeItem 4'
        )
      ),
      _react.createElement((_Tree || _load_Tree()).NestedTreeItem, {
        title: _react.createElement(
          'span',
          null,
          'NestedTreeItem 2'
        ),
        collapsed: true
      })
    )
  )
);

const AtomStyleguideTreeExample = () => _react.createElement(
  (_Block || _load_Block()).Block,
  null,
  _react.createElement(
    (_Tree || _load_Tree()).TreeList,
    { showArrows: true },
    _react.createElement(
      (_Tree || _load_Tree()).NestedTreeItem,
      { title: _react.createElement(
          (_Icon || _load_Icon()).Icon,
          { icon: 'file-directory' },
          'A Directory'
        ) },
      _react.createElement(
        (_Tree || _load_Tree()).NestedTreeItem,
        {
          collapsed: false,
          title: _react.createElement(
            (_Icon || _load_Icon()).Icon,
            { icon: 'file-directory' },
            'Nested Directory'
          ) },
        _react.createElement(
          (_Tree || _load_Tree()).TreeItem,
          null,
          _react.createElement(
            (_Icon || _load_Icon()).Icon,
            { icon: 'file-text' },
            'File one'
          )
        )
      ),
      _react.createElement(
        (_Tree || _load_Tree()).NestedTreeItem,
        {
          collapsed: true,
          title: _react.createElement(
            (_Icon || _load_Icon()).Icon,
            { icon: 'file-directory' },
            'Collapsed Nested Directory'
          ) },
        _react.createElement(
          (_Tree || _load_Tree()).TreeItem,
          null,
          _react.createElement(
            (_Icon || _load_Icon()).Icon,
            { icon: 'file-text' },
            'File one'
          )
        )
      ),
      _react.createElement(
        (_Tree || _load_Tree()).TreeItem,
        null,
        _react.createElement(
          (_Icon || _load_Icon()).Icon,
          { icon: 'file-text' },
          'File one'
        )
      ),
      _react.createElement(
        (_Tree || _load_Tree()).TreeItem,
        { selected: true },
        _react.createElement(
          (_Icon || _load_Icon()).Icon,
          { icon: 'file-text' },
          'File three .selected!'
        )
      )
    ),
    _react.createElement(
      (_Tree || _load_Tree()).TreeItem,
      null,
      _react.createElement(
        (_Icon || _load_Icon()).Icon,
        { icon: 'file-text' },
        '.icon-file-text'
      )
    ),
    _react.createElement(
      (_Tree || _load_Tree()).TreeItem,
      null,
      _react.createElement(
        (_Icon || _load_Icon()).Icon,
        { icon: 'file-symlink-file' },
        '.icon-file-symlink-file'
      )
    )
  )
);

const TreeExamples = exports.TreeExamples = {
  sectionName: 'Trees',
  description: 'Expandable, hierarchical lists.',
  examples: [{
    title: 'Basic Tree',
    component: BasicTreeExample
  }, {
    title: 'Reproducing the Atom style guide example:',
    component: AtomStyleguideTreeExample
  }]
};