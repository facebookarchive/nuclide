/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {
  Viewable,
  Opener,
  Location,
  WorkspaceViewsService,
} from 'nuclide-commons-atom/workspace-views-compat';

export type {Viewable, WorkspaceViewsService};

export type AppState = {
  locations: Map<string, Location>,
  openers: Set<Opener>,
  serializedLocationStates: Map<string, ?Object>,
};

export type SerializedAppState = {
  serializedLocationStates: {[locationId: string]: ?Object},
};
