'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addProvider = addProvider;
exports.removeProvider = removeProvider;
exports.invalidateMessages = invalidateMessages;
exports.updateMessages = updateMessages;
exports.applyFix = applyFix;
exports.applyFixesForFile = applyFixesForFile;
exports.fixFailed = fixFailed;
exports.fixesApplied = fixesApplied;
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

const ADD_PROVIDER = exports.ADD_PROVIDER = 'ADD_PROVIDER';
const REMOVE_PROVIDER = exports.REMOVE_PROVIDER = 'REMOVE_PROVIDER';
const UPDATE_MESSAGES = exports.UPDATE_MESSAGES = 'UPDATE_MESSAGES';
const INVALIDATE_MESSAGES = exports.INVALIDATE_MESSAGES = 'INVALIDATE_MESSAGES';
const APPLY_FIX = exports.APPLY_FIX = 'APPLY_FIX';
const APPLY_FIXES_FOR_FILE = exports.APPLY_FIXES_FOR_FILE = 'APPLY_FIXES_FOR_FILE';
const FIX_FAILED = exports.FIX_FAILED = 'FIX_FAILED';
const FIXES_APPLIED = exports.FIXES_APPLIED = 'FIXES_APPLIED';

function addProvider(provider) {
  return {
    type: ADD_PROVIDER,
    payload: { provider }
  };
}

function removeProvider(provider) {
  return {
    type: REMOVE_PROVIDER,
    payload: { provider }
  };
}

function invalidateMessages(provider, invalidation) {
  return {
    type: INVALIDATE_MESSAGES,
    payload: { provider, invalidation }
  };
}

// TODO: This will become `{provider, path: ?NuclideUri, messages: Array<Message>}` eventually, with
// a null path representing a project diagnostic.
function updateMessages(provider, update) {
  return {
    type: UPDATE_MESSAGES,
    payload: {
      provider,
      update
    }
  };
}

function applyFix(message) {
  return {
    type: APPLY_FIX,
    payload: {
      message
    }
  };
}

function applyFixesForFile(file) {
  return {
    type: APPLY_FIXES_FOR_FILE,
    payload: {
      file
    }
  };
}

function fixFailed() {
  return { type: FIX_FAILED };
}

function fixesApplied(filePath, messages) {
  return {
    type: FIXES_APPLIED,
    payload: { filePath, messages }
  };
}