'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {AppState, SerializedAppState} from './types';

import {objectEntries, objectFromMap} from '../../commons-node/collection';

export function serialize(state: AppState): SerializedAppState {
  return {
    serializedLocationStates: objectFromMap(
      new Map(
        Array.from(state.locations.entries())
          .map(([id, location]) => {
            const serialized =
              typeof location.serialize === 'function' ? location.serialize() : null;
            return [id, serialized];
          })
          .filter(([, serialized]) => serialized != null),
      ),
    ),
  };
}

export function deserialize(rawState: SerializedAppState): AppState {
  return {
    // Viewables and locations will re-register using the service.
    locations: new Map(),
    serializedLocationStates: new Map(objectEntries(rawState.serializedLocationStates || {})),
    openers: new Set(),
  };
}
