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
}

/**
 * Executes hh_client with proper arguments returning the result string or json object.
 */
);

exports.getHackExecOptions = getHackExecOptions;

var callHHClient = _asyncToGenerator(function* (args, errorStream, outputJson, processInput, filePath) {

  if (!hhPromiseQueue) {
    hhPromiseQueue = new _commons.PromiseQueue();
  }

  var hackExecOptions = yield getHackExecOptions(filePath);
  if (!hackExecOptions) {
    return null;
  }
  var hackRoot = hackExecOptions.hackRoot;

  (0, _assert2['default'])(hhPromiseQueue);
  return hhPromiseQueue.submit(_asyncToGenerator(function* (resolve, reject) {
    // Append args on the end of our commands.
    var defaults = ['--retries', '0', '--retry-if-init', 'false', '--from', 'nuclide'];
    if (outputJson) {
      defaults.unshift('--json');
    }

    var allArgs = defaults.concat(args);
    allArgs.push(hackRoot);

    var execResult = null;
    try {
      execResult = yield (0, _commons.checkOutput)(PATH_TO_HH_CLIENT, allArgs, { stdin: processInput });
    } catch (err) {
      reject(err);
      return;
    }
    var _execResult = execResult;
    var stdout = _execResult.stdout;
    var stderr = _execResult.stderr;

    if (stderr.indexOf(HH_SERVER_INIT_MESSAGE) !== -1) {
      reject(new Error(HH_SERVER_INIT_MESSAGE + ': try: `arc build` or try again later!'));
      return;
    } else if (stderr.startsWith(HH_SERVER_BUSY_MESSAGE)) {
      reject(new Error(HH_SERVER_BUSY_MESSAGE + ': try: `arc build` or try again later!'));
      return;
    }

    var output = errorStream ? stderr : stdout;
    if (!outputJson) {
      resolve({ result: output, hackRoot: hackRoot });
      return;
    }
    try {
      resolve({ result: JSON.parse(output), hackRoot: hackRoot });
    } catch (err) {
      var errorMessage = 'hh_client error, args: [' + args.join(',') + ']\nstdout: ' + stdout + ', stderr: ' + stderr;
      logger.error(errorMessage);
      reject(new Error(errorMessage));
    }
  }));
});

exports.callHHClient = callHHClient;

var getSearchResults = _asyncToGenerator(function* (filePath, search, filterTypes, searchPostfix) {
  if (!search) {
    return null;
  }

  // `pendingSearchPromises` is used to temporally cache search result promises.
  // So, when a matching search query is done in parallel, it will wait and resolve
  // with the original search call.
  var searchPromise = pendingSearchPromises.get(search);
  if (!searchPromise) {
    searchPromise = callHHClient(
    /*args*/['--search' + (searchPostfix || ''), search],
    /*errorStream*/false,
    /*outputJson*/true,
    /*processInput*/null,
    /*file*/filePath);
    pendingSearchPromises.set(search, searchPromise);
  }

  var searchResponse = null;
  try {
    searchResponse = yield searchPromise;
  } catch (error) {
    throw error;
  } finally {
    pendingSearchPromises['delete'](search);
  }

  if (!searchResponse) {
    return null;
  }

  var _searchResponse = searchResponse;
  var searchResult = _searchResponse.result;
  var hackRoot = _searchResponse.hackRoot;

  var result = [];
  for (var entry of searchResult) {
    var resultFile = entry.filename;
    if (!resultFile.startsWith(hackRoot)) {
      // Filter out files out of repo results, e.g. hh internal files.
      continue;
    }
    result.push({
      line: entry.line - 1,
      column: entry.char_start - 1,
      name: entry.name,
      path: resultFile,
      length: entry.char_end - entry.char_start + 1,
      scope: entry.scope,
      additionalInfo: entry.desc
    });
  }

  if (filterTypes) {
    result = filterSearchResults(result, filterTypes);
  }
  return { hackRoot: hackRoot, result: result };
}

// Eventually this will happen on the hack side, but for now, this will do.
);

exports.getSearchResults = getSearchResults;
exports.symbolTypeToSearchTypes = symbolTypeToSearchTypes;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _commons = require('../../commons');

