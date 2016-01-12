

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Copy of the npm package: blocked, but without the unref, because that doesn't work in apm tests.
 * https://github.com/tj/node-blocked/blob/master/index.js
 *
 * The blocked module checks and reports every event loop block time over a given threshold.
 * @return the interval handler.
 * To cancel, call clearInterval on the returned interval handler.
 */
function blocked(fn) {
  var intervalMs = arguments.length <= 1 || arguments[1] === undefined ? 100 : arguments[1];
  var thresholdMs = arguments.length <= 2 || arguments[2] === undefined ? 50 : arguments[2];

  var start = Date.now();

  return setInterval(function () {
    var deltaMs = Date.now() - start;
    var blockTimeMs = deltaMs - intervalMs;
    if (blockTimeMs > thresholdMs) {
      fn(blockTimeMs);
    }
    start = Date.now();
  }, intervalMs);
}

module.exports = blocked;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJsb2NrZWQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbUJBLFNBQVMsT0FBTyxDQUNaLEVBQXdCLEVBRVU7TUFEbEMsVUFBa0IseURBQUcsR0FBRztNQUN4QixXQUFtQix5REFBRyxFQUFFOztBQUMxQixNQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7O0FBRXZCLFNBQU8sV0FBVyxDQUFDLFlBQU07QUFDdkIsUUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQztBQUNuQyxRQUFNLFdBQVcsR0FBRyxPQUFPLEdBQUcsVUFBVSxDQUFDO0FBQ3pDLFFBQUksV0FBVyxHQUFHLFdBQVcsRUFBRTtBQUM3QixRQUFFLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDakI7QUFDRCxTQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0dBQ3BCLEVBQUUsVUFBVSxDQUFDLENBQUM7Q0FDaEI7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMiLCJmaWxlIjoiYmxvY2tlZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbi8qKlxuICogQ29weSBvZiB0aGUgbnBtIHBhY2thZ2U6IGJsb2NrZWQsIGJ1dCB3aXRob3V0IHRoZSB1bnJlZiwgYmVjYXVzZSB0aGF0IGRvZXNuJ3Qgd29yayBpbiBhcG0gdGVzdHMuXG4gKiBodHRwczovL2dpdGh1Yi5jb20vdGovbm9kZS1ibG9ja2VkL2Jsb2IvbWFzdGVyL2luZGV4LmpzXG4gKlxuICogVGhlIGJsb2NrZWQgbW9kdWxlIGNoZWNrcyBhbmQgcmVwb3J0cyBldmVyeSBldmVudCBsb29wIGJsb2NrIHRpbWUgb3ZlciBhIGdpdmVuIHRocmVzaG9sZC5cbiAqIEByZXR1cm4gdGhlIGludGVydmFsIGhhbmRsZXIuXG4gKiBUbyBjYW5jZWwsIGNhbGwgY2xlYXJJbnRlcnZhbCBvbiB0aGUgcmV0dXJuZWQgaW50ZXJ2YWwgaGFuZGxlci5cbiAqL1xuZnVuY3Rpb24gYmxvY2tlZChcbiAgICBmbjogKG1zOiBudW1iZXIpID0+IHZvaWQsXG4gICAgaW50ZXJ2YWxNczogbnVtYmVyID0gMTAwLFxuICAgIHRocmVzaG9sZE1zOiBudW1iZXIgPSA1MCk6IG51bWJlciB7XG4gIGxldCBzdGFydCA9IERhdGUubm93KCk7XG5cbiAgcmV0dXJuIHNldEludGVydmFsKCgpID0+IHtcbiAgICBjb25zdCBkZWx0YU1zID0gRGF0ZS5ub3coKSAtIHN0YXJ0O1xuICAgIGNvbnN0IGJsb2NrVGltZU1zID0gZGVsdGFNcyAtIGludGVydmFsTXM7XG4gICAgaWYgKGJsb2NrVGltZU1zID4gdGhyZXNob2xkTXMpIHtcbiAgICAgIGZuKGJsb2NrVGltZU1zKTtcbiAgICB9XG4gICAgc3RhcnQgPSBEYXRlLm5vdygpO1xuICB9LCBpbnRlcnZhbE1zKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBibG9ja2VkO1xuIl19