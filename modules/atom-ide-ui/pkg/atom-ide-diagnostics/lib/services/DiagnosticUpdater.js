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
import type MessageRangeTracker from '../MessageRangeTracker';
import type {
  AppState,
  CodeActionsState,
  DescriptionsState,
  DiagnosticMessage,
  DiagnosticMessages,
  Store,
  DiagnosticMessageKind,
  UiConfig,
} from '../types';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';

import * as Actions from '../redux/Actions';
import * as Selectors from '../redux/Selectors';
import {arrayEqual} from 'nuclide-commons/collection';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Observable} from 'rxjs';

export default class DiagnosticUpdater {
  _store: Store;
  _states: Observable<AppState>;
  _allMessageUpdates: Observable<Array<DiagnosticMessage>>;
  _messageRangeTracker: MessageRangeTracker;

  constructor(store: Store, messageRangeTracker: MessageRangeTracker) {
    this._store = store;
    // $FlowIgnore: Flow doesn't know about Symbol.observable
    this._states = Observable.from(store);
    this._messageRangeTracker = messageRangeTracker;
    this._allMessageUpdates = this._states
      .distinctUntilChanged((a, b) => a.messages === b.messages)
      .map(this._getMessagesSupportedByMessageRangeTracker)
      .distinctUntilChanged((a, b) => arrayEqual(a, b));
  }

  // Following two helper function is to keep track of messages whose marker may
  // already shifted lines when an update is triggered. In that case, we replace
  // the message.range with the range we get from atom

  // wrapper on Selectors.getMessages
  _getMessagesSupportedByMessageRangeTracker = (
    state: AppState,
  ): Array<DiagnosticMessage> => {
    const messages = Selectors.getMessages(state);
    return this._updateMessageRangeFromAtomRange(messages);
  };

  // wrapper on Selectors.getFileMessageUpdates()
  _getFileMessageUpdatesSupportedByMessageRangeTracker = (
    filePath: NuclideUri,
    state: AppState,
  ): DiagnosticMessages => {
    const currentState = state ? state : this._store.getState();
    const diagnosticsMessages = Selectors.getFileMessageUpdates(
      currentState,
      filePath,
    );
    return {
      ...diagnosticsMessages,
      messages: this._updateMessageRangeFromAtomRange(
        diagnosticsMessages.messages,
      ),
    };
  };

  _updateMessageRangeFromAtomRange(
    messages: Array<DiagnosticMessage>,
  ): Array<DiagnosticMessage> {
    return messages.map(message => {
      const range = this._messageRangeTracker.getCurrentRange(message);
      return range ? {...message, range} : message;
    });
  }

  getMessages = (): Array<DiagnosticMessage> => {
    return this._getMessagesSupportedByMessageRangeTracker(
      this._store.getState(),
    );
  };

  getFileMessageUpdates = (filePath: NuclideUri): DiagnosticMessages => {
    return this._getFileMessageUpdatesSupportedByMessageRangeTracker(
      filePath,
      this._store.getState(),
    );
  };

  observeMessages = (
    callback: (messages: Array<DiagnosticMessage>) => mixed,
  ): IDisposable => {
    return new UniversalDisposable(this._allMessageUpdates.subscribe(callback));
  };

  observeFileMessages = (
    filePath: NuclideUri,
    callback: (update: DiagnosticMessages) => mixed,
  ): IDisposable => {
    return new UniversalDisposable(
      // TODO: As a potential perf improvement, we could cache so the mapping only happens once.
      // Whether that's worth it depends on how often this is actually called with the same path.
      this._states
        .distinctUntilChanged((a, b) => a.messages === b.messages)
        .map(state =>
          this._getFileMessageUpdatesSupportedByMessageRangeTracker(
            filePath,
            state,
          ),
        )
        .distinctUntilChanged((a, b) => arrayEqual(a.messages, b.messages))
        .subscribe(callback),
    );
  };

  observeCodeActionsForMessage = (
    callback: (update: CodeActionsState) => mixed,
  ): IDisposable => {
    return new UniversalDisposable(
      this._states
        .map(state => state.codeActionsForMessage)
        .distinctUntilChanged()
        .subscribe(callback),
    );
  };

  observeDescriptions = (
    callback: (update: DescriptionsState) => mixed,
  ): IDisposable => {
    return new UniversalDisposable(
      this._states
        .map(state => state.descriptions)
        .distinctUntilChanged()
        .subscribe(callback),
    );
  };

  observeSupportedMessageKinds = (
    callback: (kinds: Set<DiagnosticMessageKind>) => mixed,
  ): IDisposable => {
    return new UniversalDisposable(
      this._states.map(Selectors.getSupportedMessageKinds).subscribe(callback),
    );
  };

  observeUiConfig = (callback: (config: UiConfig) => mixed): IDisposable => {
    return new UniversalDisposable(
      this._states.map(Selectors.getUiConfig).subscribe(callback),
    );
  };

  applyFix = (message: DiagnosticMessage): void => {
    this._store.dispatch(Actions.applyFix(message));
  };

  applyFixesForFile = (file: NuclideUri): void => {
    this._store.dispatch(Actions.applyFixesForFile(file));
  };

  fetchCodeActions = (
    editor: atom$TextEditor,
    messages: Array<DiagnosticMessage>,
  ): void => {
    this._store.dispatch(Actions.fetchCodeActions(editor, messages));
  };

  fetchDescriptions = (messages: Array<DiagnosticMessage>): void => {
    this._store.dispatch(Actions.fetchDescriptions(messages));
  };
}
