Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.findHackConfigDir = findHackConfigDir;

// Returns the empty string on failure

var findHackCommand = _asyncToGenerator(function* () {
  // `stdout` would be empty if there is no such command.
  return (yield (0, _nuclideCommons.checkOutput)('which', [PATH_TO_HH_CLIENT])).stdout.trim();
});

exports.setHackCommand = setHackCommand;
exports.getHackCommand = getHackCommand;

var getHackExecOptions = _asyncToGenerator(function* (localFile) {
  var _ref = yield Promise.all([hackCommand, findHackConfigDir(localFile)]);

  var _ref2 = _slicedToArray(_ref, 2);

  var currentHackCommand = _ref2[0];
  var hackRoot = _ref2[1];

  if (hackRoot && currentHackCommand) {
    return { hackRoot: hackRoot, hackCommand: currentHackCommand };
  } else {
    return null;
  }
});

exports.getHackExecOptions = getHackExecOptions;
exports.setUseIde = setUseIde;
exports.getUseIde = getUseIde;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideCommons = require('../../nuclide-commons');

var logger = require('../../nuclide-logging').getLogger();

var HACK_CONFIG_FILE_NAME = '.hhconfig';
var PATH_TO_HH_CLIENT = 'hh_client';

// Kick this off early, so we don't need to repeat this on every call.
// We don't have a way of changing the path on the dev server after a
// connection is made so this shouldn't change over time.
// Worst case scenario is requiring restarting Nuclide after changing the hh_client path.
var DEFAULT_HACK_COMMAND = findHackCommand();
var hackCommand = DEFAULT_HACK_COMMAND;

var useConnection = false;

/**
* If this returns null, then it is not safe to run hack.
*/

function findHackConfigDir(localFile) {
  return (0, _nuclideCommons.findNearestFile)(HACK_CONFIG_FILE_NAME, localFile);
}

function setHackCommand(newHackCommand) {
  if (newHackCommand === '') {
    logger.debug('Resetting to default hh_client');
    hackCommand = DEFAULT_HACK_COMMAND;
  } else {
    logger.debug('Using custom hh_client: ' + newHackCommand);
    hackCommand = Promise.resolve(newHackCommand);
  }
}

function getHackCommand() {
  return hackCommand;
}

function setUseIde(useIdeConnection) {
  useConnection = useIdeConnection;
}

