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
 * @return HackService for the specified directory if it is part of a Hack project.
 */

var getHackService = _asyncToGenerator(function* (directory) {
  var directoryPath = directory.getPath();
  var service = (0, _client.getServiceByNuclideUri)('HackService', directoryPath);
  if (service == null) {
    return null;
  }

  // Note that service being non-null only verifies that the nuclide-server that corresponds to the
  // directory has the HackService registered: it does not guarantee that the specified
  // directory is searchable via Hack. As such, we have to perform a second check to make sure
  // that the specified directory belongs to a Hack project.
  if (yield service.isAvailableForDirectoryHack(directoryPath)) {
    return service;
  } else {
    return null;
  }
});

exports.getHackService = getHackService;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _client = require('../../client');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdldEhhY2tTZXJ2aWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7SUFrQnNCLGNBQWMscUJBQTdCLFdBQ0wsU0FBeUIsRUFDRjtBQUN2QixNQUFNLGFBQWEsR0FBRyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDMUMsTUFBTSxPQUFxQixHQUFHLG9DQUF1QixhQUFhLEVBQUUsYUFBYSxDQUFDLENBQUM7QUFDbkYsTUFBSSxPQUFPLElBQUksSUFBSSxFQUFFO0FBQ25CLFdBQU8sSUFBSSxDQUFDO0dBQ2I7Ozs7OztBQU1ELE1BQUksTUFBTSxPQUFPLENBQUMsMkJBQTJCLENBQUMsYUFBYSxDQUFDLEVBQUU7QUFDNUQsV0FBTyxPQUFPLENBQUM7R0FDaEIsTUFBTTtBQUNMLFdBQU8sSUFBSSxDQUFDO0dBQ2I7Q0FDRjs7Ozs7O3NCQXZCb0MsY0FBYyIsImZpbGUiOiJnZXRIYWNrU2VydmljZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlb2YgKiBhcyBIYWNrU2VydmljZSBmcm9tICcuLi8uLi9oYWNrLWJhc2UvbGliL0hhY2tTZXJ2aWNlJztcblxuaW1wb3J0IHtnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9jbGllbnQnO1xuXG4vKipcbiAqIEByZXR1cm4gSGFja1NlcnZpY2UgZm9yIHRoZSBzcGVjaWZpZWQgZGlyZWN0b3J5IGlmIGl0IGlzIHBhcnQgb2YgYSBIYWNrIHByb2plY3QuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRIYWNrU2VydmljZShcbiAgZGlyZWN0b3J5OiBhdG9tJERpcmVjdG9yeSxcbik6IFByb21pc2U8P0hhY2tTZXJ2aWNlPiB7XG4gIGNvbnN0IGRpcmVjdG9yeVBhdGggPSBkaXJlY3RvcnkuZ2V0UGF0aCgpO1xuICBjb25zdCBzZXJ2aWNlOiA/SGFja1NlcnZpY2UgPSBnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpKCdIYWNrU2VydmljZScsIGRpcmVjdG9yeVBhdGgpO1xuICBpZiAoc2VydmljZSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvLyBOb3RlIHRoYXQgc2VydmljZSBiZWluZyBub24tbnVsbCBvbmx5IHZlcmlmaWVzIHRoYXQgdGhlIG51Y2xpZGUtc2VydmVyIHRoYXQgY29ycmVzcG9uZHMgdG8gdGhlXG4gIC8vIGRpcmVjdG9yeSBoYXMgdGhlIEhhY2tTZXJ2aWNlIHJlZ2lzdGVyZWQ6IGl0IGRvZXMgbm90IGd1YXJhbnRlZSB0aGF0IHRoZSBzcGVjaWZpZWRcbiAgLy8gZGlyZWN0b3J5IGlzIHNlYXJjaGFibGUgdmlhIEhhY2suIEFzIHN1Y2gsIHdlIGhhdmUgdG8gcGVyZm9ybSBhIHNlY29uZCBjaGVjayB0byBtYWtlIHN1cmVcbiAgLy8gdGhhdCB0aGUgc3BlY2lmaWVkIGRpcmVjdG9yeSBiZWxvbmdzIHRvIGEgSGFjayBwcm9qZWN0LlxuICBpZiAoYXdhaXQgc2VydmljZS5pc0F2YWlsYWJsZUZvckRpcmVjdG9yeUhhY2soZGlyZWN0b3J5UGF0aCkpIHtcbiAgICByZXR1cm4gc2VydmljZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuIl19