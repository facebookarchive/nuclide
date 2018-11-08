/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

/* eslint-disable no-console */

import {getWrappedThriftClient} from '../../../services/thrift/createThriftClient';
import {PTY_SERVICE_CONFIG} from '../thrift-pty-service-config';
import {readPtyUntilExit} from '../ThriftPtyUtil';
import {getLogger} from 'log4js';

const logger = getLogger('thrift-pty-example-client');

async function main(port: number): Promise<void> {
  const client = getWrappedThriftClient(PTY_SERVICE_CONFIG, port).getClient();
  const encoding = 'utf-8';
  const spawnArguments = {
    command: '/bin/bash',
    commandArgs: ['-l'],
    envPatches: {TERM_PROGRAM: 'thrift-pty-demo'},
    cwd: '.',
    name: 'xterm-256color',
    cols: 50,
    rows: 50,
  };

  const onNewOutput = (chunk: Buffer): void => {
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
          logger.error(e);
          // $FlowIgnore
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

    await Promise.all([
      // $FlowIgnore
      client.resize(process.stdout.columns, process.stdout.rows),
      client.setEncoding(encoding),
    ]);
  };

  const initialCommand = 'echo "running thrift pty client example"\n';
  await client.spawn(spawnArguments, initialCommand);
  try {
    await onSpawn();
  } catch (e) {
    logger.error(e);
  }

  const exitCode = await readPtyUntilExit(client, onNewOutput);
  // $FlowIgnore
  process.stdin.setRawMode(false);
  console.log('exited with code', exitCode);
  process.exit(exitCode);
}

const port = parseInt(process.argv[2], 10);
main(port);
