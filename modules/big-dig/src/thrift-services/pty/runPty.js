"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.runPty = runPty;

function _pty_types() {
  const data = _interopRequireDefault(require("./gen-nodejs/pty_types"));

  _pty_types = function () {
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
// $FlowIgnore
const logger = (0, _log4js().getLogger)('run-thrift-pty');
/**
 * Spawns pty process, then triggers callback `onNewOutput` as new output arrives.
 * Returns exit code of pty when complete.
 *
 * This function should abstract away the transport method; it currently uses
 * long polling but that may change.
 */

async function runPty(client, spawnArguments, initialCommand, onSpawn, onNewOutput) {
  return new Promise(async (resolve, reject) => {
    const POLL_TIMEOUT_SEC = 60;

    const poll = async () => {
      try {
        const pollEvent = await client.poll(POLL_TIMEOUT_SEC);

        switch (pollEvent.eventType) {
          case _pty_types().default.PollEventType.NEW_OUTPUT:
            {
              onNewOutput(pollEvent.chunk);
              setTimeout(poll, 0);
              break;
            }

          case _pty_types().default.PollEventType.TIMEOUT:
            {
              setTimeout(poll, 0);
              break;
            }

          case _pty_types().default.PollEventType.NO_PTY:
            {
              resolve(pollEvent.exitCode);
              break;
            }

          default:
            {
              logger.error('unknown PollEventType type', pollEvent.eventType);
              resolve(1);
            }
        }
      } catch (e) {
        logger.info(e);
        logger.info('caught error, exiting pty');
        resolve(1);
      }
    };

    await client.spawn(spawnArguments, initialCommand);

    try {
      await onSpawn();
    } catch (e) {
      logger.error(e);
    }

    await poll();
  });
}