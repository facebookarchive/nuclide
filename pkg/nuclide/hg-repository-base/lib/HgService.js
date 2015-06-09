'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// TODO (jessicalin) Import these types from hg-constants.js when types can
// be exported.
type StatusCodeId = string;

type LineDiff = {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
};

type DiffInfo = {
  added: number;
  deleted: number;
  lineDiffs: Array<LineDiff>;
};


/**
 * HgService:
 *   * Provides an API to allow clients to fetch data from hg.
 *   * Provides an API to allow clients to register for updates about
 *     when files in the hg repository have changed. Listeners can use these
 *     updates to figure out if they need to ask the HgService for new
 *     information.
 */
class HgService {

  /**
   * Section: File and Repository Status
   */

  /**
   * Shells out of the `hg status` to get the statuses of the paths. All paths
   * are presumed to be within the repo. (If any single path is not within the repo,
   * this method will return an empty object.)
   * @param options An Object with the following fields:
   *   * `hgStatusOption`: an HgStatusOption
   */
  fetchStatuses(filePaths: Array<NuclideUri>, options: ?any): Promise<{[key: NuclideUri]: StatusCodeId}> {
    return Promise.reject(new Error('not implemented'));
  }

  /**
   * Allows the client to register a callback from the service when the service
   * observes that one of more files has changed. Applies to all files except
   * .hgignore files. (See ::onHgIgnoreFileDidChange.)
   * @return A Disposable on which you can call `dispose` to remove the callback.
   */
  onFilesDidChange(callback: (changedPaths: Array<NuclideUri>) => void): Disposable {
    throw new Error('not implemented');
  }

  /**
   * Allows the client to register a callback from the service when the service
   * observes that a .hgignore file has changed.
   * @return A Disposable on which you can call `dispose` to remove the callback.
   */
  onHgIgnoreFileDidChange(callback: () => void): Disposable {
    throw new Error('not implemented');
  }

  /**
   * Allows the client to register a callback from the service when the service
   * observes that a Mercurial event has occurred (e.g. histedit) that would
   * potentially invalidate any data cached from responses from this service.
   */
  onHgRepoStateDidChange(callback: () => void): Disposable {
    throw new Error('not implemented');
  }

  /**
   * Shells out to `hg diff` to retrieve line diff information for the path.
   * The path is presumed to be in the repo. If the `hg diff` call fails, this
   * method returns null.
   */
  fetchDiffInfo(filePath: NuclideUri): Promise<?DiffInfo> {
    return Promise.reject(new Error('not implemented'));
  }

  /**
   * Section: Bookmarks
   */

  /**
   * @return The name of the current bookmark.
   */
  fetchCurrentBookmark(): Promise<string> {
    return Promise.reject(new Error('not implemented'));
  }

  /**
   * Allows the client to register a callback from the service when the service
   * observes that the Mercurial bookmark has changed.
   */
  onHgBookmarkDidChange(callback: () => void): Disposable {
    throw new Error('not implemented');
  }

  /**
   * Section: Repository State at Specific Revisions
   */

  /**
   * @param filePath: The full path to the file of interest.
   * @param revision: An expression that hg can understand, specifying the
   * revision at which we want to see the file content.
   */
  fetchFileContentAtRevision(filePath: NuclideUri, revision: string): Promise<?string> {
    return Promise.reject(new Error('not implemented'));
  }

  fetchFilesChangedAtRevision(revision: string): Promise<?RevisionFileChanges> {
    return Promise.reject(new Error('not implemented'));
  }

  /**
   * @param revision The revision expression of a revision of interest. Note:
   * this can be the name of a bookmark, such as 'master'.
   * @return An expression for the common ancestor of the revision of interest and
   * the current Hg head.
   */
  fetchCommonAncestorOfHeadAndRevision(revision: string): Promise<string> {
    return Promise.reject(new Error('not implemented'));
  }

  /**
   * @param revisionFrom The revision expression of the "start" (older) revision.
   * @param revisionTo The revision expression of the "end" (newer) revision.
   * @return An array of revision numbers that are between revisionFrom and
   *   revisionTo, plus revisionFrom and revisionTo; and the values
   *   are all 'true'. "Between" means that revisionFrom is an ancestor of, and
   *   revisionTo is a descendant of.
   */
  fetchRevisionNumbersBetweenRevisions(revisionFrom: string, revisionTo: string): Promise<Array<string>> {
    return Promise.reject(new Error('not implemented'));
  }

}

module.exports = HgService;
