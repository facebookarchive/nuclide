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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _nuclideHgRepositoryBaseLibHgConstants = require('../../nuclide-hg-repository-base/lib/hg-constants');

/*
 * Delegate to the passed in HgRepositoryClient.
 */

var HgRepositoryClientAsync = (function () {
  function HgRepositoryClientAsync(client) {
    _classCallCheck(this, HgRepositoryClientAsync);

    this._client = client;
  }

  _createClass(HgRepositoryClientAsync, [{
    key: 'checkoutReference',
    value: function checkoutReference(reference, create) {
      return this._client._service.checkout(reference, create);
    }
  }, {
    key: 'getShortHead',
    value: _asyncToGenerator(function* () {
      var newlyFetchedBookmark = '';
      try {
        newlyFetchedBookmark = yield this._client._service.fetchCurrentBookmark();
      } catch (e) {
        // Suppress the error. There are legitimate times when there may be no
        // current bookmark, such as during a rebase. In this case, we just want
        // to return an empty string if there is no current bookmark.
      }
      if (newlyFetchedBookmark !== this._client._currentBookmark) {
        this._client._currentBookmark = newlyFetchedBookmark;
        // The Atom status-bar uses this as a signal to refresh the 'shortHead'.
        // There is currently no dedicated 'shortHeadDidChange' event.
        this._client._emitter.emit('did-change-statuses');
      }
      return this._client._currentBookmark || '';
    })
  }, {
    key: 'getCachedPathStatus',
    value: function getCachedPathStatus(filePath) {
      return Promise.resolve(this._client.getCachedPathStatus(filePath));
    }

    // TODO This is a stub.
  }, {
    key: 'getCachedUpstreamAheadBehindCount',
    value: function getCachedUpstreamAheadBehindCount(path) {
      return Promise.resolve(this._client.getCachedUpstreamAheadBehindCount(path));
    }
  }, {
    key: 'getDiffStats',
    value: _asyncToGenerator(function* (filePath) {
      var cleanStats = { added: 0, deleted: 0 };
      if (!filePath) {
        return cleanStats;
      }

      // Check the cache.
      var cachedDiffInfo = this._client._hgDiffCache[filePath];
      if (cachedDiffInfo) {
        return { added: cachedDiffInfo.added, deleted: cachedDiffInfo.deleted };
      }

      // Fall back to a fetch.
      var fetchedPathToDiffInfo = yield this._client._updateDiffInfo([filePath]);
      if (fetchedPathToDiffInfo) {
        var diffInfo = fetchedPathToDiffInfo.get(filePath);
        if (diffInfo != null) {
          return { added: diffInfo.added, deleted: diffInfo.deleted };
        }
      }

      return cleanStats;
    })

    /**
     * Recommended method to use to get the line diffs of files in this repo.
     * @param path The absolute file path to get the line diffs for. If the path \
     *   is not in the project, an empty Array will be returned.
     */
  }, {
    key: 'getLineDiffs',
    value: _asyncToGenerator(function* (filePath) {
      var lineDiffs = [];
      if (!filePath) {
        return lineDiffs;
      }

      // Check the cache.
      var cachedDiffInfo = this._client._hgDiffCache[filePath];
      if (cachedDiffInfo) {
        return cachedDiffInfo.lineDiffs;
      }

      // Fall back to a fetch.
      var fetchedPathToDiffInfo = yield this._client._updateDiffInfo([filePath]);
      if (fetchedPathToDiffInfo != null) {
        var diffInfo = fetchedPathToDiffInfo.get(filePath);
        if (diffInfo != null) {
          return diffInfo.lineDiffs;
        }
      }

      return lineDiffs;
    })
  }, {
    key: 'isPathIgnored',
    value: function isPathIgnored(filePath) {
      return Promise.resolve(this._client.isPathIgnored(filePath));
    }
  }, {
    key: 'isStatusModified',
    value: function isStatusModified(status) {
      return status === _nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.MODIFIED || status === _nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.MISSING || status === _nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.REMOVED;
    }
  }, {
    key: 'isStatusNew',
    value: function isStatusNew(status) {
      return status === _nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.ADDED || status === _nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.UNTRACKED;
    }
  }, {
    key: 'onDidChangeStatus',
    value: function onDidChangeStatus(callback) {
      return this._client.onDidChangeStatus(callback);
    }
  }, {
    key: 'onDidChangeStatuses',
    value: function onDidChangeStatuses(callback) {
      return this._client.onDidChangeStatuses(callback);
    }
  }]);

  return HgRepositoryClientAsync;
})();

