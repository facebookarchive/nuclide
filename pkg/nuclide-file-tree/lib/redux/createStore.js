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

import type {Store} from '../types';

import {createStore as _createStore} from 'redux';
import {getLogger} from 'log4js';
import {
  combineEpics,
  createEpicMiddleware,
} from 'nuclide-commons/redux-observable';
import {applyMiddleware} from 'redux';
import * as Epics from './Epics';
import Reducers from './Reducers';

export default function createStore(): Store {
  const epics = Object.keys(Epics)
    .map(k => Epics[k])
    .filter(epic => typeof epic === 'function');
  const rootEpic = (actions, store) =>
    combineEpics(...epics)(actions, store).catch((err, stream) => {
      getLogger('nuclide-file-tree').error(err);
      return stream;
    });

  return _createStore(
    Reducers,
    null,
    applyMiddleware(createEpicMiddleware(rootEpic)),
  );
}
