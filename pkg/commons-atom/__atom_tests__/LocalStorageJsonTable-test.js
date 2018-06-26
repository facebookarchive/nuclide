'use strict';

var _LocalStorageJsonTable;

function _load_LocalStorageJsonTable() {
  return _LocalStorageJsonTable = require('../LocalStorageJsonTable');
}

beforeEach(() => {
  jest.restoreAllMocks();
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     *  strict-local
     * @format
     */

/* global localStorage */

describe('LocalStorageJsonTable', () => {
  it('writes values to localStorage', () => {
    jest.spyOn(localStorage, 'setItem').mockImplementation(() => {});
    const storage = new (_LocalStorageJsonTable || _load_LocalStorageJsonTable()).LocalStorageJsonTable('test');
    storage.setItem('a', true);
    expect(localStorage.setItem.mock.calls[0]).toEqual(['test', JSON.stringify([{ key: 'a', value: true }])]);
  });

  it('writes multiple values to localStorage', () => {
    jest.spyOn(localStorage, 'setItem').mockImplementation(() => {});
    const storage = new (_LocalStorageJsonTable || _load_LocalStorageJsonTable()).LocalStorageJsonTable('test');
    storage.setItem('a', 1);
    storage.setItem('b', 2);
    expect(localStorage.setItem.mock.calls[localStorage.setItem.mock.calls.length - 1]).toEqual(['test', JSON.stringify([{ key: 'a', value: 1 }, { key: 'b', value: 2 }])]);
  });

  it('retrieves values from localStorage', () => {
    jest.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify([{ key: 'a', value: true }]));
    const storage = new (_LocalStorageJsonTable || _load_LocalStorageJsonTable()).LocalStorageJsonTable('test');
    expect(storage.getItem('a')).toBe(true);
  });

  it('retrieves entries from localStorage', () => {
    jest.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify([{ key: 'a', value: true }]));
    const storage = new (_LocalStorageJsonTable || _load_LocalStorageJsonTable()).LocalStorageJsonTable('test');
    expect(storage.getEntries()).toEqual([{ key: 'a', value: true }]);
  });

  it('has the correct order when the same key is reused', () => {
    jest.spyOn(localStorage, 'setItem').mockImplementation(() => {});
    const storage = new (_LocalStorageJsonTable || _load_LocalStorageJsonTable()).LocalStorageJsonTable('test');
    storage.setItem('a', 1);
    storage.setItem('b', 2);
    storage.setItem('a', 1);
    expect(localStorage.setItem.mock.calls[localStorage.setItem.mock.calls.length - 1]).toEqual(['test', JSON.stringify([{ key: 'b', value: 2 }, { key: 'a', value: 1 }])]);
  });

  it("doesn't call setItem when not necessary", () => {
    jest.spyOn(localStorage, 'setItem').mockImplementation(() => {});
    const storage = new (_LocalStorageJsonTable || _load_LocalStorageJsonTable()).LocalStorageJsonTable('test');
    storage.setItem('a', 1);
    storage.setItem('b', 2);
    storage.setItem('b', 2);
    expect(localStorage.setItem.mock.calls.length).toBe(2);
  });
});