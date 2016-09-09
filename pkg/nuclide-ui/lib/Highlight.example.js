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

var _Highlight2;

function _Highlight() {
  return _Highlight2 = require('./Highlight');
}

var HighlightExample = function HighlightExample() {
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'div',
    null,
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Block2 || _Block()).Block,
      null,
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_Highlight2 || _Highlight()).Highlight,
        null,
        'Default'
      )
    ),
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Block2 || _Block()).Block,
      null,
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_Highlight2 || _Highlight()).Highlight,
        { color: (_Highlight2 || _Highlight()).HighlightColors.info },
        'Info'
      )
    ),
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Block2 || _Block()).Block,
      null,
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_Highlight2 || _Highlight()).Highlight,
        { color: (_Highlight2 || _Highlight()).HighlightColors.success },
        'Success'
      )
    ),
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Block2 || _Block()).Block,
      null,
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_Highlight2 || _Highlight()).Highlight,
        { color: (_Highlight2 || _Highlight()).HighlightColors.warning },
        'Warning'
      )
    ),
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Block2 || _Block()).Block,
      null,
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_Highlight2 || _Highlight()).Highlight,
        { color: (_Highlight2 || _Highlight()).HighlightColors.error },
        'Error'
      )
    )
  );
};

var HighlightExamples = {
  sectionName: 'Highlight',
  description: 'Highlights are useful for calling out inline content, such as tags.',
  examples: [{
    title: 'Highlights',
    component: HighlightExample
  }]
};
exports.HighlightExamples = HighlightExamples;