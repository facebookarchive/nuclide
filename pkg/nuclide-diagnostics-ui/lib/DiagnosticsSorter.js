'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {ColumnKeys, SortDirections} from './Cells';
import type {DiagnosticMessage} from '../../nuclide-diagnostics-common';

type ColumnGetter =
  (d: DiagnosticMessage) => string |
  (d: DiagnosticMessage) => number;

/*
 * Sorts the diagnostics according to given column and sort direction
 */
export function sortDiagnostics(
  diagnostics: Array<DiagnosticMessage>,
  columnSortDirections: {[column: string]: string},
  columnGetters: {[column: string]: ColumnGetter},
) {
  const columnKeys = Object.keys(columnSortDirections);
  if (columnKeys.length === 0) {
    return diagnostics;
  }

  const columnKey = columnKeys[0];
  const getter = columnGetters[columnKey];
  const isAsc = columnSortDirections[columnKey] === SortDirections.ASC;
  const cmp: any = columnKey === ColumnKeys.RANGE ? _cmpNumber : _cmpString;

  return Array.from(diagnostics).sort((a, b) => {
    return cmp(getter(a), getter(b), isAsc);
  });
}

function _cmpNumber(a: number, b: number, isAsc: boolean): number {
  const cmp = a - b;
  return isAsc ? cmp : -cmp;
}

function _cmpString(a: string, b: string, isAsc: boolean): number {
  const cmp = a.toLowerCase().localeCompare(b.toLowerCase());
  return isAsc ? cmp : -cmp;
}
