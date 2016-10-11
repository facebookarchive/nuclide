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

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _Block;

function _load_Block() {
  return _Block = require('./Block');
}

var _Highlight;

function _load_Highlight() {
  return _Highlight = require('./Highlight');
}

var HighlightExample = function HighlightExample() {
  return (_reactForAtom || _load_reactForAtom()).React.createElement(
    'div',
    null,
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_Block || _load_Block()).Block,
      null,
      (_reactForAtom || _load_reactForAtom()).React.createElement(
        (_Highlight || _load_Highlight()).Highlight,
        null,
        'Default'
      )
    ),
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_Block || _load_Block()).Block,
      null,
      (_reactForAtom || _load_reactForAtom()).React.createElement(
        (_Highlight || _load_Highlight()).Highlight,
        { color: (_Highlight || _load_Highlight()).HighlightColors.info },
        'Info'
      )
    ),
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_Block || _load_Block()).Block,
      null,
      (_reactForAtom || _load_reactForAtom()).React.createElement(
        (_Highlight || _load_Highlight()).Highlight,
        { color: (_Highlight || _load_Highlight()).HighlightColors.success },
        'Success'
      )
    ),
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_Block || _load_Block()).Block,
      null,
      (_reactForAtom || _load_reactForAtom()).React.createElement(
        (_Highlight || _load_Highlight()).Highlight,
        { color: (_Highlight || _load_Highlight()).HighlightColors.warning },
        'Warning'
      )
    ),
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_Block || _load_Block()).Block,
      null,
      (_reactForAtom || _load_reactForAtom()).React.createElement(
        (_Highlight || _load_Highlight()).Highlight,
        { color: (_Highlight || _load_Highlight()).HighlightColors.error },
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