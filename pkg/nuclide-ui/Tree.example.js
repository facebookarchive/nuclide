'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TreeExamples = undefined;

var _reactForAtom = require('react-for-atom');

var _Block;

function _load_Block() {
  return _Block = require('./Block');
}

var _Icon;

function _load_Icon() {
  return _Icon = require('./Icon');
}

var _Tree;

function _load_Tree() {
  return _Tree = require('./Tree');
}

const BasicTreeExample = () => _reactForAtom.React.createElement(
  'div',
  null,
  'Trees',
  _reactForAtom.React.createElement(
    (_Block || _load_Block()).Block,
    null,
    _reactForAtom.React.createElement(
      (_Tree || _load_Tree()).TreeList,
      null,
      _reactForAtom.React.createElement(
        (_Tree || _load_Tree()).TreeItem,
        null,
        'TreeItem 1'
      ),
      _reactForAtom.React.createElement(
        (_Tree || _load_Tree()).TreeItem,
        null,
        'TreeItem 2'
      ),
      _reactForAtom.React.createElement(
        (_Tree || _load_Tree()).NestedTreeItem,
        { title: _reactForAtom.React.createElement(
            'span',
            null,
            'NestedTreeItem 1'
          ), selected: true },
        _reactForAtom.React.createElement(
          (_Tree || _load_Tree()).TreeItem,
          null,
          'TreeItem 3'
        ),
        _reactForAtom.React.createElement(
          (_Tree || _load_Tree()).TreeItem,
          null,
          'TreeItem 4'
        )
      ),
      _reactForAtom.React.createElement((_Tree || _load_Tree()).NestedTreeItem, { title: _reactForAtom.React.createElement(
          'span',
          null,
          'NestedTreeItem 2'
        ), collapsed: true })
    )
  )
);

const AtomStyleguideTreeExample = () => _reactForAtom.React.createElement(
  (_Block || _load_Block()).Block,
  null,
  _reactForAtom.React.createElement(
    (_Tree || _load_Tree()).TreeList,
    { showArrows: true },
    _reactForAtom.React.createElement(
      (_Tree || _load_Tree()).NestedTreeItem,
      {
        title: _reactForAtom.React.createElement(
          (_Icon || _load_Icon()).Icon,
          { icon: 'file-directory' },
          'A Directory'
        ) },
      _reactForAtom.React.createElement(
        (_Tree || _load_Tree()).NestedTreeItem,
        {
          collapsed: false,
          title: _reactForAtom.React.createElement(
            (_Icon || _load_Icon()).Icon,
            { icon: 'file-directory' },
            'Nested Directory'
          ) },
        _reactForAtom.React.createElement(
          (_Tree || _load_Tree()).TreeItem,
          null,
          _reactForAtom.React.createElement(
            (_Icon || _load_Icon()).Icon,
            { icon: 'file-text' },
            'File one'
          )
        )
      ),
      _reactForAtom.React.createElement(
        (_Tree || _load_Tree()).NestedTreeItem,
        {
          collapsed: true,
          title: _reactForAtom.React.createElement(
            (_Icon || _load_Icon()).Icon,
            { icon: 'file-directory' },
            'Collapsed Nested Directory'
          ) },
        _reactForAtom.React.createElement(
          (_Tree || _load_Tree()).TreeItem,
          null,
          _reactForAtom.React.createElement(
            (_Icon || _load_Icon()).Icon,
            { icon: 'file-text' },
            'File one'
          )
        )
      ),
      _reactForAtom.React.createElement(
        (_Tree || _load_Tree()).TreeItem,
        null,
        _reactForAtom.React.createElement(
          (_Icon || _load_Icon()).Icon,
          { icon: 'file-text' },
          'File one'
        )
      ),
      _reactForAtom.React.createElement(
        (_Tree || _load_Tree()).TreeItem,
        { selected: true },
        _reactForAtom.React.createElement(
          (_Icon || _load_Icon()).Icon,
          { icon: 'file-text' },
          'File three .selected!'
        )
      )
    ),
    _reactForAtom.React.createElement(
      (_Tree || _load_Tree()).TreeItem,
      null,
      _reactForAtom.React.createElement(
        (_Icon || _load_Icon()).Icon,
        { icon: 'file-text' },
        '.icon-file-text'
      )
    ),
    _reactForAtom.React.createElement(
      (_Tree || _load_Tree()).TreeItem,
      null,
      _reactForAtom.React.createElement(
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