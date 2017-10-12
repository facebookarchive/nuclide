'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getConfig = getConfig;
exports.setConfig = setConfig;
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

const config = {
  functionSnippetShouldIncludeArguments: true,
  stopFlowOnExit: true,
  lazyServer: false
};

function getConfig(key) {
  return config[key];
}

function setConfig(key, val) {
  // Flow's $PropertyType is not powerful enough to express the relationship we want here.
  if (!(typeof val === typeof config[key])) {
    throw new Error('Invariant violation: "typeof val === typeof config[key]"');
  }

  config[key] = val;
}