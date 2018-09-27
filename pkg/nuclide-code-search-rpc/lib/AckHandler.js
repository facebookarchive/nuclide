"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.search = search;

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _handlerCommon() {
  const data = require("./handlerCommon");

  _handlerCommon = function () {
    return data;
  };

  return data;
}

function _parser() {
  const data = require("./parser");

  _parser = function () {
    return data;
  };

  return data;
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
  const {
    regex,
    limit,
    leadingLines,
    trailingLines
  } = params;
  const searchSources = params.recursive ? [params.directory] : params.files;

  if (searchSources.length === 0) {
    return _RxMin.Observable.empty();
  }

  const baseArgs = [];

  if (regex.ignoreCase) {
    baseArgs.push('--ignore-case');
  }

  if (limit != null) {
    baseArgs.push('-m', String(limit));
  }

  const output = (0, _handlerCommon().observeGrepLikeProcess)('ack', baseArgs.concat(leadingLines != null ? ['-B', String(leadingLines)] : []).concat(trailingLines != null ? ['-A', String(trailingLines)] : []).concat([// no colors, one result per line, always show filename, no smart case
  '--with-filename', '--nosmart-case', '--nocolor', '--nopager', '--nogroup', regex.source]).concat(searchSources));
  return (0, _handlerCommon().mergeOutputToResults)(output, event => (0, _parser().parseProcessLine)(event, 'ack'), regex, leadingLines || 0, trailingLines || 0);
}