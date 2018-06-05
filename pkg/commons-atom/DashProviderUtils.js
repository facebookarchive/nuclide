'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.prefixRequiresSpace = prefixRequiresSpace;
exports.fuzzyRelevance = fuzzyRelevance;

var _fuzzaldrinPlus;

function _load_fuzzaldrinPlus() {
  return _fuzzaldrinPlus = _interopRequireDefault(require('fuzzaldrin-plus'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const noSpaceNeededPrefixes = new Set(' !@#$%^&*();[]-_?/\'".,<>{}:'); /**
                                                                        * Copyright (c) 2015-present, Facebook, Inc.
                                                                        * All rights reserved.
                                                                        *
                                                                        * This source code is licensed under the license found in the LICENSE file in
                                                                        * the root directory of this source tree.
                                                                        *
                                                                        * 
                                                                        * @format
                                                                        */

noSpaceNeededPrefixes.add(''); // empty prefix (omnisearch) also doesn't require a space

function prefixRequiresSpace(prefix) {
  return prefix.length > 1 || !noSpaceNeededPrefixes.has(prefix);
}

function fuzzyRelevance(string, query) {
  return (_fuzzaldrinPlus || _load_fuzzaldrinPlus()).default.score(string, query) / (_fuzzaldrinPlus || _load_fuzzaldrinPlus()).default.score(string, string);
}