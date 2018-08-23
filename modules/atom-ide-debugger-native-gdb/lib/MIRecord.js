"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MIResultRecord = exports.MIAsyncRecord = exports.MICommandResponseRecord = exports.MIStreamRecord = exports.MIRecord = void 0;

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
class MIRecord {} // A stream record represents output. It is not tied to a particular
// command sent by the client.


exports.MIRecord = MIRecord;

class MIStreamRecord extends MIRecord {
  constructor(streamTarget, text) {
    super();
    this._streamTarget = streamTarget;
    this._text = text;
  }

  get streamTarget() {
    return this._streamTarget;
  }

  get text() {
    return this._text;
  }

} // A command response record represents an event initiated by a command the
// client issued, either directly or indirectly. Command responses optionally
// have a numeric token specified by the client when the command was issued.


exports.MIStreamRecord = MIStreamRecord;

class MICommandResponseRecord extends MIRecord {
  constructor(token, result) {
    super();
    this._token = token;
    this._result = result;
  }

  get token() {
    return this._token;
  }

  get result() {
    return this._result;
  }

} // An async record represents an event that happened as a side effect of
// a command, but is not the actual command result.


exports.MICommandResponseRecord = MICommandResponseRecord;

class MIAsyncRecord extends MICommandResponseRecord {
  constructor(token, result, asyncClass, recordType) {
    super(token, result);
    this._asyncClass = asyncClass;
    this._recordType = recordType;
  }

  get asyncClass() {
    return this._asyncClass;
  }

  get recordType() {
    return this._recordType;
  }

} // A result record is the direct result of a command sent from the client


exports.MIAsyncRecord = MIAsyncRecord;

class MIResultRecord extends MICommandResponseRecord {
  constructor(token, result, resultClass) {
    super(token, result);
    this._resultClass = resultClass;
  }

  get resultClass() {
    return this._resultClass;
  }

  get done() {
    return this._resultClass === 'done';
  }

  get error() {
    return this._resultClass === 'error';
  }

  get running() {
    return this._resultClass === 'running';
  }

}

exports.MIResultRecord = MIResultRecord;