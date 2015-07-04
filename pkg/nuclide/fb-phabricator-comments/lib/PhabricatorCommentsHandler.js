'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

type PhabricatorComment = {
  author: string;
  createdAt: number;
  content: string;
  lineNumber: number;
  revisionId: number;
};

class PhabricatorCommentsHandler {
  constructor(filePath: NuclideUri) {
    PhabricatorCommentsHandler._asyncExecute = PhabricatorCommentsHandler._asyncExecute || require('nuclide-commons').asyncExecute;
    this._filePath = filePath;
    var directories = atom.project.getDirectories();
    for (var i = 0; i < directories.length; i++) {
      var dir = directories[i];
      if (dir.contains(filePath)) {
        this._directory = dir;
        break;
      }
    }
    this._directoryPath = this._directory.getPath();
  }

  async _asyncCallConduit(inputObject: Object, conduitCall: string): Promise<any> {
    var options = {
      encoding: 'utf8',
      cwd: this._directoryPath,
      pipedCommand: 'arc',
      pipedArgs: [
        'call-conduit',
        conduitCall,
      ],
    };
    var args = [
      JSON.stringify(inputObject),
    ];
    var result = await PhabricatorCommentsHandler._asyncExecute('echo', args, options);
    return JSON.parse(result.stdout).response;
  }

  /**
   * @return Revision ID parsed from commit message, or -1 if not found.
   */
  async _getRevisionIdFromCurrentCommit(): Promise<number> {
    var repository = await atom.project.repositoryForDirectory(this._directory);
    if (!repository) {
      throw new Error('No version control repository detected for this directory.');
    }

    var repo;
    var args;
    switch (repository.getType()) {
      case 'hg':
        repo = 'hg';
        args = ['log', '--template', '{desc}', '--rev', '.'];
        break;
      case 'git':
        repo = 'git';
        args = ['log', '--format=%B', '-n', '1', 'HEAD'];
        break;
      default:
        throw new Error(repository.getType() + ' repository detected. Phabricator comments only supported for hg and git.')
    }

    var currentCommitMessage = await PhabricatorCommentsHandler._asyncExecute(repo, args, {cwd: this._directoryPath});
    // currentCommitMessage.stdout is the commit message for the current HEAD.
    // Extract the revision ID by parsing the commit message, which contains
    // a line specifying the Phabricator revision, e.g.:
    // `Differential Revision: https://phabricator.foo.com/D123456`
    // If a revision ID can't be extracted from the commit message, return -1.
    var captureRevisionId = /Differential Revision:.*\/D([0-9]*)/;
    var match = currentCommitMessage.stdout.match(captureRevisionId);
    var revisionId = match ? Number(match[1]) : -1;
    return revisionId;
  }

  async _getAllInlineComments(revisionId: number): Promise<Array<Object>> {
    var revisionCommentsResponse = await this._asyncCallConduit({ids: [revisionId]}, 'differential.getrevisioncomments');
    var inlineComments = revisionCommentsResponse[revisionId].filter(comment => comment.hasOwnProperty('inlines'));
    return inlineComments;
  }

  async _getMostRecentDiffId(revisionId: number): Promise<number> {
    var diffsResponse = await this._asyncCallConduit({revision_ids: [revisionId]}, 'differential.getalldiffs');
    return diffsResponse[0].diff_id;
  }

  async _mapAuthorPhidToUsername(phids: Array<string>): Promise<Object> {
    var userQueryResponse = await this._asyncCallConduit({phids}, 'user.query');
    var phidToUsername = {};
    userQueryResponse.forEach(function(user) {
      phidToUsername[user.phid] = user.userName;
    });
    return phidToUsername;
  }

  /**
   * @return Array of objects representing Phabricator comments.
   */
  async getComments(): Promise<Array<PhabricatorComment>> {
    var revisionId = await this._getRevisionIdFromCurrentCommit();
    if (revisionId === -1) {
      return [];
    }
    var diffId = await this._getMostRecentDiffId(revisionId);
    var allInlineComments = await this._getAllInlineComments(revisionId);
    var relativeFilePath = this._filePath.replace(this._directoryPath + '/', '');
    var inlineComments = allInlineComments
                         .filter(comment => comment.inlines.filePath === relativeFilePath && comment.inlines.diffID === diffId);
    var phids = inlineComments.map(comment => comment.authorPHID);
    var phidToUsername = await this._mapAuthorPhidToUsername(phids);
    return inlineComments.map(comment =>
      ({
        author: phidToUsername[comment.authorPHID],
        createdAt: comment.dateCreated,
        content: comment.inlines.content,
        lineNumber: comment.inlines.lineNumber,
        revisionId: comment.revisionID,
      })
    );
  };
}

module.exports = PhabricatorCommentsHandler;
