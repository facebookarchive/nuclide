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
    key: 'getType',
    value: function getType() {
      return this._client.getType();
    }
  }, {
    key: 'getWorkingDirectory',
    value: function getWorkingDirectory() {
      return this._client.getWorkingDirectory();
    }
  }, {
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
    key: 'refreshStatus',
    value: _asyncToGenerator(function* () {
      var repoRoot = this._client.getWorkingDirectory();
      var repoProjects = atom.project.getPaths().filter(function (projPath) {
        return projPath.startsWith(repoRoot);
      });
      yield this._client.getStatuses(repoProjects, {
        hgStatusOption: _nuclideHgRepositoryBaseLibHgConstants.HgStatusOption.ONLY_NON_IGNORED
      });
    })

    /**
     * Return relative paths to status code number values object.
     * matching `GitRepositoryAsync` implementation.
     */
  }, {
    key: 'getCachedPathStatuses',
    value: function getCachedPathStatuses() {
      var absoluteCodePaths = this._client.getAllPathStatuses();
      var relativeCodePaths = {};
      for (var absolutePath in absoluteCodePaths) {
        var relativePath = this._client.relativize(absolutePath);
        relativeCodePaths[relativePath] = absoluteCodePaths[absolutePath];
      }
      return relativeCodePaths;
    }
  }, {
    key: 'isPathIgnored',
    value: function isPathIgnored(filePath) {
      return Promise.resolve(this._client.isPathIgnored(filePath));
    }
  }, {
    key: 'isStatusStaged',
    value: function isStatusStaged(status) {
      return false;
    }
  }, {
    key: 'isStatusIgnored',
    value: function isStatusIgnored(status) {
      return status === _nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.IGNORED;
    }
  }, {
    key: 'isStatusModified',
    value: function isStatusModified(status) {
      return status === _nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.MODIFIED;
    }
  }, {
    key: 'isStatusDeleted',
    value: function isStatusDeleted(status) {
      return status === _nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.MISSING || status === _nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.REMOVED;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhnUmVwb3NpdG9yeUNsaWVudEFzeW5jLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztxREFxQk8sbURBQW1EOzs7Ozs7SUFLckMsdUJBQXVCO0FBSS9CLFdBSlEsdUJBQXVCLENBSTlCLE1BQTBCLEVBQUU7MEJBSnJCLHVCQUF1Qjs7QUFLeEMsUUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7R0FDdkI7O2VBTmtCLHVCQUF1Qjs7V0FRbkMsbUJBQVc7QUFDaEIsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQy9COzs7V0FFa0IsK0JBQVc7QUFDNUIsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixFQUFFLENBQUM7S0FDM0M7OztXQUVnQiwyQkFBQyxTQUFpQixFQUFFLE1BQWUsRUFBaUI7QUFDbkUsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQzFEOzs7NkJBRWlCLGFBQW9CO0FBQ3BDLFVBQUksb0JBQW9CLEdBQUcsRUFBRSxDQUFDO0FBQzlCLFVBQUk7QUFDRiw0QkFBb0IsR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLG9CQUFvQixFQUFFLENBQUM7T0FDM0UsQ0FBQyxPQUFPLENBQUMsRUFBRTs7OztPQUlYO0FBQ0QsVUFBSSxvQkFBb0IsS0FBSyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFO0FBQzFELFlBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEdBQUcsb0JBQW9CLENBQUM7OztBQUdyRCxZQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztPQUNuRDtBQUNELGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsSUFBSSxFQUFFLENBQUM7S0FDNUM7OztXQUVrQiw2QkFBQyxRQUFxQixF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bnRBc3luYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge1xuICBMaW5lRGlmZixcbiAgU3RhdHVzQ29kZU51bWJlclZhbHVlLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLXJlcG9zaXRvcnktYmFzZS9saWIvSGdTZXJ2aWNlJztcbmltcG9ydCB0eXBlIHtIZ1JlcG9zaXRvcnlDbGllbnR9IGZyb20gJy4vSGdSZXBvc2l0b3J5Q2xpZW50JztcblxuaW1wb3J0IHtcbiAgU3RhdHVzQ29kZU51bWJlcixcbiAgSGdTdGF0dXNPcHRpb24sXG59IGZyb20gJy4uLy4uL251Y2xpZGUtaGctcmVwb3NpdG9yeS1iYXNlL2xpYi9oZy1jb25zdGFudHMnO1xuXG4vKlxuICogRGVsZWdhdGUgdG8gdGhlIHBhc3NlZCBpbiBIZ1JlcG9zaXRvcnlDbGllbnQuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhnUmVwb3NpdG9yeUNsaWVudEFzeW5jIHtcblxuICBfY2xpZW50OiBIZ1JlcG9zaXRvcnlDbGllbnQ7XG5cbiAgY29uc3RydWN0b3IoY2xpZW50OiBIZ1JlcG9zaXRvcnlDbGllbnQpIHtcbiAgICB0aGlzLl9jbGllbnQgPSBjbGllbnQ7XG4gIH1cblxuICBnZXRUeXBlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2NsaWVudC5nZXRUeXBlKCk7XG4gIH1cblxuICBnZXRXb3JraW5nRGlyZWN0b3J5KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2NsaWVudC5nZXRXb3JraW5nRGlyZWN0b3J5KCk7XG4gIH1cblxuICBjaGVja291dFJlZmVyZW5jZShyZWZlcmVuY2U6IHN0cmluZywgY3JlYXRlOiBib29sZWFuKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuX2NsaWVudC5fc2VydmljZS5jaGVja291dChyZWZlcmVuY2UsIGNyZWF0ZSk7XG4gIH1cblxuICBhc3luYyBnZXRTaG9ydEhlYWQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBsZXQgbmV3bHlGZXRjaGVkQm9va21hcmsgPSAnJztcbiAgICB0cnkge1xuICAgICAgbmV3bHlGZXRjaGVkQm9va21hcmsgPSBhd2FpdCB0aGlzLl9jbGllbnQuX3NlcnZpY2UuZmV0Y2hDdXJyZW50Qm9va21hcmsoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBTdXBwcmVzcyB0aGUgZXJyb3IuIFRoZXJlIGFyZSBsZWdpdGltYXRlIHRpbWVzIHdoZW4gdGhlcmUgbWF5IGJlIG5vXG4gICAgICAvLyBjdXJyZW50IGJvb2ttYXJrLCBzdWNoIGFzIGR1cmluZyBhIHJlYmFzZS4gSW4gdGhpcyBjYXNlLCB3ZSBqdXN0IHdhbnRcbiAgICAgIC8vIHRvIHJldHVybiBhbiBlbXB0eSBzdHJpbmcgaWYgdGhlcmUgaXMgbm8gY3VycmVudCBib29rbWFyay5cbiAgICB9XG4gICAgaWYgKG5ld2x5RmV0Y2hlZEJvb2ttYXJrICE9PSB0aGlzLl9jbGllbnQuX2N1cnJlbnRCb29rbWFyaykge1xuICAgICAgdGhpcy5fY2xpZW50Ll9jdXJyZW50Qm9va21hcmsgPSBuZXdseUZldGNoZWRCb29rbWFyaztcbiAgICAgIC8vIFRoZSBBdG9tIHN0YXR1cy1iYXIgdXNlcyB0aGlzIGFzIGEgc2lnbmFsIHRvIHJlZnJlc2ggdGhlICdzaG9ydEhlYWQnLlxuICAgICAgLy8gVGhlcmUgaXMgY3VycmVudGx5IG5vIGRlZGljYXRlZCAnc2hvcnRIZWFkRGlkQ2hhbmdlJyBldmVudC5cbiAgICAgIHRoaXMuX2NsaWVudC5fZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLXN0YXR1c2VzJyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9jbGllbnQuX2N1cnJlbnRCb29rbWFyayB8fCAnJztcbiAgfVxuXG4gIGdldENhY2hlZFBhdGhTdGF0dXMoZmlsZVBhdGg6ID9OdWNsaWRlVXJpKTogUHJvbWlzZTxTdGF0dXNDb2RlTnVtYmVyVmFsdWU+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2NsaWVudC5nZXRDYWNoZWRQYXRoU3RhdHVzKGZpbGVQYXRoKSk7XG4gIH1cblxuICAvLyBUT0RPIFRoaXMgaXMgYSBzdHViLlxuICBnZXRDYWNoZWRVcHN0cmVhbUFoZWFkQmVoaW5kQ291bnQoXG4gICAgcGF0aDogP051Y2xpZGVVcmlcbiAgKTogUHJvbWlzZTx7YWhlYWQ6IG51bWJlcjsgYmVoaW5kOiBudW1iZXI7fT4ge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fY2xpZW50LmdldENhY2hlZFVwc3RyZWFtQWhlYWRCZWhpbmRDb3VudChwYXRoKSk7XG4gIH1cblxuICBhc3luYyBnZXREaWZmU3RhdHMoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPHthZGRlZDogbnVtYmVyOyBkZWxldGVkOiBudW1iZXI7fT4ge1xuICAgIGNvbnN0IGNsZWFuU3RhdHMgPSB7YWRkZWQ6IDAsIGRlbGV0ZWQ6IDB9O1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybiBjbGVhblN0YXRzO1xuICAgIH1cblxuICAgIC8vIENoZWNrIHRoZSBjYWNoZS5cbiAgICBjb25zdCBjYWNoZWREaWZmSW5mbyA9IHRoaXMuX2NsaWVudC5faGdEaWZmQ2FjaGVbZmlsZVBhdGhdO1xuICAgIGlmIChjYWNoZWREaWZmSW5mbykge1xuICAgICAgcmV0dXJuIHthZGRlZDogY2FjaGVkRGlmZkluZm8uYWRkZWQsIGRlbGV0ZWQ6IGNhY2hlZERpZmZJbmZvLmRlbGV0ZWR9O1xuICAgIH1cblxuICAgIC8vIEZhbGwgYmFjayB0byBhIGZldGNoLlxuICAgIGNvbnN0IGZldGNoZWRQYXRoVG9EaWZmSW5mbyA9IGF3YWl0IHRoaXMuX2NsaWVudC5fdXBkYXRlRGlmZkluZm8oW2ZpbGVQYXRoXSk7XG4gICAgaWYgKGZldGNoZWRQYXRoVG9EaWZmSW5mbykge1xuICAgICAgY29uc3QgZGlmZkluZm8gPSBmZXRjaGVkUGF0aFRvRGlmZkluZm8uZ2V0KGZpbGVQYXRoKTtcbiAgICAgIGlmIChkaWZmSW5mbyAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiB7YWRkZWQ6IGRpZmZJbmZvLmFkZGVkLCBkZWxldGVkOiBkaWZmSW5mby5kZWxldGVkfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY2xlYW5TdGF0cztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWNvbW1lbmRlZCBtZXRob2QgdG8gdXNlIHRvIGdldCB0aGUgbGluZSBkaWZmcyBvZiBmaWxlcyBpbiB0aGlzIHJlcG8uXG4gICAqIEBwYXJhbSBwYXRoIFRoZSBhYnNvbHV0ZSBmaWxlIHBhdGggdG8gZ2V0IHRoZSBsaW5lIGRpZmZzIGZvci4gSWYgdGhlIHBhdGggXFxcbiAgICogICBpcyBub3QgaW4gdGhlIHByb2plY3QsIGFuIGVtcHR5IEFycmF5IHdpbGwgYmUgcmV0dXJuZWQuXG4gICAqL1xuICBhc3luYyBnZXRMaW5lRGlmZnMoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPEFycmF5PExpbmVEaWZmPj4ge1xuICAgIGNvbnN0IGxpbmVEaWZmcyA9IFtdO1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybiBsaW5lRGlmZnM7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgdGhlIGNhY2hlLlxuICAgIGNvbnN0IGNhY2hlZERpZmZJbmZvID0gdGhpcy5fY2xpZW50Ll9oZ0RpZmZDYWNoZVtmaWxlUGF0aF07XG4gICAgaWYgKGNhY2hlZERpZmZJbmZvKSB7XG4gICAgICByZXR1cm4gY2FjaGVkRGlmZkluZm8ubGluZURpZmZzO1xuICAgIH1cblxuICAgIC8vIEZhbGwgYmFjayB0byBhIGZldGNoLlxuICAgIGNvbnN0IGZldGNoZWRQYXRoVG9EaWZmSW5mbyA9IGF3YWl0IHRoaXMuX2NsaWVudC5fdXBkYXRlRGlmZkluZm8oW2ZpbGVQYXRoXSk7XG4gICAgaWYgKGZldGNoZWRQYXRoVG9EaWZmSW5mbyAhPSBudWxsKSB7XG4gICAgICBjb25zdCBkaWZmSW5mbyA9IGZldGNoZWRQYXRoVG9EaWZmSW5mby5nZXQoZmlsZVBhdGgpO1xuICAgICAgaWYgKGRpZmZJbmZvICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGRpZmZJbmZvLmxpbmVEaWZmcztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbGluZURpZmZzO1xuICB9XG5cbiAgYXN5bmMgcmVmcmVzaFN0YXR1cygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCByZXBvUm9vdCA9IHRoaXMuX2NsaWVudC5nZXRXb3JraW5nRGlyZWN0b3J5KCk7XG4gICAgY29uc3QgcmVwb1Byb2plY3RzID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKCkuZmlsdGVyKHByb2pQYXRoID0+IHByb2pQYXRoLnN0YXJ0c1dpdGgocmVwb1Jvb3QpKTtcbiAgICBhd2FpdCB0aGlzLl9jbGllbnQuZ2V0U3RhdHVzZXMocmVwb1Byb2plY3RzLCB7XG4gICAgICBoZ1N0YXR1c09wdGlvbjogSGdTdGF0dXNPcHRpb24uT05MWV9OT05fSUdOT1JFRCxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gcmVsYXRpdmUgcGF0aHMgdG8gc3RhdHVzIGNvZGUgbnVtYmVyIHZhbHVlcyBvYmplY3QuXG4gICAqIG1hdGNoaW5nIGBHaXRSZXBvc2l0b3J5QXN5bmNgIGltcGxlbWVudGF0aW9uLlxuICAgKi9cbiAgZ2V0Q2FjaGVkUGF0aFN0YXR1c2VzKCk6IHtbZmlsZVBhdGg6IHN0cmluZ106IFN0YXR1c0NvZGVOdW1iZXJWYWx1ZX0ge1xuICAgIGNvbnN0IGFic29sdXRlQ29kZVBhdGhzID0gdGhpcy5fY2xpZW50LmdldEFsbFBhdGhTdGF0dXNlcygpO1xuICAgIGNvbnN0IHJlbGF0aXZlQ29kZVBhdGhzID0ge307XG4gICAgZm9yIChjb25zdCBhYnNvbHV0ZVBhdGggaW4gYWJzb2x1dGVDb2RlUGF0aHMpIHtcbiAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IHRoaXMuX2NsaWVudC5yZWxhdGl2aXplKGFic29sdXRlUGF0aCk7XG4gICAgICByZWxhdGl2ZUNvZGVQYXRoc1tyZWxhdGl2ZVBhdGhdID0gYWJzb2x1dGVDb2RlUGF0aHNbYWJzb2x1dGVQYXRoXTtcbiAgICB9XG4gICAgcmV0dXJuIHJlbGF0aXZlQ29kZVBhdGhzO1xuICB9XG5cbiAgaXNQYXRoSWdub3JlZChmaWxlUGF0aDogP051Y2xpZGVVcmkpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2NsaWVudC5pc1BhdGhJZ25vcmVkKGZpbGVQYXRoKSk7XG4gIH1cblxuICBpc1N0YXR1c1N0YWdlZChzdGF0dXM6ID9udW1iZXIpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpc1N0YXR1c0lnbm9yZWQoc3RhdHVzOiA/bnVtYmVyKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHN0YXR1cyA9PT0gU3RhdHVzQ29kZU51bWJlci5JR05PUkVEO1xuICB9XG5cbiAgaXNTdGF0dXNNb2RpZmllZChzdGF0dXM6ID9udW1iZXIpOiBib29sZWFuIHtcbiAgICByZXR1cm4gc3RhdHVzID09PSBTdGF0dXNDb2RlTnVtYmVyLk1PRElGSUVEO1xuICB9XG5cbiAgaXNTdGF0dXNEZWxldGVkKHN0YXR1czogP251bWJlcik6IGJvb2xlYW4ge1xuICAgIHJldHVybiAoXG4gICAgICBzdGF0dXMgPT09IFN0YXR1c0NvZGVOdW1iZXIuTUlTU0lORyB8fFxuICAgICAgc3RhdHVzID09PSBTdGF0dXNDb2RlTnVtYmVyLlJFTU9WRURcbiAgICApO1xuICB9XG5cbiAgaXNTdGF0dXNOZXcoc3RhdHVzOiA/bnVtYmVyKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIChcbiAgICAgIHN0YXR1cyA9PT0gU3RhdHVzQ29kZU51bWJlci5BRERFRCB8fFxuICAgICAgc3RhdHVzID09PSBTdGF0dXNDb2RlTnVtYmVyLlVOVFJBQ0tFRFxuICAgICk7XG4gIH1cblxuICBvbkRpZENoYW5nZVN0YXR1cyhcbiAgICBjYWxsYmFjazogKGV2ZW50OiB7cGF0aDogc3RyaW5nOyBwYXRoU3RhdHVzOiBTdGF0dXNDb2RlTnVtYmVyVmFsdWV9KSA9PiBtaXhlZCxcbiAgKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9jbGllbnQub25EaWRDaGFuZ2VTdGF0dXMoY2FsbGJhY2spO1xuICB9XG5cbiAgb25EaWRDaGFuZ2VTdGF0dXNlcyhjYWxsYmFjazogKCkgPT4gbWl4ZWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2NsaWVudC5vbkRpZENoYW5nZVN0YXR1c2VzKGNhbGxiYWNrKTtcbiAgfVxuXG59XG4iXX0=