exports['default'] = HgRepositoryClientAsync;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhnUmVwb3NpdG9yeUNsaWVudEFzeW5jLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztxREFrQitCLG1EQUFtRDs7Ozs7O0lBSzdELHVCQUF1QjtBQUkvQixXQUpRLHVCQUF1QixDQUk5QixNQUEwQixFQUFFOzBCQUpyQix1QkFBdUI7O0FBS3hDLFFBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0dBQ3ZCOztlQU5rQix1QkFBdUI7O1dBUXpCLDJCQUFDLFNBQWlCLEVBQUUsTUFBZSxFQUFpQjtBQUNuRSxhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDMUQ7Ozs2QkFFaUIsYUFBb0I7QUFDcEMsVUFBSSxvQkFBb0IsR0FBRyxFQUFFLENBQUM7QUFDOUIsVUFBSTtBQUNGLDRCQUFvQixHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztPQUMzRSxDQUFDLE9BQU8sQ0FBQyxFQUFFOzs7O09BSVg7QUFDRCxVQUFJLG9CQUFvQixLQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUU7QUFDMUQsWUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsR0FBRyxvQkFBb0IsQ0FBQzs7O0FBR3JELFlBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO09BQ25EO0FBQ0QsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixJQUFJLEVBQUUsQ0FBQztLQUM1Qzs7O1dBRWtCLDZCQUFDLFFBQXFCLEVBQWtDO0FBQ3pFLGFBQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7S0FDcEU7Ozs7O1dBR2dDLDJDQUMvQixJQUFpQixFQUMwQjtBQUMzQyxhQUFP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bnRBc3luYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge1xuICBMaW5lRGlmZixcbiAgU3RhdHVzQ29kZU51bWJlclZhbHVlLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLXJlcG9zaXRvcnktYmFzZS9saWIvSGdTZXJ2aWNlJztcbmltcG9ydCB0eXBlIHtIZ1JlcG9zaXRvcnlDbGllbnR9IGZyb20gJy4vSGdSZXBvc2l0b3J5Q2xpZW50JztcblxuaW1wb3J0IHtTdGF0dXNDb2RlTnVtYmVyfSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLXJlcG9zaXRvcnktYmFzZS9saWIvaGctY29uc3RhbnRzJztcblxuLypcbiAqIERlbGVnYXRlIHRvIHRoZSBwYXNzZWQgaW4gSGdSZXBvc2l0b3J5Q2xpZW50LlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIZ1JlcG9zaXRvcnlDbGllbnRBc3luYyB7XG5cbiAgX2NsaWVudDogSGdSZXBvc2l0b3J5Q2xpZW50O1xuXG4gIGNvbnN0cnVjdG9yKGNsaWVudDogSGdSZXBvc2l0b3J5Q2xpZW50KSB7XG4gICAgdGhpcy5fY2xpZW50ID0gY2xpZW50O1xuICB9XG5cbiAgY2hlY2tvdXRSZWZlcmVuY2UocmVmZXJlbmNlOiBzdHJpbmcsIGNyZWF0ZTogYm9vbGVhbik6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLl9jbGllbnQuX3NlcnZpY2UuY2hlY2tvdXQocmVmZXJlbmNlLCBjcmVhdGUpO1xuICB9XG5cbiAgYXN5bmMgZ2V0U2hvcnRIZWFkKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgbGV0IG5ld2x5RmV0Y2hlZEJvb2ttYXJrID0gJyc7XG4gICAgdHJ5IHtcbiAgICAgIG5ld2x5RmV0Y2hlZEJvb2ttYXJrID0gYXdhaXQgdGhpcy5fY2xpZW50Ll9zZXJ2aWNlLmZldGNoQ3VycmVudEJvb2ttYXJrKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gU3VwcHJlc3MgdGhlIGVycm9yLiBUaGVyZSBhcmUgbGVnaXRpbWF0ZSB0aW1lcyB3aGVuIHRoZXJlIG1heSBiZSBub1xuICAgICAgLy8gY3VycmVudCBib29rbWFyaywgc3VjaCBhcyBkdXJpbmcgYSByZWJhc2UuIEluIHRoaXMgY2FzZSwgd2UganVzdCB3YW50XG4gICAgICAvLyB0byByZXR1cm4gYW4gZW1wdHkgc3RyaW5nIGlmIHRoZXJlIGlzIG5vIGN1cnJlbnQgYm9va21hcmsuXG4gICAgfVxuICAgIGlmIChuZXdseUZldGNoZWRCb29rbWFyayAhPT0gdGhpcy5fY2xpZW50Ll9jdXJyZW50Qm9va21hcmspIHtcbiAgICAgIHRoaXMuX2NsaWVudC5fY3VycmVudEJvb2ttYXJrID0gbmV3bHlGZXRjaGVkQm9va21hcms7XG4gICAgICAvLyBUaGUgQXRvbSBzdGF0dXMtYmFyIHVzZXMgdGhpcyBhcyBhIHNpZ25hbCB0byByZWZyZXNoIHRoZSAnc2hvcnRIZWFkJy5cbiAgICAgIC8vIFRoZXJlIGlzIGN1cnJlbnRseSBubyBkZWRpY2F0ZWQgJ3Nob3J0SGVhZERpZENoYW5nZScgZXZlbnQuXG4gICAgICB0aGlzLl9jbGllbnQuX2VtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1zdGF0dXNlcycpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fY2xpZW50Ll9jdXJyZW50Qm9va21hcmsgfHwgJyc7XG4gIH1cblxuICBnZXRDYWNoZWRQYXRoU3RhdHVzKGZpbGVQYXRoOiA/TnVjbGlkZVVyaSk6IFByb21pc2U8U3RhdHVzQ29kZU51bWJlclZhbHVlPiB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9jbGllbnQuZ2V0Q2FjaGVkUGF0aFN0YXR1cyhmaWxlUGF0aCkpO1xuICB9XG5cbiAgLy8gVE9ETyBUaGlzIGlzIGEgc3R1Yi5cbiAgZ2V0Q2FjaGVkVXBzdHJlYW1BaGVhZEJlaGluZENvdW50KFxuICAgIHBhdGg6ID9OdWNsaWRlVXJpXG4gICk6IFByb21pc2U8e2FoZWFkOiBudW1iZXI7IGJlaGluZDogbnVtYmVyO30+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2NsaWVudC5nZXRDYWNoZWRVcHN0cmVhbUFoZWFkQmVoaW5kQ291bnQocGF0aCkpO1xuICB9XG5cbiAgYXN5bmMgZ2V0RGlmZlN0YXRzKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogUHJvbWlzZTx7YWRkZWQ6IG51bWJlcjsgZGVsZXRlZDogbnVtYmVyO30+IHtcbiAgICBjb25zdCBjbGVhblN0YXRzID0ge2FkZGVkOiAwLCBkZWxldGVkOiAwfTtcbiAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICByZXR1cm4gY2xlYW5TdGF0cztcbiAgICB9XG5cbiAgICAvLyBDaGVjayB0aGUgY2FjaGUuXG4gICAgY29uc3QgY2FjaGVkRGlmZkluZm8gPSB0aGlzLl9jbGllbnQuX2hnRGlmZkNhY2hlW2ZpbGVQYXRoXTtcbiAgICBpZiAoY2FjaGVkRGlmZkluZm8pIHtcbiAgICAgIHJldHVybiB7YWRkZWQ6IGNhY2hlZERpZmZJbmZvLmFkZGVkLCBkZWxldGVkOiBjYWNoZWREaWZmSW5mby5kZWxldGVkfTtcbiAgICB9XG5cbiAgICAvLyBGYWxsIGJhY2sgdG8gYSBmZXRjaC5cbiAgICBjb25zdCBmZXRjaGVkUGF0aFRvRGlmZkluZm8gPSBhd2FpdCB0aGlzLl9jbGllbnQuX3VwZGF0ZURpZmZJbmZvKFtmaWxlUGF0aF0pO1xuICAgIGlmIChmZXRjaGVkUGF0aFRvRGlmZkluZm8pIHtcbiAgICAgIGNvbnN0IGRpZmZJbmZvID0gZmV0Y2hlZFBhdGhUb0RpZmZJbmZvLmdldChmaWxlUGF0aCk7XG4gICAgICBpZiAoZGlmZkluZm8gIT0gbnVsbCkge1xuICAgICAgICByZXR1cm4ge2FkZGVkOiBkaWZmSW5mby5hZGRlZCwgZGVsZXRlZDogZGlmZkluZm8uZGVsZXRlZH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNsZWFuU3RhdHM7XG4gIH1cblxuICAvKipcbiAgICogUmVjb21tZW5kZWQgbWV0aG9kIHRvIHVzZSB0byBnZXQgdGhlIGxpbmUgZGlmZnMgb2YgZmlsZXMgaW4gdGhpcyByZXBvLlxuICAgKiBAcGFyYW0gcGF0aCBUaGUgYWJzb2x1dGUgZmlsZSBwYXRoIHRvIGdldCB0aGUgbGluZSBkaWZmcyBmb3IuIElmIHRoZSBwYXRoIFxcXG4gICAqICAgaXMgbm90IGluIHRoZSBwcm9qZWN0LCBhbiBlbXB0eSBBcnJheSB3aWxsIGJlIHJldHVybmVkLlxuICAgKi9cbiAgYXN5bmMgZ2V0TGluZURpZmZzKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogUHJvbWlzZTxBcnJheTxMaW5lRGlmZj4+IHtcbiAgICBjb25zdCBsaW5lRGlmZnMgPSBbXTtcbiAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICByZXR1cm4gbGluZURpZmZzO1xuICAgIH1cblxuICAgIC8vIENoZWNrIHRoZSBjYWNoZS5cbiAgICBjb25zdCBjYWNoZWREaWZmSW5mbyA9IHRoaXMuX2NsaWVudC5faGdEaWZmQ2FjaGVbZmlsZVBhdGhdO1xuICAgIGlmIChjYWNoZWREaWZmSW5mbykge1xuICAgICAgcmV0dXJuIGNhY2hlZERpZmZJbmZvLmxpbmVEaWZmcztcbiAgICB9XG5cbiAgICAvLyBGYWxsIGJhY2sgdG8gYSBmZXRjaC5cbiAgICBjb25zdCBmZXRjaGVkUGF0aFRvRGlmZkluZm8gPSBhd2FpdCB0aGlzLl9jbGllbnQuX3VwZGF0ZURpZmZJbmZvKFtmaWxlUGF0aF0pO1xuICAgIGlmIChmZXRjaGVkUGF0aFRvRGlmZkluZm8gIT0gbnVsbCkge1xuICAgICAgY29uc3QgZGlmZkluZm8gPSBmZXRjaGVkUGF0aFRvRGlmZkluZm8uZ2V0KGZpbGVQYXRoKTtcbiAgICAgIGlmIChkaWZmSW5mbyAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBkaWZmSW5mby5saW5lRGlmZnM7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGxpbmVEaWZmcztcbiAgfVxuXG4gIGlzUGF0aElnbm9yZWQoZmlsZVBhdGg6ID9OdWNsaWRlVXJpKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9jbGllbnQuaXNQYXRoSWdub3JlZChmaWxlUGF0aCkpO1xuICB9XG5cbiAgaXNTdGF0dXNNb2RpZmllZChzdGF0dXM6ID9udW1iZXIpOiBib29sZWFuIHtcbiAgICByZXR1cm4gKFxuICAgICAgc3RhdHVzID09PSBTdGF0dXNDb2RlTnVtYmVyLk1PRElGSUVEIHx8XG4gICAgICBzdGF0dXMgPT09IFN0YXR1c0NvZGVOdW1iZXIuTUlTU0lORyB8fFxuICAgICAgc3RhdHVzID09PSBTdGF0dXNDb2RlTnVtYmVyLlJFTU9WRURcbiAgICApO1xuICB9XG5cbiAgaXNTdGF0dXNOZXcoc3RhdHVzOiA/bnVtYmVyKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIChcbiAgICAgIHN0YXR1cyA9PT0gU3RhdHVzQ29kZU51bWJlci5BRERFRCB8fFxuICAgICAgc3RhdHVzID09PSBTdGF0dXNDb2RlTnVtYmVyLlVOVFJBQ0tFRFxuICAgICk7XG4gIH1cblxuICBvbkRpZENoYW5nZVN0YXR1cyhcbiAgICBjYWxsYmFjazogKGV2ZW50OiB7cGF0aDogc3RyaW5nOyBwYXRoU3RhdHVzOiBTdGF0dXNDb2RlTnVtYmVyVmFsdWV9KSA9PiBtaXhlZCxcbiAgKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9jbGllbnQub25EaWRDaGFuZ2VTdGF0dXMoY2FsbGJhY2spO1xuICB9XG5cbiAgb25EaWRDaGFuZ2VTdGF0dXNlcyhjYWxsYmFjazogKCkgPT4gbWl4ZWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2NsaWVudC5vbkRpZENoYW5nZVN0YXR1c2VzKGNhbGxiYWNrKTtcbiAgfVxuXG59XG4iXX0=