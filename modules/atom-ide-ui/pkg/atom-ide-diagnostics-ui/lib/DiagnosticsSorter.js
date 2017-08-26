'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sortDiagnostics = sortDiagnostics;


/*
 * Sorts the diagnostics according to given column and sort direction
 */
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

function sortDiagnostics(diagnostics, sortedColumnName, sortDescending) {
  if (sortedColumnName == null) {
    return diagnostics;
  }
  const cmp = sortedColumnName === 'range' ? _cmpNumber : _cmpString;
  const getter = displayDiagnostic => sortedColumnName === 'description' ? displayDiagnostic.data.description.text : displayDiagnostic.data[sortedColumnName];
  // $FlowFixMe -- this whole thing is poorly typed
  return [...diagnostics].sort((a, b) => {
    // $FlowFixMe -- this whole thing is poorly typed
    return cmp(getter(a), getter(b), !sortDescending);
  });
}

function _cmpNumber(a, b, isAsc) {
  const cmp = a - b;
  return isAsc ? cmp : -cmp;
}

function _cmpString(a, b, isAsc) {
  const cmp = a.toLowerCase().localeCompare(b.toLowerCase());
  return isAsc ? cmp : -cmp;
}