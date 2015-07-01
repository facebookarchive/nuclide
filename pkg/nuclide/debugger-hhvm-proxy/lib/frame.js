'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


var {uriToPath} = require('./utils');

/**
 * A dbgp Frame after it is converted from XML to JSON:
 * {
 *   "$":{
 *     "where":"{main}",
 *     "level":"0",
 *     "type":"file",
 *     "filename":"file:///home/peterhal/test/dbgp/test-client.php",
 *     "lineno":"2"
 *   }
 * }
 */
type DbgpStackFrame = {
  $: {
    where: string;
    level: string;
    type: string;
    filename: string;
    lineno: string;
  }
};

function idOfFrame(frame: DbgpStackFrame): Number {
  // TODO: Mangle in the transactionId of the most recent pause/status.
  return Number(frame.$.level);
}

function functionOfFrame(frame: DbgpStackFrame): string {
  return frame.$.where;
}

// Returns an absolute path
function fileOfFrame(frame: DbgpStackFrame): string {
  return uriToPath(frame.$.filename);
}

function locationOfFrame(frame: DbgpStackFrame) {
  return {
    // TODO: columnNumber: from cmdbegin/end
    lineNumber: Number(frame.$.lineno) - 1,
    scriptId: fileOfFrame(frame),
  };
}

module.exports = {
  idOfFrame,
  functionOfFrame,
  fileOfFrame,
  locationOfFrame,
};
