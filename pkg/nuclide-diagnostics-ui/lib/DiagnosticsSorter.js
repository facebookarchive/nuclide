Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.sortDiagnostics = sortDiagnostics;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _Cells2;

function _Cells() {
  return _Cells2 = require('./Cells');
}

/*
 * Sorts the diagnostics according to given column and sort direction
 */

function sortDiagnostics(diagnostics, columnSortDirections, columnGetters) {
  var columnKeys = Object.keys(columnSortDirections);
  if (columnKeys.length === 0) {
    return diagnostics;
  }

  var columnKey = columnKeys[0];
  var getter = columnGetters[columnKey];
  var isAsc = columnSortDirections[columnKey] === (_Cells2 || _Cells()).SortDirections.ASC;
  var cmp = columnKey === (_Cells2 || _Cells()).ColumnKeys.RANGE ? _cmpNumber : _cmpString;

  return Array.from(diagnostics).sort(function (a, b) {
    return cmp(getter(a), getter(b), isAsc);
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