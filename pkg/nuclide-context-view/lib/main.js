'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  ContextProvider,
  NuclideContextView,
} from './types';
import type {ContextViewConfig} from './ContextViewManager';
import type {DefinitionService} from '../../nuclide-definition-service';
import type {DistractionFreeModeProvider} from '../../nuclide-distraction-free-mode';
import type {GetToolBar} from '../../commons-atom/suda-tool-bar';

import {ContextViewManager} from './ContextViewManager';
import {Disposable, CompositeDisposable} from 'atom';
import passesGK from '../../commons-node/passesGK';
import invariant from 'assert';

const INITIAL_PANEL_WIDTH = 300;
const INITIAL_PANEL_VISIBILITY = false;
const CONTEXT_VIEW_GK = 'nuclide_context_view';

let currentService: ?DefinitionService = null;
let manager: ?ContextViewManager = null;
let disposables: CompositeDisposable;
const initialViewState = {};

export function activate(state?: Object = {}): void {
  initialViewState.width = state.width || INITIAL_PANEL_WIDTH;
  initialViewState.visible = state.visible || INITIAL_PANEL_VISIBILITY;
  disposables = new CompositeDisposable();
  // Toggle
  disposables.add(
    atom.commands.add(
      'atom-workspace',
      'nuclide-context-view:toggle',
      this.toggleContextView.bind(this),
    ),
  );

  // Show
  disposables.add(
    atom.commands.add(
      'atom-workspace',
      'nuclide-context-view:show',
      this.showContextView.bind(this),
    ),
  );

  // Hide
  disposables.add(
    atom.commands.add(
      'atom-workspace',
      'nuclide-context-view:hide',
      this.hideContextView.bind(this),
    ),
  );
}

export function deactivate(): void {
  currentService = null;
  disposables.dispose();
  if (manager != null) {
    manager.consumeDefinitionService(null);
    manager.dispose();
    manager = null;
  }
}

export function serialize(): ?ContextViewConfig {
  if (manager != null) {
    return manager.serialize();
  }
}

/** Returns the singleton ContextViewManager instance of this package, or null
 * if the user doesn't pass the Context View GK check. */
async function getContextViewManager(): Promise<?ContextViewManager> {
  if (!await passesGK(CONTEXT_VIEW_GK)) {
    return null;
  }
  if (manager == null) {
    manager = new ContextViewManager(initialViewState.width, initialViewState.visible);
  }
  return manager;
}

export async function toggleContextView(): Promise<void> {
  const contextViewManager = await getContextViewManager();
  if (contextViewManager != null) {
    contextViewManager.toggle();
  }
}

export async function showContextView(): Promise<void> {
  const contextViewManager = await getContextViewManager();
  if (contextViewManager != null) {
    contextViewManager.show();
  }
}

export async function hideContextView(): Promise<void> {
  const contextViewManager = await getContextViewManager();
  if (contextViewManager != null) {
    contextViewManager.hide();
  }
}

/**
 * This is the context view service that other Nuclide packages consume when they
 * want to provide context for a definition. A context provider must consume the
 * nuclide-context-view service and register themselves as a provider.
 */
const Service: NuclideContextView = {
  async registerProvider(provider: ContextProvider): Promise<Disposable> {
    invariant(provider != null, 'Cannot register null context provider');
    const contextViewManager = await getContextViewManager();
    if (contextViewManager == null) {
      return new Disposable();
    }
    contextViewManager.registerProvider(provider);
    return new Disposable(() => {
      contextViewManager.unregisterProvider(provider.id);
    });
  },
};

export function consumeDefinitionService(service: DefinitionService): IDisposable {
  getContextViewManager().then((contextViewManager: ?ContextViewManager) => {
    if (contextViewManager == null) {
      return;
    }
    if (service !== currentService) {
      currentService = service;
      contextViewManager.consumeDefinitionService(currentService);
    }
  });
  return new Disposable(() => {
    currentService = null;
    if (manager != null) {
      manager.consumeDefinitionService(null);
    }
  });
}

export async function consumeToolBar(getToolBar: GetToolBar): Promise<IDisposable> {
  const contextViewManager = await getContextViewManager();
  if (contextViewManager != null) {
    const toolBar = getToolBar('nuclide-context-view');
    const {element} = toolBar.addButton({
      icon: 'info',
      callback: 'nuclide-context-view:toggle',
      tooltip: 'Toggle Context View',
    });
    element.classList.add('nuclide-context-view-toolbar-button');
    const disposable = new Disposable(() => { toolBar.removeItems(); });
    disposables.add(disposable);
    return disposable;
  }
  return new Disposable();
}

export function getDistractionFreeModeProvider(): DistractionFreeModeProvider {
  return {
    name: 'nuclide-context-view',
    isVisible(): boolean {
      // IMPORTANT: The `manager != null && manager._isVisible check is an antipattern.
      // Since distraction free mode requires a *synchronous* isVisible, this
      // checks manager != null rather than using the GK-safe but async getContextViewManager().
      // If you're modifying nuclide-context-view, use async getContextViewManager() unless
      // you have a really good reason to directly reference `manager`.
      return manager != null && manager._isVisible;
    },
    toggle(): void {
      atom.commands.dispatch(
        atom.views.getView(atom.workspace),
        'nuclide-context-view:toggle',
      );
    },
  };
}

export function provideNuclideContextView(): NuclideContextView {
  return Service;
}
