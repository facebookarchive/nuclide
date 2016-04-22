Object.defineProperty(exports, '__esModule', {
  value: true
});

var passesGK = _asyncToGenerator(function* (gatekeeperName, timeout) {
  // Only do the expensive require once.
  if (gatekeeper === undefined) {
    try {
      gatekeeper = require('../../fb-gatekeeper').gatekeeper;
    } catch (e) {
      gatekeeper = null;
    }
  }

  return gatekeeper == null ? false : (yield gatekeeper.asyncIsGkEnabled(gatekeeperName, timeout)) === true;
});

exports.passesGK = passesGK;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// undefined means unknown. null means known to not be present.
var gatekeeper = undefined;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdhdGVrZWVwZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQWNzQixRQUFRLHFCQUF2QixXQUF3QixjQUFzQixFQUFFLE9BQWdCLEVBQW9COztBQUV6RixNQUFJLFVBQVUsS0FBSyxTQUFTLEVBQUU7QUFDNUIsUUFBSTtBQUNGLGdCQUFVLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUMsVUFBVSxDQUFDO0tBQ3hELENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixnQkFBVSxHQUFHLElBQUksQ0FBQztLQUNuQjtHQUNGOztBQUVELFNBQU8sVUFBVSxJQUFJLElBQUksR0FDckIsS0FBSyxHQUNMLENBQUMsTUFBTSxVQUFVLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFBLEtBQU0sSUFBSSxDQUFDO0NBQzNFOzs7Ozs7Ozs7Ozs7Ozs7OztBQWZELElBQUksVUFBVSxHQUFHLFNBQVMsQ0FBQyIsImZpbGUiOiJnYXRla2VlcGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAbm9mbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4vLyB1bmRlZmluZWQgbWVhbnMgdW5rbm93bi4gbnVsbCBtZWFucyBrbm93biB0byBub3QgYmUgcHJlc2VudC5cbmxldCBnYXRla2VlcGVyID0gdW5kZWZpbmVkO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcGFzc2VzR0soZ2F0ZWtlZXBlck5hbWU6IHN0cmluZywgdGltZW91dD86IG51bWJlcik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAvLyBPbmx5IGRvIHRoZSBleHBlbnNpdmUgcmVxdWlyZSBvbmNlLlxuICBpZiAoZ2F0ZWtlZXBlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdHJ5IHtcbiAgICAgIGdhdGVrZWVwZXIgPSByZXF1aXJlKCcuLi8uLi9mYi1nYXRla2VlcGVyJykuZ2F0ZWtlZXBlcjtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBnYXRla2VlcGVyID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZ2F0ZWtlZXBlciA9PSBudWxsXG4gICAgPyBmYWxzZVxuICAgIDogKGF3YWl0IGdhdGVrZWVwZXIuYXN5bmNJc0drRW5hYmxlZChnYXRla2VlcGVyTmFtZSwgdGltZW91dCkpID09PSB0cnVlO1xufVxuIl19