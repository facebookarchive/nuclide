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

import type {HgRepositoryClient} from '../../nuclide-hg-repository-client';

import createPackage from 'nuclide-commons-atom/createPackage';
import featureConfig from 'nuclide-commons-atom/feature-config';
import observePaneItemVisibility from 'nuclide-commons-atom/observePaneItemVisibility';
import {observableFromSubscribeFunction} from 'nuclide-commons/event';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {fastDebounce} from 'nuclide-commons/observable';
import {nextTick} from 'nuclide-commons/promise';
import {Observable, ReplaySubject} from 'rxjs';
import {gitDiffStrings} from '../../nuclide-hg-repository-client/lib/utils';
import {hgConstants} from '../../nuclide-hg-rpc';
import {parseHgDiffUnifiedOutput} from '../../nuclide-hg-rpc/lib/hg-diff-output-parser';
import {repositoryForPath} from '../../nuclide-vcs-base';
import nullthrows from 'nullthrows';

// TODO: handle file renames
// TODO: handle (ignore) large files (particularly generated)
// TODO: re-implement git-diff so it is push-based. git-diff currently only polls
// for changes on buffer updates, so if you commit and all previous changes are
// now part of head, highlights won't update until you type

class Activation {
  _disposed: ReplaySubject<void> = new ReplaySubject(1);

  constructor() {
    (featureConfig.observeAsStream(
      'nuclide-hg-repository.enableDiffStats',
    ): Observable<any>)
      .switchMap((enableDiffStats: boolean) => {
        if (!enableDiffStats) {
          return Observable.empty();
        }

        const reposBeingWatched = new Set();

        return observableFromSubscribeFunction(
          atom.workspace.observeTextEditors.bind(atom.workspace),
        ).flatMap(textEditor => {
          const editorPath = textEditor.getPath();
          if (editorPath == null) {
            return Observable.empty();
          }

          const repositoryForEditor = repositoryForPath(editorPath);
          if (
            repositoryForEditor == null ||
            repositoryForEditor.getType() !== 'hg'
          ) {
            return Observable.empty();
          }

          // Because multiple HgRepositoryClients can be backed by a single instance,
          // (in the case of multiple projects in the same real repo)
          // and we only want one HgRepositoryClient per real repo
          const rootRepo = ((repositoryForEditor: any): HgRepositoryClient).getRootRepoClient();

          if (reposBeingWatched.has(rootRepo)) {
            return Observable.empty();
          }
          reposBeingWatched.add(rootRepo);

          // Observe repo being destroyed. Remove it from Set when that happens
          const repoDestroyed = observableFromSubscribeFunction(
            rootRepo.onDidDestroy.bind(rootRepo),
          ).do(() => reposBeingWatched.delete(rootRepo));

          return this._watchBufferDiffChanges(rootRepo).takeUntil(
            repoDestroyed,
          );
        });
      })
      .takeUntil(this._disposed)
      .subscribe();
  }

