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

var getDiagnostics = _asyncToGenerator(function* (file, currentContents) {
  var hhResult = yield (0, (_commonsNodePromise2 || _commonsNodePromise()).retryLimit)(function () {
    return (0, (_HackHelpers2 || _HackHelpers()).callHHClient)(
    /*args*/[],
    /*errorStream*/true,
    /*outputJson*/true,
    /*processInput*/null,
    /*file*/file);
  }, function (result) {
    return result != null;
  }, HH_CLIENT_MAX_TRIES, HH_DIAGNOSTICS_DELAY_MS);
  if (!hhResult) {
    return null;
  }
  var hackRoot = hhResult.hackRoot;
  var result = hhResult.result;

  var messages = result.errors;

  // Use a consistent null 'falsy' value for the empty string, undefined, etc.
  messages.forEach(function (error) {
    error.message.forEach(function (component) {
      component.path = component.path || null;
    });
  });

  return {
    hackRoot: hackRoot,
    messages: messages
  };
});

exports.getDiagnostics = getDiagnostics;

var getCompletions = _asyncToGenerator(function* (file, markedContents) {
  var hhResult = yield (0, (_HackHelpers2 || _HackHelpers()).callHHClient)(
  /*args*/['--auto-complete'],
  /*errorStream*/false,
  /*outputJson*/true,
  /*processInput*/markedContents,
  /*file*/file);
  if (!hhResult) {
    return null;
  }
  var hackRoot = hhResult.hackRoot;
  var result = hhResult.result;

  var completions = result;
  return {
    hackRoot: hackRoot,
    completions: completions
  };
});

exports.getCompletions = getCompletions;

var getDefinition = _asyncToGenerator(function* (file, contents, line, column) {
  var hhResult = yield (0, (_HackHelpers2 || _HackHelpers()).callHHClient)(
  /*args*/['--ide-get-definition', formatLineColumn(line, column)],
  /*errorStream*/false,
  /*outputJson*/true,
  /*processInput*/contents,
  /*cwd*/file);
  if (hhResult == null) {
    return [];
  }

  // Results in the current file, have filename set to empty string.
  var result = hhResult.result;
  if (result == null) {
    return [];
  }

  function fixupDefinition(definition) {
    if (definition.definition_pos != null && definition.definition_pos.filename === '') {
      definition.definition_pos.filename = file;
    }
    if (definition.pos.filename === '') {
      definition.pos.filename = file;
    }
  }
  if (Array.isArray(result)) {
    result.forEach(fixupDefinition);
    return result;
  } else {
    fixupDefinition(result);
    return [result];
  }
});

exports.getDefinition = getDefinition;

var findReferences = _asyncToGenerator(function* (file, contents, line, column) {
  var hhResult = yield (0, (_HackHelpers2 || _HackHelpers()).callHHClient)(
  /*args*/['--ide-find-refs', formatLineColumn(line, column)],
  /*errorStream*/false,
  /*outputJson*/true,
  /*processInput*/contents,
  /*cwd*/file);
  if (hhResult == null) {
    return null;
  }

  var references = hhResult.result;
  if (references == null) {
    return null;
  }
  return {
    hackRoot: hhResult.hackRoot,
    references: references
  };
});

exports.findReferences = findReferences;
exports.getHackEnvironmentDetails = getHackEnvironmentDetails;

/**
 * Performs a Hack symbol search in the specified directory.
 */

var queryHack = _asyncToGenerator(function* (rootDirectory, queryString) {
  var searchPostfix = undefined;
  switch (queryString[0]) {
    case '@':
      searchPostfix = '-function';
      queryString = queryString.substring(1);
      break;
    case '#':
      searchPostfix = '-class';
      queryString = queryString.substring(1);
      break;
    case '%':
      searchPostfix = '-constant';
      queryString = queryString.substring(1);
      break;
  }
  var searchResponse = yield (0, (_HackHelpers2 || _HackHelpers()).getSearchResults)(rootDirectory, queryString,
  /* filterTypes */null, searchPostfix);
  if (searchResponse == null) {
    return [];
  } else {
    return searchResponse.result;
  }
});

exports.queryHack = queryHack;

var getTypedRegions = _asyncToGenerator(function* (filePath) {
  var hhResult = yield (0, (_HackHelpers2 || _HackHelpers()).callHHClient)(
  /*args*/['--colour', filePath],
  /*errorStream*/false,
  /*outputJson*/true,
  /*processInput*/null,
  /*file*/filePath);
  if (!hhResult) {
    return null;
  }
  var result = hhResult.result;

  return result;
});

