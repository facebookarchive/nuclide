"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.combineEpicsFromImports = combineEpicsFromImports;

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _reduxObservable() {
  const data = require("./redux-observable");

  _reduxObservable = function () {
    return data;
  };

  return data;
}

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
function combineEpicsFromImports(epics, module) {
  return (0, _reduxObservable().combineEpics)(...Object.values(epics).filter(epic => typeof epic === 'function') // Catch each epic individually, instead of catching the rootEpic
  // since otherwise we'll resubscribe every epic on any error.
  // https://github.com/redux-observable/redux-observable/issues/94
  .map(epic => (...args) => // $FlowFixMe(>=0.70.0) Flow suppress
  epic(...args).catch((error, source) => {
    if (module != null) {
      (0, _log4js().getLogger)(module).error(error);
    }

    return source;
  })));
}