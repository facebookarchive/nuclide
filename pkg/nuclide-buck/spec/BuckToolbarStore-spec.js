'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import BuckToolbarStore from '../lib/BuckToolbarStore';
import BuckToolbarDispatcher, {ActionTypes} from '../lib/BuckToolbarDispatcher';

describe('BuckToolbarStore', () => {

  let store;
  let dispatcher;

  beforeEach(() => {
    // Set up flux stuff.
    dispatcher = new BuckToolbarDispatcher();
    store = new BuckToolbarStore(dispatcher, null);
  });

  it('sets the loading state when the project is set', () => {
    dispatcher.dispatch({
      actionType: ActionTypes.UPDATE_PROJECT_ROOT,
      projectRoot: '/path/to/whatever',
    });
    expect(store.isLoadingBuckProject()).toBe(true);
  });

  it('sets the loading state when the buck project is loaded', () => {
    dispatcher.dispatch({
      actionType: ActionTypes.UPDATE_PROJECT_ROOT,
      projectRoot: '/path/to/whatever',
    });
    dispatcher.dispatch({
      actionType: ActionTypes.UPDATE_BUCK_ROOT,
      buckRoot: '/path/to/whatever',
    });
    expect(store.isLoadingBuckProject()).toBe(false);
  });

});
