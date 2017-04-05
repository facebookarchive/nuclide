/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {TrackingEvent} from '../../nuclide-analytics';

/**
 * The object used as items in locations. This is based on the supported interface for items in Atom
 * panes. That way, we maintain compatibility with Atom (upstream?) and can put them in panes as-is.
 *
 * The truth is that these models can have any methods they want. Packages define ad-hoc protocols
 * and check to see if the item implements them. For example, atom-tabs will call `getIconName()` if
 * it exists. We have some of our own optional methods which, for clarity's sake, are defined here,
 * even though they're only used by some of our location packages.
 *
 * IMPORTANT: All properties and methods must be optional so that we maintain compatibility with
 * non-nuclide items.
 */
export type Viewable = atom$PaneItem & {
  // Used by PanelLocation to get an initial size for the panel.
  +getPreferredHeight?: () => number,
  +getPreferredWidth?: () => number,
  +didChangeVisibility?: (visible: boolean) => void,
  +getDefaultLocation?: () => string,
};

export type Opener = (uri: string) => ?Viewable;

export type OpenOptions = {
  activateItem?: boolean,
  activateLocation?: boolean,
  searchAllPanes?: boolean,
};

export type Location = {
  activate(): void,
  activateItem(item: Object): void,
  addItem(item: Object): void,
  destroy(): void,
  destroyItem(item: Object): void,
  getItems(): Array<Viewable>,
  hideItem(item: Viewable): void,
  itemIsVisible(item: Viewable): boolean,
  serialize(): ?Object,

  onDidAddItem(cb: (item: Viewable) => void): IDisposable,
};

export type LocationFactory = {
  id: string,
  create(serializedState: ?Object): Location,
};

export type ToggleOptions = {
  visible?: ?boolean,
};

export type WorkspaceViewsService = {
  addOpener(opener: Opener): IDisposable,
  destroyWhere(predicate: (item: Viewable) => boolean): void,
  open(uri: string, options?: OpenOptions): void,
  registerLocation(factory: LocationFactory): IDisposable,
  toggle(uri: string, options?: ToggleOptions): void,
};

export type AppState = {
  locations: Map<string, Location>,
  openers: Set<Opener>,
  serializedLocationStates: Map<string, ?Object>,
};

export type SerializedAppState = {
  serializedLocationStates: {[locationId: string]: ?Object},
};

export type Store = {
  getState(): AppState,
  dispatch(action: Action): void,
};

//
// Actions
//

type AddOpenerAction = {
  type: 'ADD_OPENER',
  payload: {
    opener: Opener,
  },
};

type DestroyWhereAction = {
  type: 'DESTROY_WHERE',
  payload: {
    predicate: (item: Viewable) => boolean,
  },
};

type DidActivateInitialPackagesAction = {
  type: 'DID_ACTIVATE_INITIAL_PACKAGES',
};

type RemoveOpenerAction = {
  type: 'REMOVE_OPENER',
  payload: {
    opener: Opener,
  },
};

type OpenAction = {
  type: 'OPEN',
  payload: {
    uri: string,
    options: {
      searchAllPanes: boolean,
      activateItem: boolean,
      activateLocation: boolean,
    },
  },
};

type ItemCreatedAction = {
  type: 'ITEM_CREATED',
  payload: {
    item: Object,
    itemType: string,
  },
};

type RegisterLocationAction = {
  type: 'REGISTER_LOCATION',
  payload: {
    id: string,
    location: Location,
  },
};

type RegisterLocationFactoryAction = {
  type: 'REGISTER_LOCATION_FACTORY',
  payload: {
    locationFactory: LocationFactory,
  },
};

type UnregisterLocationAction = {
  type: 'UNREGISTER_LOCATION',
  payload: {
    id: string,
  },
};

type LocationUnregisteredAction = {
  type: 'LOCATION_UNREGISTERED',
  payload: {
    id: string,
  },
};

type SetItemVisibilityAction = {
  type: 'SET_ITEM_VISIBILITY',
  payload: {
    item: Viewable,
    locationId: string,
    visible: boolean,
  },
};

type ToggleItemVisibilityAction = {
  type: 'TOGGLE_ITEM_VISIBILITY',
  payload: {
    uri: string,
    visible: ?boolean,
  },
};

type TrackAction = {
  type: 'TRACK',
  payload: {
    event: TrackingEvent,
  },
};

export type Action =
  AddOpenerAction
  | DestroyWhereAction
  | DidActivateInitialPackagesAction
  | RemoveOpenerAction
  | OpenAction
  | ItemCreatedAction
  | TrackAction
  | RegisterLocationAction
  | RegisterLocationFactoryAction
  | UnregisterLocationAction
  | LocationUnregisteredAction
  | SetItemVisibilityAction
  | ToggleItemVisibilityAction;