var _hackCommonLibConstants = require('../../hack-common/lib/constants');

var PATH_TO_HH_CLIENT = 'hh_client';
var HH_SERVER_INIT_MESSAGE = 'hh_server still initializing';
var HH_SERVER_BUSY_MESSAGE = 'hh_server is busy';
var logger = require('../../logging').getLogger();

var hhPromiseQueue = null;
var pendingSearchPromises = new Map();

var SYMBOL_CLASS_SEARCH_TYPES = Object.freeze([_hackCommonLibConstants.SearchResultType.CLASS, _hackCommonLibConstants.SearchResultType.ABSTRACT_CLASS, _hackCommonLibConstants.SearchResultType.TRAIT, _hackCommonLibConstants.SearchResultType.TYPEDEF, _hackCommonLibConstants.SearchResultType.INTERFACE]);
var SYMBOL_METHOD_SEARCH_TYPES = Object.freeze([_hackCommonLibConstants.SearchResultType.METHOD]);
var SYMBOL_FUNCTION_SEARCH_TYPES = Object.freeze([_hackCommonLibConstants.SearchResultType.FUNCTION]);

/**
* If this returns null, then it is not safe to run hack.
*/
function findHackConfigDir(localFile) {
  return (0, _commons.findNearestFile)('.hhconfig', localFile);
}

function filterSearchResults(results, filter) {
  return results.filter(function (result) {
    var info = result.additionalInfo;
    var searchType = getSearchType(info);
    return filter.indexOf(searchType) !== -1;
  });
}

function getSearchType(info) {
  switch (info) {
    case 'typedef':
      return _hackCommonLibConstants.SearchResultType.TYPEDEF;
    case 'function':
      return _hackCommonLibConstants.SearchResultType.FUNCTION;
    case 'constant':
      return _hackCommonLibConstants.SearchResultType.CONSTANT;
    case 'trait':
      return _hackCommonLibConstants.SearchResultType.TRAIT;
    case 'interface':
      return _hackCommonLibConstants.SearchResultType.INTERFACE;
    case 'abstract class':
      return _hackCommonLibConstants.SearchResultType.ABSTRACT_CLASS;
    default:
      {
        if (info.startsWith('method') || info.startsWith('static method')) {
          return _hackCommonLibConstants.SearchResultType.METHOD;
        }
        if (info.startsWith('class var') || info.startsWith('static class var')) {
          return _hackCommonLibConstants.SearchResultType.CLASS_VAR;
        }
        return _hackCommonLibConstants.SearchResultType.CLASS;
      }
  }
}

