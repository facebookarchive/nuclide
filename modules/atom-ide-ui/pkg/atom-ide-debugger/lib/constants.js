"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DEBUG_SOURCES_URI = exports.UNKNOWN_SOURCE = exports.BreakpointEventReasons = exports.DEBUGGER_PANELS_DEFAULT_WIDTH_PX = exports.DEBUGGER_PANELS_DEFAULT_LOCATION = exports.DebuggerMode = exports.AnalyticsEvents = void 0;

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
const AnalyticsEvents = Object.freeze({
  ANDROID_DEBUGGER_SDK_SOURCES: 'android-debugger-sdk-sources',
  DEBUGGER_BREAKPOINT_ADD: 'debugger-breakpoint-add',
  DEBUGGER_BREAKPOINT_DELETE: 'debugger-breakpoint-delete',
  DEBUGGER_BREAKPOINT_DELETE_ALL: 'debugger-breakpoint-delete-all',
  DEBUGGER_BREAKPOINT_SINGLE_ADD: 'debugger-breakpoint-single-add',
  DEBUGGER_BREAKPOINT_TOGGLE: 'debugger-breakpoint-toggle',
  DEBUGGER_BREAKPOINT_TOGGLE_ENABLED: 'debugger-breakpoint-toggle-enabled',
  DEBUGGER_BREAKPOINT_CONFIG_UI_SHOW: 'debugger-breakpoint-condition-shown',
  DEBUGGER_BREAKPOINT_UPDATE_CONDITION: 'debugger-breakpoint-update-condition',
  DEBUGGER_EDIT_VARIABLE: 'debugger-edit-variable',
  DEBUGGER_MULTITARGET: 'debugger-multitarget',
  DEBUGGER_START: 'debugger-start',
  DEBUGGER_START_FAIL: 'debugger-start-fail',
  DEBUGGER_STEP_CONTINUE: 'debugger-step-continue',
  DEBUGGER_STEP_INTO: 'debugger-step-into',
  DEBUGGER_STEP_OUT: 'debugger-step-out',
  DEBUGGER_STEP_OVER: 'debugger-step-over',
  DEBUGGER_STEP_BACK: 'debugger-step-back',
  DEBUGGER_STEP_RUN_TO_LOCATION: 'debugger-step-run-to-location',
  DEBUGGER_STEP_PAUSE: 'debugger-step-pause',
  DEBUGGER_STOP: 'debugger-stop',
  DEBUGGER_TERMINATE_THREAD: 'debugger-terminate-thread',
  DEBUGGER_TOGGLE_ATTACH_DIALOG: 'debugger-toggle-attach-dialog',
  DEBUGGER_TOGGLE_EXCEPTION_BREAKPOINT: 'debugger-toggle-exception-breakpoint',
  DEBUGGER_TREE_OPENED: 'debugger-tree-opened',
  DEBUGGER_WATCH_ADD_EXPRESSION: 'debugger-watch-add-expression',
  DEBUGGER_WATCH_REMOVE_EXPRESSION: 'debugger-watch-remove-expression',
  DEBUGGER_WATCH_UPDATE_EXPRESSION: 'debugger-watch-update-expression',
  DEBUGGER_EDIT_BREAKPOINT_FROM_ICON: 'debugger-edit-breakpoint-from-icon',
  DEBUGGER_DELETE_BREAKPOINT_FROM_ICON: 'debugger-delete-breakpoint-from-icon'
});
exports.AnalyticsEvents = AnalyticsEvents;
const DebuggerMode = Object.freeze({
  STARTING: 'starting',
  RUNNING: 'running',
  PAUSED: 'paused',
  STOPPED: 'stopped',
  STOPPING: 'stopping'
}); // This is to work around flow's missing support of enums.

exports.DebuggerMode = DebuggerMode;
DebuggerMode;
const DEBUGGER_PANELS_DEFAULT_LOCATION = 'right';
exports.DEBUGGER_PANELS_DEFAULT_LOCATION = DEBUGGER_PANELS_DEFAULT_LOCATION;
const DEBUGGER_PANELS_DEFAULT_WIDTH_PX = 500;
exports.DEBUGGER_PANELS_DEFAULT_WIDTH_PX = DEBUGGER_PANELS_DEFAULT_WIDTH_PX;
const BreakpointEventReasons = Object.freeze({
  NEW: 'new',
  CHANGED: 'changed',
  REMOVED: 'removed'
});
exports.BreakpointEventReasons = BreakpointEventReasons;
const UNKNOWN_SOURCE = 'Unknown';
exports.UNKNOWN_SOURCE = UNKNOWN_SOURCE;
const DEBUG_SOURCES_URI = 'atom://debug-sources';
exports.DEBUG_SOURCES_URI = DEBUG_SOURCES_URI;