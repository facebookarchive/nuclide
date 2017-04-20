/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';

import type {
  DiagnosticMessage,
  LinterMessage,
  LinterProvider,
} from '../../nuclide-diagnostics-common';
import type {
  DiagnosticProviderUpdate,
  InvalidationMessage,
  FileDiagnosticMessage,
  ProjectDiagnosticMessage,
} from '../../nuclide-diagnostics-common/lib/rpc-types';

import {Range} from 'atom';
import {Observable, Subject} from 'rxjs';
import {
  observeTextEditorEvents,
} from '../../nuclide-diagnostics-provider-base/lib/TextEventDispatcher';
import {getLogger} from '../../nuclide-logging';
import {observableFromSubscribeFunction} from '../../commons-node/event';
import UniversalDisposable from '../../commons-node/UniversalDisposable';

// Exported for testing.
export function linterMessageToDiagnosticMessage(
  msg: LinterMessage,
  providerName: string,
): DiagnosticMessage {
  // The types are slightly different, so we need to copy to make Flow happy. Basically, a Trace
  // does not need a filePath property, but a LinterTrace does. Trace is a subtype of LinterTrace,
  // so copying works but aliasing does not. For a detailed explanation see
  // https://github.com/facebook/flow/issues/908
  const trace = msg.trace ? msg.trace.map(component => ({...component})) : undefined;
  if (msg.filePath) {
    return ({
      scope: 'file',
      providerName: msg.name != null ? msg.name : providerName,
      type: msg.type,
      filePath: msg.filePath,
      text: msg.text,
      html: msg.html,
      range: msg.range && Range.fromObject(msg.range),
      trace,
      fix: msg.fix == null ? undefined : {
        oldRange: msg.fix.range,
        oldText: msg.fix.oldText,
        newText: msg.fix.newText,
      },
    }: FileDiagnosticMessage);
  } else {
    return ({
      scope: 'project',
      providerName: msg.name != null ? msg.name : providerName,
      type: msg.type,
      text: msg.text,
      html: msg.html,
      range: msg.range && Range.fromObject(msg.range),
      trace,
    }: ProjectDiagnosticMessage);
  }
}

// Exported for testing.
export function linterMessagesToDiagnosticUpdate(
  currentPath: ?NuclideUri,
  msgs: Array<LinterMessage>,
  providerName: string,
): DiagnosticProviderUpdate {
  const filePathToMessages: Map<NuclideUri, Array<FileDiagnosticMessage>> = new Map();
  if (currentPath) {
    // Make sure we invalidate the messages for the current path. We may want to
    // figure out which other paths we want to invalidate if it turns out that
    // linters regularly return messages for other files.
    filePathToMessages.set(currentPath, []);
  }
  const projectMessages = [];
  for (const msg of msgs) {
    const diagnosticMessage = linterMessageToDiagnosticMessage(msg, providerName);
    if (diagnosticMessage.scope === 'file') {
      const path = diagnosticMessage.filePath;
      let messages = filePathToMessages.get(path);
      if (messages == null) {
        messages = [];
        filePathToMessages.set(path, messages);
      }
      messages.push(diagnosticMessage);
    } else { // Project scope.
      projectMessages.push(diagnosticMessage);
    }
  }
  return {
    filePathToMessages,
    projectMessages,
  };
}

/**
 * Provides an adapter between Atom linters (defined by the LinterProvider
 * type), and Nuclide Diagnostic Providers.
 *
 * The constructor takes a LinterProvider as an argument, and the resulting
 * LinterAdapter is a valid DiagnosticProvider.
 */
export class LinterAdapter {
  _provider: LinterProvider;
  _disposables: UniversalDisposable;

  _updates: Subject<DiagnosticProviderUpdate>;
  _invalidations: Subject<InvalidationMessage>;

  constructor(provider: LinterProvider) {
    this._provider = provider;
    this._updates = new Subject();
    this._invalidations = new Subject();
    this._disposables = new UniversalDisposable(
      observeTextEditorEvents(
        this._provider.grammarScopes[0] === '*' ? 'all' : this._provider.grammarScopes,
        this._provider.lintsOnChange || this._provider.lintOnFly ? 'changes' : 'saves',
      )
        // Group text editor events by their underlying text buffer.
        // Each grouped stream lasts until the buffer gets destroyed.
        .groupBy(
          editor => editor.getBuffer(),
          editor => editor,
          // $FlowFixMe: add durationSelector to groupBy
          grouped => observableFromSubscribeFunction(cb => grouped.key.onDidDestroy(cb))
            .take(1),
        )
        .mergeMap(bufferObservable => (
          // Run the linter on each buffer event.
          Observable.concat(
            // switchMap ensures that earlier lints are overridden by later ones.
            bufferObservable.switchMap(editor => this._runLint(editor)),
            // When the buffer gets destroyed, invalidate its last update.
            Observable.of(null),
          )
            // Track the previous update so we can invalidate its results.
            // (Prevents dangling diagnostics when a linter affects multiple files).
            .scan(
              (acc, update) => ({update, lastUpdate: acc.update}),
              {update: null, lastUpdate: null},
            )
        ))
        .subscribe(
          ({update, lastUpdate}) => this._processUpdate(update, lastUpdate),
        ),
    );
  }

  _runLint(editor: TextEditor): Observable<DiagnosticProviderUpdate> {
    return Observable.defer(() => {
      const lintPromise = this._provider.lint(editor);
      if (lintPromise == null) {
        return Observable.empty();
      }
      return Promise.resolve(lintPromise)
        .catch(error => {
          // Prevent errors from blowing up the entire stream.
          getLogger().error(`Error in linter provider ${this._provider.name}:`, error);
          return null;
        });
    })
      .switchMap(linterMessages => {
        if (linterMessages == null) {
          return Observable.empty();
        }
        const update = linterMessagesToDiagnosticUpdate(
          editor.getPath(),
          linterMessages,
          this._provider.name,
        );
        return Observable.of(update);
      });
  }

  _processUpdate(
    update: ?DiagnosticProviderUpdate,
    lastUpdate: ?DiagnosticProviderUpdate,
  ): void {
    if (lastUpdate != null && lastUpdate.filePathToMessages != null) {
      this._invalidations.next({
        scope: 'file',
        filePaths: Array.from(lastUpdate.filePathToMessages.keys()),
      });
    }
    if (update != null) {
      this._updates.next(update);
    }
  }

  dispose(): void {
    this._disposables.dispose();
    this._updates.complete();
    this._invalidations.complete();
  }

  getUpdates(): Observable<DiagnosticProviderUpdate> {
    return this._updates.asObservable();
  }

  getInvalidations(): Observable<InvalidationMessage> {
    return this._invalidations.asObservable();
  }
}
