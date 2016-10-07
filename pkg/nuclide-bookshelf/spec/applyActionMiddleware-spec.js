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
  Action,
  AddProjectRepositoryAction,
  BookShelfState,
} from '../lib/types';
import type {HgRepositoryClient} from '../../nuclide-hg-repository-client';

import {applyActionMiddleware} from '../lib/applyActionMiddleware';
import {ActionType, EMPTY_SHORTHEAD} from '../lib/constants';
import {
  getDummyBookShelfState,
  REPO_PATH_1,
  SHOTHEAD_1_1,
  SHOTHEAD_1_2,
} from './dummy';
import {Disposable} from 'atom';
import invariant from 'assert';
import {Subject} from 'rxjs';

describe('BookShelf applyActionMiddleware', () => {

  let fakeRepository: atom$Repository = (null: any);

  let oneRepoState: BookShelfState = (null: any);
  let shortHeadChangeCallback: ?() => mixed = null;
  let bookmarksChangeCallback: ?() => mixed = null;
  let destroyCallback: ?() => mixed = null;
  let disposeShortHeadChangeSpy: JasmineSpy = (null: any);
  let disposeBookmarksChangeSpy: JasmineSpy = (null: any);
  let disposeDestroySpy: JasmineSpy = (null: any);

  beforeEach(() => {
    disposeShortHeadChangeSpy = jasmine.createSpy();
    disposeBookmarksChangeSpy = jasmine.createSpy();
    disposeDestroySpy = jasmine.createSpy();

    fakeRepository = ({
      getWorkingDirectory: jasmine.createSpy().andReturn(REPO_PATH_1),
      onDidChangeBookmarks: jasmine.createSpy().andCallFake(changeCallback => {
        bookmarksChangeCallback = changeCallback;
        return new Disposable(disposeBookmarksChangeSpy);
      }),
      onDidChangeShortHead: jasmine.createSpy().andCallFake(changeCallback => {
        shortHeadChangeCallback = changeCallback;
        return new Disposable(disposeShortHeadChangeSpy);
      }),
      onDidDestroy: jasmine.createSpy().andCallFake(callback => {
        destroyCallback = callback;
        return new Disposable(disposeDestroySpy);
      }),
      getBookmarks: jasmine.createSpy().andReturn(Promise.resolve([
        {bookmark: SHOTHEAD_1_1, active: false},
        {bookmark: SHOTHEAD_1_2, active: true},
      ])),
    }: any);

    oneRepoState = getDummyBookShelfState();
  });

  describe('ADD_PROJECT_REPOSITORY', () => {
    it('listens to bookmark changes to update state', () => {
      const addRepositoryAction: AddProjectRepositoryAction = {
        payload: {
          repository: fakeRepository,
        },
        type: ActionType.ADD_PROJECT_REPOSITORY,
      };
      const input = new Subject();
      const resultActionStream = applyActionMiddleware(input, () => oneRepoState);
      const resultActions: Array<Action> = [];
      resultActionStream.subscribe(action => resultActions.push(action));
      input.next(addRepositoryAction);
      input.complete();

      const fakeHgRepository: HgRepositoryClient = (fakeRepository: any);

      waitsFor(() => resultActions.length === 1);

      runs(() => {
        expect(fakeHgRepository.getBookmarks).toHaveBeenCalled();
        expect(fakeHgRepository.onDidChangeBookmarks).toHaveBeenCalled();
        expect(fakeHgRepository.onDidChangeShortHead).toHaveBeenCalled();
        expect(shortHeadChangeCallback).toBeDefined();
        expect(bookmarksChangeCallback).toBeDefined();
        expect(destroyCallback).toBeDefined();
        const firstAction = resultActions[0];
        expect(firstAction.type).toBe(ActionType.UPDATE_REPOSITORY_BOOKMARKS);
        invariant(firstAction.type === ActionType.UPDATE_REPOSITORY_BOOKMARKS);
        expect(firstAction.payload.activeShortHead).toBe(SHOTHEAD_1_2);
        expect(Array.from(firstAction.payload.bookmarkNames))
          .toEqual([SHOTHEAD_1_1, SHOTHEAD_1_2, EMPTY_SHORTHEAD]);

        // Trigger a bookmark update or an active shorthead change.
        invariant(bookmarksChangeCallback);
        bookmarksChangeCallback();
      });

      waitsFor(() => resultActions.length === 2);

      runs(() => {
        // The listeners aren't called again, but another fetch of bookmark is done.
        expect(((fakeHgRepository.onDidChangeBookmarks: any): JasmineSpy).callCount).toBe(1);
        expect(((fakeHgRepository.onDidChangeShortHead: any): JasmineSpy).callCount).toBe(1);
        expect(((fakeHgRepository.getBookmarks: any): JasmineSpy).callCount).toBe(2);

        const secondAction = resultActions[1];
        expect(secondAction.type).toBe(ActionType.UPDATE_REPOSITORY_BOOKMARKS);

        // A repository destroy event would complete the watch.
        expect(disposeBookmarksChangeSpy).not.toHaveBeenCalled();
        expect(disposeShortHeadChangeSpy).not.toHaveBeenCalled();
        expect(disposeDestroySpy).not.toHaveBeenCalled();

        invariant(destroyCallback);
        destroyCallback();
      });

      // Cleanup subscriptions after destroy.
      waitsForPromise(() => resultActionStream.toPromise());

      runs(() => {
        expect(disposeBookmarksChangeSpy).toHaveBeenCalled();
        expect(disposeShortHeadChangeSpy).toHaveBeenCalled();
        expect(disposeDestroySpy).toHaveBeenCalled();
      });
    });
  });
});
