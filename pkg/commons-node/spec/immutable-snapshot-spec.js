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

import {
  List,
  ImmutableSnapshotter,
  ImmutableSnapshotReader,
} from '../immutable-snapshot';

describe('ImmutableSnapshot', () => {
  let snapshotter: ImmutableSnapshotter;
  let reader: ImmutableSnapshotReader;
  beforeEach(() => {
    snapshotter = new ImmutableSnapshotter();
    reader = new ImmutableSnapshotReader();
  });

  function verify(object, expected) {
    const isDeltaSnapshot = snapshotter._previousSnapshotObjects != null;
    const snapshot = snapshotter.createDeltaSnapshot(object);
    const stringified = JSON.stringify(snapshot, null, 2);
    // console.log(stringified);
    expect(JSON.parse(stringified)).toEqual(snapshot);
    expect(reader.readSnapshot(snapshot).toJS()).toEqual(expected);
    if (isDeltaSnapshot) {
      const {root, snapshotObjects} = snapshot;
      const serialized = snapshotObjects[root];
      expect(serialized.type).toBe('delta');
    }
  }

  describe('DiffableList', () => {
    it('records basic mutations', () => {
      let list = List([1, 2, 3]);
      verify(list, [1, 2, 3]);
      list = list.push(4);
      list = list.push(5);
      list = list.shift();
      list = list.delete(1);
      verify(list, [2, 4, 5]);
    });

    it('does not store mutations to an empty object', () => {
      let list = List([]);
      verify(list, []);
      list = list.push(1);
      const {root, snapshotObjects} = snapshotter.createDeltaSnapshot(list);
      expect(snapshotObjects[root].type).toBe('list');
    });

    it('works with JS objects', () => {
      let list = List([1]);
      verify(list, [1]);
      list = list.push([1, 2, 3]).push({a: {b: 1}});
      verify(list, [1, [1, 2, 3], {a: {b: 1}}]);
    });

    it('works with withMutations', () => {
      let list = List([1, 2, 3]);
      verify(list, [1, 2, 3]);
      list = list.withMutations(mutableList => {
        mutableList.clear();
        mutableList.push(4);
        mutableList.push(5);
      });
      verify(list, [4, 5]);
    });

    it('continues to wrap things after an unserializable mutation', () => {
      let list = List([1, 2, 3]).sort((x, y) => y - x);
      verify(list, [3, 2, 1]);
      list = list.unshift(4);
      verify(list, [4, 3, 2, 1]);
    });
  });
});
