Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var getHackExecOptions = _asyncToGenerator(function* (localFile) {
  // $FlowFixMe incompatible type.

  var _ref = yield Promise.all([
  // `stdout` would be empty if there is no such command.
  (0, _commons.checkOutput)('which', [PATH_TO_HH_CLIENT]), findHackConfigDir(localFile)]);

  var _ref2 = _slicedToArray(_ref, 2);

  var hhResult = _ref2[0];
  var hackRoot = _ref2[1];

  var hackCommand = hhResult.stdout.trim();
  if (hackRoot && hackCommand) {
    return { hackRoot: hackRoot, hackCommand: hackCommand };
  } else {
    return null;
  }
});

exports.getHackExecOptions = getHackExecOptions;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _commons = require('../../commons');

var HACK_CONFIG_FILE_NAME = '.hhconfig';
var PATH_TO_HH_CLIENT = 'hh_client';

exports.PATH_TO_HH_CLIENT = PATH_TO_HH_CLIENT;
/**
* If this returns null, then it is not safe to run hack.
*/
function findHackConfigDir(localFile) {
  return (0, _commons.findNearestFile)(HACK_CONFIG_FILE_NAME, localFile);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhhY2stY29uZmlnLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztJQXVCc0Isa0JBQWtCLHFCQUFqQyxXQUNMLFNBQWlCLEVBQ2tDOzs7YUFFdEIsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDOztBQUU3Qyw0QkFBWSxPQUFPLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEVBQ3pDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUM3QixDQUFDOzs7O01BSkssUUFBUTtNQUFFLFFBQVE7O0FBS3pCLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDM0MsTUFBSSxRQUFRLElBQUksV0FBVyxFQUFFO0FBQzNCLFdBQU8sRUFBQyxRQUFRLEVBQVIsUUFBUSxFQUFFLFdBQVcsRUFBWCxXQUFXLEVBQUMsQ0FBQztHQUNoQyxNQUFNO0FBQ0wsV0FBTyxJQUFJLENBQUM7R0FDYjtDQUNGOzs7Ozs7Ozs7Ozs7Ozt1QkEzQjBDLGVBQWU7O0FBRTFELElBQU0scUJBQXFCLEdBQUcsV0FBVyxDQUFDO0FBQ25DLElBQU0saUJBQWlCLEdBQUcsV0FBVyxDQUFDOzs7Ozs7QUFLN0MsU0FBUyxpQkFBaUIsQ0FBQyxTQUFpQixFQUFvQjtBQUM5RCxTQUFPLDhCQUFnQixxQkFBcUIsRUFBRSxTQUFTLENBQUMsQ0FBQztDQUMxRCIsImZpbGUiOiJoYWNrLWNvbmZpZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7ZmluZE5lYXJlc3RGaWxlLCBjaGVja091dHB1dH0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5cbmNvbnN0IEhBQ0tfQ09ORklHX0ZJTEVfTkFNRSA9ICcuaGhjb25maWcnO1xuZXhwb3J0IGNvbnN0IFBBVEhfVE9fSEhfQ0xJRU5UID0gJ2hoX2NsaWVudCc7XG5cbi8qKlxuKiBJZiB0aGlzIHJldHVybnMgbnVsbCwgdGhlbiBpdCBpcyBub3Qgc2FmZSB0byBydW4gaGFjay5cbiovXG5mdW5jdGlvbiBmaW5kSGFja0NvbmZpZ0Rpcihsb2NhbEZpbGU6IHN0cmluZyk6IFByb21pc2U8P3N0cmluZz4ge1xuICByZXR1cm4gZmluZE5lYXJlc3RGaWxlKEhBQ0tfQ09ORklHX0ZJTEVfTkFNRSwgbG9jYWxGaWxlKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEhhY2tFeGVjT3B0aW9ucyhcbiAgbG9jYWxGaWxlOiBzdHJpbmdcbik6IFByb21pc2U8P3toYWNrUm9vdDogc3RyaW5nLCBoYWNrQ29tbWFuZDogc3RyaW5nfT4ge1xuICAvLyAkRmxvd0ZpeE1lIGluY29tcGF0aWJsZSB0eXBlLlxuICBjb25zdCBbaGhSZXN1bHQsIGhhY2tSb290XSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAvLyBgc3Rkb3V0YCB3b3VsZCBiZSBlbXB0eSBpZiB0aGVyZSBpcyBubyBzdWNoIGNvbW1hbmQuXG4gICAgY2hlY2tPdXRwdXQoJ3doaWNoJywgW1BBVEhfVE9fSEhfQ0xJRU5UXSksXG4gICAgZmluZEhhY2tDb25maWdEaXIobG9jYWxGaWxlKSxcbiAgXSk7XG4gIGNvbnN0IGhhY2tDb21tYW5kID0gaGhSZXN1bHQuc3Rkb3V0LnRyaW0oKTtcbiAgaWYgKGhhY2tSb290ICYmIGhhY2tDb21tYW5kKSB7XG4gICAgcmV0dXJuIHtoYWNrUm9vdCwgaGFja0NvbW1hbmR9O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG4iXX0=