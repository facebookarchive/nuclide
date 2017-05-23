'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setJavaDebuggerApi = setJavaDebuggerApi;
exports.getJavaDebuggerApi = getJavaDebuggerApi;


let javaDebuggerProvider = null; /**
                                  * Copyright (c) 2015-present, Facebook, Inc.
                                  * All rights reserved.
                                  *
                                  * This source code is licensed under the license found in the LICENSE file in
                                  * the root directory of this source tree.
                                  *
                                  * 
                                  * @format
                                  */

function setJavaDebuggerApi(api) {
  javaDebuggerProvider = api;
}

function getJavaDebuggerApi() {
  return javaDebuggerProvider;
}