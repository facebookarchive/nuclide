'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  HgRepositoryClient,
  HgRepositoryClientAsync,
} from '../pkg/nuclide-hg-repository-client';
import type {RevisionInfo} from '../pkg/nuclide-hg-repository-base/lib/HgService';
import type {TestContext} from './utils/remotable-tests';

import fs from 'fs';
import invariant from 'assert';
import path from 'path';

import {copyMercurialFixture} from '../pkg/nuclide-integration-test-helpers';
import {describeRemotableTest} from './utils/remotable-tests';
import {repositoryForPath} from '../pkg/nuclide-hg-git-bridge';
import {waitsForRepositoryReady} from './utils/diff-view-utils';

describeRemotableTest('Mercurial File Changes Tree Integration Tests', (context: TestContext) => {
  let repoPath: string = (null : any);
  let repoRemotePath: string = (null : any);
  let testFileLocalPath: string = (null : any);
  let newFileLocalPath: string = (null : any);
  let otherFileLocalPath: string = (null : any);
  let workspaceView: HTMLElement = (null : any);
  // Root node of the nuclide-file-tree
  let rootNode: HTMLElement = (null : any);
  let hgRepository: HgRepositoryClient = (null : any);
  // Revision info for creating bookmarks stemming from these revisions
  let firstRevision: RevisionInfo = (null : any);
  let laterRevision: RevisionInfo = (null : any);

  beforeEach(() => {
    waitsForPromise(async () => {
      // Set up repo and handles to file tree DOM nodes
      repoPath = await copyMercurialFixture('hg_repo_1');
      await context.setProject(repoPath);
      repoRemotePath = context.getProjectRelativePath(repoPath);
      testFileLocalPath = path.join(repoPath, 'test.txt');
      newFileLocalPath = path.join(repoPath, 'new.txt');
      otherFileLocalPath = path.join(repoPath, 'other.txt');
      workspaceView = atom.views.getView(atom.workspace);
      rootNode = workspaceView.querySelector('.nuclide-file-tree');
      hgRepository = ((repositoryForPath(repoRemotePath): any): HgRepositoryClient);
      invariant(hgRepository != null,
        'HgRepositoryClient should recognize the project directory as a mercurial project');
      // For later use in creating a bookmark stemming from firstRevision
      firstRevision = await hgRepository.getBaseRevision();
    });
  });
  // This is the Mercurial history being built in this test.
  // * Edit test.txt
  // * commit
  // * Add new.txt
  // * amend (edit test.txt and add new.txt now in same commit)
  // * edit new.txt, commit
  // * make bookmark `new` at current commit
  // * make bookmark `other` starting from original commit in hg_repo_1
  // * update to `other` and add other.txt and commit
  // * update back to `new` bookmark
  // * and check that the file tree updates for each step.
  //
  // o  b7fd98  reesjones  other
  // |  add other.txt
  // |
  // | @  dcfbb5  reesjones  new*
  // | |  edit new.txt
  // | |
  // | o  4450ea  reesjones
  // |/   forgot to add new.txt
  // |
  // o  c1c235  jonaldislarry
  // |  second commit
  // ~

  it('can update the file tree UI when Mercurial commit, amend, and bookmark ops are made', () => {
    waitsForPromise(async () => {
      // Make a change
      fs.writeFileSync(testFileLocalPath, 'editing test.txt', 'utf8');

      await waitsForRepositoryReady(repoRemotePath);
    });

    waitsFor('file tree to update VCS colors', 5000, () => {
      // Select DOM nodes with .status-modified class
      const fileTreeList: HTMLElement = rootNode.querySelector('.list-tree');
      const projectFolder: HTMLElement =
        fileTreeList.querySelector('.current-working-directory');
      const modifiedFile: HTMLElement =
        fileTreeList.querySelector('.file');
      // Do those DOM nodes exist yet?
      return projectFolder.classList.contains('status-modified')
        && modifiedFile.classList.contains('status-modified');
    });

    waitsForPromise(async () => {
      await hgRepository.commit('edited test.txt');

      await waitsForRepositoryReady(repoRemotePath);
    });

    waitsFor('file tree to remove VCS colors', 5000, () => {
      // Select any DOM node with .status-modified class
      const fileTreeList: HTMLElement = rootNode.querySelector('.list-tree');
      const modifiedNodes: NodeList<HTMLElement> =
        fileTreeList.querySelectorAll('.status-modified');
      // There should no longer be any modified nodes in the file tree
      return (modifiedNodes.length === 0);
    });

    waitsForPromise(async () => {
      // Add new.txt
      fs.writeFileSync(newFileLocalPath, 'adding text to new file: new.txt', 'utf8');
      // Add it to mercurial
      await hgRepository.addAll([repoPath]);

      await waitsForRepositoryReady(repoRemotePath);
    });

    waitsFor('file tree to add and color the new file', 5000, () => {
      // Get file tree node and check that one of the <li>'s have .status-added
      const fileNodes: NodeList<HTMLElement> = rootNode.querySelectorAll('.status-added');
      // Is it there yet?
      return (fileNodes.length === 1);
    });

    waitsForPromise(async () => {
      // Amending in Nuclide adds uncommitted changes to the previous commit, so we test that
      // doing an amend removes all .status-added and .status-modified classes from the file tree

      // Amend commit
      await hgRepository.amend('forgot to add new.txt');

      await waitsForRepositoryReady(repoRemotePath);
    });

    waitsFor('file tree to remove colors after amend', 5000, () => {
      const addedFiles: NodeList<HTMLElement> = rootNode.querySelectorAll('.status-added');
      const modifiedFiles: NodeList<HTMLElement> = rootNode.querySelectorAll('.status-modified');
      return (addedFiles.length === 0 && modifiedFiles.length === 0);
    });

    waitsForPromise({timeout: 15000}, async () => {
      // Make some changes and commit
      fs.writeFileSync(newFileLocalPath, 'adding changes to new.txt', 'utf8');
      await hgRepository.addAll([repoPath]);
      await hgRepository.commit('edit new.txt');
      laterRevision = await hgRepository.getBaseRevision();

      // Make 'new' bookmark at laterRevision and 'other' bookmark at firstRevision
      const hgRepositoryAsync: HgRepositoryClientAsync = hgRepository.async;
      await hgRepositoryAsync.createBookmark('new', laterRevision.hash);
      await hgRepositoryAsync.createBookmark('other', firstRevision.hash);
      // update to that bookmark
      await hgRepository.checkoutRevision('other', false);

      await waitsForRepositoryReady(repoRemotePath);
    });

    waitsFor('file tree to update after updating to `other` bookmark', () => {
    // Make sure file tree doesn't show new.txt
      const fileNodes = rootNode.querySelector('.list-tree')
        .querySelectorAll('.file');
      if (fileNodes.length !== 1) {
        return false;
      }
      // Does the single span element have the right filename in it?
      // Only test.txt exists in firstRevision
      const testFile: HTMLElement = fileNodes[0].querySelector('span > span[data-name="test.txt"]');
      return (testFile == null)
        ? false
        : (testFile.innerHTML === 'test.txt');
    });

    waitsForPromise({timeout: 10000}, async () => {
      // Now that we're in the `other` bookmark, add other.txt and commit
      fs.writeFileSync(
        otherFileLocalPath, 'this file created in the `other` bookmark', 'utf8');
      await hgRepository.addAll([repoPath]);
      await hgRepository.commit('add other.txt');
      // Update to 'new' bookmark to see if file tree updates list of files
      await hgRepository.checkoutRevision('new', false);

      await waitsForRepositoryReady(repoRemotePath);
    });

    waitsFor('file tree to update after updating back to `new` bookmark', 10000, () => {
      // Make sure file tree shows new.txt and doesn't show other.txt
      const fileNodes = rootNode.querySelector('.list-tree')
        .querySelectorAll('.file');
      const newFile: HTMLElement = fileNodes[0].querySelector('span > span[data-name="new.txt"]');
      return (newFile == null)
        ? false
        : (newFile.innerHTML === 'new.txt');
    });
  });
});
