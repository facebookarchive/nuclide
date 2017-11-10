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

import type {FileChange} from '../../../nuclide-watchman-helpers/lib/WatchmanClient';

import fsPromise from 'nuclide-commons/fsPromise';
import nuclideUri from 'nuclide-commons/nuclideUri';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Observable} from 'rxjs';
import {WatchmanClient} from '../../../nuclide-watchman-helpers/lib/main';

const TO_IGNORE = ['**/node_modules/**', '**/VendorLib/**', '**/flow-typed/**'];

export type FileWithHash = {
  // All files in the index will be relative to the given root.
  name: string,
  // Watchman supports retrieving the SHA1 of files from list-files.
  sha1: ?string,
};

export type FileIndex = {
  root: string,
  // All non-ignored *.js files.
  jsFiles: Array<FileWithHash>,
  // All node_modules/*/package.json files.
  nodeModulesPackageJsonFiles: Array<FileWithHash>,
};

export async function getFileIndex(root: string): Promise<FileIndex> {
  const client = new WatchmanClient();
  // This is easier and performant enough to express as a glob.
  const nodeModulesPackageJsonFilesPromise = globListFiles(
    root,
    'node_modules/*/package.json',
  ).then(fromGlobResult);
  try {
    const [jsFiles, nodeModulesPackageJsonFiles] = await Promise.all([
      watchmanListFiles(client, root, '*.js').then(fromWatchmanResult),
      nodeModulesPackageJsonFilesPromise,
    ]);
    return {root, jsFiles, nodeModulesPackageJsonFiles};
  } catch (err) {
    const [jsFiles, nodeModulesPackageJsonFiles] = await Promise.all([
      globListFiles(root, '**/*.js', TO_IGNORE).then(fromGlobResult),
      nodeModulesPackageJsonFilesPromise,
    ]);
    return {root, jsFiles, nodeModulesPackageJsonFiles};
  } finally {
    client.dispose();
  }
}

function globListFiles(
  root: string,
  pattern: string,
  ignore?: Array<string>,
): Promise<Array<string>> {
  return fsPromise.glob(pattern, {cwd: root, ignore}).catch(() => []);
}

function watchmanListFiles(
  client: WatchmanClient,
  root: string,
  pattern: string,
): Promise<Array<string>> {
  return client.listFiles(root, getWatchmanExpression(root, pattern));
}

function fromWatchmanResult(result: any): Array<FileWithHash> {
  return result.map(data => ({name: data.name, sha1: data['content.sha1hex']}));
}

function fromGlobResult(files: Array<string>): Array<FileWithHash> {
  return files.map(name => ({name, sha1: null}));
}

// TODO: watch node_modules and package.json files for changes.
export function watchDirectory(root: string): Observable<FileChange> {
  return Observable.defer(() => {
    const watchmanClient = new WatchmanClient();
    return Observable.using(
      () => new UniversalDisposable(watchmanClient),
      () =>
        Observable.fromPromise(
          watchmanClient.watchDirectoryRecursive(
            root,
            'js-imports-subscription',
            getWatchmanExpression(root, '*.js'),
          ),
        ).switchMap(watchmanSubscription => {
          return Observable.fromEvent(
            watchmanSubscription,
            'change',
          ).switchMap((changes: Array<FileChange>) =>
            Observable.from(
              changes
                .map(change => {
                  const name = nuclideUri.join(
                    watchmanSubscription.root,
                    change.name,
                  );
                  if (!nuclideUri.contains(root, name)) {
                    return null;
                  }
                  return {
                    ...change,
                    name,
                  };
                })
                .filter(Boolean),
            ),
          );
        }),
    );
  });
}

function getWatchmanExpression(root: string, pattern: string) {
  return {
    expression: [
      'allof',
      ['match', pattern],
      ['type', 'f'],
      ...getWatchmanMatchesFromIgnoredFiles(),
    ],
    fields: ['name', 'content.sha1hex'],
  };
}

function getWatchmanMatchesFromIgnoredFiles() {
  return TO_IGNORE.map(patternToIgnore => {
    return [
      'not',
      ['match', patternToIgnore, 'wholename', {includedotfiles: true}],
    ];
  });
}
