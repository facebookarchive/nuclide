'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.search = search;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _handlerCommon;

function _load_handlerCommon() {
  return _handlerCommon = require('./handlerCommon');
}

var _parser;

function _load_parser() {
  return _parser = require('./parser');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

function search(params) {
  const { regex, limit, leadingLines, trailingLines } = params;
  const searchSources = params.recursive ? [params.directory] : params.files;
  if (searchSources.length === 0) {
    return _rxjsBundlesRxMinJs.Observable.empty();
  }
  // Javascript escapes the slash when constructing the regexp,
  // but Rust's regex library is picky about extra escapes:
  // see https://github.com/rust-lang/regex/issues/93#issuecomment-196022003
  const source = regex.source.split('\\/').join('/');
  const output = (0, (_handlerCommon || _load_handlerCommon()).observeGrepLikeProcess)('rg', (regex.ignoreCase ? ['--ignore-case'] : []).concat(leadingLines != null ? ['-B', String(leadingLines)] : []).concat(trailingLines != null ? ['-A', String(trailingLines)] : []).concat([
  // no colors, show line number, search hidden files, limit line length
  // one result per line, show filename with null byte
  '--color', 'never', '--line-number', '--hidden', '--no-heading', '--max-columns', String((_handlerCommon || _load_handlerCommon()).BUFFER_SIZE_LIMIT), '-H', '-0', '-e', source]).concat(searchSources));
  const results = (0, (_handlerCommon || _load_handlerCommon()).mergeOutputToResults)(output, event => (0, (_parser || _load_parser()).parseProcessLine)(event, 'rg'), regex, leadingLines || 0, trailingLines || 0);
  return limit != null ? results.take(limit) : results;
}