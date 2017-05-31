/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */
/* global localStorage */

import type {DebuggerConfigAction} from '../../nuclide-debugger-base';

function _getStorageKey(
  host: string,
  action: DebuggerConfigAction,
  debuggerName: string,
) {
  return 'NUCLIDE_DEBUGGER_CONFIG_' + host + '_' + action + '_' + debuggerName;
}

export function serializeDebuggerConfig(
  host: string,
  action: DebuggerConfigAction,
  debuggerName: string,
  settings: Object,
): void {
  const key = _getStorageKey(host, action, debuggerName);
  localStorage.setItem(key, JSON.stringify(settings));
}

export function deserializeDebuggerConfig(
  host: string,
  action: DebuggerConfigAction,
  debuggerName: string,
): Object {
  const key = _getStorageKey(host, action, debuggerName);
  const val = localStorage.getItem(key);
  if (val != null) {
    try {
      return (JSON.parse(val): any);
    } catch (err) {}
  }
  return {};
}

export function setLastUsedDebugger(
  host: string,
  action: DebuggerConfigAction,
  debuggerDisplayName: string,
): void {
  const key = 'NUCLIDE_DEBUGGER_LAST_USED_' + host + '_' + action;
  localStorage.setItem(key, debuggerDisplayName);
}

export function getLastUsedDebugger(
  host: string,
  action: DebuggerConfigAction,
): ?string {
  const key = 'NUCLIDE_DEBUGGER_LAST_USED_' + host + '_' + action;
  return localStorage.getItem(key);
}
