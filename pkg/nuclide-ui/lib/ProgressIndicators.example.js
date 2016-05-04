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

var _ProgressBar = require('./ProgressBar');

var _LoadingSpinner = require('./LoadingSpinner');

var ProgressBarExample = function ProgressBarExample() {
  return _reactForAtom.React.createElement(
    'div',
    null,
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_ProgressBar.ProgressBar, null)
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_ProgressBar.ProgressBar, { max: 100, value: 0 })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_ProgressBar.ProgressBar, { max: 100, value: 50 })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_ProgressBar.ProgressBar, { max: 100, value: 100 })
    )
  );
};

var LoadingSpinnerExample = function LoadingSpinnerExample() {
  return _reactForAtom.React.createElement(
    'div',
    null,
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_LoadingSpinner.LoadingSpinner, { size: 'EXTRA_SMALL' })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_LoadingSpinner.LoadingSpinner, { size: 'SMALL' })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_LoadingSpinner.LoadingSpinner, { size: 'MEDIUM' })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_LoadingSpinner.LoadingSpinner, { size: 'LARGE' })
    )
  );
};

var ProgressIndicatorExamples = {
  sectionName: 'Progress Indicators',
  description: 'Show that work is being performed. Consider using one of these for any work > 1s.',
  examples: [{
    title: 'ProgressBar',
    component: ProgressBarExample
  }, {
    title: 'LoadingSpinner',
    component: LoadingSpinnerExample
  }]
};
exports.ProgressIndicatorExamples = ProgressIndicatorExamples;