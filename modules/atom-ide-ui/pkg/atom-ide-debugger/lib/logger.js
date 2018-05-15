'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _log4js;











function _load_log4js() {return _log4js = require('log4js');}

const DEBUGGER_LOGGER_CATEGORY = 'atom-debugger'; /**
                                                   * Copyright (c) 2017-present, Facebook, Inc.
                                                   * All rights reserved.
                                                   *
                                                   * This source code is licensed under the BSD-style license found in the
                                                   * LICENSE file in the root directory of this source tree. An additional grant
                                                   * of patent rights can be found in the PATENTS file in the same directory.
                                                   *
                                                   *  strict
                                                   * @format
                                                   */exports.default = (0, (_log4js || _load_log4js()).getLogger)(DEBUGGER_LOGGER_CATEGORY);