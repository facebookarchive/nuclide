/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import invariant from 'assert';
import log4js from 'log4js';
import nuclideUri from 'nuclide-commons/nuclideUri';
import os from 'os';
import {launchServer} from './NuclideServer';

export type LauncherScriptParams = {|
  key: string,
  cert: string,
  ca: string,
  port: number,
  launcher: string,
  serverParams: mixed,
|};

function main() {
  // launchServer should only be spawned from ./main.js.
  if (process.send == null) {
    // eslint-disable-next-line no-console
    console.error(
      'Error: launchServer should only be spawned via parseArgsAndRunMain.',
    );
    process.exit(1);
  }

  process.on('message', params => {
    handleLaunchParams(params).catch(error => {
      log4js.getLogger().fatal('launchServer failed:', error);
      log4js.shutdown(() => process.exit(1));
    });
  });
}

async function handleLaunchParams(params: LauncherScriptParams) {
  if (params.exclusive != null) {
    await enforceExclusive(params.exclusive);
  }

  const port = await launchServer({
    port: params.port,
    webServer: {
      key: params.key,
      cert: params.cert,
      ca: params.ca,
    },
    absolutePathToServerMain: params.launcher,
    serverParams: params.serverParams,
  });

  invariant(process.send != null);
  process.send({port}, () => {
    invariant(process.disconnect);
    process.disconnect();
  });
}

log4js.configure({
  appenders: [
    {
      type: 'file',
      filename: nuclideUri.join(os.tmpdir(), 'big-dig.log'),
    },
    {
      type: 'console',
    },
  ],
});

process.on('unhandledRejection', error => {
  log4js.getLogger().error('Unhandled rejection:', error);
});

process.on('uncaughtException', error => {
  log4js.getLogger().fatal('Uncaught exception:', error);
  log4js.shutdown(() => process.exit(1));
});

main();
