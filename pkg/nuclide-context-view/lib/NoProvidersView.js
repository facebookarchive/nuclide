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
exports.NoProvidersView = undefined;

var _reactForAtom = require('react-for-atom');

/**
 * This view is rendered when no context providers are registered.
 */
const NoProvidersView = exports.NoProvidersView = () => {
  return _reactForAtom.React.createElement(
    'div',
    null,
    'No providers registered!'
  );
};