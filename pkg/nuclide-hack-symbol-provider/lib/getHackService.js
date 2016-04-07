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
  var hackEnvironment = yield (0, _nuclideHackLibUtils.getHackEnvironmentDetails)(directoryPath);

  // Note that service being non-null only verifies that the nuclide-server that corresponds to the
  // directory has the HackService registered: it does not guarantee that the specified
  // directory is searchable via Hack. As such, we have to perform a second check to make sure
  // that the specified directory belongs to a Hack project.
  return hackEnvironment.isAvailable ? hackEnvironment.hackService : null;
});

exports.getHackService = getHackService;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _nuclideHackLibUtils = require('../../nuclide-hack/lib/utils');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdldEhhY2tTZXJ2aWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7SUFrQnNCLGNBQWMscUJBQTdCLFdBQ0wsU0FBeUIsRUFDRjtBQUN2QixNQUFNLGFBQWEsR0FBRyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDMUMsTUFBTSxlQUFlLEdBQUcsTUFBTSxvREFBMEIsYUFBYSxDQUFDLENBQUM7Ozs7OztBQU12RSxTQUFPLGVBQWUsQ0FBQyxXQUFXLEdBQUcsZUFBZSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7Q0FDekU7Ozs7OzttQ0FoQnVDLDhCQUE4QiIsImZpbGUiOiJnZXRIYWNrU2VydmljZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlb2YgKiBhcyBIYWNrU2VydmljZSBmcm9tICcuLi8uLi9udWNsaWRlLWhhY2stYmFzZS9saWIvSGFja1NlcnZpY2UnO1xuXG5pbXBvcnQge2dldEhhY2tFbnZpcm9ubWVudERldGFpbHN9IGZyb20gJy4uLy4uL251Y2xpZGUtaGFjay9saWIvdXRpbHMnO1xuXG4vKipcbiAqIEByZXR1cm4gSGFja1NlcnZpY2UgZm9yIHRoZSBzcGVjaWZpZWQgZGlyZWN0b3J5IGlmIGl0IGlzIHBhcnQgb2YgYSBIYWNrIHByb2plY3QuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRIYWNrU2VydmljZShcbiAgZGlyZWN0b3J5OiBhdG9tJERpcmVjdG9yeSxcbik6IFByb21pc2U8P0hhY2tTZXJ2aWNlPiB7XG4gIGNvbnN0IGRpcmVjdG9yeVBhdGggPSBkaXJlY3RvcnkuZ2V0UGF0aCgpO1xuICBjb25zdCBoYWNrRW52aXJvbm1lbnQgPSBhd2FpdCBnZXRIYWNrRW52aXJvbm1lbnREZXRhaWxzKGRpcmVjdG9yeVBhdGgpO1xuXG4gIC8vIE5vdGUgdGhhdCBzZXJ2aWNlIGJlaW5nIG5vbi1udWxsIG9ubHkgdmVyaWZpZXMgdGhhdCB0aGUgbnVjbGlkZS1zZXJ2ZXIgdGhhdCBjb3JyZXNwb25kcyB0byB0aGVcbiAgLy8gZGlyZWN0b3J5IGhhcyB0aGUgSGFja1NlcnZpY2UgcmVnaXN0ZXJlZDogaXQgZG9lcyBub3QgZ3VhcmFudGVlIHRoYXQgdGhlIHNwZWNpZmllZFxuICAvLyBkaXJlY3RvcnkgaXMgc2VhcmNoYWJsZSB2aWEgSGFjay4gQXMgc3VjaCwgd2UgaGF2ZSB0byBwZXJmb3JtIGEgc2Vjb25kIGNoZWNrIHRvIG1ha2Ugc3VyZVxuICAvLyB0aGF0IHRoZSBzcGVjaWZpZWQgZGlyZWN0b3J5IGJlbG9uZ3MgdG8gYSBIYWNrIHByb2plY3QuXG4gIHJldHVybiBoYWNrRW52aXJvbm1lbnQuaXNBdmFpbGFibGUgPyBoYWNrRW52aXJvbm1lbnQuaGFja1NlcnZpY2UgOiBudWxsO1xufVxuIl19