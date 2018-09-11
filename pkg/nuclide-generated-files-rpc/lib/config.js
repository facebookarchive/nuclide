"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.config = void 0;

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict
 * @format
 */
let generatedTag;
let partialGeneratedTag;
let generatedPathRegexes;

try {
  ({
    generatedTag,
    partialGeneratedTag,
    generatedPathRegexes // $FlowFB

  } = require("./fb/config"));
} catch (e) {
  // fill in local configuration properties here
  generatedPathRegexes = [];
}

const config = {
  generatedTag,
  partialGeneratedTag,
  generatedPathRegexes
};
exports.config = config;