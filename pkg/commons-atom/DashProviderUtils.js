"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.prefixRequiresSpace = prefixRequiresSpace;
exports.fuzzyRelevance = fuzzyRelevance;

function _fuzzaldrinPlus() {
  const data = _interopRequireDefault(require("fuzzaldrin-plus"));

  _fuzzaldrinPlus = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
const noSpaceNeededPrefixes = new Set(' !@#$%^&*();[]-_?/\'".,<>{}:');
noSpaceNeededPrefixes.add(''); // empty prefix (omnisearch) also doesn't require a space

function prefixRequiresSpace(prefix) {
  return prefix.length > 1 || !noSpaceNeededPrefixes.has(prefix);
}

function fuzzyRelevance(string, query) {
  return _fuzzaldrinPlus().default.score(string, query) / _fuzzaldrinPlus().default.score(string, string);
}