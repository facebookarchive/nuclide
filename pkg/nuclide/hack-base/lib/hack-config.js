Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.findHackConfigDir = findHackConfigDir;

// Returns the empty string on failure

var findHackCommand = _asyncToGenerator(function* () {
  // `stdout` would be empty if there is no such command.
  return (yield (0, _commons.checkOutput)('which', [PATH_TO_HH_CLIENT])).stdout.trim();
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

var useConnection = false;

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

function getHackCommand() {
  return hackCommand;
}

function setUseIde(useIdeConnection) {
  useConnection = useIdeConnection;
}

function getUseIde() {
  return useConnection;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhhY2stY29uZmlnLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7SUFrQ2UsZUFBZSxxQkFBOUIsYUFBa0Q7O0FBRWhELFNBQU8sQ0FBQyxNQUFNLDBCQUFZLE9BQU8sRUFBRSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQSxDQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztDQUN4RTs7Ozs7SUFnQnFCLGtCQUFrQixxQkFBakMsV0FDTCxTQUFpQixFQUNrQzthQUNaLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUN2RCxXQUFXLEVBQ1gsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQzdCLENBQUM7Ozs7TUFISyxrQkFBa0I7TUFBRSxRQUFROztBQUluQyxNQUFJLFFBQVEsSUFBSSxrQkFBa0IsRUFBRTtBQUNsQyxXQUFPLEVBQUMsUUFBUSxFQUFSLFFBQVEsRUFBRSxXQUFXLEVBQUUsa0JBQWtCLEVBQUMsQ0FBQztHQUNwRCxNQUFNO0FBQ0wsV0FBTyxJQUFJLENBQUM7R0FDYjtDQUNGOzs7Ozs7Ozs7Ozs7Ozs7O3VCQXREMEMsZUFBZTs7QUFDMUQsSUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDOztBQUVwRCxJQUFNLHFCQUFxQixHQUFHLFdBQVcsQ0FBQztBQUMxQyxJQUFNLGlCQUFpQixHQUFHLFdBQVcsQ0FBQzs7Ozs7O0FBTXRDLElBQU0sb0JBQXFDLEdBQUcsZUFBZSxFQUFFLENBQUM7QUFDaEUsSUFBSSxXQUFXLEdBQUcsb0JBQW9CLENBQUM7O0FBRXZDLElBQUksYUFBYSxHQUFHLEtBQUssQ0FBQzs7Ozs7O0FBS25CLFNBQVMsaUJBQWlCLENBQUMsU0FBaUIsRUFBb0I7QUFDckUsU0FBTyw4QkFBZ0IscUJBQXFCLEVBQUUsU0FBUyxDQUFDLENBQUM7Q0FDMUQ7O0FBUU0sU0FBUyxjQUFjLENBQUMsY0FBc0IsRUFBUTtBQUMzRCxNQUFJLGNBQWMsS0FBSyxFQUFFLEVBQUU7QUFDekIsVUFBTSxDQUFDLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0FBQy9DLGVBQVcsR0FBRyxvQkFBb0IsQ0FBQztHQUNwQyxNQUFNO0FBQ0wsVUFBTSxDQUFDLEtBQUssOEJBQTRCLGNBQWMsQ0FBRyxDQUFDO0FBQzFELGVBQVcsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0dBQy9DO0NBQ0Y7O0FBRU0sU0FBUyxjQUFjLEdBQW9CO0FBQ2hELFNBQU8sV0FBVyxDQUFDO0NBQ3BCOztBQWdCTSxTQUFTLFNBQVMsQ0FBQyxnQkFBeUIsRUFBUTtBQUN6RCxlQUFhLEdBQUcsZ0JBQWdCLENBQUM7Q0FDbEM7O0FBRU0sU0FBUyxTQUFTLEdBQVk7QUFDbkMsU0FBTyxhQUFhLENBQUM7Q0FDdEIiLCJmaWxlIjoiaGFjay1jb25maWcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge2ZpbmROZWFyZXN0RmlsZSwgY2hlY2tPdXRwdXR9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuY29uc3QgbG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vbG9nZ2luZycpLmdldExvZ2dlcigpO1xuXG5jb25zdCBIQUNLX0NPTkZJR19GSUxFX05BTUUgPSAnLmhoY29uZmlnJztcbmNvbnN0IFBBVEhfVE9fSEhfQ0xJRU5UID0gJ2hoX2NsaWVudCc7XG5cbi8vIEtpY2sgdGhpcyBvZmYgZWFybHksIHNvIHdlIGRvbid0IG5lZWQgdG8gcmVwZWF0IHRoaXMgb24gZXZlcnkgY2FsbC5cbi8vIFdlIGRvbid0IGhhdmUgYSB3YXkgb2YgY2hhbmdpbmcgdGhlIHBhdGggb24gdGhlIGRldiBzZXJ2ZXIgYWZ0ZXIgYVxuLy8gY29ubmVjdGlvbiBpcyBtYWRlIHNvIHRoaXMgc2hvdWxkbid0IGNoYW5nZSBvdmVyIHRpbWUuXG4vLyBXb3JzdCBjYXNlIHNjZW5hcmlvIGlzIHJlcXVpcmluZyByZXN0YXJ0aW5nIE51Y2xpZGUgYWZ0ZXIgY2hhbmdpbmcgdGhlIGhoX2NsaWVudCBwYXRoLlxuY29uc3QgREVGQVVMVF9IQUNLX0NPTU1BTkQ6IFByb21pc2U8c3RyaW5nPiA9IGZpbmRIYWNrQ29tbWFuZCgpO1xubGV0IGhhY2tDb21tYW5kID0gREVGQVVMVF9IQUNLX0NPTU1BTkQ7XG5cbmxldCB1c2VDb25uZWN0aW9uID0gZmFsc2U7XG5cbi8qKlxuKiBJZiB0aGlzIHJldHVybnMgbnVsbCwgdGhlbiBpdCBpcyBub3Qgc2FmZSB0byBydW4gaGFjay5cbiovXG5leHBvcnQgZnVuY3Rpb24gZmluZEhhY2tDb25maWdEaXIobG9jYWxGaWxlOiBzdHJpbmcpOiBQcm9taXNlPD9zdHJpbmc+IHtcbiAgcmV0dXJuIGZpbmROZWFyZXN0RmlsZShIQUNLX0NPTkZJR19GSUxFX05BTUUsIGxvY2FsRmlsZSk7XG59XG5cbi8vIFJldHVybnMgdGhlIGVtcHR5IHN0cmluZyBvbiBmYWlsdXJlXG5hc3luYyBmdW5jdGlvbiBmaW5kSGFja0NvbW1hbmQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgLy8gYHN0ZG91dGAgd291bGQgYmUgZW1wdHkgaWYgdGhlcmUgaXMgbm8gc3VjaCBjb21tYW5kLlxuICByZXR1cm4gKGF3YWl0IGNoZWNrT3V0cHV0KCd3aGljaCcsIFtQQVRIX1RPX0hIX0NMSUVOVF0pKS5zdGRvdXQudHJpbSgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0SGFja0NvbW1hbmQobmV3SGFja0NvbW1hbmQ6IHN0cmluZyk6IHZvaWQge1xuICBpZiAobmV3SGFja0NvbW1hbmQgPT09ICcnKSB7XG4gICAgbG9nZ2VyLmRlYnVnKCdSZXNldHRpbmcgdG8gZGVmYXVsdCBoaF9jbGllbnQnKTtcbiAgICBoYWNrQ29tbWFuZCA9IERFRkFVTFRfSEFDS19DT01NQU5EO1xuICB9IGVsc2Uge1xuICAgIGxvZ2dlci5kZWJ1ZyhgVXNpbmcgY3VzdG9tIGhoX2NsaWVudDogJHtuZXdIYWNrQ29tbWFuZH1gKTtcbiAgICBoYWNrQ29tbWFuZCA9IFByb21pc2UucmVzb2x2ZShuZXdIYWNrQ29tbWFuZCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEhhY2tDb21tYW5kKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gIHJldHVybiBoYWNrQ29tbWFuZDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEhhY2tFeGVjT3B0aW9ucyhcbiAgbG9jYWxGaWxlOiBzdHJpbmdcbik6IFByb21pc2U8P3toYWNrUm9vdDogc3RyaW5nLCBoYWNrQ29tbWFuZDogc3RyaW5nfT4ge1xuICBjb25zdCBbY3VycmVudEhhY2tDb21tYW5kLCBoYWNrUm9vdF0gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgaGFja0NvbW1hbmQsXG4gICAgZmluZEhhY2tDb25maWdEaXIobG9jYWxGaWxlKSxcbiAgXSk7XG4gIGlmIChoYWNrUm9vdCAmJiBjdXJyZW50SGFja0NvbW1hbmQpIHtcbiAgICByZXR1cm4ge2hhY2tSb290LCBoYWNrQ29tbWFuZDogY3VycmVudEhhY2tDb21tYW5kfTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0VXNlSWRlKHVzZUlkZUNvbm5lY3Rpb246IGJvb2xlYW4pOiB2b2lkIHtcbiAgdXNlQ29ubmVjdGlvbiA9IHVzZUlkZUNvbm5lY3Rpb247XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRVc2VJZGUoKTogYm9vbGVhbiB7XG4gIHJldHVybiB1c2VDb25uZWN0aW9uO1xufVxuIl19