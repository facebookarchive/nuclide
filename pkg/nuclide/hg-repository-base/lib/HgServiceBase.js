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

var {HgStatusOption} = require('./hg-constants');
var {Observable, Subject} = require('rx');
var {parseHgBlameOutput, parseHgDiffUnifiedOutput} = require('./hg-output-helpers');
import {
  fetchCommonAncestorOfHeadAndRevision,
  expressionForRevisionsBeforeHead,
  fetchRevisionInfoBetweenRevisions,
} from './hg-revision-expression-helpers';
var {fetchFileContentAtRevision,
    fetchFilesChangedAtRevision} = require('./hg-revision-state-helpers');
var {asyncExecute, createArgsForScriptCommand} = require('nuclide-commons');
var path = require('path');

import type {DiffInfo, RevisionFileChanges, StatusCodeIdValue, RevisionInfo} from './hg-constants';
import type {NuclideUri} from 'nuclide-remote-uri';

const FORK_BASE_BOOKMARK_NAME = 'remote/master';

var logger;
function getLogger() {
  if (!logger) {
    logger = require('nuclide-logging').getLogger();
  }
  return logger;
}

class HgServiceBase {
  _workingDirectory: string;
  _filesDidChangeObserver: Subject;
  _hgIgnoreFileDidChangeObserver: Subject;
  _hgRepoStateDidChangeObserver: Subject;
  _hgBookmarkDidChangeObserver: Subject;

  constructor(workingDirectory: string) {
    this._workingDirectory = workingDirectory;
    this._filesDidChangeObserver = new Subject();
    this._hgIgnoreFileDidChangeObserver = new Subject();
    this._hgRepoStateDidChangeObserver = new Subject();
    this._hgBookmarkDidChangeObserver = new Subject();
  }

  async dispose(): Promise<void> {
    this._filesDidChangeObserver.onCompleted();
    this._hgIgnoreFileDidChangeObserver.onCompleted();
    this._hgRepoStateDidChangeObserver.onCompleted();
    this._hgBookmarkDidChangeObserver.onCompleted();
  }

  getWorkingDirectory(): string {
    return this._workingDirectory;
  }

  /**
   * See HgService::fetchStatuses for details.
   */
  async fetchStatuses(
    filePaths: Array<string>,
    options: ?any
  ): Promise<Map<string, StatusCodeIdValue>> {
    var statusMap = new Map();

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
      statusMap.set(this._absolutize(status.path), status.status);
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
   * See HgService.def::observeFilesDidChange for details.
   */
  observeFilesDidChange(): Observable<Array<NuclideUri>> {
    return this._filesDidChangeObserver;
  }

  /**
   * See HgService.def::observeHgIgnoreFileDidChange for details.
   */
  observeHgIgnoreFileDidChange(): Observable<void> {
    return this._hgIgnoreFileDidChangeObserver;
  }

  /**
   * See HgService.def::observeHgRepoStateDidChange for details.
   */
  observeHgRepoStateDidChange(): Observable<void> {
    return this._hgRepoStateDidChangeObserver;
  }

  /**
   * See HgService.def::fetchDiffInfo for details.
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
   * @param options as specified by http://nodejs.org/api/child_process.html. Additional options:
   *   - NO_HGPLAIN set if the $HGPLAIN environment variable should not be used.
   *   - TTY_OUTPUT set if the command should be run as if it were attached to a tty.
   */
  _hgAsyncExecute(args: Array<string>, options: any): Promise<any> {
    if (!options['NO_HGPLAIN']) {
      // Setting HGPLAIN=1 overrides any custom aliases a user has defined.
      if (options.env) {
        options.env['HGPLAIN'] = 1;
      } else {
        var {assign} = require('nuclide-commons').object;
        var env = {'HGPLAIN': 1};
        assign(env, process.env);
        options.env = env;
      }
    }

    var cmd;
    if (options['TTY_OUTPUT']) {
      cmd = 'script';
      args = createArgsForScriptCommand('hg', args);
    } else {
      cmd = 'hg';
    }
    return asyncExecute(cmd, args, options);
  }

  fetchCurrentBookmark(): Promise<string> {
    var {fetchCurrentBookmark} = require('./hg-bookmark-helpers');
    return fetchCurrentBookmark(path.join(this._workingDirectory, '.hg'));
  }

  /**
   * See HgService:.def:observeHgBookmarkDidChange for details.
   */
  observeHgBookmarkDidChange(): Observable<void> {
    return this._hgBookmarkDidChangeObserver;
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

  async fetchRevisionInfoBetweenHeadAndBase(): Promise<?Array<RevisionInfo>> {
    const commonAncestorRevision = await fetchCommonAncestorOfHeadAndRevision(
      // TODO(most): Better way to specify the fork/base that works with `fbsource`
      // and other mercurial configurations. t8769378
      FORK_BASE_BOOKMARK_NAME,
      this._workingDirectory,
    );
    if (!commonAncestorRevision) {
      return null;
    }
    const revisionsInfo = await fetchRevisionInfoBetweenRevisions(
      commonAncestorRevision,
      expressionForRevisionsBeforeHead(0),
      this._workingDirectory,
    );
    return revisionsInfo;
  }

  async getBlameAtHead(filePath: NuclideUri): Promise<Map<string, string>> {
    var args =
      ['blame', '-r', 'wdir()', '-Tjson', '--changeset', '--user', '--line-number', filePath];
    var execOptions = {
      cwd: this.getWorkingDirectory(),
    };
    var output;
    try {
      output = await this._hgAsyncExecute(args, execOptions);
    } catch (e) {
      getLogger().error(
          `LocalHgServiceBase failed to fetch blame for file: ${filePath}. Error: ${e.stderr}`);
      return new Map();
    }
    return parseHgBlameOutput(output.stdout);
  }

  /**
   * This implementation relies on the "phabdiff" template being available as defined in:
   * https://bitbucket.org/facebook/hg-experimental/src/fbf23b3f96bade5986121a7c57d7400585d75f54/phabdiff.py.
   */
  async getDifferentialRevisionForChangeSetId(changeSetId: string): Promise<?string> {
    var args = ['log', '-T', '{phabdiff}\n', '--limit', '1', '--rev', changeSetId];
    var execOptions = {
      cwd: this.getWorkingDirectory(),
    };
    try {
      var output = await this._hgAsyncExecute(args, execOptions);
      var stdout = output.stdout.trim();
      return stdout ? stdout : null;
    } catch (e) {
      // This should not happen: `hg log` does not error even if it does not recognize the template.
      getLogger().error(`Failed when trying to get differential revision for: ${changeSetId}`);
      return null;
    }
  }

  async getSmartlog(ttyOutput: boolean, concise: boolean): Promise<string> {
    // disable the pager extension so that 'hg sl' terminates. We can't just use
    // HGPLAIN because we have not found a way to get colored output when we do.
    var args = ['--config', 'extensions.pager=!', concise ? 'sl' : 'smartlog'];
    var execOptions = {
      cwd: this.getWorkingDirectory(),
      NO_HGPLAIN: concise, // `hg sl` is likely user-defined.
      TTY_OUTPUT: ttyOutput,
    };
    return await this._hgAsyncExecute(args, execOptions);
  }

  async checkout(revision: string, create: boolean): Promise<boolean> {
    var options = {
      cwd: this.getWorkingDirectory(),
    };
    try {
      await this._hgAsyncExecute(['checkout', revision], options);
    } catch (e) {
      return false;
    }
    return true;
  }
}


module.exports = HgServiceBase;
