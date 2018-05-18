/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import * as React from 'react';

import type {FileResult} from '../../nuclide-quick-open/lib/types';
import type CwdApi from '../../nuclide-current-working-directory/lib/CwdApi';

import PathWithFileIcon from '../../nuclide-ui/PathWithFileIcon';
import {BehaviorSubject, Observable} from 'rxjs';
import FileFamilyAggregator from './FileFamilyAggregator';

const ErrorCodes = Object.freeze({
  NO_ACTIVE_FILE: 'NO_ACTIVE_FILE',
});

export type RelatedFileResult = FileResult & {
  pathWithoutRoot?: ?string,
  labels?: Set<string>,
  exists?: boolean,
  creatable?: boolean,
  errorCode?: $Keys<typeof ErrorCodes>,
};

class FileFamilyQuickOpenProvider {
  providerType = 'GLOBAL';
  name = 'FileFamilyQuickOpenProvider';
  debounceDelay = 0;
  display = {
    title: 'Related Files',
    prompt: 'Search file names of related files...',
    action: 'nuclide-file-family-quick-open-provider:toggle-provider',
  };

  _aggregators: BehaviorSubject<?FileFamilyAggregator>;
  _cwds: BehaviorSubject<?CwdApi>;

  constructor(
    aggregators: BehaviorSubject<?FileFamilyAggregator>,
    cwds: BehaviorSubject<?CwdApi>,
  ): void {
    this._aggregators = aggregators;
    this._cwds = cwds;
  }

  async isEligibleForDirectories(
    directories: Array<atom$Directory>,
  ): Promise<boolean> {
    return true;
  }

  executeQuery(
    query: string,
    directories: Array<atom$Directory>,
  ): Promise<Array<RelatedFileResult>> {
    const aggregator = this._aggregators.getValue();
    if (aggregator == null) {
      return Promise.resolve([]);
    }

    const activeEditor = atom.workspace.getActiveTextEditor();
    const activeUri = activeEditor && activeEditor.getURI();

    if (activeUri == null) {
      return Promise.resolve([
        {
          resultType: 'FILE',
          path: '',
          errorCode: ErrorCodes.NO_ACTIVE_FILE,
        },
      ]);
    }

    const results = Observable.defer(() =>
      aggregator.getRelatedFiles(activeUri),
    )
      .map(graph => {
        const cwd = this._cwds.getValue();
        const projectUri = cwd && cwd.getCwd();

        return Array.from(graph.files)
          .filter(([uri, file]) => uri !== activeUri)
          .map(([uri, file]) => {
            return {
              resultType: 'FILE',
              path: uri,
              pathWithoutRoot:
                projectUri == null ? null : uri.replace(projectUri, ''),
              ...file,
            };
          });
      })
      .toPromise();

    return results;
  }

  getComponentForItem(item: RelatedFileResult): React.Element<any> {
    // Special paths indicate that an error occurred.
    switch (item.errorCode) {
      case ErrorCodes.NO_ACTIVE_FILE:
        return (
          <div>
            <span className="file icon icon-file">
              Open a file to retrieve alternates for it.
            </span>
          </div>
        );
    }

    return (
      <div
        className="nuclide-file-family-quick-open-provider-result"
        style={{opacity: item.exists ? 1 : 0.5}}>
        <PathWithFileIcon
          className="nuclide-file-family-quick-open-provider-file-path"
          path={
            item.pathWithoutRoot == null
              ? item.path
              : `.${item.pathWithoutRoot}`
          }
        />
        {!item.exists && (
          <div className="nuclide-file-family-quick-open-provider-create-file-container">
            <span className="nuclide-file-family-quick-open-provider-create-file-label">
              Create File
            </span>
          </div>
        )}
      </div>
    );
  }
}

export default FileFamilyQuickOpenProvider;
