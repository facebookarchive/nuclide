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

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _Block;

function _load_Block() {
  return _Block = require('./Block');
}

var _RelativeDate;

function _load_RelativeDate() {
  return _RelativeDate = _interopRequireDefault(require('./RelativeDate'));
}

var RelativeDateExample = function RelativeDateExample() {
  return (_reactForAtom || _load_reactForAtom()).React.createElement(
    'div',
    null,
    (_reactForAtom || _load_reactForAtom()).React.createElement(
      (_Block || _load_Block()).Block,
      null,
      (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        null,
        'Updated every 10 seconds (default): "',
        (_reactForAtom || _load_reactForAtom()).React.createElement((_RelativeDate || _load_RelativeDate()).default, { date: new Date() }),
        '"'
      ),
      (_reactForAtom || _load_reactForAtom()).React.createElement(
        'div',
        null,
        'Updated every 1 second: "',
        (_reactForAtom || _load_reactForAtom()).React.createElement((_RelativeDate || _load_RelativeDate()).default, { date: new Date(), delay: 1000 }),
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