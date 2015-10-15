'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import path from 'path';
import invariant from 'assert';
import {findNearestFile, checkOutput, PromiseQueue} from 'nuclide-commons';

const PATH_TO_HH_CLIENT = 'hh_client';
const HH_SERVER_INIT_MESSAGE = 'hh_server still initializing';
const HH_SERVER_BUSY_MESSAGE = 'hh_server is busy';
const logger = require('nuclide-logging').getLogger();

var hhPromiseQueue: ?PromiseQueue = null;

/**
* If this returns null, then it is not safe to run hack.
*/
function findHackConfigDir(localFile: string): Promise<?string> {
  return findNearestFile('.hhconfig', path.dirname(localFile));
}

async function getHackExecOptions(
  localFile: string
): Promise<?{hackRoot: string, hackCommand: string}> {
  var [hhResult, hackRoot] = await Promise.all([
    // `stdout` would be empty if there is no such command.
    checkOutput('which', [PATH_TO_HH_CLIENT]),
    findHackConfigDir(localFile),
  ]);
  var hackCommand = hhResult.stdout.trim();
  if (hackRoot && hackCommand) {
    return {hackRoot, hackCommand};
  } else {
    return null;
  }
}


 /**
  * Executes hh_client with proper arguments returning the result string or json object.
  */
export async function callHHClient(
  args: Array<string>,
  errorStream: boolean,
  outputJson: boolean,
  processInput: ?string,
  filePath: string): Promise<?{hackRoot: string, result: string | Object}> {

  if (!hhPromiseQueue) {
    hhPromiseQueue = new PromiseQueue();
  }

  var hackExecOptions = await getHackExecOptions(filePath);
  if (!hackExecOptions) {
    return null;
  }
  var {hackRoot} = hackExecOptions;

  invariant(hhPromiseQueue);
  return hhPromiseQueue.submit(async (resolve, reject) => {
    // Append args on the end of our commands.
    var defaults = ['--retries', '0', '--retry-if-init', 'false', '--from', 'nuclide'];
    if (outputJson) {
      defaults.unshift('--json');
    }

    var allArgs = defaults.concat(args);
    allArgs.push(hackRoot);

    var execResult = null;
    try {
      execResult = await checkOutput(PATH_TO_HH_CLIENT, allArgs, {stdin: processInput});
    } catch (err) {
      reject(err);
      return;
    }
    var {stdout, stderr} = execResult;
    if (stderr.indexOf(HH_SERVER_INIT_MESSAGE) !== -1) {
      reject(new Error(`${HH_SERVER_INIT_MESSAGE}: try: \`arc build\` or try again later!`));
      return;
    } else if (stderr.startsWith(HH_SERVER_BUSY_MESSAGE)) {
      reject(new Error(`${HH_SERVER_BUSY_MESSAGE}: try: \`arc build\` or try again later!`));
      return;
    }

    var output = errorStream ? stderr : stdout;
    if (!outputJson) {
      resolve({result: output, hackRoot});
      return;
    }
    try {
      resolve({result: JSON.parse(output), hackRoot});
    } catch (err) {
      var errorMessage = `hh_client error, args: [${args.join(',')}]
stdout: ${stdout}, stderr: ${stderr}`;
      logger.error(errorMessage);
      reject(new Error(errorMessage));
    }
  });
}
