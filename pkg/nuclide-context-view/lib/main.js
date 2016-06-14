'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {ContextViewManager} from './ContextViewManager';
import type {ContextViewConfig} from './ContextViewManager';

import type {DefinitionService} from '../../nuclide-definition-service';
import invariant from 'assert';

import {Disposable} from 'atom';

let currentService: ?DefinitionService = null;

const INITIAL_PANEL_WIDTH: number = 300;
const INITIAL_PANEL_VISIBILITY: boolean = false;

let manager: ?ContextViewManager = null;

export function activate(state: ContextViewConfig | void): void {
  if (manager === null) {
    manager = (state != null)
    ? new ContextViewManager(state.width, state.visible)
    : new ContextViewManager(INITIAL_PANEL_WIDTH, INITIAL_PANEL_VISIBILITY);
  }
}

export function deactivate(): void {
  if (manager != null) {
    manager.dispose();
    manager = null;
  }
}

export function serialize(): ?ContextViewConfig {
  if (manager != null) {
    return manager.serialize();
  }
}

function updateService(): void {
  if (manager != null) {
    manager.setDefinitionService(currentService);
  }
}

export function consumeDefinitionService(service: DefinitionService): IDisposable {
  invariant(currentService == null);
  currentService = service;
  updateService();
  return new Disposable(() => {
    invariant(currentService === service);
    currentService = null;
    updateService();
  });
}
