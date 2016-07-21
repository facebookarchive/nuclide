Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _Block2;

function _Block() {
  return _Block2 = require('./Block');
}

var _Icon2;

function _Icon() {
  return _Icon2 = require('./Icon');
}

var _Tree2;

function _Tree() {
  return _Tree2 = require('./Tree');
}

var BasicTreeExample = function BasicTreeExample() {
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'div',
    null,
    'Trees',
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Block2 || _Block()).Block,
      null,
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_Tree2 || _Tree()).TreeList,
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Tree2 || _Tree()).TreeItem,
          null,
          'TreeItem 1'
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Tree2 || _Tree()).TreeItem,
          null,
          'TreeItem 2'
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Tree2 || _Tree()).NestedTreeItem,
          { title: (_reactForAtom2 || _reactForAtom()).React.createElement(
              'span',
              null,
              'NestedTreeItem 1'
            ), selected: true },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_Tree2 || _Tree()).TreeItem,
            null,
            'TreeItem 3'
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_Tree2 || _Tree()).TreeItem,
            null,
            'TreeItem 4'
          )
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement((_Tree2 || _Tree()).NestedTreeItem, { title: (_reactForAtom2 || _reactForAtom()).React.createElement(
            'span',
            null,
            'NestedTreeItem 2'
          ), collapsed: true })
      )
    )
  );
};

var AtomStyleguideTreeExample = function AtomStyleguideTreeExample() {
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    (_Block2 || _Block()).Block,
    null,
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Tree2 || _Tree()).TreeList,
      { showArrows: true },
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_Tree2 || _Tree()).NestedTreeItem,
        {
          title: (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_Icon2 || _Icon()).Icon,
            { icon: 'file-directory' },
            'A Directory'
          ) },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Tree2 || _Tree()).NestedTreeItem,
          {
            collapsed: false,
            title: (_reactForAtom2 || _reactForAtom()).React.createElement(
              (_Icon2 || _Icon()).Icon,
              { icon: 'file-directory' },
              'Nested Directory'
            ) },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_Tree2 || _Tree()).TreeItem,
            null,
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              (_Icon2 || _Icon()).Icon,
              { icon: 'file-text' },
              'File one'
            )
          )
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Tree2 || _Tree()).NestedTreeItem,
          {
            collapsed: true,
            title: (_reactForAtom2 || _reactForAtom()).React.createElement(
              (_Icon2 || _Icon()).Icon,
              { icon: 'file-directory' },
              'Collapsed Nested Directory'
            ) },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_Tree2 || _Tree()).TreeItem,
            null,
            (_reactForAtom2 || _reactForAtom()).React.createElement(
              (_Icon2 || _Icon()).Icon,
              { icon: 'file-text' },
              'File one'
            )
          )
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Tree2 || _Tree()).TreeItem,
          null,
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_Icon2 || _Icon()).Icon,
            { icon: 'file-text' },
            'File one'
          )
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Tree2 || _Tree()).TreeItem,
          { selected: true },
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_Icon2 || _Icon()).Icon,
            { icon: 'file-text' },
            'File three .selected!'
          )
        )
      ),
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_Tree2 || _Tree()).TreeItem,
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Icon2 || _Icon()).Icon,
          { icon: 'file-text' },
          '.icon-file-text'
        )
      ),
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_Tree2 || _Tree()).TreeItem,
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Icon2 || _Icon()).Icon,
          { icon: 'file-symlink-file' },
          '.icon-file-symlink-file'
        )
      )
    )
  );
};

var TreeExamples = {
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
exports.TreeExamples = TreeExamples;