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

// This file contains RPC definitions for jediserver.py.

var get_completions = _asyncToGenerator(function* (src, contents, line, column) {
  throw new Error('RPC Stub');
});

exports.get_completions = get_completions;

var get_definitions = _asyncToGenerator(function* (src, contents, line, column) {
  throw new Error('RPC Stub');
});

exports.get_definitions = get_definitions;

var get_references = _asyncToGenerator(function* (src, contents, line, column) {
  throw new Error('RPC Stub');
});

exports.get_references = get_references;
exports.get_outline = get_outline;
exports.add_paths = add_paths;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function get_outline(src, contents) {
  throw new Error('RPC Stub');
}

function add_paths(paths) {
  throw new Error('RPC Stub');
}

// Class params, i.e. superclasses.