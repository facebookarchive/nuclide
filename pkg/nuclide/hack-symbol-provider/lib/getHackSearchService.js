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
 * @return HackSearchService for the specified directory if it is part of a Hack project.
 */

var getHackSearchService = _asyncToGenerator(function* (directory) {
  var directoryPath = directory.getPath();
  var service = (0, _client.getServiceByNuclideUri)('HackSearchService', directoryPath);
  if (service == null) {
    return null;
  }

  // Note that service being non-null only verifies that the nuclide-server that corresponds to the
  // directory has the HackSearchService registered: it does not guarantee that the specified
  // directory is searchable via Hack. As such, we have to perform a second check to make sure
  // that the specified directory belongs to a Hack project.
  if (yield service.isAvailableForDirectoryHack(directoryPath)) {
    return service;
  } else {
    return null;
  }
});

exports.getHackSearchService = getHackSearchService;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _client = require('../../client');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdldEhhY2tTZWFyY2hTZXJ2aWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7SUF1QnNCLG9CQUFvQixxQkFBbkMsV0FDTCxTQUF5QixFQUNJO0FBQzdCLE1BQU0sYUFBYSxHQUFHLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUMxQyxNQUFNLE9BQTJCLEdBQUcsb0NBQXVCLG1CQUFtQixFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBQy9GLE1BQUksT0FBTyxJQUFJLElBQUksRUFBRTtBQUNuQixXQUFPLElBQUksQ0FBQztHQUNiOzs7Ozs7QUFNRCxNQUFJLE1BQU0sT0FBTyxDQUFDLDJCQUEyQixDQUFDLGFBQWEsQ0FBQyxFQUFFO0FBQzVELFdBQU8sT0FBTyxDQUFDO0dBQ2hCLE1BQU07QUFDTCxXQUFPLElBQUksQ0FBQztHQUNiO0NBQ0Y7Ozs7OztzQkF2Qm9DLGNBQWMiLCJmaWxlIjoiZ2V0SGFja1NlYXJjaFNlcnZpY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7SGFja0ZpbGVSZXN1bHR9IGZyb20gJy4vSGFja1N5bWJvbFByb3ZpZGVyJztcblxudHlwZSBIYWNrU2VhcmNoU2VydmljZSA9IHtcbiAgaXNBdmFpbGFibGVGb3JEaXJlY3RvcnlIYWNrKGRpcmVjdG9yeVBhdGg6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj47XG4gIHF1ZXJ5SGFjayhkaXJlY3RvcnlQYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcpOiBQcm9taXNlPEFycmF5PEhhY2tGaWxlUmVzdWx0Pj47XG59O1xuXG5pbXBvcnQge2dldFNlcnZpY2VCeU51Y2xpZGVVcml9IGZyb20gJy4uLy4uL2NsaWVudCc7XG5cbi8qKlxuICogQHJldHVybiBIYWNrU2VhcmNoU2VydmljZSBmb3IgdGhlIHNwZWNpZmllZCBkaXJlY3RvcnkgaWYgaXQgaXMgcGFydCBvZiBhIEhhY2sgcHJvamVjdC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEhhY2tTZWFyY2hTZXJ2aWNlKFxuICBkaXJlY3Rvcnk6IGF0b20kRGlyZWN0b3J5LFxuKTogUHJvbWlzZTw/SGFja1NlYXJjaFNlcnZpY2U+IHtcbiAgY29uc3QgZGlyZWN0b3J5UGF0aCA9IGRpcmVjdG9yeS5nZXRQYXRoKCk7XG4gIGNvbnN0IHNlcnZpY2U6ID9IYWNrU2VhcmNoU2VydmljZSA9IGdldFNlcnZpY2VCeU51Y2xpZGVVcmkoJ0hhY2tTZWFyY2hTZXJ2aWNlJywgZGlyZWN0b3J5UGF0aCk7XG4gIGlmIChzZXJ2aWNlID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIE5vdGUgdGhhdCBzZXJ2aWNlIGJlaW5nIG5vbi1udWxsIG9ubHkgdmVyaWZpZXMgdGhhdCB0aGUgbnVjbGlkZS1zZXJ2ZXIgdGhhdCBjb3JyZXNwb25kcyB0byB0aGVcbiAgLy8gZGlyZWN0b3J5IGhhcyB0aGUgSGFja1NlYXJjaFNlcnZpY2UgcmVnaXN0ZXJlZDogaXQgZG9lcyBub3QgZ3VhcmFudGVlIHRoYXQgdGhlIHNwZWNpZmllZFxuICAvLyBkaXJlY3RvcnkgaXMgc2VhcmNoYWJsZSB2aWEgSGFjay4gQXMgc3VjaCwgd2UgaGF2ZSB0byBwZXJmb3JtIGEgc2Vjb25kIGNoZWNrIHRvIG1ha2Ugc3VyZVxuICAvLyB0aGF0IHRoZSBzcGVjaWZpZWQgZGlyZWN0b3J5IGJlbG9uZ3MgdG8gYSBIYWNrIHByb2plY3QuXG4gIGlmIChhd2FpdCBzZXJ2aWNlLmlzQXZhaWxhYmxlRm9yRGlyZWN0b3J5SGFjayhkaXJlY3RvcnlQYXRoKSkge1xuICAgIHJldHVybiBzZXJ2aWNlO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG4iXX0=