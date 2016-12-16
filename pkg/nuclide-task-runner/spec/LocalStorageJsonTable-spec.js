/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

/* global localStorage */

import {LocalStorageJsonTable} from '../lib/LocalStorageJsonTable';

describe('LocalStorageJsonTable', () => {
  it('writes values to localStorage', () => {
    spyOn(localStorage, 'setItem');
    const storage = new LocalStorageJsonTable('test');
    storage.setItem('a', true);
    expect(localStorage.setItem.calls[0].args)
      .toEqual(['test', JSON.stringify([{key: 'a', value: true}])]);
  });

  it('retrieves values from localStorage', () => {
    spyOn(localStorage, 'getItem').andReturn(JSON.stringify([{key: 'a', value: true}]));
    const storage = new LocalStorageJsonTable('test');
    expect(storage.getItem('a')).toBe(true);
  });

  it('retrieves entries from localStorage', () => {
    spyOn(localStorage, 'getItem').andReturn(JSON.stringify([{key: 'a', value: true}]));
    const storage = new LocalStorageJsonTable('test');
    expect(storage.getEntries()).toEqual([{key: 'a', value: true}]);
  });
});
