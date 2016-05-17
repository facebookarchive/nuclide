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

var _Toolbar2;

function _Toolbar() {
  return _Toolbar2 = require('./Toolbar');
}

var _ToolbarCenter2;

function _ToolbarCenter() {
  return _ToolbarCenter2 = require('./ToolbarCenter');
}

var _ToolbarLeft2;

function _ToolbarLeft() {
  return _ToolbarLeft2 = require('./ToolbarLeft');
}

var _ToolbarRight2;

function _ToolbarRight() {
  return _ToolbarRight2 = require('./ToolbarRight');
}

var _Button2;

function _Button() {
  return _Button2 = require('./Button');
}

var ToolbarExampleLeft = function ToolbarExampleLeft() {
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'div',
    null,
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Block2 || _Block()).Block,
      null,
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_Toolbar2 || _Toolbar()).Toolbar,
        { location: 'top' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_ToolbarLeft2 || _ToolbarLeft()).ToolbarLeft,
          null,
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'div',
            null,
            'a toolbar can have multiple children,'
          ),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            (_Button2 || _Button()).Button,
            null,
            'such as this button.'
          )
        )
      )
    ),
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Block2 || _Block()).Block,
      null,
      (_reactForAtom2 || _reactForAtom()).React.createElement(
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
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    (_Block2 || _Block()).Block,
    null,
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Toolbar2 || _Toolbar()).Toolbar,
      { location: 'top' },
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_ToolbarCenter2 || _ToolbarCenter()).ToolbarCenter,
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement(
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
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    (_Block2 || _Block()).Block,
    null,
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Toolbar2 || _Toolbar()).Toolbar,
      { location: 'top' },
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_ToolbarRight2 || _ToolbarRight()).ToolbarRight,
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement(
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
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    (_Block2 || _Block()).Block,
    null,
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Toolbar2 || _Toolbar()).Toolbar,
      { location: 'top' },
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_ToolbarLeft2 || _ToolbarLeft()).ToolbarLeft,
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          null,
          'You can combine'
        )
      ),
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_ToolbarCenter2 || _ToolbarCenter()).ToolbarCenter,
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          null,
          'the various kinds'
        )
      ),
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_ToolbarRight2 || _ToolbarRight()).ToolbarRight,
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement(
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