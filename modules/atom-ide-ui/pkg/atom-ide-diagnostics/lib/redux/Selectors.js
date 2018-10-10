/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import type {
  AppState,
  DiagnosticMessage,
  DiagnosticMessages,
  DiagnosticMessageKind,
  ObservableDiagnosticProvider,
  UiConfig,
} from '../types';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';

import {createSelector} from 'reselect';
import {DefaultMap, takeIterable} from 'nuclide-commons/collection';
import {minBy} from 'lodash';

const MAX_MESSAGE_COUNT_PER_FILE = 1000;

const getMessagesState = state => state.messages;
const getProviders = state => state.providers;

function* getThreadedFileMessages(
  state: AppState,
  filePath: NuclideUri,
): Iterable<DiagnosticMessage> {
  const providerToMessages = new Map();
  for (const [provider, messages] of state.messages) {
    const fileMessages = messages.get(filePath);
    if (fileMessages != null && fileMessages.length > 0) {
      providerToMessages.set(provider, fileMessages);
    }
  }

  const providerToCurrentIndex: DefaultMap<
    ObservableDiagnosticProvider,
    number,
  > = new DefaultMap(() => 0);

  while (providerToMessages.size) {
    // "Peek" at the next message from each provider, and store them so we can
    // select the best next one.
    const nextMessageCandidates: Array<
      [ObservableDiagnosticProvider, DiagnosticMessage],
    > = Array.from(providerToMessages.entries()).map(([provider, messages]) => [
      provider,
      messages[providerToCurrentIndex.get(provider)],
    ]);

    // Pick the "closest" (lowest row and column pair) of the options we generated
    const [closestProvider, closestMessage] = minBy(
      nextMessageCandidates,
      ([provider, message]) => {
        const range = message && message.range;
        return range
          ? range.start.row + range.start.column / Number.MAX_SAFE_INTEGER
          : 0;
      },
    );

    // Advance this provider's index forward one. First, get "i"
    const closestProviderIndex = providerToCurrentIndex.get(closestProvider);
    const closestProviderMessages = providerToMessages.get(closestProvider);
    if (
      closestProviderMessages != null &&
      closestProviderIndex < closestProviderMessages.length - 1
    ) {
      // "i++"
      providerToCurrentIndex.set(closestProvider, closestProviderIndex + 1);
    } else {
      // We've exhausted the messages for this provider. Remove it from future
      // consideration.
      providerToMessages.delete(closestProvider);
    }

    yield closestMessage;
  }
}

export function* getBoundedThreadedFileMessages(
  state: AppState,
  filePath: NuclideUri,
): Iterable<DiagnosticMessage> {
  yield* takeIterable(
    getThreadedFileMessages(state, filePath),
    MAX_MESSAGE_COUNT_PER_FILE,
  );
}

/**
 * Gets the current diagnostic messages for the file.
 * Prefer to get updates via ::onFileMessagesDidUpdate.
 */
export function getFileMessages(
  state: AppState,
  filePath: NuclideUri,
): Array<DiagnosticMessage> {
  return Array.from(getThreadedFileMessages(state, filePath));
}

export function getFileMessageUpdates(
  state: AppState,
  filePath: NuclideUri,
): DiagnosticMessages {
  return {
    filePath,
    // Excessive numbers of items cause performance issues in the gutter, table, and decorations.
    // Truncate the number of items MAX_MESSAGE_COUNT_PER_FILE.
    messages: Array.from(getBoundedThreadedFileMessages(state, filePath)),
    // Include the total number of messages without truncation
    totalMessages: getFileMessageCount(state, filePath),
  };
}

/**
 * Gets all current diagnostic messages.
 * Prefer to get updates via ::onAllMessagesDidUpdate.
 */
export const getMessages = createSelector(
  [getMessagesState],
  (messagesState): Array<DiagnosticMessage> => {
    const messages = [];

    // Get all file messages.
    for (const providerMessages of messagesState.values()) {
      for (const fileMessages of providerMessages.values()) {
        messages.push(...fileMessages);
      }
    }

    return messages;
  },
);

export const getSupportedMessageKinds = createSelector(
  [getProviders],
  (providers): Set<DiagnosticMessageKind> => {
    const kinds = new Set(['lint']); // Lint is always supported.
    providers.forEach(provider => {
      if (provider.supportedMessageKinds != null) {
        provider.supportedMessageKinds.forEach(kind => {
          kinds.add(kind);
        });
      }
    });
    return kinds;
  },
);

export const getUiConfig = createSelector(
  [getProviders],
  (providers): UiConfig => {
    const config = [];
    providers.forEach(provider => {
      if (
        provider.name != null &&
        provider.uiSettings != null &&
        provider.uiSettings.length > 0
      ) {
        config.push({
          providerName: provider.name,
          settings: provider.uiSettings,
        });
      }
    });
    return config;
  },
);

function getFileMessageCount(state: AppState, filePath: NuclideUri): number {
  let messageCount = 0;
  for (const providerMessages of state.messages.values()) {
    const messagesForFile = providerMessages.get(filePath);
    if (messagesForFile == null) {
      continue;
    }
    messageCount += messagesForFile.length;
  }
  return messageCount;
}
