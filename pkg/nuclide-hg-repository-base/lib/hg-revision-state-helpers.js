

/**
 * @param filePath An absolute path to a file.
 * @param revision A string representation of the revision desired. See
 * Mercurial documentation for ways to specify a revision.
 * @param The working directory (aka root directory) of the Hg repository.
 * @return The content of the filePath at the given revision. Returns null
 * if the operation fails for whatever reason, including invalid input (e.g. if
 * you pass a filePath that does not exist at the given revision).
 */

var fetchFileContentAtRevision = _asyncToGenerator(function* (filePath, revision, workingDirectory) {
  var args = ['cat', filePath];
  if (revision) {
    args.splice(1, 0, '--rev', revision);
  }
  var execOptions = {
    cwd: workingDirectory
  };

  var _ref = yield (0, (_hgUtils2 || _hgUtils()).hgAsyncExecute)(args, execOptions);

  var contents = _ref.stdout;

  return contents;
}

/**
 * @param revision A string representation of the revision desired. See
 * Mercurial documentation for ways to specify a revision.
 * @return The content of the filePath at the given revision. Returns null
 * if the operation fails for whatever reason, including invalid input (e.g. if
 * you pass an invalid revision).
 */
);

var fetchFilesChangedAtRevision = _asyncToGenerator(function* (revision, workingDirectory) {
  var args = ['log', '--template', REVISION_FILE_CHANGES_TEMPLATE, '--rev', revision, '--limit', '1'];
  var execOptions = {
    cwd: workingDirectory
  };

  var _ref2 = yield (0, (_hgUtils2 || _hgUtils()).hgAsyncExecute)(args, execOptions);

  var stdout = _ref2.stdout;

  if (!stdout) {
    return null;
  }
  return parseRevisionFileChangeOutput(stdout, workingDirectory);
}

/**
 * @param output Raw output string from 'hg log' call in `fetchFilesChangedAtRevision`.
 * @param workingDirectory The absolute path to the working directory of the hg repository.
 * @return A RevisionFileChanges object where the paths are all absolute paths.
 */
);

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _hgUtils2;

function _hgUtils() {
  return _hgUtils2 = require('./hg-utils');
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var ALL_FILES_LABEL = 'files:';
var FILE_ADDS_LABEL = 'file-adds:';
var FILE_DELETES_LABEL = 'file-dels:';
var FILE_COPIES_LABEL = 'file-copies:';
var FILE_MODS_LABEL = 'file-mods:';
var REVISION_FILE_CHANGES_TEMPLATE = ALL_FILES_LABEL + ' {files}\n' + FILE_ADDS_LABEL + ' {file_adds}\n' + FILE_DELETES_LABEL + ' {file_dels}\n' + FILE_COPIES_LABEL + ' {file_copies}\n' + FILE_MODS_LABEL + ' {file_mods}';
// Regex for: "new_file (previous_file", with two capture groups, one for each file.
var COPIED_FILE_PAIR_REGEX = /(.+) \((.+)/;function parseRevisionFileChangeOutput(output, workingDirectory) {
  var lines = output.trim().split('\n');
  var allFiles = lines[0].slice(ALL_FILES_LABEL.length + 1).trim();
  allFiles = allFiles.length ? allFiles.split(' ') : [];
  allFiles = absolutizeAll(allFiles, workingDirectory);

  var addedFiles = lines[1].slice(FILE_ADDS_LABEL.length + 1).trim();
  addedFiles = addedFiles.length ? addedFiles.split(' ') : [];
  addedFiles = absolutizeAll(addedFiles, workingDirectory);

  var deletedFiles = lines[2].slice(FILE_DELETES_LABEL.length + 1).trim();
  deletedFiles = deletedFiles.length ? deletedFiles.split(' ') : [];
  deletedFiles = absolutizeAll(deletedFiles, workingDirectory);

  // Copied files are in the form: new_file (previous_file)new_file2 (previous_file2)[...]
  // There is no space between entries.
  var copiedFiles = lines[3].slice(FILE_COPIES_LABEL.length + 1).trim();
  copiedFiles = copiedFiles.length ? copiedFiles.split(')') : [];
  // We expect the string to end with a ')', so the last entry in copiedFiles will
  // be an empty string. Remove this.
  copiedFiles.pop();
  // Parse the lines, now in the form: new_file (previous_file)
  copiedFiles = copiedFiles.map(function (filePathPair) {
    var fileNameMatches = filePathPair.match(COPIED_FILE_PAIR_REGEX);
    (0, (_assert2 || _assert()).default)(fileNameMatches);
    return {
      from: absolutize(fileNameMatches[2], workingDirectory),
      to: absolutize(fileNameMatches[1], workingDirectory)
    };
  });

  var modifiedFiles = lines[4].slice(FILE_MODS_LABEL.length + 1).trim();
  modifiedFiles = modifiedFiles.length ? modifiedFiles.split(' ') : [];
  modifiedFiles = absolutizeAll(modifiedFiles, workingDirectory);

  return {
    all: allFiles,
    added: addedFiles,
    deleted: deletedFiles,
    copied: copiedFiles,
    modified: modifiedFiles
  };
}

function absolutize(filePath, workingDirectory) {
  return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(workingDirectory, filePath);
}

function absolutizeAll(filePaths, workingDirectory) {
  return filePaths.map(function (filePath) {
    return absolutize(filePath, workingDirectory);
  });
}

module.exports = {
  fetchFileContentAtRevision: fetchFileContentAtRevision,
  fetchFilesChangedAtRevision: fetchFilesChangedAtRevision,
  parseRevisionFileChangeOutput: parseRevisionFileChangeOutput };
// exposed for testing