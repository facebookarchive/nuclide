"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addProvider = addProvider;
exports.removeProvider = removeProvider;
exports.setCodeActionFetcher = setCodeActionFetcher;
exports.fetchCodeActions = fetchCodeActions;
exports.setCodeActions = setCodeActions;
exports.invalidateMessages = invalidateMessages;
exports.updateMessages = updateMessages;
exports.applyFix = applyFix;
exports.applyFixesForFile = applyFixesForFile;
exports.fixFailed = fixFailed;
exports.fixesApplied = fixesApplied;
exports.FIXES_APPLIED = exports.FIX_FAILED = exports.APPLY_FIXES_FOR_FILE = exports.APPLY_FIX = exports.INVALIDATE_MESSAGES = exports.UPDATE_MESSAGES = exports.SET_CODE_ACTIONS = exports.FETCH_CODE_ACTIONS = exports.SET_CODE_ACTION_FETCHER = exports.REMOVE_PROVIDER = exports.ADD_PROVIDER = void 0;

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
const ADD_PROVIDER = 'ADD_PROVIDER';
exports.ADD_PROVIDER = ADD_PROVIDER;
const REMOVE_PROVIDER = 'REMOVE_PROVIDER';
exports.REMOVE_PROVIDER = REMOVE_PROVIDER;
const SET_CODE_ACTION_FETCHER = 'SET_CODE_ACTION_FETCHER';
exports.SET_CODE_ACTION_FETCHER = SET_CODE_ACTION_FETCHER;
const FETCH_CODE_ACTIONS = 'FETCH_CODE_ACTIONS';
exports.FETCH_CODE_ACTIONS = FETCH_CODE_ACTIONS;
const SET_CODE_ACTIONS = 'SET_CODE_ACTIONS';
exports.SET_CODE_ACTIONS = SET_CODE_ACTIONS;
const UPDATE_MESSAGES = 'UPDATE_MESSAGES';
exports.UPDATE_MESSAGES = UPDATE_MESSAGES;
const INVALIDATE_MESSAGES = 'INVALIDATE_MESSAGES';
exports.INVALIDATE_MESSAGES = INVALIDATE_MESSAGES;
const APPLY_FIX = 'APPLY_FIX';
exports.APPLY_FIX = APPLY_FIX;
const APPLY_FIXES_FOR_FILE = 'APPLY_FIXES_FOR_FILE';
exports.APPLY_FIXES_FOR_FILE = APPLY_FIXES_FOR_FILE;
const FIX_FAILED = 'FIX_FAILED';
exports.FIX_FAILED = FIX_FAILED;
const FIXES_APPLIED = 'FIXES_APPLIED';
exports.FIXES_APPLIED = FIXES_APPLIED;

function addProvider(provider) {
  return {
    type: ADD_PROVIDER,
    payload: {
      provider
    }
  };
}

function removeProvider(provider) {
  return {
    type: REMOVE_PROVIDER,
    payload: {
      provider
    }
  };
}

function setCodeActionFetcher(codeActionFetcher) {
  return {
    type: SET_CODE_ACTION_FETCHER,
    payload: {
      codeActionFetcher
    }
  };
}

function fetchCodeActions(editor, messages) {
  return {
    type: FETCH_CODE_ACTIONS,
    payload: {
      editor,
      messages
    }
  };
}

function setCodeActions(codeActionsForMessage) {
  return {
    type: SET_CODE_ACTIONS,
    payload: {
      codeActionsForMessage
    }
  };
}

function invalidateMessages(provider, invalidation) {
  return {
    type: INVALIDATE_MESSAGES,
    payload: {
      provider,
      invalidation
    }
  };
} // TODO: This will become `{provider, path: ?NuclideUri, messages: Array<Message>}` eventually, with
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
  return {
    type: FIX_FAILED
  };
}

function fixesApplied(filePath, messages) {
  return {
    type: FIXES_APPLIED,
    payload: {
      filePath,
      messages
    }
  };
}