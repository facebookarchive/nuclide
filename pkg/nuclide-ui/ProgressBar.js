'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProgressBar = undefined;

var _reactForAtom = require('react-for-atom');

/** A Progressbar for showing deterministic progress. */
const ProgressBar = exports.ProgressBar = props => _reactForAtom.React.createElement('progress', Object.assign({ value: props.value, max: props.max }, props));