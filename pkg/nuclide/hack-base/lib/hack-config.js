Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

// Returns the empty string on failure

var findHackCommand = _asyncToGenerator(function* () {
  // `stdout` would be empty if there is no such command.
  return (yield (0, _commons.checkOutput)('which', [PATH_TO_HH_CLIENT])).stdout.trim();
});

exports.setHackCommand = setHackCommand;

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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _commons = require('../../commons');

var logger = require('../../logging').getLogger();

var HACK_CONFIG_FILE_NAME = '.hhconfig';
var PATH_TO_HH_CLIENT = 'hh_client';

// Kick this off early, so we don't need to repeat this on every call.
// We don't have a way of changing the path on the dev server after a
// connection is made so this shouldn't change over time.
// Worst case scenario is requiring restarting Nuclide after changing the hh_client path.
var DEFAULT_HACK_COMMAND = findHackCommand();
var hackCommand = DEFAULT_HACK_COMMAND;

/**
* If this returns null, then it is not safe to run hack.
*/
function findHackConfigDir(localFile) {
  return (0, _commons.findNearestFile)(HACK_CONFIG_FILE_NAME, localFile);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhhY2stY29uZmlnLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0lBZ0NlLGVBQWUscUJBQTlCLGFBQWtEOztBQUVoRCxTQUFPLENBQUMsTUFBTSwwQkFBWSxPQUFPLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUEsQ0FBRSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7Q0FDeEU7Ozs7SUFZcUIsa0JBQWtCLHFCQUFqQyxXQUNMLFNBQWlCLEVBQ2tDO2FBQ1osTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQ3ZELFdBQVcsRUFDWCxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FDN0IsQ0FBQzs7OztNQUhLLGtCQUFrQjtNQUFFLFFBQVE7O0FBSW5DLE1BQUksUUFBUSxJQUFJLGtCQUFrQixFQUFFO0FBQ2xDLFdBQU8sRUFBQyxRQUFRLEVBQVIsUUFBUSxFQUFFLFdBQVcsRUFBRSxrQkFBa0IsRUFBQyxDQUFDO0dBQ3BELE1BQU07QUFDTCxXQUFPLElBQUksQ0FBQztHQUNiO0NBQ0Y7Ozs7Ozs7Ozs7Ozs7O3VCQWhEMEMsZUFBZTs7QUFDMUQsSUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDOztBQUVwRCxJQUFNLHFCQUFxQixHQUFHLFdBQVcsQ0FBQztBQUMxQyxJQUFNLGlCQUFpQixHQUFHLFdBQVcsQ0FBQzs7Ozs7O0FBTXRDLElBQU0sb0JBQXFDLEdBQUcsZUFBZSxFQUFFLENBQUM7QUFDaEUsSUFBSSxXQUFXLEdBQUcsb0JBQW9CLENBQUM7Ozs7O0FBS3ZDLFNBQVMsaUJBQWlCLENBQUMsU0FBaUIsRUFBb0I7QUFDOUQsU0FBTyw4QkFBZ0IscUJBQXFCLEVBQUUsU0FBUyxDQUFDLENBQUM7Q0FDMUQ7QUFRTSxTQUFTLGNBQWMsQ0FBQyxjQUFzQixFQUFRO0FBQzNELE1BQUksY0FBYyxLQUFLLEVBQUUsRUFBRTtBQUN6QixVQUFNLENBQUMsS0FBSyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7QUFDL0MsZUFBVyxHQUFHLG9CQUFvQixDQUFDO0dBQ3BDLE1BQU07QUFDTCxVQUFNLENBQUMsS0FBSyw4QkFBNEIsY0FBYyxDQUFHLENBQUM7QUFDMUQsZUFBVyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7R0FDL0M7Q0FDRiIsImZpbGUiOiJoYWNrLWNvbmZpZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7ZmluZE5lYXJlc3RGaWxlLCBjaGVja091dHB1dH0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5jb25zdCBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG5cbmNvbnN0IEhBQ0tfQ09ORklHX0ZJTEVfTkFNRSA9ICcuaGhjb25maWcnO1xuY29uc3QgUEFUSF9UT19ISF9DTElFTlQgPSAnaGhfY2xpZW50JztcblxuLy8gS2ljayB0aGlzIG9mZiBlYXJseSwgc28gd2UgZG9uJ3QgbmVlZCB0byByZXBlYXQgdGhpcyBvbiBldmVyeSBjYWxsLlxuLy8gV2UgZG9uJ3QgaGF2ZSBhIHdheSBvZiBjaGFuZ2luZyB0aGUgcGF0aCBvbiB0aGUgZGV2IHNlcnZlciBhZnRlciBhXG4vLyBjb25uZWN0aW9uIGlzIG1hZGUgc28gdGhpcyBzaG91bGRuJ3QgY2hhbmdlIG92ZXIgdGltZS5cbi8vIFdvcnN0IGNhc2Ugc2NlbmFyaW8gaXMgcmVxdWlyaW5nIHJlc3RhcnRpbmcgTnVjbGlkZSBhZnRlciBjaGFuZ2luZyB0aGUgaGhfY2xpZW50IHBhdGguXG5jb25zdCBERUZBVUxUX0hBQ0tfQ09NTUFORDogUHJvbWlzZTxzdHJpbmc+ID0gZmluZEhhY2tDb21tYW5kKCk7XG5sZXQgaGFja0NvbW1hbmQgPSBERUZBVUxUX0hBQ0tfQ09NTUFORDtcblxuLyoqXG4qIElmIHRoaXMgcmV0dXJucyBudWxsLCB0aGVuIGl0IGlzIG5vdCBzYWZlIHRvIHJ1biBoYWNrLlxuKi9cbmZ1bmN0aW9uIGZpbmRIYWNrQ29uZmlnRGlyKGxvY2FsRmlsZTogc3RyaW5nKTogUHJvbWlzZTw/c3RyaW5nPiB7XG4gIHJldHVybiBmaW5kTmVhcmVzdEZpbGUoSEFDS19DT05GSUdfRklMRV9OQU1FLCBsb2NhbEZpbGUpO1xufVxuXG4vLyBSZXR1cm5zIHRoZSBlbXB0eSBzdHJpbmcgb24gZmFpbHVyZVxuYXN5bmMgZnVuY3Rpb24gZmluZEhhY2tDb21tYW5kKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gIC8vIGBzdGRvdXRgIHdvdWxkIGJlIGVtcHR5IGlmIHRoZXJlIGlzIG5vIHN1Y2ggY29tbWFuZC5cbiAgcmV0dXJuIChhd2FpdCBjaGVja091dHB1dCgnd2hpY2gnLCBbUEFUSF9UT19ISF9DTElFTlRdKSkuc3Rkb3V0LnRyaW0oKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldEhhY2tDb21tYW5kKG5ld0hhY2tDb21tYW5kOiBzdHJpbmcpOiB2b2lkIHtcbiAgaWYgKG5ld0hhY2tDb21tYW5kID09PSAnJykge1xuICAgIGxvZ2dlci5kZWJ1ZygnUmVzZXR0aW5nIHRvIGRlZmF1bHQgaGhfY2xpZW50Jyk7XG4gICAgaGFja0NvbW1hbmQgPSBERUZBVUxUX0hBQ0tfQ09NTUFORDtcbiAgfSBlbHNlIHtcbiAgICBsb2dnZXIuZGVidWcoYFVzaW5nIGN1c3RvbSBoaF9jbGllbnQ6ICR7bmV3SGFja0NvbW1hbmR9YCk7XG4gICAgaGFja0NvbW1hbmQgPSBQcm9taXNlLnJlc29sdmUobmV3SGFja0NvbW1hbmQpO1xuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRIYWNrRXhlY09wdGlvbnMoXG4gIGxvY2FsRmlsZTogc3RyaW5nXG4pOiBQcm9taXNlPD97aGFja1Jvb3Q6IHN0cmluZywgaGFja0NvbW1hbmQ6IHN0cmluZ30+IHtcbiAgY29uc3QgW2N1cnJlbnRIYWNrQ29tbWFuZCwgaGFja1Jvb3RdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgIGhhY2tDb21tYW5kLFxuICAgIGZpbmRIYWNrQ29uZmlnRGlyKGxvY2FsRmlsZSksXG4gIF0pO1xuICBpZiAoaGFja1Jvb3QgJiYgY3VycmVudEhhY2tDb21tYW5kKSB7XG4gICAgcmV0dXJuIHtoYWNrUm9vdCwgaGFja0NvbW1hbmQ6IGN1cnJlbnRIYWNrQ29tbWFuZH07XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cbiJdfQ==