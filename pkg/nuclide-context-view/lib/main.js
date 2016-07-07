'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ContextViewConfig, ContextProvider} from './ContextViewManager';
import type {DefinitionService} from '../../nuclide-definition-service';

import {ContextViewManager} from './ContextViewManager';
import {Disposable} from 'atom';
import passesGK from '../../commons-node/passesGK';
import invariant from 'assert';

const INITIAL_PANEL_WIDTH = 300;
const INITIAL_PANEL_VISIBILITY = false;
const CONTEXT_VIEW_GK = 'nuclide_context_view';

let currentService: ?DefinitionService = null;
let manager: ?ContextViewManager = null;
const initialViewState = {};

export function activate(activationState: ContextViewConfig = {}): void {
  initialViewState.width = activationState.width || INITIAL_PANEL_WIDTH;
  initialViewState.visible = activationState.visible || INITIAL_PANEL_VISIBILITY;
}

export function deactivate(): void {
  currentService = null;
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

/**
 * This is the context view service that other Nuclide packages consume when they
 * want to provide context for a definition. A context provider must consume the
 * nuclide-context-view service and register themselves as a provider.
 */
const Service = {
  async registerProvider(provider: ContextProvider): Promise<Disposable> {
    invariant(provider != null, 'Cannot register null context provider');
    const contextViewManager = await getContextViewManager();
    if (contextViewManager == null) {
      return new Disposable();
    }
    contextViewManager.registerProvider(provider);
    return new Disposable(() => {
      contextViewManager.deregisterProvider(provider.id);
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

export type NuclideContextView = typeof Service;

export function provideNuclideContextView(): NuclideContextView {
  return Service;
}
