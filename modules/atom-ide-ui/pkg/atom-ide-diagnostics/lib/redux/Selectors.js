"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFileMessages = getFileMessages;
exports.getFileMessageUpdates = getFileMessageUpdates;
exports.getUiConfig = exports.getSupportedMessageKinds = exports.getMessages = void 0;

function _reselect() {
  const data = require("reselect");

  _reselect = function () {
    return data;
  };

  return data;
}

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
const getMessagesState = state => state.messages;

const getProviders = state => state.providers;
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
 * Gets all current diagnostic messages.
 * Prefer to get updates via ::onAllMessagesDidUpdate.
 */


const getMessages = (0, _reselect().createSelector)([getMessagesState], messagesState => {
  const messages = []; // Get all file messages.

  for (const providerMessages of messagesState.values()) {
    for (const fileMessages of providerMessages.values()) {
      messages.push(...fileMessages);
    }
  }

  return messages;
});
exports.getMessages = getMessages;
const getSupportedMessageKinds = (0, _reselect().createSelector)([getProviders], providers => {
  const kinds = new Set(['lint']); // Lint is always supported.

  providers.forEach(provider => {
    if (provider.supportedMessageKinds != null) {
      provider.supportedMessageKinds.forEach(kind => {
        kinds.add(kind);
      });
    }
  });
  return kinds;
});
exports.getSupportedMessageKinds = getSupportedMessageKinds;
const getUiConfig = (0, _reselect().createSelector)([getProviders], providers => {
  const config = [];
  providers.forEach(provider => {
    if (provider.name != null && provider.uiSettings != null && provider.uiSettings.length > 0) {
      config.push({
        providerName: provider.name,
        settings: provider.uiSettings
      });
    }
  });
  return config;
});
exports.getUiConfig = getUiConfig;