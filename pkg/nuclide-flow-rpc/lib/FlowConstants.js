'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
const ServerStatus = exports.ServerStatus = Object.freeze({
  FAILED: 'failed',
  UNKNOWN: 'unknown',
  NOT_RUNNING: 'not running',
  NOT_INSTALLED: 'not installed',
  BUSY: 'busy',
  INIT: 'init',
  READY: 'ready'
});

// If we put this type on the definition, use sites will not see the individual properties in the
// Server object for things like autocomplete. Worse, Flow will assume that *any* string key will
// yield a valid ServerStatus result, so we won't get protection against typos. Adding this
// assertion here ensures that all of the values are valid ServerStatus options, while yielding
// better Flow behavior at use sites.
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

ServerStatus;

// Controls how long the Flow version will be cached before it is considered invalid.
const VERSION_TIMEOUT_MS = exports.VERSION_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes in ms