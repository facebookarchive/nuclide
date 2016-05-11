'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';

export type WId = {
  site: number;
  h: number;
};

export type WChar = {
  id: WId;
  visible: boolean;
  degree: number;
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
      && leftHalf.startId.h === c.startId.h - leftHalf.length
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

  canMergeRight(i: number): boolean {
    invariant(i < this._string.length - 1);
    return this._string[i].startId.site === this._string[i + 1].startId.site
      && this._string[i].startId.h === this._string[i + 1].startId.h - this._string[i].length
      && this._string[i].visible === this._string[i + 1].visible;
  }

  mergeRuns() {
    const newString = [];
    newString.push(this._string[0]);
    for (let i = 0; i < this._string.length - 1; i++) {
      if (this.canMergeRight(i)) {
        newString[newString.length - 1].length += this._string[i + 1].length;
      } else {
        newString.push(this._string[i + 1]);
      }
    }
    this._string = newString;
  }

  integrateDelete(pos: number): void {
    let originalIndex;
    let offset = pos;

    // Find the index of the WString run containing this position
    for (originalIndex = 0; originalIndex < this._string.length; originalIndex++) {
      if (this._string[originalIndex].length > offset && this._string[originalIndex].visible) {
        break;
      }
      if (this._string[originalIndex].visible) {
        offset -= this._string[originalIndex].length;
      }
    }

    const runs = [];

    const original = this._string[originalIndex];

    if (offset > 0) {
      runs.push({
        startId: {
          site: original.startId.site,
          h: original.startId.h,
        },
        visible: original.visible,
        length: offset,
        startDegree: original.startDegree,
      });
    }

    runs.push({
      startId: {
        site: original.startId.site,
        h: original.startId.h + offset,
      },
      visible: false,
      length: 1,
      startDegree: original.startDegree + offset,
    });

    if (offset < original.length - 1) {
      runs.push({
        startId: {
          site: original.startId.site,
          h: original.startId.h + offset + 1,
        },
        visible: original.visible,
        length: original.length - (offset + 1),
        startDegree: original.startDegree + offset + 1,
      });
    }

    this._string.splice(
      originalIndex,
      1,
      ...runs,
    );

    this.mergeRuns();
  }

  pos(c: WChar, visibleOnly: boolean = false): number {
    let currentOffset = 0;

    for (let i = 0; i < this._string.length; i++) {
      const currentRun = this._string[i];
      if (currentRun.startId.site === c.id.site
        && currentRun.startId.h <= c.id.h
        && currentRun.startId.h + currentRun.length > c.id.h
        && (!visibleOnly || this._string[i].visible)) {
        return currentOffset + (c.id.h - currentRun.startId.h);
      }
      if (!visibleOnly || this._string[i].visible) {
        currentOffset += currentRun.length;
      }
    }
    return -1;
  }

  charFromRun(run: WCharRun, offset: number): WChar {
    return {
      id: {
        site: run.startId.site,
        h: run.startId.h + offset,
      },
      degree: run.startDegree + offset,
      visible: run.visible,
    };
  }

  ith(pos: number, visibleOnly: boolean = true): WChar {
    let i;
    let offset = pos;

    for (i = 0; i < this._string.length; i++) {
      if (this._string[i].length > offset && (!visibleOnly || this._string[i].visible)) {
        break;
      }
      if (!visibleOnly || this._string[i].visible) {
        offset -= this._string[i].length;
      }
    }

    return this.charFromRun(this._string[i], offset);
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
