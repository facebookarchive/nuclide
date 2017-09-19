'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMessages = exports.getProjectMessages = undefined;
exports.getFileMessages = getFileMessages;
exports.getFileMessageUpdates = getFileMessageUpdates;

var _reselect;

function _load_reselect() {
  return _reselect = require('reselect');
}

const getMessagesState = state => state.messages; /**
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

const getProjectMessagesState = state => state.projectMessages;

/**
  * Gets the current diagnostic messages for the file.
  * Prefer to get updates via ::onFileMessagesDidUpdate.
  */
function getFileMessages(state, filePath) {
  const messages = [];
  for (const providerMessages of state.messages.values()) {
    const messagesForFile = providerMessages.get(filePath);
    if (messagesForFile == null) {
      continue;
    }
    messages.push(...messagesForFile);
  }
  return messages;
}

function getFileMessageUpdates(state, filePath) {
  return {
    filePath,
    messages: getFileMessages(state, filePath)
  };
}

/**
  * Gets the current project-scope diagnostic messages.
  * Prefer to get updates via ::onProjectMessagesDidUpdate.
  */
const getProjectMessages = exports.getProjectMessages = (0, (_reselect || _load_reselect()).createSelector)([getProjectMessagesState], projectMessagesState => {
  const messages = [];
  for (const providerMessages of projectMessagesState.values()) {
    messages.push(...providerMessages);
  }
  return messages;
});

/**
  * Gets all current diagnostic messages.
  * Prefer to get updates via ::onAllMessagesDidUpdate.
  */
const getMessages = exports.getMessages = (0, (_reselect || _load_reselect()).createSelector)([getMessagesState, getProjectMessages], (messagesState, projectMessages) => {
  const messages = [];

  // Get all file messages.
  for (const providerMessages of messagesState.values()) {
    for (const fileMessages of providerMessages.values()) {
      messages.push(...fileMessages);
    }
  }

  // Get all project messages.
  messages.push(...projectMessages);

  return messages;
});