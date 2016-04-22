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
 * Executes hh_client with proper arguments returning the result string or json object.
 */

var callHHClient = _asyncToGenerator(function* (args, errorStream, outputJson, processInput, filePath) {

  if ((0, _hackConfig.getUseIde)()) {
    return yield (0, _HackConnection.callHHClientUsingConnection)(args, processInput, filePath);
  }

  if (!hhPromiseQueue) {
    hhPromiseQueue = new _nuclideCommons.PromiseQueue();
  }

  var hackExecOptions = yield (0, _hackConfig.getHackExecOptions)(filePath);
  if (!hackExecOptions) {
    return null;
  }
  var hackRoot = hackExecOptions.hackRoot;
  var hackCommand = hackExecOptions.hackCommand;

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
      logger.debug('Calling Hack: ' + hackCommand + ' with ' + allArgs);
      execResult = yield (0, _nuclideCommons.checkOutput)(hackCommand, allArgs, { stdin: processInput });
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
    logger.debug('Hack output for ' + allArgs + ': ' + output);
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideCommons = require('../../nuclide-commons');

var _nuclideHackCommon = require('../../nuclide-hack-common');

var _hackConfig = require('./hack-config');

var _HackConnection = require('./HackConnection');

var HH_SERVER_INIT_MESSAGE = 'hh_server still initializing';
var HH_SERVER_BUSY_MESSAGE = 'hh_server is busy';
var logger = require('../../nuclide-logging').getLogger();

var hhPromiseQueue = null;
var pendingSearchPromises = new Map();function filterSearchResults(results, filter) {
  return results.filter(function (result) {
    var info = result.additionalInfo;
    var searchType = getSearchType(info);
    return filter.indexOf(searchType) !== -1;
  });
}

function getSearchType(info) {
  switch (info) {
    case 'typedef':
      return _nuclideHackCommon.SearchResultType.TYPEDEF;
    case 'function':
      return _nuclideHackCommon.SearchResultType.FUNCTION;
    case 'constant':
      return _nuclideHackCommon.SearchResultType.CONSTANT;
    case 'trait':
      return _nuclideHackCommon.SearchResultType.TRAIT;
    case 'interface':
      return _nuclideHackCommon.SearchResultType.INTERFACE;
    case 'abstract class':
      return _nuclideHackCommon.SearchResultType.ABSTRACT_CLASS;
    default:
      {
        if (info.startsWith('method') || info.startsWith('static method')) {
          return _nuclideHackCommon.SearchResultType.METHOD;
        }
        if (info.startsWith('class var') || info.startsWith('static class var')) {
          return _nuclideHackCommon.SearchResultType.CLASS_VAR;
        }
        return _nuclideHackCommon.SearchResultType.CLASS;
      }
  }
}
//# sourceMappingURL=data:application/json;base64,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QUMsTUFBTSxDQUFDLFVBQUEsTUFBTSxFQUFJO0FBQzlCLFFBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUM7QUFDbkMsUUFBTSxVQUFVLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3ZDLFdBQU8sTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztHQUMxQyxDQUFDLENBQUM7Q0FDSjs7QUFFRCxTQUFTLGFBQWEsQ0FBQyxJQUFZLEVBQXlCO0FBQzFELFVBQVEsSUFBSTtBQUNWLFNBQUssU0FBUztBQUNaLGFBQU8sb0NBQWlCLE9BQU8sQ0FBQztBQUFBLEFBQ2xDLFNBQUssVUFBVTtBQUNiLGFBQU8sb0NBQWlCLFFBQVEsQ0FBQztBQUFBLEFBQ25DLFNBQUssVUFBVTtBQUNiLGFBQU8sb0NBQWlCLFFBQVEsQ0FBQztBQUFBLEFBQ25DLFNBQUssT0FBTztBQUNWLGFBQU8sb0NBQWlCLEtBQUssQ0FBQztBQUFBLEFBQ2hDLFNBQUssV0FBVztBQUNkLGFBQU8sb0NBQWlCLFNBQVMsQ0FBQztBQUFBLEFBQ3BDLFNBQUssZ0JBQWdCO0FBQ25CLGFBQU8sb0NBQWlCLGNBQWMsQ0FBQztBQUFBLEFBQ3pDO0FBQVM7QUFDUCxZQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsRUFBRTtBQUNqRSxpQkFBTyxvQ0FBaUIsTUFBTSxDQUFDO1NBQ2hDO0FBQ0QsWUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUMsRUFBRTtBQUN2RSxpQkFBTyxvQ0FBaUIsU0FBUyxDQUFDO1NBQ25DO0FBQ0QsZUFBTyxvQ0FBaUIsS0FBSyxDQUFDO09BQy9CO0FBQUEsR0FDRjtDQUNGIiwiZmlsZSI6IkhhY2tIZWxwZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0hhY2tTZWFyY2hQb3NpdGlvbn0gZnJvbSAnLi9IYWNrU2VydmljZSc7XG5pbXBvcnQgdHlwZSB7SGFja1NlYXJjaFJlc3VsdCwgSEhTZWFyY2hQb3NpdGlvbn0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgdHlwZSB7U2VhcmNoUmVzdWx0VHlwZVZhbHVlfSBmcm9tICcuLi8uLi9udWNsaWRlLWhhY2stY29tbW9uJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtjaGVja091dHB1dCwgUHJvbWlzZVF1ZXVlfSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IHtTZWFyY2hSZXN1bHRUeXBlfSBmcm9tICcuLi8uLi9udWNsaWRlLWhhY2stY29tbW9uJztcbmltcG9ydCB7Z2V0SGFja0V4ZWNPcHRpb25zLCBnZXRVc2VJZGV9IGZyb20gJy4vaGFjay1jb25maWcnO1xuaW1wb3J0IHtjYWxsSEhDbGllbnRVc2luZ0Nvbm5lY3Rpb259IGZyb20gJy4vSGFja0Nvbm5lY3Rpb24nO1xuXG5jb25zdCBISF9TRVJWRVJfSU5JVF9NRVNTQUdFID0gJ2hoX3NlcnZlciBzdGlsbCBpbml0aWFsaXppbmcnO1xuY29uc3QgSEhfU0VSVkVSX0JVU1lfTUVTU0FHRSA9ICdoaF9zZXJ2ZXIgaXMgYnVzeSc7XG5jb25zdCBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcblxubGV0IGhoUHJvbWlzZVF1ZXVlOiA/UHJvbWlzZVF1ZXVlID0gbnVsbDtcbmNvbnN0IHBlbmRpbmdTZWFyY2hQcm9taXNlczogTWFwPHN0cmluZywgUHJvbWlzZT4gPSBuZXcgTWFwKCk7XG5cbiAvKipcbiAgKiBFeGVjdXRlcyBoaF9jbGllbnQgd2l0aCBwcm9wZXIgYXJndW1lbnRzIHJldHVybmluZyB0aGUgcmVzdWx0IHN0cmluZyBvciBqc29uIG9iamVjdC5cbiAgKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjYWxsSEhDbGllbnQoXG4gIGFyZ3M6IEFycmF5PGFueT4sXG4gIGVycm9yU3RyZWFtOiBib29sZWFuLFxuICBvdXRwdXRKc29uOiBib29sZWFuLFxuICBwcm9jZXNzSW5wdXQ6ID9zdHJpbmcsXG4gIGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPD97aGFja1Jvb3Q6IHN0cmluZzsgcmVzdWx0OiBzdHJpbmcgfCBPYmplY3R9PiB7XG5cbiAgaWYgKGdldFVzZUlkZSgpKSB7XG4gICAgcmV0dXJuIGF3YWl0IGNhbGxISENsaWVudFVzaW5nQ29ubmVjdGlvbihhcmdzLCBwcm9jZXNzSW5wdXQsIGZpbGVQYXRoKTtcbiAgfVxuXG4gIGlmICghaGhQcm9taXNlUXVldWUpIHtcbiAgICBoaFByb21pc2VRdWV1ZSA9IG5ldyBQcm9taXNlUXVldWUoKTtcbiAgfVxuXG4gIGNvbnN0IGhhY2tFeGVjT3B0aW9ucyA9IGF3YWl0IGdldEhhY2tFeGVjT3B0aW9ucyhmaWxlUGF0aCk7XG4gIGlmICghaGFja0V4ZWNPcHRpb25zKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3Qge2hhY2tSb290LCBoYWNrQ29tbWFuZH0gPSBoYWNrRXhlY09wdGlvbnM7XG5cbiAgaW52YXJpYW50KGhoUHJvbWlzZVF1ZXVlKTtcbiAgcmV0dXJuIGhoUHJvbWlzZVF1ZXVlLnN1Ym1pdChhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgLy8gQXBwZW5kIGFyZ3Mgb24gdGhlIGVuZCBvZiBvdXIgY29tbWFuZHMuXG4gICAgY29uc3QgZGVmYXVsdHMgPSBbJy0tcmV0cmllcycsICcwJywgJy0tcmV0cnktaWYtaW5pdCcsICdmYWxzZScsICctLWZyb20nLCAnbnVjbGlkZSddO1xuICAgIGlmIChvdXRwdXRKc29uKSB7XG4gICAgICBkZWZhdWx0cy51bnNoaWZ0KCctLWpzb24nKTtcbiAgICB9XG5cbiAgICBjb25zdCBhbGxBcmdzID0gZGVmYXVsdHMuY29uY2F0KGFyZ3MpO1xuICAgIGFsbEFyZ3MucHVzaChoYWNrUm9vdCk7XG5cbiAgICBsZXQgZXhlY1Jlc3VsdCA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgIGxvZ2dlci5kZWJ1ZyhgQ2FsbGluZyBIYWNrOiAke2hhY2tDb21tYW5kfSB3aXRoICR7YWxsQXJnc31gKTtcbiAgICAgIGV4ZWNSZXN1bHQgPSBhd2FpdCBjaGVja091dHB1dChoYWNrQ29tbWFuZCwgYWxsQXJncywge3N0ZGluOiBwcm9jZXNzSW5wdXR9KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHJlamVjdChlcnIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB7c3Rkb3V0LCBzdGRlcnJ9ID0gZXhlY1Jlc3VsdDtcbiAgICBpZiAoc3RkZXJyLmluZGV4T2YoSEhfU0VSVkVSX0lOSVRfTUVTU0FHRSkgIT09IC0xKSB7XG4gICAgICByZWplY3QobmV3IEVycm9yKGAke0hIX1NFUlZFUl9JTklUX01FU1NBR0V9OiB0cnk6IFxcYGFyYyBidWlsZFxcYCBvciB0cnkgYWdhaW4gbGF0ZXIhYCkpO1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSBpZiAoc3RkZXJyLnN0YXJ0c1dpdGgoSEhfU0VSVkVSX0JVU1lfTUVTU0FHRSkpIHtcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoYCR7SEhfU0VSVkVSX0JVU1lfTUVTU0FHRX06IHRyeTogXFxgYXJjIGJ1aWxkXFxgIG9yIHRyeSBhZ2FpbiBsYXRlciFgKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgb3V0cHV0ID0gZXJyb3JTdHJlYW0gPyBzdGRlcnIgOiBzdGRvdXQ7XG4gICAgbG9nZ2VyLmRlYnVnKGBIYWNrIG91dHB1dCBmb3IgJHthbGxBcmdzfTogJHtvdXRwdXR9YCk7XG4gICAgaWYgKCFvdXRwdXRKc29uKSB7XG4gICAgICByZXNvbHZlKHtyZXN1bHQ6IG91dHB1dCwgaGFja1Jvb3R9KTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIHJlc29sdmUoe3Jlc3VsdDogSlNPTi5wYXJzZShvdXRwdXQpLCBoYWNrUm9vdH0pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYGhoX2NsaWVudCBlcnJvciwgYXJnczogWyR7YXJncy5qb2luKCcsJyl9XVxuc3Rkb3V0OiAke3N0ZG91dH0sIHN0ZGVycjogJHtzdGRlcnJ9YDtcbiAgICAgIGxvZ2dlci5lcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgcmVqZWN0KG5ldyBFcnJvcihlcnJvck1lc3NhZ2UpKTtcbiAgICB9XG4gIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0U2VhcmNoUmVzdWx0cyhcbiAgICBmaWxlUGF0aDogc3RyaW5nLFxuICAgIHNlYXJjaDogc3RyaW5nLFxuICAgIGZpbHRlclR5cGVzPzogP0FycmF5PFNlYXJjaFJlc3VsdFR5cGVWYWx1ZT4sXG4gICAgc2VhcmNoUG9zdGZpeD86IHN0cmluZyxcbiAgKTogUHJvbWlzZTw/SGFja1NlYXJjaFJlc3VsdD4ge1xuICBpZiAoIXNlYXJjaCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLy8gYHBlbmRpbmdTZWFyY2hQcm9taXNlc2AgaXMgdXNlZCB0byB0ZW1wb3JhbGx5IGNhY2hlIHNlYXJjaCByZXN1bHQgcHJvbWlzZXMuXG4gIC8vIFNvLCB3aGVuIGEgbWF0Y2hpbmcgc2VhcmNoIHF1ZXJ5IGlzIGRvbmUgaW4gcGFyYWxsZWwsIGl0IHdpbGwgd2FpdCBhbmQgcmVzb2x2ZVxuICAvLyB3aXRoIHRoZSBvcmlnaW5hbCBzZWFyY2ggY2FsbC5cbiAgbGV0IHNlYXJjaFByb21pc2UgPSBwZW5kaW5nU2VhcmNoUHJvbWlzZXMuZ2V0KHNlYXJjaCk7XG4gIGlmICghc2VhcmNoUHJvbWlzZSkge1xuICAgIHNlYXJjaFByb21pc2UgPSBjYWxsSEhDbGllbnQoXG4gICAgICAgIC8qYXJncyovIFsnLS1zZWFyY2gnICsgKHNlYXJjaFBvc3RmaXggfHwgJycpLCBzZWFyY2hdLFxuICAgICAgICAvKmVycm9yU3RyZWFtKi8gZmFsc2UsXG4gICAgICAgIC8qb3V0cHV0SnNvbiovIHRydWUsXG4gICAgICAgIC8qcHJvY2Vzc0lucHV0Ki8gbnVsbCxcbiAgICAgICAgLypmaWxlKi8gZmlsZVBhdGgsXG4gICAgKTtcbiAgICBwZW5kaW5nU2VhcmNoUHJvbWlzZXMuc2V0KHNlYXJjaCwgc2VhcmNoUHJvbWlzZSk7XG4gIH1cblxuICBsZXQgc2VhcmNoUmVzcG9uc2U6ID97aGFja1Jvb3Q6IHN0cmluZzsgcmVzdWx0OiBBcnJheTxISFNlYXJjaFBvc2l0aW9uPn0gPSBudWxsO1xuICB0cnkge1xuICAgIHNlYXJjaFJlc3BvbnNlID0gKFxuICAgICAgKChhd2FpdCBzZWFyY2hQcm9taXNlKTogYW55KToge2hhY2tSb290OiBzdHJpbmc7IHJlc3VsdDogQXJyYXk8SEhTZWFyY2hQb3NpdGlvbj59XG4gICAgKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfSBmaW5hbGx5IHtcbiAgICBwZW5kaW5nU2VhcmNoUHJvbWlzZXMuZGVsZXRlKHNlYXJjaCk7XG4gIH1cblxuICBpZiAoIXNlYXJjaFJlc3BvbnNlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCB7cmVzdWx0OiBzZWFyY2hSZXN1bHQsIGhhY2tSb290fSA9IHNlYXJjaFJlc3BvbnNlO1xuICBsZXQgcmVzdWx0OiBBcnJheTxIYWNrU2VhcmNoUG9zaXRpb24+ID0gW107XG4gIGZvciAoY29uc3QgZW50cnkgb2Ygc2VhcmNoUmVzdWx0KSB7XG4gICAgY29uc3QgcmVzdWx0RmlsZSA9IGVudHJ5LmZpbGVuYW1lO1xuICAgIGlmICghcmVzdWx0RmlsZS5zdGFydHNXaXRoKGhhY2tSb290KSkge1xuICAgICAgLy8gRmlsdGVyIG91dCBmaWxlcyBvdXQgb2YgcmVwbyByZXN1bHRzLCBlLmcuIGhoIGludGVybmFsIGZpbGVzLlxuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIHJlc3VsdC5wdXNoKHtcbiAgICAgIGxpbmU6IGVudHJ5LmxpbmUgLSAxLFxuICAgICAgY29sdW1uOiBlbnRyeS5jaGFyX3N0YXJ0IC0gMSxcbiAgICAgIG5hbWU6IGVudHJ5Lm5hbWUsXG4gICAgICBwYXRoOiByZXN1bHRGaWxlLFxuICAgICAgbGVuZ3RoOiBlbnRyeS5jaGFyX2VuZCAtIGVudHJ5LmNoYXJfc3RhcnQgKyAxLFxuICAgICAgc2NvcGU6IGVudHJ5LnNjb3BlLFxuICAgICAgYWRkaXRpb25hbEluZm86IGVudHJ5LmRlc2MsXG4gICAgfSk7XG4gIH1cblxuICBpZiAoZmlsdGVyVHlwZXMpIHtcbiAgICByZXN1bHQgPSBmaWx0ZXJTZWFyY2hSZXN1bHRzKHJlc3VsdCwgZmlsdGVyVHlwZXMpO1xuICB9XG4gIHJldHVybiB7aGFja1Jvb3QsIHJlc3VsdH07XG59XG5cbi8vIEV2ZW50dWFsbHkgdGhpcyB3aWxsIGhhcHBlbiBvbiB0aGUgaGFjayBzaWRlLCBidXQgZm9yIG5vdywgdGhpcyB3aWxsIGRvLlxuZnVuY3Rpb24gZmlsdGVyU2VhcmNoUmVzdWx0cyhcbiAgcmVzdWx0czogQXJyYXk8SGFja1NlYXJjaFBvc2l0aW9uPixcbiAgZmlsdGVyOiBBcnJheTxTZWFyY2hSZXN1bHRUeXBlVmFsdWU+LFxuKTogQXJyYXk8SGFja1NlYXJjaFBvc2l0aW9uPiB7XG4gIHJldHVybiByZXN1bHRzLmZpbHRlcihyZXN1bHQgPT4ge1xuICAgIGNvbnN0IGluZm8gPSByZXN1bHQuYWRkaXRpb25hbEluZm87XG4gICAgY29uc3Qgc2VhcmNoVHlwZSA9IGdldFNlYXJjaFR5cGUoaW5mbyk7XG4gICAgcmV0dXJuIGZpbHRlci5pbmRleE9mKHNlYXJjaFR5cGUpICE9PSAtMTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGdldFNlYXJjaFR5cGUoaW5mbzogc3RyaW5nKTogU2VhcmNoUmVzdWx0VHlwZVZhbHVlIHtcbiAgc3dpdGNoIChpbmZvKSB7XG4gICAgY2FzZSAndHlwZWRlZic6XG4gICAgICByZXR1cm4gU2VhcmNoUmVzdWx0VHlwZS5UWVBFREVGO1xuICAgIGNhc2UgJ2Z1bmN0aW9uJzpcbiAgICAgIHJldHVybiBTZWFyY2hSZXN1bHRUeXBlLkZVTkNUSU9OO1xuICAgIGNhc2UgJ2NvbnN0YW50JzpcbiAgICAgIHJldHVybiBTZWFyY2hSZXN1bHRUeXBlLkNPTlNUQU5UO1xuICAgIGNhc2UgJ3RyYWl0JzpcbiAgICAgIHJldHVybiBTZWFyY2hSZXN1bHRUeXBlLlRSQUlUO1xuICAgIGNhc2UgJ2ludGVyZmFjZSc6XG4gICAgICByZXR1cm4gU2VhcmNoUmVzdWx0VHlwZS5JTlRFUkZBQ0U7XG4gICAgY2FzZSAnYWJzdHJhY3QgY2xhc3MnOlxuICAgICAgcmV0dXJuIFNlYXJjaFJlc3VsdFR5cGUuQUJTVFJBQ1RfQ0xBU1M7XG4gICAgZGVmYXVsdDoge1xuICAgICAgaWYgKGluZm8uc3RhcnRzV2l0aCgnbWV0aG9kJykgfHwgaW5mby5zdGFydHNXaXRoKCdzdGF0aWMgbWV0aG9kJykpIHtcbiAgICAgICAgcmV0dXJuIFNlYXJjaFJlc3VsdFR5cGUuTUVUSE9EO1xuICAgICAgfVxuICAgICAgaWYgKGluZm8uc3RhcnRzV2l0aCgnY2xhc3MgdmFyJykgfHwgaW5mby5zdGFydHNXaXRoKCdzdGF0aWMgY2xhc3MgdmFyJykpIHtcbiAgICAgICAgcmV0dXJuIFNlYXJjaFJlc3VsdFR5cGUuQ0xBU1NfVkFSO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFNlYXJjaFJlc3VsdFR5cGUuQ0xBU1M7XG4gICAgfVxuICB9XG59XG4iXX0=