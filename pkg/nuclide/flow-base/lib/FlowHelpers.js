'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var path = require('path');
var {asyncExecute, findNearestFile, getConfigValueAsync} = require('nuclide-commons');

function insertAutocompleteToken(contents: string, line: number, col: number): string {
  var lines = contents.split('\n');
  var theLine = lines[line];
  theLine = theLine.substring(0, col) + 'AUTO332' + theLine.substring(col);
  lines[line] = theLine;
  return lines.join('\n');
}

async function isFlowInstalled(): Promise<boolean> {
  var os = require('os');
  var platform = os.platform();
  if (platform === 'linux' || platform === 'darwin') {
    var flowPath = await getPathToFlow();
    try {
      await asyncExecute('which', [flowPath]);
      return true;
    } catch (e) {
      return false;
    }
  } else {
    // Flow does not currently work in Windows.
    return false;
  }
}

function getPathToFlow(): Promise<string> {
  if (global.atom) {
    return getConfigValueAsync('nuclide-flow.pathToFlow')();
  } else {
    return Promise.resolve('flow');
  }
}

/**
* If this returns null, then it is not safe to run flow.
*/
async function getFlowExecOptions(file: string): Promise<?Object> {
  var flowConfigDirectory = await findNearestFile('.flowconfig', path.dirname(file));
  var installed = await isFlowInstalled();
  if (flowConfigDirectory && installed) {
    // TODO(nmote) remove typecast once Flow allows Promises to have covariant
    // type params
    return ({
      cwd: flowConfigDirectory,
    }: ?Object);
  } else {
    return null;
  }
}

module.exports = {
  insertAutocompleteToken,
  isFlowInstalled,
  getPathToFlow,
  getFlowExecOptions,
};
