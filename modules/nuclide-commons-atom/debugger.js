'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.















getDebuggerService = getDebuggerService;var _consumeFirstProvider;function _load_consumeFirstProvider() {return _consumeFirstProvider = _interopRequireDefault(require('./consumeFirstProvider'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                                                                                                                                  * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                  * All rights reserved.
                                                                                                                                                                                                                                                                                                  *
                                                                                                                                                                                                                                                                                                  * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                  * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                  * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                  *
                                                                                                                                                                                                                                                                                                  *  strict-local
                                                                                                                                                                                                                                                                                                  * @format
                                                                                                                                                                                                                                                                                                  */function getDebuggerService() {return (0, (_consumeFirstProvider || _load_consumeFirstProvider()).default)('debugger.remote');}