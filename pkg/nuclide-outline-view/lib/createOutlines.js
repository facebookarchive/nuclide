'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Outline, OutlineForUi} from '..';
import type {ProviderRegistry} from './ProviderRegistry';

import {Observable} from 'rx';

import {event as commonsEvent} from '../../nuclide-commons';
const {observableFromSubscribeFunction} = commonsEvent;

import {getLogger} from '../../nuclide-logging';
const logger = getLogger();

const TAB_SWITCH_DELAY = 200; // ms
export function createOutlines(providers: ProviderRegistry): Observable<OutlineForUi> {
  return getTextEditorEvents()
    .flatMap(async editor => {
      if (editor == null) {
        return {
          kind: 'not-text-editor',
        };
      } else {
        return outlineForEditor(providers, editor);
      }
    });
}

async function outlineForEditor(
  providers: ProviderRegistry,
  editor: atom$TextEditor
): Promise<OutlineForUi> {
  const scopeName = editor.getGrammar().scopeName;
  const readableGrammarName = editor.getGrammar().name;

  const outlineProvider = providers.findProvider(scopeName);
  if (outlineProvider == null) {
    return {
      kind: 'no-provider',
      grammar: readableGrammarName,
    };
  }
  let outline: ?Outline;
  try {
    outline = await outlineProvider.getOutline(editor);
  } catch (e) {
    logger.error('Error in outline provider:', e);
    outline = null;
  }
  if (outline == null) {
    return {
      kind: 'provider-no-outline',
    };
  }
  return {
    kind: 'outline',
    outline,
    editor,
  };
}

// Emits a TextEditor whenever the active editor changes or whenever the text in the active editor
// changes.
function getTextEditorEvents(): Observable<atom$TextEditor> {
  const textEvents = Observable.create(observer => {
    const textEventDispatcher =
      require('../../nuclide-text-event-dispatcher').getInstance();
    return textEventDispatcher.onAnyFileChange(editor => observer.onNext(editor));
  });

  const paneChanges = observableFromSubscribeFunction(
      atom.workspace.observeActivePaneItem.bind(atom.workspace),
    )
    // Delay the work on tab switch to keep tab switches snappy and avoid doing a bunch of
    // computation if there are a lot of consecutive tab switches.
    .debounce(TAB_SWITCH_DELAY);

  return Observable.merge(
    textEvents,
    paneChanges
      .map(() => atom.workspace.getActiveTextEditor())
  );
}
