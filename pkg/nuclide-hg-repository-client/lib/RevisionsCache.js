'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const FETCH_REVISIONS_DEBOUNCE_MS = 100;
// The request timeout is 60 seconds anyways.
const FETCH_REVISIONS_TIMEOUT_MS = 50 * 1000;
const FETCH_REVISIONS_RETRY_COUNT = 2;

// The revisions haven't changed if the revisions' ids are the same.
// That's because commit ids are unique and incremental.
// Also, any write operation will update them.
// That way, we guarantee we only update the revisions state if the revisions are changed.
function isEqualRevisions(revisions1, revisions2) {
  if (revisions1 === revisions2) {
    return true;
  }
  if (revisions1 == null || revisions2 == null) {
    return false;
  }
  return (0, (_collection || _load_collection()).arrayEqual)(revisions1, revisions2, (revision1, revision2) => {
    return revision1.id === revision2.id && revision1.isHead === revision2.isHead && (0, (_collection || _load_collection()).arrayEqual)(revision1.tags, revision2.tags) && (0, (_collection || _load_collection()).arrayEqual)(revision1.bookmarks, revision2.bookmarks);
  });
}

class RevisionsCache {

  constructor(hgService) {
    this._hgService = hgService;
    this._revisions = new _rxjsBundlesRxMinJs.BehaviorSubject([]);
    this._fetchRevisionsRequests = new _rxjsBundlesRxMinJs.Subject();

    this._lazyRevisionFetcher = this._fetchRevisionsRequests.startWith(null) // Initially, no refresh requests applied.
    .debounceTime(FETCH_REVISIONS_DEBOUNCE_MS).switchMap(() =>
    // Using `defer` will guarantee a fresh subscription / execution on retries,
    // even though `_fetchSmartlogRevisions` returns a `refCount`ed shared Observable.
    _rxjsBundlesRxMinJs.Observable.defer(() => this._fetchSmartlogRevisions()).retry(FETCH_REVISIONS_RETRY_COUNT).catch(error => {
      (0, (_log4js || _load_log4js()).getLogger)('nuclide-hg-repository-client').error('RevisionsCache Error:', error);
      return _rxjsBundlesRxMinJs.Observable.empty();
    })).distinctUntilChanged(isEqualRevisions).do(revisions => this._revisions.next(revisions)).share();
  }

  _fetchSmartlogRevisions() {
    return this._hgService.fetchSmartlogRevisions().refCount().timeout(FETCH_REVISIONS_TIMEOUT_MS).catch(err => {
      if (err instanceof _rxjsBundlesRxMinJs.TimeoutError) {
        throw new Error('Timed out fetching smartlog revisions');
      }
      throw err;
    });
  }

  refreshRevisions() {
    this._fetchRevisionsRequests.next(null);
  }

  getCachedRevisions() {
    return this._revisions.getValue();
  }

  observeRevisionChanges() {
    return this._lazyRevisionFetcher.startWith(this.getCachedRevisions());
  }
}
exports.default = RevisionsCache;