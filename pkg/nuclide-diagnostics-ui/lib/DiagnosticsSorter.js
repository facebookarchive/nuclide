Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.sortDiagnostics = sortDiagnostics;

/*
 * Sorts the diagnostics according to given column and sort direction
 */

function sortDiagnostics(diagnostics, sortedColumnName, sortDescending) {
  if (sortedColumnName == null) {
    return diagnostics;
  }
  var cmp = sortedColumnName === 'range' ? _cmpNumber : _cmpString;
  var getter = function getter(displayDiagnostic) {
    return sortedColumnName === 'description' ? displayDiagnostic.data.description.text : displayDiagnostic.data[sortedColumnName];
  };
  return [].concat(diagnostics).sort(function (a, b) {
    return cmp(getter(a), getter(b), !sortDescending);
  });
}

function _cmpNumber(a, b, isAsc) {
  var cmp = a - b;
  return isAsc ? cmp : -cmp;
}

function _cmpString(a, b, isAsc) {
  var cmp = a.toLowerCase().localeCompare(b.toLowerCase());
  return isAsc ? cmp : -cmp;
}