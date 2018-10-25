"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DEFAULT_HACK_COMMAND = exports.HACK_LOGGER_CATEGORY = void 0;

function _process() {
  const data = require("../../../modules/nuclide-commons/process");

  _process = function () {
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
 * 
 * @format
 */
const HACK_LOGGER_CATEGORY = 'nuclide-hack';
exports.HACK_LOGGER_CATEGORY = HACK_LOGGER_CATEGORY;
const PATH_TO_HH_CLIENT = 'hh_client'; // Kick this off early, so we don't need to repeat this on every call.
// We don't have a way of changing the path on the dev server after a
// connection is made so this shouldn't change over time.
// Worst case scenario is requiring restarting Nuclide after changing the hh_client path.

const DEFAULT_HACK_COMMAND = findHackCommand(); // Returns the empty string on failure

exports.DEFAULT_HACK_COMMAND = DEFAULT_HACK_COMMAND;

async function findHackCommand() {
  try {
    return (await (0, _process().runCommand)('which', [PATH_TO_HH_CLIENT]).toPromise()).trim();
  } catch (err) {
    return '';
  }
}