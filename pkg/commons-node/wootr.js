/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import invariant from 'assert';

export type WId = {
  site: number,
  h: number,
};

export type WChar = {
  id: WId,
  visible: boolean,
  degree: number,
};

export type WCharRun = {
  startId: WId,
  visible: boolean,
  startDegree: number,
  length: number,
};

export type WOpType = 'INS' | 'DEL';

export type WOp = {
  type: WOpType,
  text?: string,
  char?: WCharRun,
  runs?: Array<WCharRun>,
  next?: WChar,
  prev?: WChar,
};

// Represents a concrete change to a string.  That is, the result of applying
// the WOp to the local string.
export type WChange = {
  addition?: {pos: number, text: string},
  removals?: Array<{pos: number, count: number}>,
};

function idLess(idLeft: WId, idRight: WId): boolean {
  return (idLeft.site < idRight.site
    || (idLeft.site === idRight.site && idLeft.h < idRight.h));
}

export class WString {
  static start: WCharRun;
  static end: WCharRun;
  _siteId: number;
  _localId: number;
  _string: Array<WCharRun>;
  _ops: Array<WOp>;

  constructor(siteId: number, length: number = 0) {
    this._siteId = siteId;
    this._localId = 1;
    this._string = [WString.start, WString.end];
    this._ops = [];
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
          length,
        },
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

  /**
   * Returns the subset (left, right) of the string sequence (exlusive on both sides)
   */
  subseq(left: WChar, right: WChar): Array<WChar> {
    const sub = [];
    if (left == null || right == null) {
      throw new Error('asdf');
    }
    const start = this.pos(left, false);
    const end = this.pos(right, false);

    for (let i = start + 1; i < end; i++) {
      sub.push(this.ith(i, false));
    }

    return sub;
  }

  genInsert(pos: number, text: string): WOp {
    const prevChar = this.ith(pos);
    const nextChar = this.ith(pos + 1);

    if (prevChar == null || nextChar == null) {
      throw new Error(`Position ${pos} invalid within wstring`);
    }

    const c = {
      startId: {
        site: this._siteId,
        h: this._localId,
      },
      visible: true,
      startDegree: Math.max(prevChar.degree, nextChar.degree) + 1,
      length: text.length,
    };
    this._localId += text.length;

    this.integrateIns(c, prevChar, nextChar);

    return {type: 'INS', char: {...c}, prev: prevChar, next: nextChar, text};
  }

  // Main wooto algorithm. see: "Wooki: a P2P Wiki-based Collaborative Writing Tool"
  // returns the visible position of the string that this text is inserted into
  integrateIns(c: WCharRun, cp: WChar, cn: WChar): number {
    // Consider the sequence of characters between cp, and cn
    const sub = this.subseq(cp, cn);
    // If this is an empty sequence just insert the character
    if (sub.length === 0) {
      const pos = this.pos(cn);
      this.insert(pos, c);
      return this.pos(this.charFromRun(c, 0), true);
    }

    // Else, only consider the characters with minimum degree.  Other characters
    // positions in the sequence are determing by the order relations.
    const minDegree = Math.min(...sub.map(c2 => c2.degree));
    const idOrderedSubset = [cp, ...sub.filter(c2 => c2.degree === minDegree), cn];

    // Find the position of the new character in this sequence of characters
    // ordered by the ids
    let i = idOrderedSubset.findIndex(elm => !idLess(elm.id, c.startId));
    if (i === -1) {
      i = idOrderedSubset.length - 1;
    }
    return this.integrateIns(c, idOrderedSubset[i - 1], idOrderedSubset[i]);
  }

  charToRun(char: WChar, visible: boolean): WCharRun {
    return {
      startId: {
        site: char.id.site,
        h: char.id.h,
      },
      startDegree: char.degree,
      visible,
      length: 1,
    };
  }

  canExtendRun(run: WCharRun, char: WChar): boolean {
    return run.startId.site === char.id.site
      && run.startId.h + run.length === char.id.h
      && run.startDegree + run.length === char.degree;
  }

  charsToRuns(chars: Array<WChar>): Array<WCharRun> {
    if (chars.length === 0) {
      return [];
    }

    const runs = [];
    let curRun = this.charToRun(chars[0], false);

    for (let i = 1; i < chars.length; i++) {
      if (this.canExtendRun(curRun, chars[i])) {
        curRun.length += 1;
      } else {
        runs.push(curRun);
        curRun = this.charToRun(chars[i], false);
      }
    }

    runs.push(curRun);

    return runs;
  }

  genDelete(pos: number, count: number = 1): WOp {
    const chars = [];
    for (let i = 0; i < count; i++) {
      chars.push(this.ith(pos + 1));
      this.integrateDelete(pos + 1);
    }

    return {type: 'DEL', runs: this.charsToRuns(chars)};
  }

  visibleRanges(runs: Array<WCharRun>): Array<{pos: number, count: number}> {
    let pos = -1;
    let count = 1;
    const ranges = [];
    for (let i = 0; i < runs.length; i++) {
      for (let j = 0; j < runs[i].length; j++) {
        const wchar = this.charFromRun(runs[i], j);
        const newPos = this.pos(wchar, /* visibleOnly */ true);
        // Skip invisible characters
        if (newPos === -1) {
          continue;
        }
        if (pos + count === newPos) {
          count += 1;
        } else {
          if (pos > 0) {
            ranges.push({pos, count});
          }
          count = 1;
          pos = newPos;
        }
      }
    }
    if (pos > 0) {
      ranges.push({pos, count});
    }

    return ranges;
  }

  applyOps(): Array<WChange> {
    const changes = [];
    let lastCount = this._ops.length + 1;

    while (lastCount > this._ops.length) {
      lastCount = this._ops.length;
      this._ops = this._ops.filter(op => {
        if (this.canApplyOp(op)) {
          changes.push(this.execute(op));
          return false;
        }
        return true;
      });
    }

    return changes;
  }

  receive(op: WOp): Array<WChange> {
    if (op.type === 'INS') {
      invariant(op.char != null);
      if (this.contains(this.charFromRun(op.char, 0))) {
        return [];
      }
    }

    this._ops.push(op);

    return this.applyOps();
  }

  canApplyOp(op: WOp): boolean {
    if (op.type === 'INS') {
      const prev = op.prev;
      const next = op.next;

      invariant(prev != null && next != null);
      return this.contains(prev) && this.contains(next);
    } else { // DEL
      invariant(op.runs != null);
      for (let i = 0; i < op.runs.length; i++) {
        for (let j = 0; j < op.runs[i].length; j++) {
          if (!this.contains(this.charFromRun(op.runs[i], j))) {
            return false;
          }
        }
      }
      return true;
    }
  }

  contains(c: WChar): boolean {
    if (this.pos(c, false) !== -1) {
      return true;
    }
    return false;
  }

  execute(op: WOp): WChange {
    const next = op.next;
    const prev = op.prev;

    if (op.type === 'INS') {
      if (next == null || prev == null || op.char == null || op.text == null) {
        throw new Error('INS type operation invalid.');
      }

      const pos = this.integrateIns(
        op.char,
        prev,
        next,
      );
      invariant(op.text);
      return {addition: {pos, text: op.text}};
    } else { // DEL
      if (op.runs == null) {
        throw new Error('DEL operation invalid');
      }

      const ranges = this.visibleRanges(op.runs);

      for (let i = 0; i < ranges.length; i++) {
        for (let j = 0; j < ranges[i].count; j++) {
          this.integrateDelete(ranges[i].pos);
        }
      }
      return {removals: ranges};
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
