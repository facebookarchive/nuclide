Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

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

var _RelativeDate2;

function _RelativeDate() {
  return _RelativeDate2 = _interopRequireDefault(require('./RelativeDate'));
}

var RelativeDateExample = function RelativeDateExample() {
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'div',
    null,
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Block2 || _Block()).Block,
      null,
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        null,
        'Updated every 10 seconds (default): "',
        (_reactForAtom2 || _reactForAtom()).React.createElement((_RelativeDate2 || _RelativeDate()).default, { date: new Date() }),
        '"'
      ),
      (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        null,
        'Updated every 1 second: "',
        (_reactForAtom2 || _reactForAtom()).React.createElement((_RelativeDate2 || _RelativeDate()).default, { date: new Date(), delay: 1000 }),
        '"'
      )
    )
  );
};

var RelativeDateExamples = {
  sectionName: 'Relative Date',
  description: 'Renders and periodically updates a relative date string.',
  examples: [{
    title: 'Simple relative date',
    component: RelativeDateExample
  }]
};
exports.RelativeDateExamples = RelativeDateExamples;