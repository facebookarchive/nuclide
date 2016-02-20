'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {GadgetsService} from '../../gadgets-interfaces';

import {Observable} from 'rx';

import {CompositeDisposable, Disposable} from 'atom';

import {event as commonsEvent} from '../../commons';
const {observableFromSubscribeFunction} = commonsEvent;

import {createOutlineViewClass} from './OutlineView';
import {ProviderRegistry} from './ProviderRegistry';

import invariant from 'assert';

export type OutlineTree = {
  displayText: string;
  startPosition: atom$Point;
  children: Array<OutlineTree>;
};

export type Outline = {
  outlineTrees: Array<OutlineTree>;
}

/**
 * Includes additional information that is useful to the UI, but redundant for
 * providers to include in their responses.
 */
export type OutlineForUi = Outline & {
  /**
   * Use a TextEditor instead of a path so that:
   * - If there are multiple editors for a file, we always jump to outline item
   *   locations in the correct editor.
   * - Jumping to outline item locations works for new, unsaved files.
   */
  editor: atom$TextEditor;
}

export type OutlineProvider = {
  name: string;
  // If there are multiple providers for a given grammar, the one with the highest priority will be
  // used.
  priority: number;
  grammarScopes: Array<string>;
  getOutline: (editor: TextEditor) => Promise<?Outline>;
};

class Activation {
  _disposables: CompositeDisposable;

  _outline$: Observable<?OutlineForUi>;

  _providers: ProviderRegistry<OutlineProvider>;

  constructor(state: ?Object) {
    this._disposables = new CompositeDisposable();

    this._providers = new ProviderRegistry();

    const textEvent$ = Observable.create(observer => {
      const textEventDispatcher = require('../../text-event-dispatcher').getInstance();
      return textEventDispatcher.onAnyFileChange(editor => observer.onNext(editor));
    });

    const paneChange$ = observableFromSubscribeFunction(
        atom.workspace.observeActivePaneItem.bind(atom.workspace),
      )
      // Delay the work on tab switch to keep tab switches snappy and avoid doing a bunch of
      // computation if there are a lot of consecutive tab switches.
      .debounce(200);

    // We are over-subscribing a little bit here, but since outlines are typically cheap and fast to
    // generate that's okay for now.
    this._outline$ = Observable.merge(
        textEvent$,
        paneChange$
          .map(() => atom.workspace.getActiveTextEditor()),
      )
      .flatMap(async editor => {
        if (editor == null) {
          return null;
        } else {
          return this._outlineForEditor(editor);
        }
      });
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeGadgetsService(gadgets: GadgetsService): IDisposable {
    const OutlineView = createOutlineViewClass(this._outline$);
    const disposable = gadgets.registerGadget((OutlineView: any));
    return disposable;
  }

  consumeOutlineProvider(provider: OutlineProvider): IDisposable {
    this._providers.addProvider(provider);
    return new Disposable(() => this._providers.removeProvider(provider));
  }

  async _outlineForEditor(editor: atom$TextEditor): Promise<?OutlineForUi> {
    const scopeName = editor.getGrammar().scopeName;

    const outlineProvider = this._providers.findProvider(scopeName);
    if (outlineProvider == null) {
      return Promise.resolve(null);
    }
    const outline: ?Outline = await outlineProvider.getOutline(editor);
    if (outline == null) {
      return null;
    }
    return {
      ...outline,
      editor,
    };
  }
}

let activation: ?Activation = null;

export function activate(state: ?Object) {
  if (activation == null) {
    activation = new Activation(state);
  }
}

export function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}

export function consumeGadgetsService(gadgets: GadgetsService): IDisposable {
  invariant(activation != null);
  return activation.consumeGadgetsService(gadgets);
}

export function consumeOutlineProvider(provider: OutlineProvider): IDisposable {
  invariant(activation != null);
  return activation.consumeOutlineProvider(provider);
}
