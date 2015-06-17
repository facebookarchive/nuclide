'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


var {logErrorAndThrow} = require('./utils');

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
  var components = require('url').parse(frame.$.filename);
  if (components.protocol !== 'file:') {
    logErrorAndThrow('unexpected file protocol. Got: ' + components.protocol);
  }
  return components.pathname;
}

function locationOfFrame(frame: DbgpStackFrame) {
  return {
    // TODO: columnNumber: from cmdbegin/end
    lineNumber: Number(frame.$.lineno) - 1,
    scriptId: fileOfFrame(frame),
  };
}

function scopesOfFrame(frame: DbgpStackFrame) {
  // TODO: Array of Scope
  // object: Runtime.RemoteObject
  // type: "catch" , "closure" , "global" , "local" , "with"
  return [
    {
      type: 'local',
      object: {
        value: 'TODO: scopeOfFrame',
      },
    }];
}

function thisObjectOfFrame(frame: DbgpStackFrame) {
  // RemoteObject:
  // className
  // description
  // objectId
  // subtype - "array" , "date" , "node" , "null" , "regexp"
  // type - "boolean" , "function" , "number" , "object" , "string" , "undefined"
  return {value: 'TODO: this-object'};
}

module.exports = {
  idOfFrame,
  functionOfFrame,
  fileOfFrame,
  locationOfFrame,
  scopesOfFrame,
  thisObjectOfFrame,
};
