'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export type WId = {
  site: number;
  h: number;
};

export type WCharRun = {
  startId: WId;
  visible: boolean;
  startDegree: number;
  length: number;
};

export class WString {
  static start: WCharRun;
  static end: WCharRun;
  _siteId: number;
  _localId: number;
  _string: Array<WCharRun>;

  constructor(siteId: number, length: number = 0) {
    this._siteId = siteId;
    this._localId = 1;
    this._string = [WString.start, WString.end];
    if (length > 0) {
      this._localId = length;
      this.insert(
        1,
        {
          startId: {
            site: siteId,
            h: 1,
          },
          visible: true,
          startDegree: 1,
          length: length,
        },
        length,
      );
    }
  }

  insert(pos: number, c: WCharRun) {
    // Find the run that has the previous position in it.
    let leftHalfIndex;
    let offset = pos;
    for (leftHalfIndex = 0; leftHalfIndex < this._string.length; leftHalfIndex++) {
      if (this._string[leftHalfIndex].length >= offset) {
        break;
      }
      offset -= this._string[leftHalfIndex].length;
    }

    const leftHalf = this._string[leftHalfIndex];

    // There are 3 cases we handle. Assume the following run
    // [begin][id:1,1; len: 3, vis: 1;][end]
    //
    // The first case is where we can merely extend the previous run
    // insert(4, {id: 1,4; len: 1; vis: 1})
    //
    // [begin][id:1,1; len: 3, vis: 1;]*insert here*[end]
    // =>
    // [begin][id:1,1; len: *4*, vis: 1;][end]
    //
    // The next case is where we are at the end but cannont extend.
    //
    // insert(4, {id: *2,7*; len: 1; vis: 1})
    //
    // [begin][id:1,1; len: 3, vis: 1;]*insert here*[end]
    // =>
    // [begin][id:1,1; len: 3, vis: 1;][id:2,7; len: 1, vis: 1;][end]
    //
    // The last case is where we split the previous run.
    // insert(3, {id: 1,4; len: 1; vis: 1})
    //
    // [begin][id:1,1; len: 4, vis: 1;]*<= insert inside there*[end]
    // =>
    // [begin][id:1,1; len: 2, vis: 1;][id:1,4; len: 1, vis: 1;][id:1,3; len: 2, vis: 1;][end]
    if (leftHalf.startId.site === c.startId.site
      && leftHalf.startId.h  === c.startId.h - leftHalf.length
      && offset === leftHalf.length
      && c.visible === leftHalf.visible) {
      leftHalf.length += c.length;
    } else if (offset === leftHalf.length) {
      this._string.splice(
        leftHalfIndex + 1,
        0,
        c,
      );
    } else {
      const rightHalf = {
        startId: {
          site: leftHalf.startId.site,
          h: leftHalf.startId.h + offset,
        },
        visible: leftHalf.visible,
        length: leftHalf.length - offset,
        startDegree: leftHalf.startDegree + offset,
      };

      leftHalf.length -= leftHalf.length - offset;
      this._string.splice(
        leftHalfIndex + 1,
        0,
        c,
        rightHalf,
      );
    }
  }
}

WString.start = {
  startId: {site: -1, h: 0},
  visible: true,
  startDegree: 0,
  length: 1,
};

WString.end = {
  startId: {site: -1, h: 1},
  visible: true,
  startDegree: 0,
  length: 1,
};
