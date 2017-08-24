/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {
  AppState,
  DiagnosticMessage,
  FileDiagnosticMessage,
  FileDiagnosticMessages,
  ProjectDiagnosticMessage,
} from '../types';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';

import {createSelector} from 'reselect';

const getMessagesState = state => state.messages;
const getProjectMessagesState = state => state.projectMessages;

/**
  * Gets the current diagnostic messages for the file.
  * Prefer to get updates via ::onFileMessagesDidUpdate.
  */
export function getFileMessages(
  state: AppState,
  filePath: NuclideUri,
): Array<FileDiagnosticMessage> {
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

export function getFileMessageUpdates(
  state: AppState,
  filePath: NuclideUri,
): FileDiagnosticMessages {
  return {
    filePath,
    messages: getFileMessages(state, filePath),
  };
}

/**
  * Gets the current project-scope diagnostic messages.
  * Prefer to get updates via ::onProjectMessagesDidUpdate.
  */
export const getProjectMessages = createSelector(
  [getProjectMessagesState],
  (projectMessagesState): Array<ProjectDiagnosticMessage> => {
    const messages = [];
    for (const providerMessages of projectMessagesState.values()) {
      messages.push(...providerMessages);
    }
    return messages;
  },
);

/**
  * Gets all current diagnostic messages.
  * Prefer to get updates via ::onAllMessagesDidUpdate.
  */
export const getMessages = createSelector(
  [getMessagesState, getProjectMessages],
  (messagesState, projectMessages): Array<DiagnosticMessage> => {
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
  },
);
