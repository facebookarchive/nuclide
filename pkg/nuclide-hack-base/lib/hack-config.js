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
  return _nuclideCommons.fsPromise.findNearestFile(HACK_CONFIG_FILE_NAME, localFile);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhhY2stY29uZmlnLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7SUFrQ2UsZUFBZSxxQkFBOUIsYUFBa0Q7O0FBRWhELFNBQU8sQ0FBQyxNQUFNLGlDQUFZLE9BQU8sRUFBRSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQSxDQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztDQUN4RTs7Ozs7SUFnQnFCLGtCQUFrQixxQkFBakMsV0FDTCxTQUFpQixFQUNrQzthQUNaLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUN2RCxXQUFXLEVBQ1gsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQzdCLENBQUM7Ozs7TUFISyxrQkFBa0I7TUFBRSxRQUFROztBQUluQyxNQUFJLFFBQVEsSUFBSSxrQkFBa0IsRUFBRTtBQUNsQyxXQUFPLEVBQUMsUUFBUSxFQUFSLFFBQVEsRUFBRSxXQUFXLEVBQUUsa0JBQWtCLEVBQUMsQ0FBQztHQUNwRCxNQUFNO0FBQ0wsV0FBTyxJQUFJLENBQUM7R0FDYjtDQUNGOzs7Ozs7Ozs7Ozs7Ozs7OzhCQXREb0MsdUJBQXVCOztBQUM1RCxJQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQzs7QUFFNUQsSUFBTSxxQkFBcUIsR0FBRyxXQUFXLENBQUM7QUFDMUMsSUFBTSxpQkFBaUIsR0FBRyxXQUFXLENBQUM7Ozs7OztBQU10QyxJQUFNLG9CQUFxQyxHQUFHLGVBQWUsRUFBRSxDQUFDO0FBQ2hFLElBQUksV0FBVyxHQUFHLG9CQUFvQixDQUFDOztBQUV2QyxJQUFJLGFBQWEsR0FBRyxLQUFLLENBQUM7Ozs7OztBQUtuQixTQUFTLGlCQUFpQixDQUFDLFNBQWlCLEVBQW9CO0FBQ3JFLFNBQU8sMEJBQVUsZUFBZSxDQUFDLHFCQUFxQixFQUFFLFNBQVMsQ0FBQyxDQUFDO0NBQ3BFOztBQVFNLFNBQVMsY0FBYyxDQUFDLGNBQXNCLEVBQVE7QUFDM0QsTUFBSSxjQUFjLEtBQUssRUFBRSxFQUFFO0FBQ3pCLFVBQU0sQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztBQUMvQyxlQUFXLEdBQUcsb0JBQW9CLENBQUM7R0FDcEMsTUFBTTtBQUNMLFVBQU0sQ0FBQyxLQUFLLDhCQUE0QixjQUFjLENBQUcsQ0FBQztBQUMxRCxlQUFXLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztHQUMvQztDQUNGOztBQUVNLFNBQVMsY0FBYyxHQUFvQjtBQUNoRCxTQUFPLFdBQVcsQ0FBQztDQUNwQjs7QUFnQk0sU0FBUyxTQUFTLENBQUMsZ0JBQXlCLEVBQVE7QUFDekQsZUFBYSxHQUFHLGdCQUFnQixDQUFDO0NBQ2xDOztBQUVNLFNBQVMsU0FBUyxHQUFZO0FBQ25DLFNBQU8sYUFBYSxDQUFDO0NBQ3RCIiwiZmlsZSI6ImhhY2stY29uZmlnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtmc1Byb21pc2UsIGNoZWNrT3V0cHV0fSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuY29uc3QgbG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG5cbmNvbnN0IEhBQ0tfQ09ORklHX0ZJTEVfTkFNRSA9ICcuaGhjb25maWcnO1xuY29uc3QgUEFUSF9UT19ISF9DTElFTlQgPSAnaGhfY2xpZW50JztcblxuLy8gS2ljayB0aGlzIG9mZiBlYXJseSwgc28gd2UgZG9uJ3QgbmVlZCB0byByZXBlYXQgdGhpcyBvbiBldmVyeSBjYWxsLlxuLy8gV2UgZG9uJ3QgaGF2ZSBhIHdheSBvZiBjaGFuZ2luZyB0aGUgcGF0aCBvbiB0aGUgZGV2IHNlcnZlciBhZnRlciBhXG4vLyBjb25uZWN0aW9uIGlzIG1hZGUgc28gdGhpcyBzaG91bGRuJ3QgY2hhbmdlIG92ZXIgdGltZS5cbi8vIFdvcnN0IGNhc2Ugc2NlbmFyaW8gaXMgcmVxdWlyaW5nIHJlc3RhcnRpbmcgTnVjbGlkZSBhZnRlciBjaGFuZ2luZyB0aGUgaGhfY2xpZW50IHBhdGguXG5jb25zdCBERUZBVUxUX0hBQ0tfQ09NTUFORDogUHJvbWlzZTxzdHJpbmc+ID0gZmluZEhhY2tDb21tYW5kKCk7XG5sZXQgaGFja0NvbW1hbmQgPSBERUZBVUxUX0hBQ0tfQ09NTUFORDtcblxubGV0IHVzZUNvbm5lY3Rpb24gPSBmYWxzZTtcblxuLyoqXG4qIElmIHRoaXMgcmV0dXJucyBudWxsLCB0aGVuIGl0IGlzIG5vdCBzYWZlIHRvIHJ1biBoYWNrLlxuKi9cbmV4cG9ydCBmdW5jdGlvbiBmaW5kSGFja0NvbmZpZ0Rpcihsb2NhbEZpbGU6IHN0cmluZyk6IFByb21pc2U8P3N0cmluZz4ge1xuICByZXR1cm4gZnNQcm9taXNlLmZpbmROZWFyZXN0RmlsZShIQUNLX0NPTkZJR19GSUxFX05BTUUsIGxvY2FsRmlsZSk7XG59XG5cbi8vIFJldHVybnMgdGhlIGVtcHR5IHN0cmluZyBvbiBmYWlsdXJlXG5hc3luYyBmdW5jdGlvbiBmaW5kSGFja0NvbW1hbmQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgLy8gYHN0ZG91dGAgd291bGQgYmUgZW1wdHkgaWYgdGhlcmUgaXMgbm8gc3VjaCBjb21tYW5kLlxuICByZXR1cm4gKGF3YWl0IGNoZWNrT3V0cHV0KCd3aGljaCcsIFtQQVRIX1RPX0hIX0NMSUVOVF0pKS5zdGRvdXQudHJpbSgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0SGFja0NvbW1hbmQobmV3SGFja0NvbW1hbmQ6IHN0cmluZyk6IHZvaWQge1xuICBpZiAobmV3SGFja0NvbW1hbmQgPT09ICcnKSB7XG4gICAgbG9nZ2VyLmRlYnVnKCdSZXNldHRpbmcgdG8gZGVmYXVsdCBoaF9jbGllbnQnKTtcbiAgICBoYWNrQ29tbWFuZCA9IERFRkFVTFRfSEFDS19DT01NQU5EO1xuICB9IGVsc2Uge1xuICAgIGxvZ2dlci5kZWJ1ZyhgVXNpbmcgY3VzdG9tIGhoX2NsaWVudDogJHtuZXdIYWNrQ29tbWFuZH1gKTtcbiAgICBoYWNrQ29tbWFuZCA9IFByb21pc2UucmVzb2x2ZShuZXdIYWNrQ29tbWFuZCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEhhY2tDb21tYW5kKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gIHJldHVybiBoYWNrQ29tbWFuZDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEhhY2tFeGVjT3B0aW9ucyhcbiAgbG9jYWxGaWxlOiBzdHJpbmdcbik6IFByb21pc2U8P3toYWNrUm9vdDogc3RyaW5nOyBoYWNrQ29tbWFuZDogc3RyaW5nfT4ge1xuICBjb25zdCBbY3VycmVudEhhY2tDb21tYW5kLCBoYWNrUm9vdF0gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgaGFja0NvbW1hbmQsXG4gICAgZmluZEhhY2tDb25maWdEaXIobG9jYWxGaWxlKSxcbiAgXSk7XG4gIGlmIChoYWNrUm9vdCAmJiBjdXJyZW50SGFja0NvbW1hbmQpIHtcbiAgICByZXR1cm4ge2hhY2tSb290LCBoYWNrQ29tbWFuZDogY3VycmVudEhhY2tDb21tYW5kfTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0VXNlSWRlKHVzZUlkZUNvbm5lY3Rpb246IGJvb2xlYW4pOiB2b2lkIHtcbiAgdXNlQ29ubmVjdGlvbiA9IHVzZUlkZUNvbm5lY3Rpb247XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRVc2VJZGUoKTogYm9vbGVhbiB7XG4gIHJldHVybiB1c2VDb25uZWN0aW9uO1xufVxuIl19