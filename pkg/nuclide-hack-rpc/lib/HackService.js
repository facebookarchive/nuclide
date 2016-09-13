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
    /* args */[],
    /* errorStream */true,
    /* processInput */null,
    /* file */file);
  }, function (result) {
    return result != null;
  }, HH_CLIENT_MAX_TRIES, HH_DIAGNOSTICS_DELAY_MS);
  if (!hhResult) {
    return null;
  }

  var messages = hhResult.errors;

  // Use a consistent null 'falsy' value for the empty string, undefined, etc.
  messages.forEach(function (error) {
    error.message.forEach(function (component) {
      component.path = component.path || null;
    });
  });

  return messages;
});

exports.getDiagnostics = getDiagnostics;

var getCompletions = _asyncToGenerator(function* (file, contents, offset, line, column) {
  if ((0, (_hackConfig4 || _hackConfig3()).getUseIdeConnection)()) {
    (_hackConfig4 || _hackConfig3()).logger.logTrace('Attempting Hack Autocomplete: ' + file + ', ' + line + ', ' + column);
    var service = yield (0, (_HackProcess2 || _HackProcess()).getHackConnectionService)(file);
    if (service == null) {
      return null;
    }

    (_hackConfig4 || _hackConfig3()).logger.logTrace('Got Hack Service');
    // The file notifications are a placeholder until we get
    // full file synchronization implemented.
    yield service.didOpenFile(file);
    try {
      var VERSION_PLACEHOLDER = 1;
      yield service.didChangeFile(file, VERSION_PLACEHOLDER, [{ text: contents }]);
      return yield service.getCompletions(file, { line: line, column: column });
    } finally {
      yield service.didCloseFile(file);
    }
  } else {
    var markedContents = markFileForCompletion(contents, offset);
    var _result = yield (0, (_HackHelpers2 || _HackHelpers()).callHHClient)(
    /* args */['--auto-complete'],
    /* errorStream */false,
    /* processInput */markedContents,
    /* file */file);
    return _result;
  }
});

exports.getCompletions = getCompletions;

var getDefinition = _asyncToGenerator(function* (file, contents, line, column) {
  var result = yield (0, (_HackHelpers2 || _HackHelpers()).callHHClient)(
  /* args */['--ide-get-definition', formatLineColumn(line, column)],
  /* errorStream */false,
  /* processInput */contents,
  /* cwd */file);
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

var getDefinitionById = _asyncToGenerator(function* (file, id) {
  var result = yield (0, (_HackHelpers2 || _HackHelpers()).callHHClient)(
  /* args */['--get-definition-by-id', id],
  /* errorStream */false,
  /* processInput */null,
  /* cwd */file);
  return result;
});

exports.getDefinitionById = getDefinitionById;

var findReferences = _asyncToGenerator(function* (file, contents, line, column) {
  var result = yield (0, (_HackHelpers2 || _HackHelpers()).callHHClient)(
  /* args */['--ide-find-refs', formatLineColumn(line, column)],
  /* errorStream */false,
  /* processInput */contents,
  /* cwd */file);
  return result;
});

exports.findReferences = findReferences;
exports.getHackEnvironmentDetails = getHackEnvironmentDetails;

/**
 * Performs a Hack symbol search in the specified directory.
 */

var queryHack = _asyncToGenerator(function* (rootDirectory, queryString_) {
  var queryString = queryString_;
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
  var result = yield (0, (_HackHelpers2 || _HackHelpers()).callHHClient)(
  /* args */['--colour', filePath],
  /* errorStream */false,
  /* processInput */null,
  /* file */filePath);
  return result;
});

exports.getTypedRegions = getTypedRegions;

var getIdeOutline = _asyncToGenerator(function* (filePath, contents) {
  var result = yield (0, (_HackHelpers2 || _HackHelpers()).callHHClient)(
  /* args */['--ide-outline'],
  /* errorStream */false,
  /* processInput */contents, filePath);
  return result;
});

exports.getIdeOutline = getIdeOutline;

var getTypeAtPos = _asyncToGenerator(function* (filePath, contents, line, column) {
  var result = yield (0, (_HackHelpers2 || _HackHelpers()).callHHClient)(
  /* args */['--type-at-pos', formatLineColumn(line, column)],
  /* errorStream */false,
  /* processInput */contents,
  /* file */filePath);
  return result;
});

exports.getTypeAtPos = getTypeAtPos;

var getSourceHighlights = _asyncToGenerator(function* (filePath, contents, line, column) {
  var result = yield (0, (_HackHelpers2 || _HackHelpers()).callHHClient)(
  /* args */['--ide-highlight-refs', formatLineColumn(line, column)],
  /* errorStream */false,
  /* processInput */contents,
  /* file */filePath);
  return result;
});

exports.getSourceHighlights = getSourceHighlights;

var formatSource = _asyncToGenerator(function* (filePath, contents, startOffset, endOffset) {
  var result = yield (0, (_HackHelpers2 || _HackHelpers()).callHHClient)(
  /* args */['--format', startOffset, endOffset],
  /* errorStream */false,
  /* processInput */contents,
  /* file */filePath);
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
  var hhconfigPath = yield (0, (_hackConfig2 || _hackConfig()).findHackConfigDir)(fileUri);
  return hhconfigPath != null;
});

exports.isFileInHackProject = isFileInHackProject;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

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

var _hackConfig4;

function _hackConfig3() {
  return _hackConfig4 = require('./hack-config');
}

var _HackProcess2;

function _HackProcess() {
  return _HackProcess2 = require('./HackProcess');
}

/**
 * Each error or warning can consist of any number of different messages from
 * Flow to help explain the problem and point to different locations that may be
 * of interest.
 */

// Note that all line/column values are 1-based.

var HH_DIAGNOSTICS_DELAY_MS = 600;
var HH_CLIENT_MAX_TRIES = 10;

function getHackEnvironmentDetails(localFile, hackCommand, useIdeConnection, logLevel) {
  (0, (_hackConfig2 || _hackConfig()).setHackCommand)(hackCommand);
  (0, (_hackConfig2 || _hackConfig()).setUseIdeConnection)(useIdeConnection);
  (_hackConfig4 || _hackConfig3()).logger.setLogLevel(logLevel);
  return (0, (_hackConfig2 || _hackConfig()).getHackExecOptions)(localFile);
}

function formatLineColumn(line, column) {
  return line + ':' + column;
}

// Calculate the offset of the cursor from the beginning of the file.
// Then insert AUTO332 in at this offset. (Hack uses this as a marker.)
function markFileForCompletion(contents, offset) {
  return contents.substring(0, offset) + 'AUTO332' + contents.substring(offset, contents.length);
}