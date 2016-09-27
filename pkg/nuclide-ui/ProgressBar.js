Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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

/** A Progressbar for showing deterministic progress. */
var ProgressBar = function ProgressBar(props) {
  return (_reactForAtom2 || _reactForAtom()).React.createElement('progress', _extends({ value: props.value, max: props.max }, props));
};
exports.ProgressBar = ProgressBar;

/**
 * The progress value. If none is provided, the Progressbar will render in `indefinite` mode.
 * Use `indefinite mode` to indicate an initializing period,
 * Prefer using the `LoadingSpinner` component for surfacing non-deterministic progress.
 */

/** Determines the scaling of `value`. `min` is implicitly set to `0`. */