exports.getTypedRegions = getTypedRegions;

var getIdeOutline = _asyncToGenerator(function* (filePath, contents) {
  var hhResult = yield (0, (_HackHelpers2 || _HackHelpers()).callHHClient)(
  /*args*/['--ide-outline'],
  /*errorStream*/false,
  /*outputJson*/true,
  /*processInput*/contents, filePath);
  if (hhResult == null) {
    return null;
  }
  return hhResult.result;
});

exports.getIdeOutline = getIdeOutline;

var getTypeAtPos = _asyncToGenerator(function* (filePath, contents, line, column) {
  var hhResult = yield (0, (_HackHelpers2 || _HackHelpers()).callHHClient)(
  /*args*/['--type-at-pos', formatLineColumn(line, column)],
  /*errorStream*/false,
  /*outputJson*/true,
  /*processInput*/contents,
  /*file*/filePath);
  if (!hhResult) {
    return null;
  }
  var result = hhResult.result;

  return result;
});

exports.getTypeAtPos = getTypeAtPos;

var getSourceHighlights = _asyncToGenerator(function* (filePath, contents, line, column) {
  var hhResult = yield (0, (_HackHelpers2 || _HackHelpers()).callHHClient)(
  /*args*/['--find-lvar-refs', formatLineColumn(line, column)],
  /*errorStream*/false,
  /*outputJson*/true,
  /*processInput*/contents,
  /*file*/filePath);
  if (!hhResult) {
    return null;
  }
  var result = hhResult.result;

  return result;
});

exports.getSourceHighlights = getSourceHighlights;

var formatSource = _asyncToGenerator(function* (filePath, contents, startOffset, endOffset) {
  var hhResult = yield (0, (_HackHelpers2 || _HackHelpers()).callHHClient)(
  /*args*/['--format', startOffset, endOffset],
  /*errorStream*/false,
  /*outputJson*/true,
  /*processInput*/contents,
  /*file*/filePath);
  if (!hhResult) {
    return null;
  }
  var result = hhResult.result;

  return result;
}

/**
 * @return whether this service can perform Hack symbol queries on the
 *   specified directory. Not all directories on a host correspond to
 *   repositories that contain Hack code.
 */
);

exports.formatSource = formatSource;

var isAvailableForDirectoryHack = _asyncToGenerator(function* (rootDirectory) {
  var hackOptions = yield (0, (_hackConfig2 || _hackConfig()).getHackExecOptions)(rootDirectory);
  return hackOptions != null;
}

/**
 * @param fileUri a file path.  It cannot be a directory.
 * @return whether the file represented by fileUri is inside of a Hack project.
 */
);

exports.isAvailableForDirectoryHack = isAvailableForDirectoryHack;

var isFileInHackProject = _asyncToGenerator(function* (fileUri) {
  var filePath = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.getPath(fileUri);
  var hhconfigPath = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.findNearestFile('.hhconfig', (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.dirname(filePath));
  return hhconfigPath != null;
});

exports.isFileInHackProject = isFileInHackProject;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsNodeFsPromise2;

function _commonsNodeFsPromise() {
  return _commonsNodeFsPromise2 = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _commonsNodePromise2;

function _commonsNodePromise() {
  return _commonsNodePromise2 = require('../../commons-node/promise');
}

var _HackHelpers2;

function _HackHelpers() {
  return _HackHelpers2 = require('./HackHelpers');
}

var _hackConfig2;

function _hackConfig() {
  return _hackConfig2 = require('./hack-config');
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _hackConfig4;

function _hackConfig3() {
  return _hackConfig4 = require('./hack-config');
}

/**
 * Each error or warning can consist of any number of different messages from
 * Flow to help explain the problem and point to different locations that may be
 * of interest.
 */

// Note that all line/column values are 1-based.

// Note that all line/column values are 1-based.

var HH_DIAGNOSTICS_DELAY_MS = 600;
var HH_CLIENT_MAX_TRIES = 10;

function getHackEnvironmentDetails(localFile, hackCommand, useIdeConnection, logLevel) {
  (0, (_hackConfig2 || _hackConfig()).setHackCommand)(hackCommand);
  (0, (_hackConfig2 || _hackConfig()).setUseIde)(useIdeConnection);
  (_hackConfig4 || _hackConfig3()).logger.setLogLevel(logLevel);
  return (0, (_hackConfig2 || _hackConfig()).getHackExecOptions)(localFile);
}

function formatLineColumn(line, column) {
  return line + ':' + column;
}

// The location of the .hhconfig where these messages came from.