/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {IThread} from '../types';

export class FilterThreadConditions {
  name: string;
  idNumbers: number[];
  stringOfIDs: string;
  onlyPausedThreads: boolean;

  // Pass in empty string for name and id if the user does not want to filter
  // threads based on those criteria.
  constructor(name: string, id: string, onlyPausedThreads: boolean) {
    this.name = name;
    if (id != null) {
      this.idNumbers = this.parseID(id);
    }
    this.stringOfIDs = id;
    this.onlyPausedThreads = onlyPausedThreads;
  }

  locations(substring: string, string: string) {
    const a = [];
    let i = -1;
    while ((i = string.indexOf(substring, i + 1)) >= 0) {
      a.push(i);
    }
    return a;
  }

  parseID(id: string): number[] {
    if (id == null || id.length === 0) {
      return [];
    }
    const generatedIDNumbers: number[] = [];
    const trimmedID = id.trim();
    const idStringIndices = this.locations(',', trimmedID);
    idStringIndices.unshift(-1);
    idStringIndices.push(trimmedID.length);
    for (let i = 0; i < idStringIndices.length - 1; i++) {
      const beginIndex = idStringIndices[i];
      const endIndex = idStringIndices[i + 1];
      const idString = trimmedID.substring(beginIndex + 1, endIndex).trim();
      const idNumber = parseInt(idString, 10);
      if (isNaN(idNumber)) {
        atom.notifications.addError(
          'Invalid number entered: "' + idString + '"',
        );
      } else {
        generatedIDNumbers.push(idNumber);
      }
    }
    return generatedIDNumbers;
  }

  isInRange(queryID: number) {
    if (this.idNumbers.length === 0) {
      return true;
    }
    for (let i = 0; i < this.idNumbers.length; i++) {
      const id = this.idNumbers[i];
      if (queryID === id) {
        return true;
      }
    }
    return false;
  }

  // If return true, keep. Else, discard.
  filterThread(thread: IThread): boolean {
    if (this.name !== '') {
      const filterThreadName = this.name;
      // toUpperCase is called for case-insensitive comparison.
      if (!thread.name.toUpperCase().includes(filterThreadName.toUpperCase())) {
        return false;
      }
    }
    if (!this.isInRange(thread.threadId)) {
      return false;
    }
    if (this.onlyPausedThreads && !thread.stopped) {
      return false;
    }
    return true;
  }
}
