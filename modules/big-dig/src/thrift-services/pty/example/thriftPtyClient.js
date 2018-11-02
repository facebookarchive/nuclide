"use strict";

function _createThriftClient() {
  const data = require("../../../services/thrift/createThriftClient");

  _createThriftClient = function () {
    return data;
  };

  return data;
}

function _thriftPtyServiceConfig() {
  const data = require("../thrift-pty-service-config");

  _thriftPtyServiceConfig = function () {
    return data;
  };

  return data;
}

function _runPty() {
  const data = require("../runPty");

  _runPty = function () {
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

/* eslint-disable no-console */
const logger = (0, _log4js().getLogger)('thrift-pty-example-client');

async function main(port) {
  const client = (0, _createThriftClient().createThriftClient)(_thriftPtyServiceConfig().PTY_SERVICE_CONFIG, port).getClient();
  const encoding = 'utf-8';
  const spawnArguments = {
    command: '/bin/bash',
    commandArgs: ['-l'],
    envPatches: {
      TERM_PROGRAM: 'thrift-pty-demo'
    },
    cwd: '.',
    name: 'xterm-256color',
    cols: 50,
    rows: 50
  };

  const onNewOutput = chunk => {
    process.stdout.write(chunk.toString(encoding));
  };

  const onSpawn = async () => {
    // $FlowIgnore
    process.stdin.setRawMode(true); // disable echoing

    process.stdin.resume();
    process.stdin.on('data', async data => {
      if (client != null) {
        try {
          await client.writeInput(data.toString());
        } catch (e) {
          logger.error('Failed to write input to pty');
          logger.error(e); // $FlowIgnore

          process.stdin.setRawMode(false);
        }
      }
    });
    process.stdout.on('resize', async () => {
      try {
        // $FlowIgnore
        await client.resize(process.stdout.columns, process.stdout.rows);
      } catch (e) {
        logger.error(e);
      }
    });
    await Promise.all([// $FlowIgnore
    client.resize(process.stdout.columns, process.stdout.rows), client.setEncoding(encoding)]);
  };

  const exitCode = await (0, _runPty().runPty)(client, spawnArguments, 'echo "running thrift pty client example"\n', onSpawn, onNewOutput); // $FlowIgnore

  process.stdin.setRawMode(false);
  console.log('exited with code', exitCode);
  process.exit(exitCode);
}

const port = parseInt(process.argv[2], 10);
main(port);