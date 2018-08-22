"use strict";

function _cli() {
  const data = require("../big-dig/src/server/cli");

  _cli = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
const absolutePathToServerMain = require.resolve("./server.js");

(0, _cli().parseArgsAndRunMain)(absolutePathToServerMain);