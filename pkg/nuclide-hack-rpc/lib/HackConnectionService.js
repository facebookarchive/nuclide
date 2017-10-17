'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.didOpenFile = didOpenFile;
exports.didChangeFile = didChangeFile;
exports.didCloseFile = didCloseFile;
exports.didChangeWatchedFiles = didChangeWatchedFiles;
exports.getCompletions = getCompletions;
exports.notifyDiagnostics = notifyDiagnostics;
exports.disconnect = disconnect;


// Inidicates that the file has been opened by the IDE.
// Hack should get its source of truth for the file from
// didChangeFile notifications until didCloseFile is seen.


// end is exclusive, so start == end implies a 0 length range.
// end must be >= start.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

function didOpenFile(filename, version, contents) {
  throw new Error('RPC stub');
}

// The version number corresponds to the contents of the file after
// all changes have been applied.


// Indicates that the text at range in the file has been
// replaced by text. If range is null, then the new file contents
// is set to text.
// inserts are represented as ranges with start == end.


// Note that all line/column values are 1-based.
function didChangeFile(filename, version, changes) {
  throw new Error('RPC stub');
}

// Indicates that the file has been closed by the IDE.
// Hack should get its source of truth for the file from the file system.
function didCloseFile(filename) {
  throw new Error('RPC stub');
}

// Created indicates that a new file has been added to the Hack project.
//
// Changed indicates that the IDE has noticed that a non-open file has
// been modified. It is provided to Hack purely for informational purposes.
//
// Deleted means a file has been deleted.
//
// Saved indicates that the IDE has saved a file. This is purely informational
// as Hack should get the source of truth from didChangeFile.


// Indicates that the set of files in the Hack project has changed.
// Subsequent requests should not complete successfully until Hack
// accounts for the indicated change.
function didChangeWatchedFiles(changes) {
  throw new Error('RPC stub');
}

function getCompletions(filename, position) {
  throw new Error('RPC stub');
}

function notifyDiagnostics() {
  throw new Error('RPC stub');
}

// Gracefully terminates the connection.
function disconnect() {
  throw new Error('RPC stub');
}