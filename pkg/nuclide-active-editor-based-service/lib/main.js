'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Disposable} from 'atom';
import {Observable} from 'rxjs';

import {
  atomEventDebounce,
} from '../../nuclide-atom-helpers';

import {getLogger} from '../../nuclide-logging';
const logger = getLogger();

import {ProviderRegistry} from './ProviderRegistry';

export type Provider = {
  priority: number;
  grammarScopes: Array<string>;
};

export type Result<V> = {
  kind: 'not-text-editor';
} | {
  kind: 'no-provider';
  grammar: atom$Grammar;
} | {
  kind: 'provider-error';
} | {
  // Since providers can be slow, the pane-change and edit events are emitted immediately in case
  // the UI needs to clear outdated results.
  kind: 'pane-change';
} | {
  kind: 'edit';
} | {
  kind: 'result';
  result: V;
  // The editor that the result was computed from
  editor: atom$TextEditor;
};

type ResultFunction<T, V> = (provider: T, editor: atom$TextEditor) => Promise<V>;

export type EventSources = {
  activeEditors: Observable<?atom$TextEditor>;
  changesForEditor: (editor: atom$TextEditor) => Observable<void>;
};

export class ActiveEditorBasedService<T: Provider, V> {
  _resultFunction: ResultFunction<T, V>;
  _providerRegistry: ProviderRegistry<T>;
  _resultsStream: Observable<Result<V>>;

  constructor(
    resultFunction: ResultFunction<T, V>,
    eventSources: EventSources = getDefaultEventSources(),
  ) {
    this._resultFunction = resultFunction;
    this._providerRegistry = new ProviderRegistry();
    this._resultsStream = this._createResultsStream(eventSources);
  }

  consumeProvider(provider: T): IDisposable {
    this._providerRegistry.addProvider(provider);
    return new Disposable(() => {
      this._providerRegistry.removeProvider(provider);
    });
  }

  getResultsStream(): Observable<Result<V>> {
    return this._resultsStream;
  }

  _createResultsStream(eventSources: EventSources): Observable<Result<V>> {
    // Emit a pane change event first, so that clients can do something while waiting for a provider
    // to give a result.
    return eventSources.activeEditors.switchMap(editorArg => {
      // Necessary so the type refinement holds in the callback later
      const editor = editorArg;
      if (editor == null) {
        return Observable.of({ kind: 'not-text-editor' });
      }

      const editorEvents = eventSources.changesForEditor(editor);

      return Observable.concat(
        Observable.of({ kind: 'pane-change' }),
        Observable.fromPromise(this._getResultForEditor(editor)),
        editorEvents.flatMap(() => {
          return Observable.concat(
            Observable.of({ kind: 'edit' }),
            Observable.fromPromise(this._getResultForEditor(editor)),
          );
        }),
      );
    });
  }

  async _getResultForEditor(editor: atom$TextEditor): Promise<Result<V>> {
    const grammar = editor.getGrammar().scopeName;
    const provider = this._providerRegistry.findProvider(grammar);
    if (provider == null) {
      return {
        kind: 'no-provider',
        grammar: editor.getGrammar(),
      };
    }
    let result;
    try {
      result = await this._resultFunction(provider, editor);
    } catch (e) {
      logger.error(`Error from provider for ${grammar}`, e);
      return {
        kind: 'provider-error',
      };
    }
    return {
      kind: 'result',
      result,
      editor,
    };
  }
}

function getDefaultEventSources(): EventSources {
  return {
    activeEditors: atomEventDebounce.observeActiveEditorsDebounced(),
    changesForEditor: editor => atomEventDebounce.editorChangesDebounced(editor),
  };
}
