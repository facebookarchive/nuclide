/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {TrackingEvent} from '../../nuclide-analytics';

export type ViewableFactory = {
  id: string,
  name: string,
  iconName?: atom$Octicon,
  toggleCommand?: string,
  defaultLocation?: string,
  allowedLocations?: Array<string>,
  disallowedLocations?: Array<string>,

  create(): Viewable,
  isInstance(item: Viewable): boolean,
};

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
  +getPreferredInitialHeight?: () => number,
  +getPreferredInitialWidth?: () => number,
  +didChangeVisibility?: (visible: boolean) => void,
};

export type Location = {
  destroy(): void,
  destroyItem(item: Object): void,
  getItems(): Array<Viewable>,
  hideItem(item: Viewable): void,
  itemIsVisible(item: Viewable): boolean,
  showItem(item: Viewable): void,
  serialize(): ?Object,
};

export type LocationFactory = {
  id: string,
  create(serializedState: ?Object): Location,
};

export type WorkspaceViewsService = {
  registerFactory(factory: ViewableFactory): IDisposable,
  registerLocation(factory: LocationFactory): IDisposable,
  getViewableFactories(location: string): Array<ViewableFactory>,
  observeViewableFactories(
    location: string,
    cb: (factories: Set<ViewableFactory>) => void,
  ): IDisposable,
};

export type AppState = {
  viewableFactories: Map<string, ViewableFactory>,
  locations: Map<string, Location>,
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

type CreateViewableAction = {
  type: 'CREATE_VIEWABLE',
  payload: {
    itemType: string,
  },
};

type ItemCreatedAction = {
  type: 'ITEM_CREATED',
  payload: {
    item: Object,
    itemType: string,
  },
};

type RegisterViewableFactoryAction = {
  type: 'REGISTER_VIEWABLE_FACTORY',
  payload: {
    viewableFactory: ViewableFactory,
  },
};

type UnregisterViewableFactoryAction = {
  type: 'UNREGISTER_VIEWABLE_FACTORY',
  payload: {
    id: string,
  },
};

type ViewableFactoryUnregisteredAction = {
  type: 'VIEWABLE_FACTORY_UNREGISTERED',
  payload: {
    id: string,
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
    itemType: string,
    visible: ?boolean,
    immediate: boolean,
  },
};

type TrackAction = {
  type: 'TRACK',
  payload: {
    event: TrackingEvent,
  },
};

export type Action =
  CreateViewableAction
  | ItemCreatedAction
  | RegisterViewableFactoryAction
  | TrackAction
  | UnregisterViewableFactoryAction
  | ViewableFactoryUnregisteredAction
  | RegisterLocationAction
  | RegisterLocationFactoryAction
  | UnregisterLocationAction
  | LocationUnregisteredAction
  | SetItemVisibilityAction
  | ToggleItemVisibilityAction;
