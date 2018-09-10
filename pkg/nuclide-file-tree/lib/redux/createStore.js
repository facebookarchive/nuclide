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
    .filter(epic => typeof epic === 'function')
    // Catch each epic individually, instead of catching the rootEpic
    // since otherwise we'll resubscribe every epic on any error.
    // https://github.com/redux-observable/redux-observable/issues/94
    .map(epic => (...args) =>
      // $FlowFixMe(>=0.70.0) Flow suppress (T28750930)
      epic(...args).catch((error, source) => {
        getLogger('nuclide-file-tree').error(error);
        return source;
      }),
    );
  const rootEpic = (actions, store) => combineEpics(...epics)(actions, store);

  return _createStore(
    Reducers,
    null,
    applyMiddleware(createEpicMiddleware(rootEpic)),
  );
}
