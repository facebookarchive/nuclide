'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.search = search;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _parser;

function _load_parser() {
  return _parser = require('./parser');
}

function search(directory, regex, tool) {
  const baseArgs = [];
  // ag does not search hidden files without --hidden flag.
  if (tool === 'ag') {
    baseArgs.push('--hidden');
  }
  if (regex.ignoreCase) {
    baseArgs.push('--ignore-case');
  }
  return (0, (_process || _load_process()).observeProcess)(tool, baseArgs.concat([
  // no colors, always show column of first match, one result per line
  '--nocolor', '--column', '--nogroup', regex.source, directory])).flatMap(event => (0, (_parser || _load_parser()).parseAgAckRgLine)(event));
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