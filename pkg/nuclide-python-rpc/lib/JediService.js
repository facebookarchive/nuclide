'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.get_completions = get_completions;
exports.get_definitions = get_definitions;
exports.get_references = get_references;
exports.get_hover = get_hover;
exports.get_outline = get_outline;
exports.get_signature_help = get_signature_help;


// This file contains RPC definitions for jediserver.py.

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

async function get_completions(src, contents, sysPath, line, column) {
  throw new Error('RPC Stub');
}

async function get_definitions(src, contents, sysPath, line, column) {
  throw new Error('RPC Stub');
}

async function get_references(src, contents, sysPath, line, column) {
  throw new Error('RPC Stub');
}

async function get_hover(src, contents, sysPath,
// It's much easier to get the current word from JavaScript.
word, line, column) {
  throw new Error('RPC Stub');
}

function get_outline(src, contents) {
  throw new Error('RPC Stub');
}

function get_signature_help(src, contents, sysPath, line, column) {
  throw new Error('RPC Stub');
}