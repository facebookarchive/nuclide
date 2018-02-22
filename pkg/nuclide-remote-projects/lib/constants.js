'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logger = undefined;

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

const logger = exports.logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-remote-projects'); /**
                                                                                                        * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                        * All rights reserved.
                                                                                                        *
                                                                                                        * This source code is licensed under the license found in the LICENSE file in
                                                                                                        * the root directory of this source tree.
                                                                                                        *
                                                                                                        * 
                                                                                                        * @format
                                                                                                        */