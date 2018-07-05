/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {RpcRegistrar} from './rpc-types';
import type {
  WatchmanClient,
  WatchmanSubscription,
} from 'nuclide-watchman-helpers';

import * as proto from './Protocol.js';
import * as pathModule from 'path';
import fs from 'big-dig/src/common/fs';
import shallowEqual from 'shallowequal';
import {Observable} from 'rxjs';
import {runCommand} from 'nuclide-commons/process';

/**
 * This class provides RPC methods for talking to Hg that should be sufficient
 * to support basic SCM integration in an editor. Of note, it publishes changes
 * to `hg status` as a stream.
 */
export class HgRpcMethods {
  _watcher: WatchmanClient;

  constructor(watcher: WatchmanClient) {
    this._watcher = watcher;
  }

  register(registrar: RpcRegistrar) {
    registrar.registerFun('hg/is-repo', this.isHgRepo.bind(this));
    registrar.registerObservable('hg/status', this.observeStatus.bind(this));
    registrar.registerFun('hg/get-contents', this.getHgGetContents.bind(this));
  }

  /** @return whether the specified directory is part of an Hg repo. */
  async isHgRepo(params: proto.HgIsRepoParams): Promise<proto.HgIsRepoResult> {
    const dir = await fs.findNearestDir('.hg', params.directory);
    const root = dir != null ? pathModule.dirname(dir) : null;
    return {root};
  }

  /**
   * Produce a stream of `hg status` changes by re-running `hg status` every
   * time Watchman notifies us about a file change. Only notify the observer if
   * the result is different from the previous value that was broadcast.
   */
  observeStatus(
    params: proto.HgObserveStatusParams,
  ): Observable<proto.HgObserveStatusData> {
    const {root} = params;
    // Should we memoize the result of this function (based on the root)?
    return (
      Observable.defer(() =>
        getHgStatusWatchmanSubscription(root, this._watcher),
      )
        .switchMap(watchmanSubscription =>
          Observable.fromEvent(watchmanSubscription, 'change'),
        )
        // We start our Observable with a dummy value so that we trigger a
        // an initial proto.HgObserveStatusData to be dispatched upon connection.
        .startWith(null)
        .switchMap(() => getStatus(root))
        .distinctUntilChanged(
          (
            oldStatus: proto.HgObserveStatusData,
            newStatus: proto.HgObserveStatusData,
          ) => shallowEqual(oldStatus.status, newStatus.status),
        )
    );
  }

  async getHgGetContents(
    params: proto.HgGetContentsParams,
  ): Promise<proto.HgGetContentsResult> {
    const {path, ref} = params;
    const args = ['cat'];
    if (ref !== '') {
      args.push('-r', ref);
    }
    args.push(path);

    let contents;
    try {
      // We don't bother to try to find the root of the repo to use as the cwd:
      // we just use the parent of the path whose contents we are trying to
      // find, which should be sufficient.
      contents = await runCommand('hg', args, {
        cwd: pathModule.dirname(path),
        env: createEnvWithHgPlain(),
      }).toPromise();
    } catch (e) {
      // It is possible that path is untracked or there was a more serious error
      // (e.g., the specified path is not part of an Hg repository). In either
      // case, we return the empty string.
      contents = '';
    }
    return {contents};
  }

  dispose() {
    // TODO(mbolin): Remove any subscriptions to Watchman that were made.
  }
}

/**
 * @return a WatchmanSubscription that fires change events that might indicate
 *   that the output of `hg status` has changed. Note that not all change events
 *   will correspond to a change in `hg status`, but our primary concern is
 *   missing an `hg status` change.
 */
function getHgStatusWatchmanSubscription(
  root: string,
  watcher: WatchmanClient,
): Promise<WatchmanSubscription> {
  const watchmanName = 'big-dig-hg-status-change:' + root;
  return watcher.watchDirectoryRecursive(root, watchmanName, {
    // This expression may look a little intimidating. It should fire a change
    // event when *either* of the following happen:
    // 1. A file outside of the .hg/ folder changes. (We also try to exclude
    //    temp files written by Mercurial outside of the .hg/ folder.)
    // 2. The .hg/dirstate file changes.
    expression: [
      'anyof',
      [
        'allof',
        ['not', ['dirname', '.hg']],
        // Hg appears to modify temporary files that begin with these
        // prefixes every time a file is saved.
        ['not', ['match', 'hg-checkexec-*', 'wholename']],
        ['not', ['match', 'hg-checklink-*', 'wholename']],
        // This watchman subscription is used to determine when and which
        // files to fetch new statuses for. There is no reason to include
        // directories in these updates, and in fact they may make us overfetch
        // statuses. (See diff summary of D2021498.)
        // This line restricts this subscription to only return files.
        ['type', 'f'],
      ],
      // Commands like `hg add` that have the side-effect of changing the result
      // of `hg status` have the side-effect of writing the .hg/dirstate file,
      // so watching this file is a useful heuristic for detecting changes to
      // `hg status`.
      ['name', '.hg/dirstate', 'wholename'],
    ],
    defer: ['hg.update'],
    empty_on_fresh_instance: true,
  });
}

/**
 * @return Observable that represents running `hg status` one time. We return an
 *   Observable rather than a Promise so it can be cancelled via unsubscribe().
 */
function getStatus(root: string): Observable<proto.HgObserveStatusData> {
  // Note that --print0 would probably be slightly more efficient, but -Tjson
  // is easier to deal with here.
  return runCommand('hg', ['status', '-mardu', '-Tjson'], {
    cwd: root,
    env: createEnvWithHgPlain(),
  }).map(json => {
    const status: {[relativePath: string]: proto.HgStatusCode} = {};
    for (const {path, status: code} of JSON.parse(json)) {
      status[path] = code;
    }
    return {status};
  });
}

function createEnvWithHgPlain() {
  return {...process.env, HGPLAIN: '1'};
}
