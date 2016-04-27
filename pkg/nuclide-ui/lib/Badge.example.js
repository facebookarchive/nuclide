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

var _Badge = require('./Badge');

var BadgeBasicExample = function BadgeBasicExample() {
  return _reactForAtom.React.createElement(
    'div',
    null,
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_Badge.Badge, { value: 1 }),
      ' ',
      _reactForAtom.React.createElement(_Badge.Badge, { value: 11 }),
      ' ',
      _reactForAtom.React.createElement(_Badge.Badge, { value: 123 })
    )
  );
};

var BadgeColorExample = function BadgeColorExample() {
  return _reactForAtom.React.createElement(
    'div',
    null,
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      'Info: ',
      _reactForAtom.React.createElement(_Badge.Badge, { color: _Badge.BadgeColors.info, value: 123 })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      'Success: ',
      _reactForAtom.React.createElement(_Badge.Badge, { color: _Badge.BadgeColors.success, value: 123 })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      'Warning: ',
      _reactForAtom.React.createElement(_Badge.Badge, { color: _Badge.BadgeColors.warning, value: 123 })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      'Error: ',
      _reactForAtom.React.createElement(_Badge.Badge, { color: _Badge.BadgeColors.error, value: 123 })
    )
  );
};

var BadgeSizeExample = function BadgeSizeExample() {
  return _reactForAtom.React.createElement(
    'div',
    null,
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      'Small: ',
      _reactForAtom.React.createElement(_Badge.Badge, { size: _Badge.BadgeSizes.small, value: 123 })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      'Medium: ',
      _reactForAtom.React.createElement(_Badge.Badge, { size: _Badge.BadgeSizes.medium, value: 123 })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      'Large: ',
      _reactForAtom.React.createElement(_Badge.Badge, { size: _Badge.BadgeSizes.large, value: 123 })
    )
  );
};

var BadgeIconExample = function BadgeIconExample() {
  return _reactForAtom.React.createElement(
    'div',
    null,
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_Badge.Badge, { icon: 'gear', value: 13 }),
      ' ',
      _reactForAtom.React.createElement(_Badge.Badge, { icon: 'cloud-download', color: _Badge.BadgeColors.info, value: 23 }),
      ' ',
      _reactForAtom.React.createElement(_Badge.Badge, { icon: 'octoface', color: _Badge.BadgeColors.success, value: 42 })
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