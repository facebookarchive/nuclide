'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
const RUNNABLE_RULE_TYPES = exports.RUNNABLE_RULE_TYPES = new Set(['apple_bundle']); /**
                                                                                      * Copyright (c) 2015-present, Facebook, Inc.
                                                                                      * All rights reserved.
                                                                                      *
                                                                                      * This source code is licensed under the license found in the LICENSE file in
                                                                                      * the root directory of this source tree.
                                                                                      *
                                                                                      * 
                                                                                      * @format
                                                                                      */

const SUPPORTED_RULE_TYPES = exports.SUPPORTED_RULE_TYPES = new Set([...RUNNABLE_RULE_TYPES, 'apple_library', 'apple_test']);