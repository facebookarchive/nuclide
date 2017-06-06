'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.serializeDebuggerConfig = serializeDebuggerConfig;
exports.deserializeDebuggerConfig = deserializeDebuggerConfig;
exports.setLastUsedDebugger = setLastUsedDebugger;
exports.getLastUsedDebugger = getLastUsedDebugger;


// transientSettings will matinain configuration that should be persisted for the
// duration of the current Nunclide session (so preserved across the configuration dialog
// closing and re-opening), but not preserved if Nuclide is restarted.
const transientSettings = {}; /**
                               * Copyright (c) 2015-present, Facebook, Inc.
                               * All rights reserved.
                               *
                               * This source code is licensed under the license found in the LICENSE file in
                               * the root directory of this source tree.
                               *
                               * 
                               * @format
                               */
/* global localStorage */

function _getStorageKey(host, action, debuggerName) {
  return 'NUCLIDE_DEBUGGER_CONFIG_' + host + '_' + action + '_' + debuggerName;
}

function serializeDebuggerConfig(host, action, debuggerName, persistent, transient) {
  const key = _getStorageKey(host, action, debuggerName);
  localStorage.setItem(key, JSON.stringify(persistent));

  if (transient == null) {
    delete transientSettings[key];
  } else {
    transientSettings[key] = transient;
  }
}

function deserializeDebuggerConfig(host, action, debuggerName, callback) {
  const key = _getStorageKey(host, action, debuggerName);
  const val = localStorage.getItem(key);
  try {
    const persistedSettings = val != null ? JSON.parse(val) : {};
    callback(transientSettings[key] || {}, persistedSettings);
  } catch (err) {}
}

function setLastUsedDebugger(host, action, debuggerDisplayName) {
  const key = 'NUCLIDE_DEBUGGER_LAST_USED_' + host + '_' + action;
  localStorage.setItem(key, debuggerDisplayName);
}

function getLastUsedDebugger(host, action) {
  const key = 'NUCLIDE_DEBUGGER_LAST_USED_' + host + '_' + action;
  return localStorage.getItem(key);
}