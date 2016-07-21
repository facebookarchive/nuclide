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

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

function getElement() {
  var element = atom.views.getView(atom.workspace).querySelector('.nuclide-busy-signal-status-bar');
  (0, (_assert2 || _assert()).default)(element != null);
  return element;
}

exports.default = {
  isBusy: function isBusy() {
    return getElement().classList.contains('loading-spinner-tiny');
  }
};
module.exports = exports.default;