function symbolTypeToSearchTypes(symbolType) {
  switch (symbolType) {
    case _hackCommonLibConstants.SymbolType.CLASS:
      return SYMBOL_CLASS_SEARCH_TYPES;
    case _hackCommonLibConstants.SymbolType.METHOD:
      return SYMBOL_METHOD_SEARCH_TYPES;
    case _hackCommonLibConstants.SymbolType.FUNCTION:
      return SYMBOL_FUNCTION_SEARCH_TYPES;
    default:
      return null;
  }
}
//# sourceMappingURL=data:application/json;base64,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QVU7QUFDYixhQUFPLHlDQUFpQixRQUFRLENBQUM7QUFBQSxBQUNuQyxTQUFLLE9BQU87QUFDVixhQUFPLHlDQUFpQixLQUFLLENBQUM7QUFBQSxBQUNoQyxTQUFLLFdBQVc7QUFDZCxhQUFPLHlDQUFpQixTQUFTLENBQUM7QUFBQSxBQUNwQyxTQUFLLGdCQUFnQjtBQUNuQixhQUFPLHlDQUFpQixjQUFjLENBQUM7QUFBQSxBQUN6QztBQUFTO0FBQ1AsWUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLEVBQUU7QUFDakUsaUJBQU8seUNBQWlCLE1BQU0sQ0FBQztTQUNoQztBQUNELFlBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLEVBQUU7QUFDdkUsaUJBQU8seUNBQWlCLFNBQVMsQ0FBQztTQUNuQztBQUNELGVBQU8seUNBQWlCLEtBQUssQ0FBQztPQUMvQjtBQUFBLEdBQ0Y7Q0FDRjs7QUFFTSxTQUFTLHVCQUF1QixDQUNyQyxVQUEyQixFQUNJO0FBQy9CLFVBQVEsVUFBVTtBQUNoQixTQUFLLG1DQUFXLEtBQUs7QUFDbkIsYUFBTyx5QkFBeUIsQ0FBQztBQUFBLEFBQ25DLFNBQUssbUNBQVcsTUFBTTtBQUNwQixhQUFPLDBCQUEwQixDQUFDO0FBQUEsQUFDcEMsU0FBSyxtQ0FBVyxRQUFRO0FBQ3RCLGFBQU8sNEJBQTRCLENBQUM7QUFBQSxBQUN0QztBQUNFLGFBQU8sSUFBSSxDQUFDO0FBQUEsR0FDZjtDQUNGIiwiZmlsZSI6IkhhY2tIZWxwZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0hhY2tTZWFyY2hSZXN1bHQsIEhhY2tTZWFyY2hQb3NpdGlvbiwgSEhTZWFyY2hQb3NpdGlvbn0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgdHlwZSB7U2VhcmNoUmVzdWx0VHlwZVZhbHVlLCBTeW1ib2xUeXBlVmFsdWV9IGZyb20gJy4uLy4uL2hhY2stY29tbW9uL2xpYi9jb25zdGFudHMnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge2ZpbmROZWFyZXN0RmlsZSwgY2hlY2tPdXRwdXQsIFByb21pc2VRdWV1ZX0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQge1NlYXJjaFJlc3VsdFR5cGUsIFN5bWJvbFR5cGV9IGZyb20gJy4uLy4uL2hhY2stY29tbW9uL2xpYi9jb25zdGFudHMnO1xuXG5jb25zdCBQQVRIX1RPX0hIX0NMSUVOVCA9ICdoaF9jbGllbnQnO1xuY29uc3QgSEhfU0VSVkVSX0lOSVRfTUVTU0FHRSA9ICdoaF9zZXJ2ZXIgc3RpbGwgaW5pdGlhbGl6aW5nJztcbmNvbnN0IEhIX1NFUlZFUl9CVVNZX01FU1NBR0UgPSAnaGhfc2VydmVyIGlzIGJ1c3knO1xuY29uc3QgbG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vbG9nZ2luZycpLmdldExvZ2dlcigpO1xuXG5sZXQgaGhQcm9taXNlUXVldWU6ID9Qcm9taXNlUXVldWUgPSBudWxsO1xuY29uc3QgcGVuZGluZ1NlYXJjaFByb21pc2VzOiBNYXA8c3RyaW5nLCBQcm9taXNlPiA9IG5ldyBNYXAoKTtcblxuY29uc3QgU1lNQk9MX0NMQVNTX1NFQVJDSF9UWVBFUyA9IE9iamVjdC5mcmVlemUoW1xuICBTZWFyY2hSZXN1bHRUeXBlLkNMQVNTLFxuICBTZWFyY2hSZXN1bHRUeXBlLkFCU1RSQUNUX0NMQVNTLFxuICBTZWFyY2hSZXN1bHRUeXBlLlRSQUlULFxuICBTZWFyY2hSZXN1bHRUeXBlLlRZUEVERUYsXG4gIFNlYXJjaFJlc3VsdFR5cGUuSU5URVJGQUNFLFxuXSk7XG5jb25zdCBTWU1CT0xfTUVUSE9EX1NFQVJDSF9UWVBFUyA9IE9iamVjdC5mcmVlemUoW1NlYXJjaFJlc3VsdFR5cGUuTUVUSE9EXSk7XG5jb25zdCBTWU1CT0xfRlVOQ1RJT05fU0VBUkNIX1RZUEVTID0gT2JqZWN0LmZyZWV6ZShbU2VhcmNoUmVzdWx0VHlwZS5GVU5DVElPTl0pO1xuXG4vKipcbiogSWYgdGhpcyByZXR1cm5zIG51bGwsIHRoZW4gaXQgaXMgbm90IHNhZmUgdG8gcnVuIGhhY2suXG4qL1xuZnVuY3Rpb24gZmluZEhhY2tDb25maWdEaXIobG9jYWxGaWxlOiBzdHJpbmcpOiBQcm9taXNlPD9zdHJpbmc+IHtcbiAgcmV0dXJuIGZpbmROZWFyZXN0RmlsZSgnLmhoY29uZmlnJywgbG9jYWxGaWxlKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEhhY2tFeGVjT3B0aW9ucyhcbiAgbG9jYWxGaWxlOiBzdHJpbmdcbik6IFByb21pc2U8P3toYWNrUm9vdDogc3RyaW5nLCBoYWNrQ29tbWFuZDogc3RyaW5nfT4ge1xuICAvLyAkRmxvd0ZpeE1lIGluY29tcGF0aWJsZSB0eXBlLlxuICBjb25zdCBbaGhSZXN1bHQsIGhhY2tSb290XSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAvLyBgc3Rkb3V0YCB3b3VsZCBiZSBlbXB0eSBpZiB0aGVyZSBpcyBubyBzdWNoIGNvbW1hbmQuXG4gICAgY2hlY2tPdXRwdXQoJ3doaWNoJywgW1BBVEhfVE9fSEhfQ0xJRU5UXSksXG4gICAgZmluZEhhY2tDb25maWdEaXIobG9jYWxGaWxlKSxcbiAgXSk7XG4gIGNvbnN0IGhhY2tDb21tYW5kID0gaGhSZXN1bHQuc3Rkb3V0LnRyaW0oKTtcbiAgaWYgKGhhY2tSb290ICYmIGhhY2tDb21tYW5kKSB7XG4gICAgcmV0dXJuIHtoYWNrUm9vdCwgaGFja0NvbW1hbmR9O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbiAvKipcbiAgKiBFeGVjdXRlcyBoaF9jbGllbnQgd2l0aCBwcm9wZXIgYXJndW1lbnRzIHJldHVybmluZyB0aGUgcmVzdWx0IHN0cmluZyBvciBqc29uIG9iamVjdC5cbiAgKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjYWxsSEhDbGllbnQoXG4gIGFyZ3M6IEFycmF5PHN0cmluZz4sXG4gIGVycm9yU3RyZWFtOiBib29sZWFuLFxuICBvdXRwdXRKc29uOiBib29sZWFuLFxuICBwcm9jZXNzSW5wdXQ6ID9zdHJpbmcsXG4gIGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPD97aGFja1Jvb3Q6IHN0cmluZywgcmVzdWx0OiBzdHJpbmcgfCBPYmplY3R9PiB7XG5cbiAgaWYgKCFoaFByb21pc2VRdWV1ZSkge1xuICAgIGhoUHJvbWlzZVF1ZXVlID0gbmV3IFByb21pc2VRdWV1ZSgpO1xuICB9XG5cbiAgY29uc3QgaGFja0V4ZWNPcHRpb25zID0gYXdhaXQgZ2V0SGFja0V4ZWNPcHRpb25zKGZpbGVQYXRoKTtcbiAgaWYgKCFoYWNrRXhlY09wdGlvbnMpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCB7aGFja1Jvb3R9ID0gaGFja0V4ZWNPcHRpb25zO1xuXG4gIGludmFyaWFudChoaFByb21pc2VRdWV1ZSk7XG4gIHJldHVybiBoaFByb21pc2VRdWV1ZS5zdWJtaXQoYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIC8vIEFwcGVuZCBhcmdzIG9uIHRoZSBlbmQgb2Ygb3VyIGNvbW1hbmRzLlxuICAgIGNvbnN0IGRlZmF1bHRzID0gWyctLXJldHJpZXMnLCAnMCcsICctLXJldHJ5LWlmLWluaXQnLCAnZmFsc2UnLCAnLS1mcm9tJywgJ251Y2xpZGUnXTtcbiAgICBpZiAob3V0cHV0SnNvbikge1xuICAgICAgZGVmYXVsdHMudW5zaGlmdCgnLS1qc29uJyk7XG4gICAgfVxuXG4gICAgY29uc3QgYWxsQXJncyA9IGRlZmF1bHRzLmNvbmNhdChhcmdzKTtcbiAgICBhbGxBcmdzLnB1c2goaGFja1Jvb3QpO1xuXG4gICAgbGV0IGV4ZWNSZXN1bHQgPSBudWxsO1xuICAgIHRyeSB7XG4gICAgICBleGVjUmVzdWx0ID0gYXdhaXQgY2hlY2tPdXRwdXQoUEFUSF9UT19ISF9DTElFTlQsIGFsbEFyZ3MsIHtzdGRpbjogcHJvY2Vzc0lucHV0fSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICByZWplY3QoZXJyKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qge3N0ZG91dCwgc3RkZXJyfSA9IGV4ZWNSZXN1bHQ7XG4gICAgaWYgKHN0ZGVyci5pbmRleE9mKEhIX1NFUlZFUl9JTklUX01FU1NBR0UpICE9PSAtMSkge1xuICAgICAgcmVqZWN0KG5ldyBFcnJvcihgJHtISF9TRVJWRVJfSU5JVF9NRVNTQUdFfTogdHJ5OiBcXGBhcmMgYnVpbGRcXGAgb3IgdHJ5IGFnYWluIGxhdGVyIWApKTtcbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYgKHN0ZGVyci5zdGFydHNXaXRoKEhIX1NFUlZFUl9CVVNZX01FU1NBR0UpKSB7XG4gICAgICByZWplY3QobmV3IEVycm9yKGAke0hIX1NFUlZFUl9CVVNZX01FU1NBR0V9OiB0cnk6IFxcYGFyYyBidWlsZFxcYCBvciB0cnkgYWdhaW4gbGF0ZXIhYCkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IG91dHB1dCA9IGVycm9yU3RyZWFtID8gc3RkZXJyIDogc3Rkb3V0O1xuICAgIGlmICghb3V0cHV0SnNvbikge1xuICAgICAgcmVzb2x2ZSh7cmVzdWx0OiBvdXRwdXQsIGhhY2tSb290fSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICByZXNvbHZlKHtyZXN1bHQ6IEpTT04ucGFyc2Uob3V0cHV0KSwgaGFja1Jvb3R9KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGBoaF9jbGllbnQgZXJyb3IsIGFyZ3M6IFske2FyZ3Muam9pbignLCcpfV1cbnN0ZG91dDogJHtzdGRvdXR9LCBzdGRlcnI6ICR7c3RkZXJyfWA7XG4gICAgICBsb2dnZXIuZXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoZXJyb3JNZXNzYWdlKSk7XG4gICAgfVxuICB9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFNlYXJjaFJlc3VsdHMoXG4gICAgZmlsZVBhdGg6IHN0cmluZyxcbiAgICBzZWFyY2g6IHN0cmluZyxcbiAgICBmaWx0ZXJUeXBlcz86ID9BcnJheTxTZWFyY2hSZXN1bHRUeXBlVmFsdWU+LFxuICAgIHNlYXJjaFBvc3RmaXg/OiBzdHJpbmcsXG4gICk6IFByb21pc2U8P0hhY2tTZWFyY2hSZXN1bHQ+IHtcbiAgaWYgKCFzZWFyY2gpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIGBwZW5kaW5nU2VhcmNoUHJvbWlzZXNgIGlzIHVzZWQgdG8gdGVtcG9yYWxseSBjYWNoZSBzZWFyY2ggcmVzdWx0IHByb21pc2VzLlxuICAvLyBTbywgd2hlbiBhIG1hdGNoaW5nIHNlYXJjaCBxdWVyeSBpcyBkb25lIGluIHBhcmFsbGVsLCBpdCB3aWxsIHdhaXQgYW5kIHJlc29sdmVcbiAgLy8gd2l0aCB0aGUgb3JpZ2luYWwgc2VhcmNoIGNhbGwuXG4gIGxldCBzZWFyY2hQcm9taXNlID0gcGVuZGluZ1NlYXJjaFByb21pc2VzLmdldChzZWFyY2gpO1xuICBpZiAoIXNlYXJjaFByb21pc2UpIHtcbiAgICBzZWFyY2hQcm9taXNlID0gY2FsbEhIQ2xpZW50KFxuICAgICAgICAvKmFyZ3MqLyBbJy0tc2VhcmNoJyArIChzZWFyY2hQb3N0Zml4IHx8ICcnKSwgc2VhcmNoXSxcbiAgICAgICAgLyplcnJvclN0cmVhbSovIGZhbHNlLFxuICAgICAgICAvKm91dHB1dEpzb24qLyB0cnVlLFxuICAgICAgICAvKnByb2Nlc3NJbnB1dCovIG51bGwsXG4gICAgICAgIC8qZmlsZSovIGZpbGVQYXRoLFxuICAgICk7XG4gICAgcGVuZGluZ1NlYXJjaFByb21pc2VzLnNldChzZWFyY2gsIHNlYXJjaFByb21pc2UpO1xuICB9XG5cbiAgbGV0IHNlYXJjaFJlc3BvbnNlOiA/e2hhY2tSb290OiBzdHJpbmc7IHJlc3VsdDogQXJyYXk8SEhTZWFyY2hQb3NpdGlvbj59ID0gbnVsbDtcbiAgdHJ5IHtcbiAgICBzZWFyY2hSZXNwb25zZSA9IChcbiAgICAgICgoYXdhaXQgc2VhcmNoUHJvbWlzZSk6IGFueSk6IHtoYWNrUm9vdDogc3RyaW5nOyByZXN1bHQ6IEFycmF5PEhIU2VhcmNoUG9zaXRpb24+fVxuICAgICk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH0gZmluYWxseSB7XG4gICAgcGVuZGluZ1NlYXJjaFByb21pc2VzLmRlbGV0ZShzZWFyY2gpO1xuICB9XG5cbiAgaWYgKCFzZWFyY2hSZXNwb25zZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29uc3Qge3Jlc3VsdDogc2VhcmNoUmVzdWx0LCBoYWNrUm9vdH0gPSBzZWFyY2hSZXNwb25zZTtcbiAgbGV0IHJlc3VsdDogQXJyYXk8SGFja1NlYXJjaFBvc2l0aW9uPiA9IFtdO1xuICBmb3IgKGNvbnN0IGVudHJ5IG9mIHNlYXJjaFJlc3VsdCkge1xuICAgIGNvbnN0IHJlc3VsdEZpbGUgPSBlbnRyeS5maWxlbmFtZTtcbiAgICBpZiAoIXJlc3VsdEZpbGUuc3RhcnRzV2l0aChoYWNrUm9vdCkpIHtcbiAgICAgIC8vIEZpbHRlciBvdXQgZmlsZXMgb3V0IG9mIHJlcG8gcmVzdWx0cywgZS5nLiBoaCBpbnRlcm5hbCBmaWxlcy5cbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICByZXN1bHQucHVzaCh7XG4gICAgICBsaW5lOiBlbnRyeS5saW5lIC0gMSxcbiAgICAgIGNvbHVtbjogZW50cnkuY2hhcl9zdGFydCAtIDEsXG4gICAgICBuYW1lOiBlbnRyeS5uYW1lLFxuICAgICAgcGF0aDogcmVzdWx0RmlsZSxcbiAgICAgIGxlbmd0aDogZW50cnkuY2hhcl9lbmQgLSBlbnRyeS5jaGFyX3N0YXJ0ICsgMSxcbiAgICAgIHNjb3BlOiBlbnRyeS5zY29wZSxcbiAgICAgIGFkZGl0aW9uYWxJbmZvOiBlbnRyeS5kZXNjLFxuICAgIH0pO1xuICB9XG5cbiAgaWYgKGZpbHRlclR5cGVzKSB7XG4gICAgcmVzdWx0ID0gZmlsdGVyU2VhcmNoUmVzdWx0cyhyZXN1bHQsIGZpbHRlclR5cGVzKTtcbiAgfVxuICByZXR1cm4ge2hhY2tSb290LCByZXN1bHR9O1xufVxuXG4vLyBFdmVudHVhbGx5IHRoaXMgd2lsbCBoYXBwZW4gb24gdGhlIGhhY2sgc2lkZSwgYnV0IGZvciBub3csIHRoaXMgd2lsbCBkby5cbmZ1bmN0aW9uIGZpbHRlclNlYXJjaFJlc3VsdHMoXG4gIHJlc3VsdHM6IEFycmF5PEhhY2tTZWFyY2hQb3NpdGlvbj4sXG4gIGZpbHRlcjogQXJyYXk8U2VhcmNoUmVzdWx0VHlwZVZhbHVlPixcbik6IEFycmF5PEhhY2tTZWFyY2hQb3NpdGlvbj4ge1xuICByZXR1cm4gcmVzdWx0cy5maWx0ZXIoKHJlc3VsdCkgPT4ge1xuICAgIGNvbnN0IGluZm8gPSByZXN1bHQuYWRkaXRpb25hbEluZm87XG4gICAgY29uc3Qgc2VhcmNoVHlwZSA9IGdldFNlYXJjaFR5cGUoaW5mbyk7XG4gICAgcmV0dXJuIGZpbHRlci5pbmRleE9mKHNlYXJjaFR5cGUpICE9PSAtMTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFNlYXJjaFR5cGUoaW5mbzogc3RyaW5nKTogU2VhcmNoUmVzdWx0VHlwZVZhbHVlIHtcbiAgc3dpdGNoIChpbmZvKSB7XG4gICAgY2FzZSAndHlwZWRlZic6XG4gICAgICByZXR1cm4gU2VhcmNoUmVzdWx0VHlwZS5UWVBFREVGO1xuICAgIGNhc2UgJ2Z1bmN0aW9uJzpcbiAgICAgIHJldHVybiBTZWFyY2hSZXN1bHRUeXBlLkZVTkNUSU9OO1xuICAgIGNhc2UgJ2NvbnN0YW50JzpcbiAgICAgIHJldHVybiBTZWFyY2hSZXN1bHRUeXBlLkNPTlNUQU5UO1xuICAgIGNhc2UgJ3RyYWl0JzpcbiAgICAgIHJldHVybiBTZWFyY2hSZXN1bHRUeXBlLlRSQUlUO1xuICAgIGNhc2UgJ2ludGVyZmFjZSc6XG4gICAgICByZXR1cm4gU2VhcmNoUmVzdWx0VHlwZS5JTlRFUkZBQ0U7XG4gICAgY2FzZSAnYWJzdHJhY3QgY2xhc3MnOlxuICAgICAgcmV0dXJuIFNlYXJjaFJlc3VsdFR5cGUuQUJTVFJBQ1RfQ0xBU1M7XG4gICAgZGVmYXVsdDoge1xuICAgICAgaWYgKGluZm8uc3RhcnRzV2l0aCgnbWV0aG9kJykgfHwgaW5mby5zdGFydHNXaXRoKCdzdGF0aWMgbWV0aG9kJykpIHtcbiAgICAgICAgcmV0dXJuIFNlYXJjaFJlc3VsdFR5cGUuTUVUSE9EO1xuICAgICAgfVxuICAgICAgaWYgKGluZm8uc3RhcnRzV2l0aCgnY2xhc3MgdmFyJykgfHwgaW5mby5zdGFydHNXaXRoKCdzdGF0aWMgY2xhc3MgdmFyJykpIHtcbiAgICAgICAgcmV0dXJuIFNlYXJjaFJlc3VsdFR5cGUuQ0xBU1NfVkFSO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFNlYXJjaFJlc3VsdFR5cGUuQ0xBU1M7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzeW1ib2xUeXBlVG9TZWFyY2hUeXBlcyhcbiAgc3ltYm9sVHlwZTogU3ltYm9sVHlwZVZhbHVlLFxuKTogP0FycmF5PFNlYXJjaFJlc3VsdFR5cGVWYWx1ZT4ge1xuICBzd2l0Y2ggKHN5bWJvbFR5cGUpIHtcbiAgICBjYXNlIFN5bWJvbFR5cGUuQ0xBU1M6XG4gICAgICByZXR1cm4gU1lNQk9MX0NMQVNTX1NFQVJDSF9UWVBFUztcbiAgICBjYXNlIFN5bWJvbFR5cGUuTUVUSE9EOlxuICAgICAgcmV0dXJuIFNZTUJPTF9NRVRIT0RfU0VBUkNIX1RZUEVTO1xuICAgIGNhc2UgU3ltYm9sVHlwZS5GVU5DVElPTjpcbiAgICAgIHJldHVybiBTWU1CT0xfRlVOQ1RJT05fU0VBUkNIX1RZUEVTO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuIl19