'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Often, we may want to respond to Atom events, but only after a buffer period
 * of no change.
 * For example, Atom provides Workspace::onDidChangeActivePaneItem, but we may
 * want to know not when the active pane item has changed, buth when it has
 * stopped changing.
 * This file provides methods to do this.
 */

import {Observable} from '@reactivex/rxjs';

import {
  event as commonsEvent,
  debounce,
} from '../../nuclide-commons';

const DEFAULT_PANE_DEBOUNCE_INTERVAL_MS = 100;
const DEFAULT_EDITOR_DEBOUNCE_INTERVAL_MS = 300;

/**
 * Similar to Atom's Workspace::onDidChangeActivePaneItem
 * (https://atom.io/docs/api/latest/Workspace#instance-onDidChangeActivePaneItem),
 * with the addition of a debounce interval.
 * @param debounceInterval The number of milliseconds to debounce.
 */
export function onWorkspaceDidStopChangingActivePaneItem(
    callback: (item: mixed) => any,
    debounceInterval: number = DEFAULT_PANE_DEBOUNCE_INTERVAL_MS
  ): IDisposable {
  const debouncedFunction = debounce(callback, debounceInterval, /* immediate */ false);
  return atom.workspace.onDidChangeActivePaneItem(debouncedFunction);
}

export function observeActivePaneItemDebounced(
  debounceInterval: number = DEFAULT_PANE_DEBOUNCE_INTERVAL_MS,
): Observable<mixed> {
  return commonsEvent.observableFromSubscribeFunction(callback => {
    return atom.workspace.observeActivePaneItem(callback);
  })
  .debounceTime(debounceInterval);
}

export function observeActiveEditorsDebounced(
  debounceInterval: number = DEFAULT_PANE_DEBOUNCE_INTERVAL_MS,
): Observable<?atom$TextEditor> {
  return observeActivePaneItemDebounced(debounceInterval)
    .map(paneItem => {
      if (atom.workspace.isTextEditor(paneItem)) {
        // Flow cannot understand the type refinement provided by the isTextEditor function, so we
        // have to cast.
        return (paneItem: any);
      }
      return null;
    });
}

export function observeEditorChangesDebounced(
  editor: atom$TextEditor,
  debounceInterval: number = DEFAULT_EDITOR_DEBOUNCE_INTERVAL_MS,
): Observable<void> {
  return Observable.concat(
    // Emit one event at the beginning in keeping with the observe* methods in the Atom API.
    Observable.of(undefined),
    commonsEvent.observableFromSubscribeFunction(callback => editor.onDidChange(callback)),
  )
  // Debounce manually rather than using editor.onDidStopChanging so that the debounce time is
  // configurable.
  .debounceTime(debounceInterval);
}
