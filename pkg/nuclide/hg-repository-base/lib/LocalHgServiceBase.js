'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
/* @providesModule LocalHgServiceBase */

var {EventEmitter} = require('events');
var HgService = require('./HgService');
var {HgStatusOption} = require('./hg-constants');
var {parseHgDiffUnifiedOutput} = require('./hg-output-helpers');
var {fetchCommonAncestorOfHeadAndRevision,
    fetchRevisionNumbersBetweenRevisions} = require('./hg-revision-expression-helpers');
var {fetchFileContentAtRevision, fetchFilesChangedAtRevision} = require('./hg-revision-state-helpers');
var {asyncExecute} = require('nuclide-commons');
var path = require('path');

import type LocalHgServiceOptions from './hg-types';

class LocalHgServiceBase extends HgService {
  constructor(options: LocalHgServiceOptions) {
    super();
    this._emitter = new EventEmitter();
    this._workingDirectory = options.workingDirectory;
  }

  destroy() {
    this._emitter.removeAllListeners();
    this._emitter = null;
  }

  getWorkingDirectory(): string {
    return this._workingDirectory;
  }

  /**
   * See HgService::fetchStatuses for details.
   */
  async fetchStatuses(filePaths: Array<string>, options: ?any): Promise<{[key: string]: StatusCodeId}> {
    var statusMap = {};

    var args = ['status', '-Tjson'];
    if (options && ('hgStatusOption' in options)) {
      if (options.hgStatusOption === HgStatusOption.ONLY_IGNORED) {
        args.push('--ignored');
      } else if (options.hgStatusOption === HgStatusOption.ALL_STATUSES) {
        args.push('--all');
      }
    }
    args = args.concat(filePaths);
    var execOptions = {
      cwd: this.getWorkingDirectory(),
    };
    try {
      var output = await this._hgAsyncExecute(args, execOptions);
    } catch (e) {
      return statusMap;
    }

    var statuses = JSON.parse(output.stdout);
    statuses.forEach((status) => {
      statusMap[this._absolutize(status.path)] = status.status;
    });
    return statusMap;
  }

  // Mercurial returns all paths relative to the repository's working directory.
  // This method transforms a path relative to the working direcotry into an
  // absolute path.
  _absolutize(pathRelativeToWorkingDirectory: string): string {
    return path.join(this._workingDirectory, pathRelativeToWorkingDirectory);
  }

  /**
   * See HgService::onFilesDidChange for details.
   */
  onFilesDidChange(callback: (changedFilePaths: Array<string>) => void): Disposable {
    this._emitter.on('files-changed', callback);
    return {
      dispose: () => {
        this._removeOnFilesDidChangeListener(callback);
      }
    };
  }

  /**
   * Removes a listener that was registered on ::onFilesDidChange.
   * Note: Does not fire on changes to .hgignore files. Use ::onHgIgnoreFileDidChange
   * if you need to observe changes on these types of files.
   */
  _removeOnFilesDidChangeListener(callback: (changedFilePaths: Array<string>) => void): void {
    this._emitter.removeListener('files-changed', callback);
  }

  /**
   * See HgService::onHgIgnoreFileDidChange for details.
   */
  onHgIgnoreFileDidChange(callback: () => void): Disposable {
    this._emitter.on('hg-ignore-changed', callback);
    return {
      dispose: () => {
        this._removeOnHgIgnoreFileDidChangeListener(callback);
      }
    };
  }

  /**
   * Removes a listener that was registered on ::onHgIgnoreFileDidChange.
   */
  _removeOnHgIgnoreFileDidChangeListener(callback: () => void): void {
    this._emitter.removeListener('hg-ignore-changed', callback);
  }

  /**
   * See HgService::onHgRepoStateDidChange for details.
   */
  onHgRepoStateDidChange(callback: () => void): Disposable {
    this._emitter.on('hg-repo-state-changed', callback);
    return {
      dispose: () => {
        this._removeOnHgRepoStateDidChangeListener(callback);
      }
    };
  }

  /**
   * Removes a listener that was registered on ::onHgRepoStateDidChange.
   */
  _removeOnHgRepoStateDidChangeListener(callback: () => void): void {
    this._emitter.removeListener('hg-repo-state-changed', callback);
  }

  /**
   * See HgService::fetchDiffInfo for details.
   */
  async fetchDiffInfo(filePath: string): Promise<?DiffInfo> {
    var args = ['diff', '--unified', '0', filePath];
    var options = {
      cwd: this.getWorkingDirectory(),
    };
    try {
      var output = await this._hgAsyncExecute(args, options);
    } catch (e) {
      return null;
    }
    return parseHgDiffUnifiedOutput(output.stdout);
  }

  /**
   * Calls out to asyncExecute using the 'hg' command.
   */
  _hgAsyncExecute(args: Array<string>, options: any): Promise<any> {
    // Setting HGPLAIN=1 overrides any custom aliases a user has defined.
    if (options.env) {
      options.env['HGPLAIN'] = 1;
    } else {
      var {assign} = require('nuclide-commons').object;
      var env = {'HGPLAIN': 1};
      assign(env, process.env);
      options.env = env;
    }
    return asyncExecute('hg', args, options);
  }

  fetchCurrentBookmark(): Promise<string> {
    var {fetchCurrentBookmark} = require('./hg-bookmark-helpers');
    return fetchCurrentBookmark(path.join(this._workingDirectory, '.hg'));
  }

  /**
   * See HgService::onHgBookmarkDidChange for details.
   */
  onHgBookmarkDidChange(callback: () => void): Disposable {
    this._emitter.on('hg-bookmark-changed', callback);
    return {
      dispose: this._removeOnHgBookmarkDidChangeListener.bind(this, callback),
    };
  }

  _removeOnHgBookmarkDidChangeListener(callback: () => void): void {
    this._emitter.removeListener('hg-bookmark-changed', callback);
  }


  /**
   * Section: Repository State at Specific Revisions
   */

  fetchFileContentAtRevision(filePath: NuclideUri, revision: string): Promise<?string> {
    return fetchFileContentAtRevision(filePath, revision, this._workingDirectory);
  }

  fetchFilesChangedAtRevision(revision: string): Promise<?RevisionFileChanges> {
    return fetchFilesChangedAtRevision(revision, this._workingDirectory);
  }

  fetchCommonAncestorOfHeadAndRevision(revision: string): Promise<string> {
    return fetchCommonAncestorOfHeadAndRevision(revision, this._workingDirectory);
  }

  fetchRevisionNumbersBetweenRevisions(revisionFrom: string, revisionTo: string): Promise<Array<string>> {
    return fetchRevisionNumbersBetweenRevisions(revisionFrom, revisionTo, this._workingDirectory);
  }

}


module.exports = LocalHgServiceBase;
