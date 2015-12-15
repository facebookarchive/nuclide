'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const path = require('path');
const React = require('react-for-atom');

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

let _formatter = null;
function getIntlRelativeFormatFor(date: Date): string {
  if (_formatter == null) {
    const IntlRelativeFormat = require('intl-relativeformat');
    _formatter = new IntlRelativeFormat('en');
  }
  return _formatter.format(date);
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

  getComponentForItem(item: FileResult): ReactElement {
    const basename = path.basename(item.path);
    const filePath = item.path.substring(0, item.path.lastIndexOf(basename));
    const date = item.timestamp == null ? null : new Date(item.timestamp);
    const datetime = date === null ? '' : date.toLocaleString();
    return (
      <div className="recent-files-provider-result" title={datetime}>
        <div className="recent-files-provider-filepath-container">
          <span className="recent-files-provider-file-path">{filePath}</span>
          <span className="recent-files-provider-file-name">{basename}</span>
        </div>
        <div className="recent-files-provider-datetime-container">
          <span className="recent-files-provider-datetime-label">
            {date === null ? 'At some point' : getIntlRelativeFormatFor(date)}
          </span>
        </div>
      </div>
    );
  },

};