function getUseIde() {
  return useConnection;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhhY2stY29uZmlnLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7SUFrQ2UsZUFBZSxxQkFBOUIsYUFBa0Q7O0FBRWhELFNBQU8sQ0FBQyxNQUFNLGlDQUFZLE9BQU8sRUFBRSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQSxDQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztDQUN4RTs7Ozs7SUFnQnFCLGtCQUFrQixxQkFBakMsV0FDTCxTQUFpQixFQUNrQzthQUNaLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUN2RCxXQUFXLEVBQ1gsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQzdCLENBQUM7Ozs7TUFISyxrQkFBa0I7TUFBRSxRQUFROztBQUluQyxNQUFJLFFBQVEsSUFBSSxrQkFBa0IsRUFBRTtBQUNsQyxXQUFPLEVBQUMsUUFBUSxFQUFSLFFBQVEsRUFBRSxXQUFXLEVBQUUsa0JBQWtCLEVBQUMsQ0FBQztHQUNwRCxNQUFNO0FBQ0wsV0FBTyxJQUFJLENBQUM7R0FDYjtDQUNGOzs7Ozs7Ozs7Ozs7Ozs7OzhCQXREMEMsdUJBQXVCOztBQUNsRSxJQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQzs7QUFFNUQsSUFBTSxxQkFBcUIsR0FBRyxXQUFXLENBQUM7QUFDMUMsSUFBTSxpQkFBaUIsR0FBRyxXQUFXLENBQUM7Ozs7OztBQU10QyxJQUFNLG9CQUFxQyxHQUFHLGVBQWUsRUFBRSxDQUFDO0FBQ2hFLElBQUksV0FBVyxHQUFHLG9CQUFvQixDQUFDOztBQUV2QyxJQUFJLGFBQWEsR0FBRyxLQUFLLENBQUM7Ozs7OztBQUtuQixTQUFTLGlCQUFpQixDQUFDLFNBQWlCLEVBQW9CO0FBQ3JFLFNBQU8scUNBQWdCLHFCQUFxQixFQUFFLFNBQVMsQ0FBQyxDQUFDO0NBQzFEOztBQVFNLFNBQVMsY0FBYyxDQUFDLGNBQXNCLEVBQVE7QUFDM0QsTUFBSSxjQUFjLEtBQUssRUFBRSxFQUFFO0FBQ3pCLFVBQU0sQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztBQUMvQyxlQUFXLEdBQUcsb0JBQW9CLENBQUM7R0FDcEMsTUFBTTtBQUNMLFVBQU0sQ0FBQyxLQUFLLDhCQUE0QixjQUFjLENBQUcsQ0FBQztBQUMxRCxlQUFXLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztHQUMvQztDQUNGOztBQUVNLFNBQVMsY0FBYyxHQUFvQjtBQUNoRCxTQUFPLFdBQVcsQ0FBQztDQUNwQjs7QUFnQk0sU0FBUyxTQUFTLENBQUMsZ0JBQXlCLEVBQVE7QUFDekQsZUFBYSxHQUFHLGdCQUFnQixDQUFDO0NBQ2xDOztBQUVNLFNBQVMsU0FBUyxHQUFZO0FBQ25DLFNBQU8sYUFBYSxDQUFDO0NBQ3RCIiwiZmlsZSI6ImhhY2stY29uZmlnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtmaW5kTmVhcmVzdEZpbGUsIGNoZWNrT3V0cHV0fSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuY29uc3QgbG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG5cbmNvbnN0IEhBQ0tfQ09ORklHX0ZJTEVfTkFNRSA9ICcuaGhjb25maWcnO1xuY29uc3QgUEFUSF9UT19ISF9DTElFTlQgPSAnaGhfY2xpZW50JztcblxuLy8gS2ljayB0aGlzIG9mZiBlYXJseSwgc28gd2UgZG9uJ3QgbmVlZCB0byByZXBlYXQgdGhpcyBvbiBldmVyeSBjYWxsLlxuLy8gV2UgZG9uJ3QgaGF2ZSBhIHdheSBvZiBjaGFuZ2luZyB0aGUgcGF0aCBvbiB0aGUgZGV2IHNlcnZlciBhZnRlciBhXG4vLyBjb25uZWN0aW9uIGlzIG1hZGUgc28gdGhpcyBzaG91bGRuJ3QgY2hhbmdlIG92ZXIgdGltZS5cbi8vIFdvcnN0IGNhc2Ugc2NlbmFyaW8gaXMgcmVxdWlyaW5nIHJlc3RhcnRpbmcgTnVjbGlkZSBhZnRlciBjaGFuZ2luZyB0aGUgaGhfY2xpZW50IHBhdGguXG5jb25zdCBERUZBVUxUX0hBQ0tfQ09NTUFORDogUHJvbWlzZTxzdHJpbmc+ID0gZmluZEhhY2tDb21tYW5kKCk7XG5sZXQgaGFja0NvbW1hbmQgPSBERUZBVUxUX0hBQ0tfQ09NTUFORDtcblxubGV0IHVzZUNvbm5lY3Rpb24gPSBmYWxzZTtcblxuLyoqXG4qIElmIHRoaXMgcmV0dXJucyBudWxsLCB0aGVuIGl0IGlzIG5vdCBzYWZlIHRvIHJ1biBoYWNrLlxuKi9cbmV4cG9ydCBmdW5jdGlvbiBmaW5kSGFja0NvbmZpZ0Rpcihsb2NhbEZpbGU6IHN0cmluZyk6IFByb21pc2U8P3N0cmluZz4ge1xuICByZXR1cm4gZmluZE5lYXJlc3RGaWxlKEhBQ0tfQ09ORklHX0ZJTEVfTkFNRSwgbG9jYWxGaWxlKTtcbn1cblxuLy8gUmV0dXJucyB0aGUgZW1wdHkgc3RyaW5nIG9uIGZhaWx1cmVcbmFzeW5jIGZ1bmN0aW9uIGZpbmRIYWNrQ29tbWFuZCgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAvLyBgc3Rkb3V0YCB3b3VsZCBiZSBlbXB0eSBpZiB0aGVyZSBpcyBubyBzdWNoIGNvbW1hbmQuXG4gIHJldHVybiAoYXdhaXQgY2hlY2tPdXRwdXQoJ3doaWNoJywgW1BBVEhfVE9fSEhfQ0xJRU5UXSkpLnN0ZG91dC50cmltKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRIYWNrQ29tbWFuZChuZXdIYWNrQ29tbWFuZDogc3RyaW5nKTogdm9pZCB7XG4gIGlmIChuZXdIYWNrQ29tbWFuZCA9PT0gJycpIHtcbiAgICBsb2dnZXIuZGVidWcoJ1Jlc2V0dGluZyB0byBkZWZhdWx0IGhoX2NsaWVudCcpO1xuICAgIGhhY2tDb21tYW5kID0gREVGQVVMVF9IQUNLX0NPTU1BTkQ7XG4gIH0gZWxzZSB7XG4gICAgbG9nZ2VyLmRlYnVnKGBVc2luZyBjdXN0b20gaGhfY2xpZW50OiAke25ld0hhY2tDb21tYW5kfWApO1xuICAgIGhhY2tDb21tYW5kID0gUHJvbWlzZS5yZXNvbHZlKG5ld0hhY2tDb21tYW5kKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGFja0NvbW1hbmQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgcmV0dXJuIGhhY2tDb21tYW5kO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0SGFja0V4ZWNPcHRpb25zKFxuICBsb2NhbEZpbGU6IHN0cmluZ1xuKTogUHJvbWlzZTw/e2hhY2tSb290OiBzdHJpbmc7IGhhY2tDb21tYW5kOiBzdHJpbmd9PiB7XG4gIGNvbnN0IFtjdXJyZW50SGFja0NvbW1hbmQsIGhhY2tSb290XSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICBoYWNrQ29tbWFuZCxcbiAgICBmaW5kSGFja0NvbmZpZ0Rpcihsb2NhbEZpbGUpLFxuICBdKTtcbiAgaWYgKGhhY2tSb290ICYmIGN1cnJlbnRIYWNrQ29tbWFuZCkge1xuICAgIHJldHVybiB7aGFja1Jvb3QsIGhhY2tDb21tYW5kOiBjdXJyZW50SGFja0NvbW1hbmR9O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRVc2VJZGUodXNlSWRlQ29ubmVjdGlvbjogYm9vbGVhbik6IHZvaWQge1xuICB1c2VDb25uZWN0aW9uID0gdXNlSWRlQ29ubmVjdGlvbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFVzZUlkZSgpOiBib29sZWFuIHtcbiAgcmV0dXJuIHVzZUNvbm5lY3Rpb247XG59XG4iXX0=