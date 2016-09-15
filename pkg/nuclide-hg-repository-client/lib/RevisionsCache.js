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
  HgService,
  RevisionInfo,
} from '../../nuclide-hg-rpc/lib/HgService';
import UniversalDisposable from '../../commons-node/UniversalDisposable';

import {BehaviorSubject, Observable, Subject} from 'rxjs';

const FETCH_REVISIONS_DEBOUNCE_MS = 100;
// The request timeout is 60 seconds anyways.
const FETCH_REVISIONS_TIMEOUT_MS = 50 * 1000;

export default class RevisionsCache {

  _hgService: HgService;
  _revisions: BehaviorSubject<Array<RevisionInfo>>;
  _lazyRevisionFetcher: Observable<Array<RevisionInfo>>;
  _fetchRevisionsRequests: Subject<void>;

  constructor(hgService: HgService) {
    this._hgService = hgService;
    this._revisions = new BehaviorSubject([]);
    this._fetchRevisionsRequests = new Subject();

    this._lazyRevisionFetcher = this._fetchRevisionsRequests
      .startWith() // Initially, no refresh requests applied.
      .debounceTime(FETCH_REVISIONS_DEBOUNCE_MS)
      .switchMap(() => this._fetchSmartlogRevisions())
      .do(revisions => this._revisions.next(revisions))
      .share();
  }

  _fetchSmartlogRevisions(): Observable<Array<RevisionInfo>> {
    // TODO(most): change the service to return cancelable Observable
    // to exit when no longer needed
    return Observable
      .fromPromise(this._hgService.fetchSmartlogRevisions())
      .timeout(
        FETCH_REVISIONS_TIMEOUT_MS,
        new Error('Timed out fetching smartlog revisions'),
      )
    ;
  }

  refreshRevisions(): void {
    this._fetchRevisionsRequests.next();
  }

  getCachedRevisions(): Array<RevisionInfo> {
    return this._revisions.getValue();
  }

  onDidChangeRevisions(
    callback: (revisions: Array<RevisionInfo>) => mixed,
  ): IDisposable {
    return new UniversalDisposable(this._lazyRevisionFetcher.subscribe(callback));
  }

}
