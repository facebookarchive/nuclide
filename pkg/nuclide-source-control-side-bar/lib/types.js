'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {BookmarkInfo} from '../../nuclide-hg-repository-base/lib/HgService';

type DeleteBookmark = {
  payload: {
    bookmark: BookmarkInfo;
    repository: atom$Repository;
  };
  type: 'delete-bookmark';
};

type FetchProjectDirectoriesAction = {
  type: 'fetch-project-repositories';
};

type RenameBookmark = {
  payload: {
    bookmark: BookmarkInfo;
    nextName: string;
    repository: atom$Repository;
  };
  type: 'rename-bookmark';
};

export type SetBookmarkIsLoading = {
  payload: {
    bookmark: BookmarkInfo;
    repository: atom$Repository;
  };
  type: 'set-bookmark-is-loading';
};

type SetDirectoryRepository = {
  payload: {
    directory: atom$Directory;
    repository: atom$Repository;
  };
  type: 'set-directory-repository';
};

type SetProjectDirectoriesAction = {
  payload: {
    projectDirectories: Array<atom$Directory>;
  };
  type: 'set-project-directories';
};

type SetRepositoryBookmarks = {
  payload: {
    bookmarks: Array<BookmarkInfo>;
    repository: atom$Repository;
  };
  type: 'set-repository-bookmarks';
};

export type UnsetBookmarkIsLoading = {
  payload: {
    bookmark: BookmarkInfo;
    repository: atom$Repository;
  };
  type: 'unset-bookmark-is-loading';
};

type UpdateToBookmarkAction = {
  payload: {
    bookmark: BookmarkInfo;
    repository: atom$Repository;
  };
  type: 'update-to-bookmark';
};

export type Action =
  FetchProjectDirectoriesAction
  | RenameBookmark
  | DeleteBookmark // Place out of alphabetical order to satisfy Flow union types bug
  | SetBookmarkIsLoading
  | SetDirectoryRepository
  | SetProjectDirectoriesAction
  | SetRepositoryBookmarks
  | UnsetBookmarkIsLoading
  | UpdateToBookmarkAction;
