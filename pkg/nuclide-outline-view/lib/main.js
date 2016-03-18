'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HomeFragments} from '../../nuclide-home-interfaces';

import {Observable} from 'rx';

import {CompositeDisposable, Disposable} from 'atom';

import {event as commonsEvent} from '../../nuclide-commons';
const {observableFromSubscribeFunction} = commonsEvent;

import {getLogger} from '../../nuclide-logging';
const logger = getLogger();

import {OutlineViewPanelState} from './OutlineViewPanel';
import {ProviderRegistry} from './ProviderRegistry';

import invariant from 'assert';

import type {TokenizedText} from '../../nuclide-tokenized-text';

export type OutlineTree = {
  tokenizedText: TokenizedText;
  startPosition: atom$Point;
  children: Array<OutlineTree>;
};

export type Outline = {
  outlineTrees: Array<OutlineTree>;
}

/**
 * Includes additional information that is useful to the UI, but redundant or nonsensical for
 * providers to include in their responses.
 */
export type OutlineForUi = {
  // The initial state at startup.
  kind: 'empty';
} | {
  // The thing that currently has focus is not a text editor.
  kind: 'not-text-editor';
} | {
  // Indicates that no provider is registered for the given grammar.
  kind: 'no-provider';
  // Human-readable name for the grammar.
  grammar: string;
} | {
  // Indicates that a provider is registered but that it did not return an outline.
  kind: 'provider-no-outline';
} | {
  kind: 'outline';
  outline: Outline;
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

type OutlineViewState = {
  width: number;
  visible: boolean;
};

const DEFAULT_WIDTH = 300; // px

function makeDefaultState(): OutlineViewState {
  return {
    width: DEFAULT_WIDTH,
    visible: false,
  };
}

class Activation {
  _disposables: CompositeDisposable;

  _providers: ProviderRegistry<OutlineProvider>;

  _panel: OutlineViewPanelState;

  constructor(state?: OutlineViewState = makeDefaultState()) {
    this._disposables = new CompositeDisposable();

    this._providers = new ProviderRegistry();

    const textEvent$ = Observable.create(observer => {
      const textEventDispatcher =
        require('../../nuclide-text-event-dispatcher').getInstance();
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
    const outlines: Observable<OutlineForUi> = Observable.merge(
        textEvent$,
        paneChange$
          .map(() => atom.workspace.getActiveTextEditor()),
      )
      .flatMap(async editor => {
        if (editor == null) {
          return {
            kind: 'not-text-editor',
          };
        } else {
          return this._outlineForEditor(editor);
        }
      });

    const panel = this._panel = new OutlineViewPanelState(outlines, state.width, state.visible);
    this._disposables.add(panel);

    this._disposables.add(
      atom.commands.add(
        'atom-workspace',
        'nuclide-outline-view:toggle',
        panel.toggle.bind(panel),
      )
    );
    this._disposables.add(
      atom.commands.add(
        'atom-workspace',
        'nuclide-outline-view:show',
        panel.show.bind(panel),
      )
    );
    this._disposables.add(
      atom.commands.add(
        'atom-workspace',
        'nuclide-outline-view:hide',
        panel.hide.bind(panel),
      )
    );
  }

  dispose() {
    this._disposables.dispose();
  }

  serialize(): OutlineViewState {
    return {
      visible: this._panel.isVisible(),
      width: this._panel.getWidth(),
    };
  }

  consumeOutlineProvider(provider: OutlineProvider): IDisposable {
    this._providers.addProvider(provider);
    return new Disposable(() => this._providers.removeProvider(provider));
  }

  async _outlineForEditor(editor: atom$TextEditor): Promise<OutlineForUi> {
    const scopeName = editor.getGrammar().scopeName;
    const readableGrammarName = editor.getGrammar().name;

    const outlineProvider = this._providers.findProvider(scopeName);
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

  consumeToolBar(getToolBar: (group: string) => Object): void {
    const toolBar = getToolBar('nuclide-outline-view');
    toolBar.addButton({
      icon: 'list-unordered',
      callback: 'nuclide-outline-view:toggle',
      tooltip: 'Toggle Outline View',
      priority: 350, // Between diff view and test runner
    });
    this._disposables.add(new Disposable(() => {
      toolBar.removeItems();
    }));
  }
}

let activation: ?Activation = null;

export function activate(state: Object | void) {
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

export function serialize(): ?OutlineViewState {
  if (activation != null) {
    return activation.serialize();
  }
}

export function consumeOutlineProvider(provider: OutlineProvider): IDisposable {
  invariant(activation != null);
  return activation.consumeOutlineProvider(provider);
}

export function consumeToolBar(getToolBar: (group: string) => Object): void {
  invariant(activation != null);
  activation.consumeToolBar(getToolBar);
}

export function getHomeFragments(): HomeFragments {
  return {
    feature: {
      title: 'Outline View',
      icon: 'list-unordered',
      description: 'Displays major components of the current file (classes, methods, etc.)',
      command: 'nuclide-outline-view:show',
    },
    priority: 2.5, // Between diff view and test runner
  };
}
