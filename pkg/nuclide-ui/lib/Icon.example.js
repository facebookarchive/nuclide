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

var IconExample = function IconExample() {
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'div',
    null,
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Block2 || _Block()).Block,
      null,
      (_reactForAtom2 || _reactForAtom()).React.createElement((_Icon2 || _Icon()).Icon, { icon: 'gift' }),
      (_reactForAtom2 || _reactForAtom()).React.createElement((_Icon2 || _Icon()).Icon, { icon: 'heart' }),
      (_reactForAtom2 || _reactForAtom()).React.createElement((_Icon2 || _Icon()).Icon, { icon: 'info' })
    )
  );
};

var IconWithTextExample = function IconWithTextExample() {
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'div',
    null,
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Block2 || _Block()).Block,
      null,
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Icon2 || _Icon()).Icon,
          { icon: 'gift' },
          'gift'
        )
      ),
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Icon2 || _Icon()).Icon,
          { icon: 'heart' },
          'heart'
        )
      ),
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          (_Icon2 || _Icon()).Icon,
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