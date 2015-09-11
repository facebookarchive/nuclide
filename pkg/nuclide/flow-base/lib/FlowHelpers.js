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
var {asyncExecute, findNearestFile} = require('nuclide-commons');
var LRU = require('lru-cache');
var flowConfigDirCache = LRU({
  max: 10,
  length: function (n) { return n.length; },
  maxAge: 1000 * 30, //30 seconds
});

function insertAutocompleteToken(contents: string, line: number, col: number): string {
  var lines = contents.split('\n');
  var theLine = lines[line];
  theLine = theLine.substring(0, col) + 'AUTO332' + theLine.substring(col);
  lines[line] = theLine;
  return lines.join('\n');
}

/**
 * Takes an autocomplete item from Flow and returns a valid autocomplete-plus
 * response, as documented here:
 * https://github.com/atom/autocomplete-plus/wiki/Provider-API
 */
function processAutocompleteItem(replacementPrefix: string, flowItem: Object): Object {
  var result = {
    description: flowItem['type'],
    displayText: flowItem['name'],
    replacementPrefix,
  };
  var funcDetails = flowItem['func_details'];
  if (funcDetails) {
    // The parameters turned into snippet strings.
    var snippetParamStrings = funcDetails['params']
      .map((param, i) => `\${${i + 1}:${param['name']}}`);
    // The parameters in human-readable form for use on the right label.
    var rightParamStrings = funcDetails['params']
      .map(param => `${param['name']}: ${param['type']}`);
    result = {
      ...result,
      leftLabel: funcDetails['return_type'],
      rightLabel: `(${rightParamStrings.join(', ')})`,
      snippet: `${flowItem['name']}(${snippetParamStrings.join(', ')})`,
      type: 'function',
    };
  } else {
    result = {
      ...result,
      rightLabel: flowItem['type'],
      text: flowItem['name'],
    };
  }
  return result;
}

async function isFlowInstalled(): Promise<boolean> {
  var os = require('os');
  var platform = os.platform();
  if (platform === 'linux' || platform === 'darwin') {
    var flowPath = getPathToFlow();
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

/**
 * @return The path to Flow on the user's machine. It is recommended not to cache the result of this
 *   function in case the user updates his or her preferences in Atom, in which case the return
 *   value will be stale.
 */
function getPathToFlow(): string {
  if (global.atom) {
    return atom.config.get('nuclide-flow.pathToFlow');
  } else {
    return 'flow';
  }
}

function findFlowConfigDir(localFile: string): Promise<?string> {
  if (!flowConfigDirCache.has(localFile)) {
    flowConfigDirCache.set(localFile, findNearestFile('.flowconfig', path.dirname(localFile)));
  }
  return flowConfigDirCache.get(localFile);
}

/**
* If this returns null, then it is not safe to run flow.
*/
async function getFlowExecOptions(localFile: string): Promise<?Object> {
  var flowConfigDirectory = await findFlowConfigDir(localFile);
  var installed = await isFlowInstalled();
  if (flowConfigDirectory && installed) {
    return {
      cwd: flowConfigDirectory,
    };
  } else {
    return null;
  }
}

module.exports = {
  findFlowConfigDir,
  getFlowExecOptions,
  getPathToFlow,
  insertAutocompleteToken,
  isFlowInstalled,
  processAutocompleteItem,
};
