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
  FileResult,
  Provider,
  ProviderType,
} from '../../quick-open-interfaces';

import {regexp} from '../../commons';
const {safeRegExpFromString} = regexp;

// Imported from nuclide-files-service, which is an apm package, preventing a direct import.
type FilePath = string;
type TimeStamp = number;
type FileList = Array<{path: FilePath, timestamp: TimeStamp}>;
type RecentFilesService = {
  getRecentFiles(): FileList,
  touchFile(path: string): void,
};

let _recentFilesService: ?RecentFilesService = null;

function getRecentFilesMatching(query: string): Array<FileResult> {
  if (_recentFilesService == null) {
    return [];
  }
  const queryRegExp = safeRegExpFromString(query);
  const projectPaths = atom.project.getPaths();
  return _recentFilesService.getRecentFiles()
    .filter(result =>
      (!query.length || queryRegExp.test(result.path)) && (
        projectPaths.some(projectPath => result.path.indexOf(projectPath) !== -1)
      )
    )
    .map(result => ({
      path: result.path,
      timestamp: result.timestamp,
    }));
}

export const RecentFilesProvider: Provider = {

  getName(): string {
    return 'RecentFilesProvider';
  },

  getProviderType(): ProviderType {
    return 'GLOBAL';
  },

  getDebounceDelay(): number {
    return 0;
  },

  isRenderable(): boolean {
    return true;
  },

  getAction(): string {
    return 'nuclide-recent-files-provider:toggle-provider';
  },

  getPromptText(): string {
    return 'Search recently opened files';
  },

  getTabTitle(): string {
    return 'Recent Files';
  },

  executeQuery(query: string): Promise<Array<FileResult>> {
    return Promise.resolve(getRecentFilesMatching(query));
  },

  setRecentFilesService(service: RecentFilesService): void {
    _recentFilesService = service;
  },

};
