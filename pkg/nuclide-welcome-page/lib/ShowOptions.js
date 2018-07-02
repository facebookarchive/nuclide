"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.showAll = showAll;
exports.showOne = showOne;

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
function showAll() {
  return {
    type: 'SHOW_ALL',
    args: {}
  };
}

function showOne(topic) {
  return {
    type: 'SHOW_ONE',
    args: {
      topic
    }
  };
}