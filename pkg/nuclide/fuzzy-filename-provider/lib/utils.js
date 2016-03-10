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

/**
 * @return FuzzyFileSearchService for the specified directory if it is part of a Hack project.
 */

var getFuzzyFileSearchService = _asyncToGenerator(function* (directory) {
  var directoryPath = directory.getPath();
  var service = (0, _client.getServiceByNuclideUri)('FuzzyFileSearchService', directoryPath);
  return service;
});

exports.getFuzzyFileSearchService = getFuzzyFileSearchService;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _client = require('../../client');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInV0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7SUFrQnNCLHlCQUF5QixxQkFBeEMsV0FDTCxTQUF5QixFQUNTO0FBQ2xDLE1BQU0sYUFBYSxHQUFHLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUMxQyxNQUFNLE9BQWdDLEdBQUcsb0NBQ3ZDLHdCQUF3QixFQUN4QixhQUFhLENBQ2QsQ0FBQztBQUNGLFNBQU8sT0FBTyxDQUFDO0NBQ2hCOzs7Ozs7c0JBZG9DLGNBQWMiLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZW9mICogYXMgRnV6enlGaWxlU2VhcmNoU2VydmljZSBmcm9tICcuLi8uLi9mdXp6eS1maWxlLXNlYXJjaC1zZXJ2aWNlJztcblxuaW1wb3J0IHtnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9jbGllbnQnO1xuXG4vKipcbiAqIEByZXR1cm4gRnV6enlGaWxlU2VhcmNoU2VydmljZSBmb3IgdGhlIHNwZWNpZmllZCBkaXJlY3RvcnkgaWYgaXQgaXMgcGFydCBvZiBhIEhhY2sgcHJvamVjdC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEZ1enp5RmlsZVNlYXJjaFNlcnZpY2UoXG4gIGRpcmVjdG9yeTogYXRvbSREaXJlY3RvcnksXG4pOiBQcm9taXNlPD9GdXp6eUZpbGVTZWFyY2hTZXJ2aWNlPiB7XG4gIGNvbnN0IGRpcmVjdG9yeVBhdGggPSBkaXJlY3RvcnkuZ2V0UGF0aCgpO1xuICBjb25zdCBzZXJ2aWNlOiA/RnV6enlGaWxlU2VhcmNoU2VydmljZSA9IGdldFNlcnZpY2VCeU51Y2xpZGVVcmkoXG4gICAgJ0Z1enp5RmlsZVNlYXJjaFNlcnZpY2UnLFxuICAgIGRpcmVjdG9yeVBhdGgsXG4gICk7XG4gIHJldHVybiBzZXJ2aWNlO1xufVxuIl19