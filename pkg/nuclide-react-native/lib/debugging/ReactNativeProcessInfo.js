'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReactNativeProcessInfo = undefined;

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../../nuclide-debugger-base');
}

var _ReactNativeDebuggerInstance;

function _load_ReactNativeDebuggerInstance() {
  return _ReactNativeDebuggerInstance = require('./ReactNativeDebuggerInstance');
}

class ReactNativeProcessInfo extends (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerProcessInfo {
  constructor(targetUri) {
    super('react-native', targetUri);
  }

  debug() {
    // This is the port that the V8 debugger usually listens on.
    // TODO(matthewwithanm): Provide a way to override this in the UI.
    return Promise.resolve(new (_ReactNativeDebuggerInstance || _load_ReactNativeDebuggerInstance()).ReactNativeDebuggerInstance(this, 5858));
  }
}
exports.ReactNativeProcessInfo = ReactNativeProcessInfo; /**
                                                          * Copyright (c) 2015-present, Facebook, Inc.
                                                          * All rights reserved.
                                                          *
                                                          * This source code is licensed under the license found in the LICENSE file in
                                                          * the root directory of this source tree.
                                                          *
                                                          * 
                                                          */