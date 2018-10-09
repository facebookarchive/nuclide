"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findHackConfigDir = findHackConfigDir;
exports.setHackCommand = setHackCommand;
exports.getHackCommand = getHackCommand;
exports.getHackExecOptions = getHackExecOptions;
exports.logger = exports.HACK_LOGGER_CATEGORY = void 0;

function _ConfigCache() {
  const data = require("../../../modules/nuclide-commons/ConfigCache");

  _ConfigCache = function () {
    return data;
  };

  return data;
}

function _process() {
  const data = require("../../../modules/nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _constants() {
  const data = require("../../nuclide-hack-common/lib/constants");

  _constants = function () {
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
const logger = (0, _log4js().getLogger)(HACK_LOGGER_CATEGORY);
exports.logger = logger;
const PATH_TO_HH_CLIENT = 'hh_client'; // Kick this off early, so we don't need to repeat this on every call.
// We don't have a way of changing the path on the dev server after a
// connection is made so this shouldn't change over time.
// Worst case scenario is requiring restarting Nuclide after changing the hh_client path.

const DEFAULT_HACK_COMMAND = findHackCommand();
let hackCommand = DEFAULT_HACK_COMMAND;
const configCache = new (_ConfigCache().ConfigCache)([_constants().HACK_CONFIG_FILE_NAME]);
/**
 * If this returns null, then it is not safe to run hack.
 */

function findHackConfigDir(localFile) {
  return configCache.getConfigDir(localFile);
} // Returns the empty string on failure


async function findHackCommand() {
  try {
    return (await (0, _process().runCommand)('which', [PATH_TO_HH_CLIENT]).toPromise()).trim();
  } catch (err) {
    return '';
  }
}

function setHackCommand(newHackCommand) {
  if (newHackCommand === '') {
    hackCommand = DEFAULT_HACK_COMMAND;
  } else {
    logger.debug(`Using custom hh_client: ${newHackCommand}`);
    hackCommand = Promise.resolve(newHackCommand);
  }
}

function getHackCommand() {
  return hackCommand;
}

async function getHackExecOptions(localFile) {
  const [currentHackCommand, hackRoot] = await Promise.all([hackCommand, findHackConfigDir(localFile)]); // flowlint-next-line sketchy-null-string:off

  if (hackRoot && currentHackCommand) {
    return {
      hackRoot,
      hackCommand: currentHackCommand
    };
  } else {
    return null;
  }
}