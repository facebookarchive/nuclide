Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.setOutputService = setOutputService;
exports.getOutputService = getOutputService;
exports.registerOutputWindowLogging = registerOutputWindowLogging;

var outputServiceApi = null;

function setOutputService(api) {
  outputServiceApi = api;
}

function getOutputService() {
  return outputServiceApi;
}

// TODO: refactor this function to work with other providers(like hhvm).

function registerOutputWindowLogging(userOutputStream) {
  var api = getOutputService();
  var outputDisposable = null;
  if (api != null) {
    outputDisposable = api.registerOutputProvider({
      id: 'lldb debugger',
      messages: userOutputStream.map(function (message) {
        return JSON.parse(message);
      })
    });
  }
  return outputDisposable;
}