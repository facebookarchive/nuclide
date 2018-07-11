"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.promiseError = promiseError;
exports.promiseErrorString = promiseErrorString;
exports.promiseErrorUndefined = promiseErrorUndefined;
exports.promiseErrorCode = promiseErrorCode;
exports.observableError = observableError;
exports.observableErrorString = observableErrorString;
exports.observableErrorUndefined = observableErrorUndefined;
exports.observableErrorCode = observableErrorCode;

var _RxMin = require("rxjs/bundles/Rx.min.js");

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
// Contains services that let us test marshalling of Errors.
async function promiseError(message) {
  throw new Error(message);
}

async function promiseErrorString(message) {
  throw message;
}

function promiseErrorUndefined() {
  // eslint-disable-next-line no-throw-literal
  throw undefined;
}

function promiseErrorCode(code) {
  throw createErrorCode(code);
}

function observableError(message) {
  return createErrorObservable(new Error(message));
}

function observableErrorString(message) {
  return createErrorObservable(message);
}

function observableErrorUndefined() {
  return createErrorObservable(undefined);
}

function observableErrorCode(code) {
  return createErrorObservable(createErrorCode(code));
}

function createErrorObservable(error) {
  return _RxMin.Observable.create(observer => {
    observer.error(error);
  }).publish();
}

function createErrorCode(code) {
  const e = new Error(); // $FlowIssue - Error should have a code

  e.code = code;
  return e;
}