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

var _reactForAtom = require('react-for-atom');

var _Block = require('./Block');

var _Toolbar = require('./Toolbar');

var _ToolbarCenter = require('./ToolbarCenter');

var _ToolbarLeft = require('./ToolbarLeft');

var _ToolbarRight = require('./ToolbarRight');

var _Button = require('./Button');

var ToolbarExampleLeft = function ToolbarExampleLeft() {
  return _reactForAtom.React.createElement(
    'div',
    null,
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(
        _Toolbar.Toolbar,
        { location: 'top' },
        _reactForAtom.React.createElement(
          _ToolbarLeft.ToolbarLeft,
          null,
          _reactForAtom.React.createElement(
            'div',
            null,
            'a toolbar can have multiple children,'
          ),
          _reactForAtom.React.createElement(
            _Button.Button,
            null,
            'such as this button.'
          )
        )
      )
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(
        'div',
        null,
        'Be sure to use ',
        '<ToolbarLeft/>, <ToolbarLeft/>, and <ToolbarLeft/>',
        ' as children.'
      )
    )
  );
};

var ToolbarExampleCenter = function ToolbarExampleCenter() {
  return _reactForAtom.React.createElement(
    _Block.Block,
    null,
    _reactForAtom.React.createElement(
      _Toolbar.Toolbar,
      { location: 'top' },
      _reactForAtom.React.createElement(
        _ToolbarCenter.ToolbarCenter,
        null,
        _reactForAtom.React.createElement(
          'div',
          null,
          'Example of ',
          '<ToolbarCenter />',
          '.'
        )
      )
    )
  );
};

var ToolbarExampleRight = function ToolbarExampleRight() {
  return _reactForAtom.React.createElement(
    _Block.Block,
    null,
    _reactForAtom.React.createElement(
      _Toolbar.Toolbar,
      { location: 'top' },
      _reactForAtom.React.createElement(
        _ToolbarRight.ToolbarRight,
        null,
        _reactForAtom.React.createElement(
          'div',
          null,
          'Example of ',
          '<ToolbarRight />'
        )
      )
    )
  );
};

var ToolbarExampleMultiple = function ToolbarExampleMultiple() {
  return _reactForAtom.React.createElement(
    _Block.Block,
    null,
    _reactForAtom.React.createElement(
      _Toolbar.Toolbar,
      { location: 'top' },
      _reactForAtom.React.createElement(
        _ToolbarLeft.ToolbarLeft,
        null,
        _reactForAtom.React.createElement(
          'div',
          null,
          'You can combine'
        )
      ),
      _reactForAtom.React.createElement(
        _ToolbarCenter.ToolbarCenter,
        null,
        _reactForAtom.React.createElement(
          'div',
          null,
          'the various kinds'
        )
      ),
      _reactForAtom.React.createElement(
        _ToolbarRight.ToolbarRight,
        null,
        _reactForAtom.React.createElement(
          'div',
          null,
          'of aligners.'
        )
      )
    )
  );
};

var ToolbarExamples = {
  sectionName: 'Toolbar',
  description: '',
  examples: [{
    title: 'Left Toolbar',
    component: ToolbarExampleLeft
  }, {
    title: 'Center Toolbar',
    component: ToolbarExampleCenter
  }, {
    title: 'Right Toolbar',
    component: ToolbarExampleRight
  }, {
    title: 'Combining Toolbar aligners',
    component: ToolbarExampleMultiple
  }]
};
exports.ToolbarExamples = ToolbarExamples;