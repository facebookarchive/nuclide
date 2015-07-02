'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var Handler = require('../lib/PhabricatorCommentsHandler');
var {Directory} = require('atom');

describe('PhabricatorCommentsHandler', () => {
  var handler;
  var filePath;
  var root1;
  var root2;
  var directory1;
  var directory2;

  beforeEach(() => {
    filePath = 'file/path/main.js';
    root1 = '/first/dir/abc';
    root2 = '/second/dir/xyz';
    directory1 = new Directory(root1);
    directory2 = new Directory(root2);

    spyOn(atom.project, 'getDirectories').andReturn([directory1, directory2]);
    handler = new Handler(root2 + '/' + filePath);
  });

  describe('constructor', () => {
    it('detects the correct directory for the file path', () => {
      expect(handler._directoryPath).toEqual(root2);
      expect(handler._directory).toEqual(directory2);
    });
  });

  describe('_getAllInlineComments', () => {
    var revisionId;
    var inline1;
    var inline2;
    var nonInlineComment;
    var inlineComments;

    beforeEach(() => {
      revisionId = 123;
      inline1 = {
        inlines: {
          content: 'Your foo is too fooey.',
        },
      };
      inline2 = {
        inlines: {
          content: 'thumbsup',
        },
      };
      nonInlineComment = {
        content: 'I am not an inline comment!',
      };
      var comments = [
        inline1,
        inline2,
        nonInlineComment,
      ];
      spyOn(handler, '_asyncCallConduit').andReturn({123: comments});
    });

    it('returns inline comments', () => {
      waitsForPromise(async () => {
        inlineComments = await handler._getAllInlineComments(revisionId);
        expect(inlineComments).toContain(inline1);
        expect(inlineComments).toContain(inline2);
        expect(inlineComments).not.toContain(nonInlineComment);
      });
    });
  });

  describe('_getRevisionIdFromCurrentCommit', () => {
    var repo;

    beforeEach(() => {
      repo = jasmine.createSpyObj('repo', ['getType']);
      spyOn(atom.project, 'repositoryForDirectory').andReturn(repo);
    });

    it('throws an error if the repository isn\'t supported', () => {
      repo.getType.andCallFake(() => 'svn');
      waitsForPromise(async () => {
        try {
          await handler._getRevisionIdFromCurrentCommit();
        } catch(err) {
          expect(err.message).toEqual('svn repository detected. Phabricator comments only supported for hg and git.');
        }
      });
    });

    it('returns the revision ID from the commit message', () => {
      repo.getType.andCallFake(() => 'git');
      var commitMessage = `your fancy new feature
                           Summary: made a new foobar
                           Test Plan: apm test
                           Reviewers: zuck, aturing
                           Differential Revision: https://phabricator.foo.com/D123456
                           Tasks: 9876`;
      spyOn(Handler, '_asyncExecute').andReturn({stdout: commitMessage});
      waitsForPromise(async () => {
        var revisionId = await handler._getRevisionIdFromCurrentCommit();
        expect(revisionId).toEqual(123456);
      });
    });

    it('returns -1 when revision ID cannot be parsed from the commit message', () => {
      repo.getType.andCallFake(() => 'git');
      var commitMessage = 'malformed commit message';
      spyOn(Handler, '_asyncExecute').andReturn({stdout: commitMessage});
      waitsForPromise(async () => {
        var revisionId = await handler._getRevisionIdFromCurrentCommit();
        expect(revisionId).toEqual(-1);
      });
    });

  });

  describe('_getMostRecentDiffId', () => {
    var revisionId;
    var diff1;
    var diff2;
    var diff3;

    beforeEach(() => {
      revisionId = 456;
      diff1 = {
        revision_id: revisionId,
        diff_id: 500,
      };
      diff2 = {
        revision_id: revisionId,
        diff_id: 400,
      };
      diff3 = {
        revision_id: revisionId,
        diff_id: 300,
      };
      var diffs = [
        diff1,
        diff2,
        diff3,
      ];
      spyOn(handler, '_asyncCallConduit').andReturn(diffs);
    });

    it('returns the ID of the most recent diff', () => {
      waitsForPromise(async () => {
        var diffId = await handler._getMostRecentDiffId(revisionId);
        expect(diffId).toEqual(diff1.diff_id);
      });
    });
  });

  describe('_mapAuthorPhidToUsername', () => {
    var phids;
    var usernames;
    var user1;
    var user2;

    beforeEach(() => {
      phids = [
        'PHID-1',
        'PHID-2',
      ];
      usernames = [
        'Edsger Dijkstra',
        'Linus Torvalds',
      ];
      user1 = {
        phid: phids[0],
        userName: usernames[0],
      };
      user2 = {
        phid: phids[1],
        userName: usernames[1],
      };
      var users = [
        user1,
        user2,
      ];
      spyOn(handler, '_asyncCallConduit').andReturn(users);
    });

    it('maps author PHIDs to usernames', () => {
      waitsForPromise(async () => {
        var phidToUsername = await handler._mapAuthorPhidToUsername(phids);
        expect(phidToUsername[phids[0]]).toEqual(usernames[0]);
        expect(phidToUsername[phids[1]]).toEqual(usernames[1]);
      });
    });
  });

  describe('getComments', () => {
    var diffId;
    var revisionId;
    var usernameMap;
    var allInlineComments;
    var dateCreated;

    beforeEach(() => {
      diffId = 314159;
      revisionId = 555;
      dateCreated = Date.now();

      // diffId does not match
      var comment1 = {
        inlines: {
          filePath: filePath,
          diffID: 111,
          content: 'I should not be returned.',
          lineNumber: 0,
        },
        authorPHID: 'PHID-3',
        revisionID: 555,
        dateCreated: dateCreated,
      };
      // filePath does not match
      var comment2 = {
        inlines: {
          filePath: '/not/the/same.js',
          diffID: diffId,
          content: 'Nope, not me!',
          lineNumber: 0,
        },
        authorPHID: 'PHID-3',
        revisionID: revisionId,
        dateCreated: dateCreated,
      };
      var comment3 = {
        inlines: {
          filePath: filePath,
          diffID: diffId,
          content: 'It\'s a Match!',
          lineNumber: 10,
        },
        authorPHID: 'PHID-3',
        revisionID: revisionId,
        dateCreated: dateCreated,
      };
      usernameMap = {
        'PHID-3': 'Tim Berners-Lee',
      };
      allInlineComments = [comment1, comment2, comment3];

      spyOn(handler, '_getRevisionIdFromCurrentCommit').andReturn(revisionId);
      spyOn(handler, '_getMostRecentDiffId').andReturn(diffId);
      spyOn(handler, '_getAllInlineComments').andReturn(allInlineComments);
      spyOn(handler, '_mapAuthorPhidToUsername').andReturn(usernameMap);
    });

    it('returns matching comments in the correct format', () => {
      var formattedComment = {
        author: 'Tim Berners-Lee',
        createdAt: dateCreated,
        content: 'It\'s a Match!',
        lineNumber: 10,
        revisionId: 555,
      };
      waitsForPromise(async () => {
        var comments = await handler.getComments();
        var comment = comments[0];
        expect(comment).toEqual(formattedComment);
      });
    });
  });
});
