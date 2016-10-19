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

var _Icon;

function _load_Icon() {
  return _Icon = require('./Icon');
}

var IconExample = function IconExample() {
  return (_reactForAtom || _load_reactForAtom()).React.createElement(
    'div',
    null,
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_Block || _load_Block()).Block,
      null,
      (_reactForAtom || _load_reactForAtom()).React.createElement((_Icon || _load_Icon()).Icon, { icon: 'gift' }),
      (_reactForAtom || _load_reactForAtom()).React.createElement((_Icon || _load_Icon()).Icon, { icon: 'heart' }),
      (_reactForAtom || _load_reactForAtom()).React.createElement((_Icon || _load_Icon()).Icon, { icon: 'info' })
    )
  );
};

var IconWithTextExample = function IconWithTextExample() {
  return (_reactForAtom || _load_reactForAtom()).React.createElement(
    'div',
    null,
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_Block || _load_Block()).Block,
      null,
      (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        null,
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_Icon || _load_Icon()).Icon,
          { icon: 'gift' },
          'gift'
        )
      ),
      (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        null,
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_Icon || _load_Icon()).Icon,
          { icon: 'heart' },
          'heart'
        )
      ),
      (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        null,
        (_reactForAtom || _load_reactForAtom()).React.createElement(
          (_Icon || _load_Icon()).Icon,
          { icon: 'info' },
          'info'
        )
      )
    )
  );
};

var IconExamples = {
  sectionName: 'Icons',
  description: 'Octicons with optional text.',
  examples: [{
    title: 'Icons',
    component: IconExample
  }, {
    title: 'You can pass optional text as children.',
    component: IconWithTextExample
  }]
};
exports.IconExamples = IconExamples;