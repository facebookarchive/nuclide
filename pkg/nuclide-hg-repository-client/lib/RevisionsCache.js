Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _commonsNodeCollection;

function _load_commonsNodeCollection() {
  return _commonsNodeCollection = require('../../commons-node/collection');
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var FETCH_REVISIONS_DEBOUNCE_MS = 100;
// The request timeout is 60 seconds anyways.
var FETCH_REVISIONS_TIMEOUT_MS = 50 * 1000;
var FETCH_REVISIONS_RETRY_COUNT = 2;

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
  return (0, (_commonsNodeCollection || _load_commonsNodeCollection()).arrayEqual)(revisions1, revisions2, function (revision1, revision2) {
    return revision1.id === revision2.id && revision1.isHead === revision2.isHead && (0, (_commonsNodeCollection || _load_commonsNodeCollection()).arrayEqual)(revision1.tags, revision2.tags) && (0, (_commonsNodeCollection || _load_commonsNodeCollection()).arrayEqual)(revision1.bookmarks, revision2.bookmarks);
  });
}

var RevisionsCache = (function () {
  function RevisionsCache(hgService) {
    var _this = this;

    _classCallCheck(this, RevisionsCache);

    this._hgService = hgService;
    this._revisions = new (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).BehaviorSubject([]);
    this._fetchRevisionsRequests = new (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Subject();

    this._lazyRevisionFetcher = this._fetchRevisionsRequests.startWith(null) // Initially, no refresh requests applied.
    .debounceTime(FETCH_REVISIONS_DEBOUNCE_MS).switchMap(function () {
      return(
        // Using `defer` will guarantee a fresh subscription / execution on retries,
        // even though `_fetchSmartlogRevisions` returns a `refCount`ed shared Observable.
        (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.defer(function () {
          return _this._fetchSmartlogRevisions();
        }).retry(FETCH_REVISIONS_RETRY_COUNT).catch(function (error) {
          (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('RevisionsCache Error:', error);
          return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty();
        })
      );
    }).distinctUntilChanged(isEqualRevisions).do(function (revisions) {
      return _this._revisions.next(revisions);
    }).share();
  }

  _createClass(RevisionsCache, [{
    key: '_fetchSmartlogRevisions',
    value: function _fetchSmartlogRevisions() {
      return this._hgService.fetchSmartlogRevisions().refCount().timeout(FETCH_REVISIONS_TIMEOUT_MS, new Error('Timed out fetching smartlog revisions'));
    }
  }, {
    key: 'refreshRevisions',
    value: function refreshRevisions() {
      this._fetchRevisionsRequests.next(null);
    }
  }, {
    key: 'getCachedRevisions',
    value: function getCachedRevisions() {
      return this._revisions.getValue();
    }
  }, {
    key: 'observeRevisionChanges',
    value: function observeRevisionChanges() {
      return this._lazyRevisionFetcher.startWith(this.getCachedRevisions());
    }
  }]);

  return RevisionsCache;
})();

exports.default = RevisionsCache;
module.exports = exports.default;