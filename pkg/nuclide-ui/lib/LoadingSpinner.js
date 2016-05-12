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

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var LoadingSpinnerSizes = Object.freeze({
  EXTRA_SMALL: 'EXTRA_SMALL',
  SMALL: 'SMALL',
  MEDIUM: 'MEDIUM',
  LARGE: 'LARGE'
});

exports.LoadingSpinnerSizes = LoadingSpinnerSizes;
var LoadingSpinnerClassnames = Object.freeze({
  EXTRA_SMALL: 'loading-spinner-tiny',
  SMALL: 'loading-spinner-small',
  MEDIUM: 'loading-spinner-medium',
  LARGE: 'loading-spinner-large'
});

/**
 * Shows an indefinite, animated LoadingSpinner.
 */
var LoadingSpinner = function LoadingSpinner(props) {
  var className = props.className;
  var size = props.size;

  var safeSize = size != null && LoadingSpinnerSizes.hasOwnProperty(size) ? size : LoadingSpinnerSizes.MEDIUM;
  var sizeClassname = LoadingSpinnerClassnames[safeSize];
  var newClassName = (0, (_classnames2 || _classnames()).default)(className, 'loading', sizeClassname);
  return (_reactForAtom2 || _reactForAtom()).React.createElement('div', { className: newClassName });
};
exports.LoadingSpinner = LoadingSpinner;

/** The size of the LoadingSpinner. Defaults to MEDIUM. */