  // Responsible for calculating the diff of a file by 1. fetching the content
  // at head for each buffer once it becomes visible and 2. diffing it against
  // current buffer contents once the buffer changes
  _watchBufferDiffChanges(repository: HgRepositoryClient): Observable<any> {
    return repository
      .observeHeadRevision()
      .do(() => repository.clearAllDiffInfo())
      .switchMap(() => {
        // by defining the cache in this scope, it is automatically "cleared"
        // when headRevision changes
        const fileContentsAtHead = new Map();

        // batch hg cat calls using this array
        const bufferedFilesToCat = [];

        // fetchFileContentsAtHead is the observable responsible for buffering
        // up textEditor paths as they become visible, and then running them
        // through `hg cat` to get content at head
        const fetchFileContentsAtHead = observeTextEditorsInRepo(repository)
          .flatMap(textEditor => {
            return observePaneItemVisibility(textEditor)
              .filter(isVisible => isVisible)
              .first()
              .flatMap(() => {
                const bufferPath = nullthrows(textEditor.getPath());
                // TODO (tjfryan): do something to handle generated files
                if (fileContentsAtHead.has(bufferPath)) {
                  return Observable.empty();
                }

                bufferedFilesToCat.push(repository.relativize(bufferPath));
                if (bufferedFilesToCat.length > 1) {
                  return Observable.empty();
                }

                // use nextTick to buffer many files being requested at once
                // (maybe should use timeout instead?)
                return Observable.fromPromise(nextTick()).switchMap(() => {
                  const filesToCat = [...bufferedFilesToCat];
                  bufferedFilesToCat.length = 0;
                  return repository
                    .fetchMultipleFilesContentAtRevision(
                      filesToCat,
                      hgConstants.HEAD_REVISION_EXPRESSION,
                    )
                    .catch(() =>
                      // hg uses errorCode 1 as "nothing went wrong but nothing was found"
                      Observable.empty(),
                    );
                });
              });
          })
          .do(fileContents =>
            fileContents.forEach(({abspath, data}) => {
              fileContentsAtHead.set(
                nuclideUri.join(repository.getWorkingDirectory(), abspath),
                data,
              );
            }),
          )
          .share();

        const buffers = new Set();
        // calculateDiffForBuffers is the observable responsible for watching
        // buffer changes and updating the diff info
        const calculateDiffForBuffers = observeTextEditorsInRepo(
          repository,
        ).flatMap(textEditor => {
          const buffer = textEditor.getBuffer();
          if (buffers.has(buffer)) {
            return Observable.empty();
          }
          buffers.add(buffer);

          const bufferPath = nullthrows(buffer.getPath());

          const bufferReloads = observableFromSubscribeFunction(
            buffer.onDidReload.bind(buffer),
          );
          const bufferChanges = observableFromSubscribeFunction(
            buffer.onDidChangeText.bind(buffer),
          );

          // TODO (tjfryan): handle renames `onDidChangePath`

          // This is in a flatMap, so we need to make sure this terminates
          // We can terminate, `takeUntil`, buffer is destroyed
          // And make sure to clear the cached diff for the buffer once we no
          // longer care about it
          const bufferDestroyed = observableFromSubscribeFunction(
            buffer.onDidDestroy.bind(buffer),
          ).do(() => {
            buffers.delete(buffer);
            repository.deleteDiffInfo(bufferPath);
            fileContentsAtHead.delete(bufferPath);
          });

          // recalculate on bufferReload, bufferChanges, and when we get
          // this file's data from hg cat
          return Observable.merge(
            bufferReloads,
            bufferChanges,
            fetchFileContentsAtHead.filter(fileContentsList =>
              fileContentsList.some(
                fileInfo =>
                  nuclideUri.join(
                    repository.getWorkingDirectory(),
                    fileInfo.abspath,
                  ) === bufferPath,
              ),
            ),
          )
            .let(fastDebounce(200))
            .switchMap(() => {
              const oldContents = fileContentsAtHead.get(bufferPath);
              if (oldContents == null) {
                return Observable.empty();
              }
              const newContents = buffer.getText();
              return gitDiffStrings(oldContents, newContents)
                .map(diffOutput => parseHgDiffUnifiedOutput(diffOutput))
                .do(diffInfo => {
                  repository.setDiffInfo(bufferPath, diffInfo);
                });
            })
            .takeUntil(bufferDestroyed);
        });

        return Observable.merge(
          fetchFileContentsAtHead,
          calculateDiffForBuffers,
        );
      });
  }

  dispose(): void {
    this._disposed.next();
  }
}

function observeTextEditorsInRepo(
  repository: HgRepositoryClient,
): Observable<atom$TextEditor> {
  return observableFromSubscribeFunction(
    atom.workspace.observeTextEditors.bind(atom.workspace),
  ).filter(textEditor => {
    const path = textEditor.getPath();
    return path != null && repository.isPathRelevantToRepository(path);
  });
}

createPackage(module.exports, Activation);
