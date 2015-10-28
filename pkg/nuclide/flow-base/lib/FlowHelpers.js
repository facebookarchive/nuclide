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
var flowPathCache = LRU({
  max: 10,
  maxAge: 1000 * 30, // 30 seconds
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
  // Truncate long types for readability
  var description = flowItem['type'].length < 80
    ? flowItem['type']
    : flowItem['type'].substring(0,80) + ' ...';
  var result = {
    description: description,
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
    if (!flowPathCache.has(flowPath)) {
      flowPathCache.set(flowPath, await canFindFlow(flowPath));
    }

    return flowPathCache.get(flowPath);
  } else {
    // Flow does not currently work in Windows.
    return false;
  }
}

async function canFindFlow(flowPath: string): Promise<boolean> {
  try {
    await asyncExecute('which', [flowPath]);
    return true;
  } catch (e) {
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
    return global.atom.config.get('nuclide-flow.pathToFlow');
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

module.exports = {
  findFlowConfigDir,
  getPathToFlow,
  insertAutocompleteToken,
  isFlowInstalled,
  processAutocompleteItem,
};
