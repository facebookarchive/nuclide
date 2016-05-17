Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = getInitialState;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _immutable2;

function _immutable() {
  return _immutable2 = _interopRequireDefault(require('immutable'));
}

/**
 * Get the initial state of the gadgets app.
 * TODO: Get this from deserialization.
 */

function getInitialState() {
  return (_immutable2 || _immutable()).default.Map({
    gadgets: (_immutable2 || _immutable()).default.Map(),
    components: (_immutable2 || _immutable()).default.Map(),
    props: (_immutable2 || _immutable()).default.Map()
  });
}

module.exports = exports.default;