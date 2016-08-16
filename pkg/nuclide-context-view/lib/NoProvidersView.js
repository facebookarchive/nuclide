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

/**
 * This view is rendered when no context providers are registered.
 */
var NoProvidersView = function NoProvidersView() {
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'div',
    null,
    'No providers registered!'
  );
};
exports.NoProvidersView = NoProvidersView;