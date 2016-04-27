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