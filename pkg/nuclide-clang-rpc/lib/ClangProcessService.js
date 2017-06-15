'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compile = compile;
exports.get_completions = get_completions;
exports.get_declaration = get_declaration;
exports.get_declaration_info = get_declaration_info;
exports.get_outline = get_outline;
exports.get_local_references = get_local_references;


// This file contains RPC definitions for clang_server.py.

function compile(contents) {
  throw new Error('Rpc Stub');
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

function get_completions(contents, line, column, tokenStartColumn, prefix) {
  throw new Error('Rpc Stub');
}

function get_declaration(contents, line, column) {
  throw new Error('Rpc Stub');
}

function get_declaration_info(contents, line, column) {
  throw new Error('Rpc Stub');
}

function get_outline(contents) {
  throw new Error('Rpc Stub');
}

function get_local_references(contents, line, column) {
  throw new Error('Rpc Stub');
}