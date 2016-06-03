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

var _Badge2;

function _Badge() {
  return _Badge2 = require('./Badge');
}

var BadgeBasicExample = function BadgeBasicExample() {
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'div',
    null,
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Block2 || _Block()).Block,
      null,
      (_reactForAtom2 || _reactForAtom()).React.createElement((_Badge2 || _Badge()).Badge, { value: 1 }),
      ' ',
      (_reactForAtom2 || _reactForAtom()).React.createElement((_Badge2 || _Badge()).Badge, { value: 11 }),
      ' ',
      (_reactForAtom2 || _reactForAtom()).React.createElement((_Badge2 || _Badge()).Badge, { value: 123 })
    )
  );
};

var BadgeColorExample = function BadgeColorExample() {
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'div',
    null,
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Block2 || _Block()).Block,
      null,
      'Info: ',
      (_reactForAtom2 || _reactForAtom()).React.createElement((_Badge2 || _Badge()).Badge, { color: (_Badge2 || _Badge()).BadgeColors.info, value: 123 })
    ),
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Block2 || _Block()).Block,
      null,
      'Success: ',
      (_reactForAtom2 || _reactForAtom()).React.createElement((_Badge2 || _Badge()).Badge, { color: (_Badge2 || _Badge()).BadgeColors.success, value: 123 })
    ),
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Block2 || _Block()).Block,
      null,
      'Warning: ',
      (_reactForAtom2 || _reactForAtom()).React.createElement((_Badge2 || _Badge()).Badge, { color: (_Badge2 || _Badge()).BadgeColors.warning, value: 123 })
    ),
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Block2 || _Block()).Block,
      null,
      'Error: ',
      (_reactForAtom2 || _reactForAtom()).React.createElement((_Badge2 || _Badge()).Badge, { color: (_Badge2 || _Badge()).BadgeColors.error, value: 123 })
    )
  );
};

var BadgeSizeExample = function BadgeSizeExample() {
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'div',
    null,
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Block2 || _Block()).Block,
      null,
      'Small: ',
      (_reactForAtom2 || _reactForAtom()).React.createElement((_Badge2 || _Badge()).Badge, { size: (_Badge2 || _Badge()).BadgeSizes.small, value: 123 })
    ),
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Block2 || _Block()).Block,
      null,
      'Medium: ',
      (_reactForAtom2 || _reactForAtom()).React.createElement((_Badge2 || _Badge()).Badge, { size: (_Badge2 || _Badge()).BadgeSizes.medium, value: 123 })
    ),
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Block2 || _Block()).Block,
      null,
      'Large: ',
      (_reactForAtom2 || _reactForAtom()).React.createElement((_Badge2 || _Badge()).Badge, { size: (_Badge2 || _Badge()).BadgeSizes.large, value: 123 })
    )
  );
};

var BadgeIconExample = function BadgeIconExample() {
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'div',
    null,
    (_reactForAtom2 || _reactForAtom()).React.createElement(
      (_Block2 || _Block()).Block,
      null,
      (_reactForAtom2 || _reactForAtom()).React.createElement((_Badge2 || _Badge()).Badge, { icon: 'gear', value: 13 }),
      ' ',
      (_reactForAtom2 || _reactForAtom()).React.createElement((_Badge2 || _Badge()).Badge, { icon: 'cloud-download', color: (_Badge2 || _Badge()).BadgeColors.info, value: 23 }),
      ' ',
      (_reactForAtom2 || _reactForAtom()).React.createElement((_Badge2 || _Badge()).Badge, { icon: 'octoface', color: (_Badge2 || _Badge()).BadgeColors.success, value: 42 })
    )
  );
};

var BadgeExamples = {
  sectionName: 'Badges',
  description: 'Badges are typically used to display numbers.',
  examples: [{
    title: 'Basic badges',
    component: BadgeBasicExample
  }, {
    title: 'Colored badges',
    component: BadgeColorExample
  }, {
    title: 'Badges with explicit size',
    component: BadgeSizeExample
  }, {
    title: 'Badges with Icons',
    component: BadgeIconExample
  }]
};
exports.BadgeExamples = BadgeExamples;