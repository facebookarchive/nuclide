'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {DistractionFreeModeProvider} from '../../nuclide-distraction-free-mode';
import type {WorkspaceViewsService} from '../../nuclide-workspace-views/lib/types';
import type {PanelLocationId} from './types';

import createPackage from '../../commons-atom/createPackage';
import {PaneLocation} from './PaneLocation';
import {PanelLocation} from './PanelLocation';
import PanelLocationIds from './PanelLocationIds';
import {CompositeDisposable} from 'atom';

// This package doesn't actually serialize its own state. The reason is that we want to centralize
// that so that we can (eventually) associate them with profiles or workspace configurations.

class Activation {
  _disposables: CompositeDisposable;
  _panelLocations: Map<string, PanelLocation>;

  // The initial visiblity of each panel. A null/undefined value signifies that the serialized
  // visibility should be used.
  _initialPanelVisibility: Map<PanelLocationId, ?boolean>;

  constructor() {
    this._disposables = new CompositeDisposable();
    this._panelLocations = new Map();
    this._initialPanelVisibility = new Map();
  }

  dispose(): void {
    this._disposables.dispose();
  }

  _toggleVisibility(id: PanelLocationId): void {
    const location = this._panelLocations.get(id);
    if (location == null) {
      // We haven't created the panel yet. Store the visibility value so we can use it once we
      // do.
      const prevVisibility = this._initialPanelVisibility.get(id);
      this._initialPanelVisibility.set(id, !prevVisibility);
    } else {
      location.toggle();
    }
  }

  consumeWorkspaceViewsService(api: WorkspaceViewsService): void {
    this._disposables.add(
      api.registerLocation({id: 'pane', create: () => new PaneLocation()}),
      ...PanelLocationIds.map(id => api.registerLocation({
        id,
        create: serializedState_ => {
          const serializedState = serializedState_ == null ? {} : serializedState_;
          const initialVisibility = this._initialPanelVisibility.get(id);
          if (initialVisibility != null) {
            serializedState.visible = initialVisibility;
          }
          const location = new PanelLocation(id, serializedState);
          location.initialize();
          this._panelLocations.set(id, location);
          return location;
        },
      })),
      ...PanelLocationIds.map(id => (
        atom.commands.add(
          'atom-workspace',
          `nuclide-workspace-views:toggle-${id}`,
          () => { this._toggleVisibility(id); },
        )
      )),
    );
  }

  /**
   * Provide an interface to DSF for each panel. Because the services are asynchronous, we have to
   * account for the posibility that the panel hasn't yet been created (and we can't just create it
   * early beccause we need the serialized state which we get asynchronously as well). In that case,
   * store the visiblity DSF wants and use it when we create the panel later.
   */
  provideDistractionFreeModeProvider(): Array<DistractionFreeModeProvider> {
    this._initialPanelVisibility = new Map(PanelLocationIds.map(id => [id, false]));
    return PanelLocationIds.map(id => ({
      name: `nuclide-workspace-view-locations:${id}`,
      isVisible: () => {
        const location = this._panelLocations.get(id);
        return location == null
          ? Boolean(this._initialPanelVisibility.get(id))
          : location.isVisible();
      },
      toggle: () => { this._toggleVisibility(id); },
    }));
  }

}

export default createPackage(Activation);
