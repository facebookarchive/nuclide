var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var getForkBaseName = _asyncToGenerator(function* (directoryPath) {
  var arcConfig = yield (0, _arcanistBase.readArcConfig)(directoryPath);
  if (arcConfig != null) {
    return arcConfig['arc.feature.start.default'] || arcConfig['arc.land.onto.default'];
  }
  return DEFAULT_FORK_BASE_NAME;
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* @providesModule LocalHgServiceBase */

var _hgConstants = require('./hg-constants');

var _rx = require('rx');

var _hgBlameOutputParser = require('./hg-blame-output-parser');

var _hgDiffOutputParser = require('./hg-diff-output-parser');

var _hgRevisionExpressionHelpers = require('./hg-revision-expression-helpers');

var _hgRevisionStateHelpers = require('./hg-revision-state-helpers');

var _commons = require('../../commons');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _arcanistBase = require('../../arcanist-base');

var DEFAULT_FORK_BASE_NAME = 'default';

var logger = undefined;
function getLogger() {
  if (!logger) {
    logger = require('../../logging').getLogger();
  }
  return logger;
}

var HgServiceBase = (function () {
  function HgServiceBase(workingDirectory) {
    _classCallCheck(this, HgServiceBase);

    this._workingDirectory = workingDirectory;
    this._filesDidChangeObserver = new _rx.Subject();
    this._hgIgnoreFileDidChangeObserver = new _rx.Subject();
    this._hgRepoStateDidChangeObserver = new _rx.Subject();
    this._hgBookmarkDidChangeObserver = new _rx.Subject();
  }

  _createClass(HgServiceBase, [{
    key: 'dispose',
    value: _asyncToGenerator(function* () {
      this._filesDidChangeObserver.onCompleted();
      this._hgIgnoreFileDidChangeObserver.onCompleted();
      this._hgRepoStateDidChangeObserver.onCompleted();
      this._hgBookmarkDidChangeObserver.onCompleted();
    })
  }, {
    key: 'getWorkingDirectory',
    value: function getWorkingDirectory() {
      return this._workingDirectory;
    }

    /**
     * See HgService::fetchStatuses for details.
     */
  }, {
    key: 'fetchStatuses',
    value: _asyncToGenerator(function* (filePaths, options) {
      var _this = this;

      var statusMap = new Map();

      var args = ['status', '-Tjson'];
      if (options && 'hgStatusOption' in options) {
        if (options.hgStatusOption === _hgConstants.HgStatusOption.ONLY_IGNORED) {
          args.push('--ignored');
        } else if (options.hgStatusOption === _hgConstants.HgStatusOption.ALL_STATUSES) {
          args.push('--all');
        }
      }
      args = args.concat(filePaths);
      var execOptions = {
        cwd: this.getWorkingDirectory()
      };
      var output = undefined;
      try {
        output = yield this._hgAsyncExecute(args, execOptions);
      } catch (e) {
        return statusMap;
      }

      var statuses = JSON.parse(output.stdout);
      statuses.forEach(function (status) {
        statusMap.set(_this._absolutize(status.path), status.status);
      });
      return statusMap;
    })

    // Mercurial returns all paths relative to the repository's working directory.
    // This method transforms a path relative to the working direcotry into an
    // absolute path.
  }, {
    key: '_absolutize',
    value: function _absolutize(pathRelativeToWorkingDirectory) {
      return _path2['default'].join(this._workingDirectory, pathRelativeToWorkingDirectory);
    }

    /**
     * See HgService.def::observeFilesDidChange for details.
     */
  }, {
    key: 'observeFilesDidChange',
    value: function observeFilesDidChange() {
      return this._filesDidChangeObserver;
    }

    /**
     * See HgService.def::observeHgIgnoreFileDidChange for details.
     */
  }, {
    key: 'observeHgIgnoreFileDidChange',
    value: function observeHgIgnoreFileDidChange() {
      return this._hgIgnoreFileDidChangeObserver;
    }

    /**
     * See HgService.def::observeHgRepoStateDidChange for details.
     */
  }, {
    key: 'observeHgRepoStateDidChange',
    value: function observeHgRepoStateDidChange() {
      return this._hgRepoStateDidChangeObserver;
    }

    /**
     * See HgService.def::fetchDiffInfoForPaths for details.
     */
  }, {
    key: 'fetchDiffInfo',
    value: _asyncToGenerator(function* (filePaths) {
      // '--unified 0' gives us 0 lines of context around each change (we don't
      // care about the context).
      // '--noprefix' omits the a/ and b/ prefixes from filenames.
      var args = ['diff', '--unified', '0', '--noprefix'].concat(filePaths);
      var options = {
        cwd: this.getWorkingDirectory()
      };
      var output = undefined;
      try {
        output = yield this._hgAsyncExecute(args, options);
      } catch (e) {
        getLogger().error('Error when running hg diff for paths: ' + filePaths + ' \n\tError: ' + e.stderr);
        return null;
      }
      var pathToDiffInfo = (0, _hgDiffOutputParser.parseMultiFileHgDiffUnifiedOutput)(output.stdout);
      var absolutePathToDiffInfo = new Map();
      for (var _ref3 of pathToDiffInfo) {
        var _ref2 = _slicedToArray(_ref3, 2);

        var filePath = _ref2[0];
        var diffInfo = _ref2[1];

        absolutePathToDiffInfo.set(this._absolutize(filePath), diffInfo);
      }
      return absolutePathToDiffInfo;
    })

    /**
     * Calls out to asyncExecute using the 'hg' command.
     * @param options as specified by http://nodejs.org/api/child_process.html. Additional options:
     *   - NO_HGPLAIN set if the $HGPLAIN environment variable should not be used.
     *   - TTY_OUTPUT set if the command should be run as if it were attached to a tty.
     */
  }, {
    key: '_hgAsyncExecute',
    value: _asyncToGenerator(function* (args, options) {
      if (!options['NO_HGPLAIN']) {
        // Setting HGPLAIN=1 overrides any custom aliases a user has defined.
        if (options.env) {
          options.env['HGPLAIN'] = 1;
        } else {
          var assign = require('../../commons').object.assign;

          var env = { 'HGPLAIN': 1 };
          assign(env, process.env);
          options.env = env;
        }
      }

      var cmd = undefined;
      if (options['TTY_OUTPUT']) {
        cmd = 'script';
        args = (0, _commons.createArgsForScriptCommand)('hg', args);
      } else {
        cmd = 'hg';
      }
      try {
        return yield (0, _commons.asyncExecute)(cmd, args, options);
      } catch (e) {
        getLogger().error('Error executing hg command: ' + JSON.stringify(args) + ' ' + ('options: ' + JSON.stringify(options) + ' ' + JSON.stringify(e)));
        throw e;
      }
    })
  }, {
    key: 'fetchCurrentBookmark',
    value: function fetchCurrentBookmark() {
      var _require = require('./hg-bookmark-helpers');

      var fetchCurrentBookmark = _require.fetchCurrentBookmark;

      return fetchCurrentBookmark(_path2['default'].join(this._workingDirectory, '.hg'));
    }

    /**
     * See HgService:.def:observeHgBookmarkDidChange for details.
     */
  }, {
    key: 'observeHgBookmarkDidChange',
    value: function observeHgBookmarkDidChange() {
      return this._hgBookmarkDidChangeObserver;
    }

    /**
     * Section: Repository State at Specific Revisions
     */

  }, {
    key: 'fetchFileContentAtRevision',
    value: function fetchFileContentAtRevision(filePath, revision) {
      return (0, _hgRevisionStateHelpers.fetchFileContentAtRevision)(filePath, revision, this._workingDirectory);
    }
  }, {
    key: 'fetchFilesChangedAtRevision',
    value: function fetchFilesChangedAtRevision(revision) {
      return (0, _hgRevisionStateHelpers.fetchFilesChangedAtRevision)(revision, this._workingDirectory);
    }
  }, {
    key: 'fetchRevisionInfoBetweenHeadAndBase',
    value: _asyncToGenerator(function* () {
      var fokBaseName = yield getForkBaseName(this._workingDirectory);
      var commonAncestorRevision = yield (0, _hgRevisionExpressionHelpers.fetchCommonAncestorOfHeadAndRevision)(fokBaseName, this._workingDirectory);
      if (!commonAncestorRevision) {
        return null;
      }
      var revisionsInfo = yield (0, _hgRevisionExpressionHelpers.fetchRevisionInfoBetweenRevisions)(commonAncestorRevision, (0, _hgRevisionExpressionHelpers.expressionForRevisionsBeforeHead)(0), this._workingDirectory);
      return revisionsInfo;
    })
  }, {
    key: 'getBlameAtHead',
    value: _asyncToGenerator(function* (filePath) {
      var args = ['blame', '-r', 'wdir()', '-Tjson', '--changeset', '--user', '--line-number', filePath];
      var execOptions = {
        cwd: this.getWorkingDirectory()
      };
      var output = undefined;
      try {
        output = yield this._hgAsyncExecute(args, execOptions);
      } catch (e) {
        getLogger().error('LocalHgServiceBase failed to fetch blame for file: ' + filePath + '. Error: ' + e.stderr);
        throw e;
      }
      return (0, _hgBlameOutputParser.parseHgBlameOutput)(output.stdout);
    })

    /**
     * This implementation relies on the "phabdiff" template being available as defined in:
     * https://bitbucket.org/facebook/hg-experimental/src/fbf23b3f96bade5986121a7c57d7400585d75f54/phabdiff.py.
     */
  }, {
    key: 'getDifferentialRevisionForChangeSetId',
    value: _asyncToGenerator(function* (changeSetId) {
      var args = ['log', '-T', '{phabdiff}\n', '--limit', '1', '--rev', changeSetId];
      var execOptions = {
        cwd: this.getWorkingDirectory()
      };
      try {
        var output = yield this._hgAsyncExecute(args, execOptions);
        var stdout = output.stdout.trim();
        return stdout ? stdout : null;
      } catch (e) {
        // This should not happen: `hg log` does not error even if it does not recognize the template.
        getLogger().error('Failed when trying to get differential revision for: ' + changeSetId);
        return null;
      }
    })

    // TODO (chenshen) The return type should be `AsyncExecuteRet` inf `HgService.def`, but flow
    // doesn't allow importing `.def` file unless we merge `HgService.def` to this file.
  }, {
    key: 'getSmartlog',
    value: _asyncToGenerator(function* (ttyOutput, concise) {
      // disable the pager extension so that 'hg sl' terminates. We can't just use
      // HGPLAIN because we have not found a way to get colored output when we do.
      var args = ['--config', 'extensions.pager=!', concise ? 'sl' : 'smartlog'];
      var execOptions = {
        cwd: this.getWorkingDirectory(),
        NO_HGPLAIN: concise, // `hg sl` is likely user-defined.
        TTY_OUTPUT: ttyOutput
      };
      return yield this._hgAsyncExecute(args, execOptions);
    })
  }, {
    key: 'checkout',
    value: _asyncToGenerator(function* (revision, create) {
      var options = {
        cwd: this.getWorkingDirectory()
      };
      try {
        yield this._hgAsyncExecute(['checkout', revision], options);
      } catch (e) {
        return false;
      }
      return true;
    })
  }]);

  return HgServiceBase;
})();

module.exports = HgServiceBase;
//# sourceMappingURL=data:application/json;base64,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LENBQUM7T0FDL0IsQ0FBQyxPQUFPLENBQUMsRUFBRTs7QUFFVixpQkFBUyxFQUFFLENBQUMsS0FBSywyREFBeUQsV0FBVyxDQUFHLENBQUM7QUFDekYsZUFBTyxJQUFJLENBQUM7T0FDYjtLQUNGOzs7Ozs7NkJBSWdCLFdBQUMsU0FBa0IsRUFBRSxPQUFnQixFQUFtQjs7O0FBR3ZFLFVBQU0sSUFBSSxHQUFHLENBQUMsVUFBVSxFQUFFLG9CQUFvQixFQUFFLE9BQU8sR0FBRyxJQUFJLEdBQUcsVUFBVSxDQUFDLENBQUM7QUFDN0UsVUFBTSxXQUFXLEdBQUc7QUFDbEIsV0FBRyxFQUFFLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtBQUMvQixrQkFBVSxFQUFFLE9BQU87QUFDbkIsa0JBQVUsRUFBRSxTQUFTO09BQ3RCLENBQUM7QUFDRixhQUFPLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUM7S0FDdEQ7Ozs2QkFFYSxXQUFDLFFBQWdCLEVBQUUsTUFBZSxFQUFvQjtBQUNsRSxVQUFNLE9BQU8sR0FBRztBQUNkLFdBQUcsRUFBRSxJQUFJLENBQUMsbUJBQW1CLEVBQUU7T0FDaEMsQ0FBQztBQUNGLFVBQUk7QUFDRixjQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7T0FDN0QsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLGVBQU8sS0FBSyxDQUFDO09BQ2Q7QUFDRCxhQUFPLElBQUksQ0FBQztLQUNiOzs7U0FoUUcsYUFBYTs7O0FBb1FuQixNQUFNLENBQUMsT0FBTyxHQUFHLGFBQWEsQ0FBQyIsImZpbGUiOiJIZ1NlcnZpY2VCYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuLyogQHByb3ZpZGVzTW9kdWxlIExvY2FsSGdTZXJ2aWNlQmFzZSAqL1xuXG5pbXBvcnQge0hnU3RhdHVzT3B0aW9ufSBmcm9tICcuL2hnLWNvbnN0YW50cyc7XG5pbXBvcnQge09ic2VydmFibGUsIFN1YmplY3R9IGZyb20gJ3J4JztcbmltcG9ydCB7cGFyc2VIZ0JsYW1lT3V0cHV0fSBmcm9tICcuL2hnLWJsYW1lLW91dHB1dC1wYXJzZXInO1xuaW1wb3J0IHtwYXJzZU11bHRpRmlsZUhnRGlmZlVuaWZpZWRPdXRwdXR9IGZyb20gJy4vaGctZGlmZi1vdXRwdXQtcGFyc2VyJztcbmltcG9ydCB7XG4gIGZldGNoQ29tbW9uQW5jZXN0b3JPZkhlYWRBbmRSZXZpc2lvbixcbiAgZXhwcmVzc2lvbkZvclJldmlzaW9uc0JlZm9yZUhlYWQsXG4gIGZldGNoUmV2aXNpb25JbmZvQmV0d2VlblJldmlzaW9ucyxcbn0gZnJvbSAnLi9oZy1yZXZpc2lvbi1leHByZXNzaW9uLWhlbHBlcnMnO1xuaW1wb3J0IHtcbiAgZmV0Y2hGaWxlQ29udGVudEF0UmV2aXNpb24sXG4gIGZldGNoRmlsZXNDaGFuZ2VkQXRSZXZpc2lvbixcbn0gZnJvbSAnLi9oZy1yZXZpc2lvbi1zdGF0ZS1oZWxwZXJzJztcbmltcG9ydCB7YXN5bmNFeGVjdXRlLCBjcmVhdGVBcmdzRm9yU2NyaXB0Q29tbWFuZH0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuaW1wb3J0IHR5cGUge0RpZmZJbmZvLCBSZXZpc2lvbkZpbGVDaGFuZ2VzLCBTdGF0dXNDb2RlSWRWYWx1ZSwgUmV2aXNpb25JbmZvfSBmcm9tICcuL2hnLWNvbnN0YW50cyc7XG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5cbmltcG9ydCB7cmVhZEFyY0NvbmZpZ30gZnJvbSAnLi4vLi4vYXJjYW5pc3QtYmFzZSc7XG5cbmNvbnN0IERFRkFVTFRfRk9SS19CQVNFX05BTUUgPSAnZGVmYXVsdCc7XG5cbmxldCBsb2dnZXI7XG5mdW5jdGlvbiBnZXRMb2dnZXIoKSB7XG4gIGlmICghbG9nZ2VyKSB7XG4gICAgbG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vbG9nZ2luZycpLmdldExvZ2dlcigpO1xuICB9XG4gIHJldHVybiBsb2dnZXI7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldEZvcmtCYXNlTmFtZShkaXJlY3RvcnlQYXRoOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICBjb25zdCBhcmNDb25maWcgPSBhd2FpdCByZWFkQXJjQ29uZmlnKGRpcmVjdG9yeVBhdGgpO1xuICBpZiAoYXJjQ29uZmlnICE9IG51bGwpIHtcbiAgICByZXR1cm4gYXJjQ29uZmlnWydhcmMuZmVhdHVyZS5zdGFydC5kZWZhdWx0J10gfHwgYXJjQ29uZmlnWydhcmMubGFuZC5vbnRvLmRlZmF1bHQnXTtcbiAgfVxuICByZXR1cm4gREVGQVVMVF9GT1JLX0JBU0VfTkFNRTtcbn1cblxuY2xhc3MgSGdTZXJ2aWNlQmFzZSB7XG4gIF93b3JraW5nRGlyZWN0b3J5OiBzdHJpbmc7XG4gIF9maWxlc0RpZENoYW5nZU9ic2VydmVyOiBTdWJqZWN0O1xuICBfaGdJZ25vcmVGaWxlRGlkQ2hhbmdlT2JzZXJ2ZXI6IFN1YmplY3Q7XG4gIF9oZ1JlcG9TdGF0ZURpZENoYW5nZU9ic2VydmVyOiBTdWJqZWN0O1xuICBfaGdCb29rbWFya0RpZENoYW5nZU9ic2VydmVyOiBTdWJqZWN0O1xuXG4gIGNvbnN0cnVjdG9yKHdvcmtpbmdEaXJlY3Rvcnk6IHN0cmluZykge1xuICAgIHRoaXMuX3dvcmtpbmdEaXJlY3RvcnkgPSB3b3JraW5nRGlyZWN0b3J5O1xuICAgIHRoaXMuX2ZpbGVzRGlkQ2hhbmdlT2JzZXJ2ZXIgPSBuZXcgU3ViamVjdCgpO1xuICAgIHRoaXMuX2hnSWdub3JlRmlsZURpZENoYW5nZU9ic2VydmVyID0gbmV3IFN1YmplY3QoKTtcbiAgICB0aGlzLl9oZ1JlcG9TdGF0ZURpZENoYW5nZU9ic2VydmVyID0gbmV3IFN1YmplY3QoKTtcbiAgICB0aGlzLl9oZ0Jvb2ttYXJrRGlkQ2hhbmdlT2JzZXJ2ZXIgPSBuZXcgU3ViamVjdCgpO1xuICB9XG5cbiAgYXN5bmMgZGlzcG9zZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLl9maWxlc0RpZENoYW5nZU9ic2VydmVyLm9uQ29tcGxldGVkKCk7XG4gICAgdGhpcy5faGdJZ25vcmVGaWxlRGlkQ2hhbmdlT2JzZXJ2ZXIub25Db21wbGV0ZWQoKTtcbiAgICB0aGlzLl9oZ1JlcG9TdGF0ZURpZENoYW5nZU9ic2VydmVyLm9uQ29tcGxldGVkKCk7XG4gICAgdGhpcy5faGdCb29rbWFya0RpZENoYW5nZU9ic2VydmVyLm9uQ29tcGxldGVkKCk7XG4gIH1cblxuICBnZXRXb3JraW5nRGlyZWN0b3J5KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3dvcmtpbmdEaXJlY3Rvcnk7XG4gIH1cblxuICAvKipcbiAgICogU2VlIEhnU2VydmljZTo6ZmV0Y2hTdGF0dXNlcyBmb3IgZGV0YWlscy5cbiAgICovXG4gIGFzeW5jIGZldGNoU3RhdHVzZXMoXG4gICAgZmlsZVBhdGhzOiBBcnJheTxzdHJpbmc+LFxuICAgIG9wdGlvbnM6ID9hbnlcbiAgKTogUHJvbWlzZTxNYXA8c3RyaW5nLCBTdGF0dXNDb2RlSWRWYWx1ZT4+IHtcbiAgICBjb25zdCBzdGF0dXNNYXAgPSBuZXcgTWFwKCk7XG5cbiAgICBsZXQgYXJncyA9IFsnc3RhdHVzJywgJy1UanNvbiddO1xuICAgIGlmIChvcHRpb25zICYmICgnaGdTdGF0dXNPcHRpb24nIGluIG9wdGlvbnMpKSB7XG4gICAgICBpZiAob3B0aW9ucy5oZ1N0YXR1c09wdGlvbiA9PT0gSGdTdGF0dXNPcHRpb24uT05MWV9JR05PUkVEKSB7XG4gICAgICAgIGFyZ3MucHVzaCgnLS1pZ25vcmVkJyk7XG4gICAgICB9IGVsc2UgaWYgKG9wdGlvbnMuaGdTdGF0dXNPcHRpb24gPT09IEhnU3RhdHVzT3B0aW9uLkFMTF9TVEFUVVNFUykge1xuICAgICAgICBhcmdzLnB1c2goJy0tYWxsJyk7XG4gICAgICB9XG4gICAgfVxuICAgIGFyZ3MgPSBhcmdzLmNvbmNhdChmaWxlUGF0aHMpO1xuICAgIGNvbnN0IGV4ZWNPcHRpb25zID0ge1xuICAgICAgY3dkOiB0aGlzLmdldFdvcmtpbmdEaXJlY3RvcnkoKSxcbiAgICB9O1xuICAgIGxldCBvdXRwdXQ7XG4gICAgdHJ5IHtcbiAgICAgIG91dHB1dCA9IGF3YWl0IHRoaXMuX2hnQXN5bmNFeGVjdXRlKGFyZ3MsIGV4ZWNPcHRpb25zKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gc3RhdHVzTWFwO1xuICAgIH1cblxuICAgIGNvbnN0IHN0YXR1c2VzID0gSlNPTi5wYXJzZShvdXRwdXQuc3Rkb3V0KTtcbiAgICBzdGF0dXNlcy5mb3JFYWNoKChzdGF0dXMpID0+IHtcbiAgICAgIHN0YXR1c01hcC5zZXQodGhpcy5fYWJzb2x1dGl6ZShzdGF0dXMucGF0aCksIHN0YXR1cy5zdGF0dXMpO1xuICAgIH0pO1xuICAgIHJldHVybiBzdGF0dXNNYXA7XG4gIH1cblxuICAvLyBNZXJjdXJpYWwgcmV0dXJucyBhbGwgcGF0aHMgcmVsYXRpdmUgdG8gdGhlIHJlcG9zaXRvcnkncyB3b3JraW5nIGRpcmVjdG9yeS5cbiAgLy8gVGhpcyBtZXRob2QgdHJhbnNmb3JtcyBhIHBhdGggcmVsYXRpdmUgdG8gdGhlIHdvcmtpbmcgZGlyZWNvdHJ5IGludG8gYW5cbiAgLy8gYWJzb2x1dGUgcGF0aC5cbiAgX2Fic29sdXRpemUocGF0aFJlbGF0aXZlVG9Xb3JraW5nRGlyZWN0b3J5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBwYXRoLmpvaW4odGhpcy5fd29ya2luZ0RpcmVjdG9yeSwgcGF0aFJlbGF0aXZlVG9Xb3JraW5nRGlyZWN0b3J5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgSGdTZXJ2aWNlLmRlZjo6b2JzZXJ2ZUZpbGVzRGlkQ2hhbmdlIGZvciBkZXRhaWxzLlxuICAgKi9cbiAgb2JzZXJ2ZUZpbGVzRGlkQ2hhbmdlKCk6IE9ic2VydmFibGU8QXJyYXk8TnVjbGlkZVVyaT4+IHtcbiAgICByZXR1cm4gdGhpcy5fZmlsZXNEaWRDaGFuZ2VPYnNlcnZlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgSGdTZXJ2aWNlLmRlZjo6b2JzZXJ2ZUhnSWdub3JlRmlsZURpZENoYW5nZSBmb3IgZGV0YWlscy5cbiAgICovXG4gIG9ic2VydmVIZ0lnbm9yZUZpbGVEaWRDaGFuZ2UoKTogT2JzZXJ2YWJsZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuX2hnSWdub3JlRmlsZURpZENoYW5nZU9ic2VydmVyO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBIZ1NlcnZpY2UuZGVmOjpvYnNlcnZlSGdSZXBvU3RhdGVEaWRDaGFuZ2UgZm9yIGRldGFpbHMuXG4gICAqL1xuICBvYnNlcnZlSGdSZXBvU3RhdGVEaWRDaGFuZ2UoKTogT2JzZXJ2YWJsZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuX2hnUmVwb1N0YXRlRGlkQ2hhbmdlT2JzZXJ2ZXI7XG4gIH1cblxuICAvKipcbiAgICogU2VlIEhnU2VydmljZS5kZWY6OmZldGNoRGlmZkluZm9Gb3JQYXRocyBmb3IgZGV0YWlscy5cbiAgICovXG4gIGFzeW5jIGZldGNoRGlmZkluZm8oXG4gICAgZmlsZVBhdGhzOiBBcnJheTxOdWNsaWRlVXJpPixcbiAgKTogUHJvbWlzZTw/TWFwPE51Y2xpZGVVcmksIERpZmZJbmZvPj5cbiAge1xuICAgIC8vICctLXVuaWZpZWQgMCcgZ2l2ZXMgdXMgMCBsaW5lcyBvZiBjb250ZXh0IGFyb3VuZCBlYWNoIGNoYW5nZSAod2UgZG9uJ3RcbiAgICAvLyBjYXJlIGFib3V0IHRoZSBjb250ZXh0KS5cbiAgICAvLyAnLS1ub3ByZWZpeCcgb21pdHMgdGhlIGEvIGFuZCBiLyBwcmVmaXhlcyBmcm9tIGZpbGVuYW1lcy5cbiAgICBjb25zdCBhcmdzID0gWydkaWZmJywgJy0tdW5pZmllZCcsICcwJywgJy0tbm9wcmVmaXgnXS5jb25jYXQoZmlsZVBhdGhzKTtcbiAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgY3dkOiB0aGlzLmdldFdvcmtpbmdEaXJlY3RvcnkoKSxcbiAgICB9O1xuICAgIGxldCBvdXRwdXQ7XG4gICAgdHJ5IHtcbiAgICAgIG91dHB1dCA9IGF3YWl0IHRoaXMuX2hnQXN5bmNFeGVjdXRlKGFyZ3MsIG9wdGlvbnMpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGdldExvZ2dlcigpLmVycm9yKFxuICAgICAgICAgIGBFcnJvciB3aGVuIHJ1bm5pbmcgaGcgZGlmZiBmb3IgcGF0aHM6ICR7ZmlsZVBhdGhzfSBcXG5cXHRFcnJvcjogJHtlLnN0ZGVycn1gKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBwYXRoVG9EaWZmSW5mbyA9IHBhcnNlTXVsdGlGaWxlSGdEaWZmVW5pZmllZE91dHB1dChvdXRwdXQuc3Rkb3V0KTtcbiAgICBjb25zdCBhYnNvbHV0ZVBhdGhUb0RpZmZJbmZvID0gbmV3IE1hcCgpO1xuICAgIGZvciAoY29uc3QgW2ZpbGVQYXRoLCBkaWZmSW5mb10gb2YgcGF0aFRvRGlmZkluZm8pIHtcbiAgICAgIGFic29sdXRlUGF0aFRvRGlmZkluZm8uc2V0KHRoaXMuX2Fic29sdXRpemUoZmlsZVBhdGgpLCBkaWZmSW5mbyk7XG4gICAgfVxuICAgIHJldHVybiBhYnNvbHV0ZVBhdGhUb0RpZmZJbmZvO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxzIG91dCB0byBhc3luY0V4ZWN1dGUgdXNpbmcgdGhlICdoZycgY29tbWFuZC5cbiAgICogQHBhcmFtIG9wdGlvbnMgYXMgc3BlY2lmaWVkIGJ5IGh0dHA6Ly9ub2RlanMub3JnL2FwaS9jaGlsZF9wcm9jZXNzLmh0bWwuIEFkZGl0aW9uYWwgb3B0aW9uczpcbiAgICogICAtIE5PX0hHUExBSU4gc2V0IGlmIHRoZSAkSEdQTEFJTiBlbnZpcm9ubWVudCB2YXJpYWJsZSBzaG91bGQgbm90IGJlIHVzZWQuXG4gICAqICAgLSBUVFlfT1VUUFVUIHNldCBpZiB0aGUgY29tbWFuZCBzaG91bGQgYmUgcnVuIGFzIGlmIGl0IHdlcmUgYXR0YWNoZWQgdG8gYSB0dHkuXG4gICAqL1xuICBhc3luYyBfaGdBc3luY0V4ZWN1dGUoYXJnczogQXJyYXk8c3RyaW5nPiwgb3B0aW9uczogYW55KTogUHJvbWlzZTxhbnk+IHtcbiAgICBpZiAoIW9wdGlvbnNbJ05PX0hHUExBSU4nXSkge1xuICAgICAgLy8gU2V0dGluZyBIR1BMQUlOPTEgb3ZlcnJpZGVzIGFueSBjdXN0b20gYWxpYXNlcyBhIHVzZXIgaGFzIGRlZmluZWQuXG4gICAgICBpZiAob3B0aW9ucy5lbnYpIHtcbiAgICAgICAgb3B0aW9ucy5lbnZbJ0hHUExBSU4nXSA9IDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCB7YXNzaWdufSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbnMnKS5vYmplY3Q7XG4gICAgICAgIGNvbnN0IGVudiA9IHsnSEdQTEFJTic6IDF9O1xuICAgICAgICBhc3NpZ24oZW52LCBwcm9jZXNzLmVudik7XG4gICAgICAgIG9wdGlvbnMuZW52ID0gZW52O1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBjbWQ7XG4gICAgaWYgKG9wdGlvbnNbJ1RUWV9PVVRQVVQnXSkge1xuICAgICAgY21kID0gJ3NjcmlwdCc7XG4gICAgICBhcmdzID0gY3JlYXRlQXJnc0ZvclNjcmlwdENvbW1hbmQoJ2hnJywgYXJncyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNtZCA9ICdoZyc7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gYXdhaXQgYXN5bmNFeGVjdXRlKGNtZCwgYXJncywgb3B0aW9ucyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgZ2V0TG9nZ2VyKCkuZXJyb3IoYEVycm9yIGV4ZWN1dGluZyBoZyBjb21tYW5kOiAke0pTT04uc3RyaW5naWZ5KGFyZ3MpfSBgICtcbiAgICAgICAgICBgb3B0aW9uczogJHtKU09OLnN0cmluZ2lmeShvcHRpb25zKX0gJHtKU09OLnN0cmluZ2lmeShlKX1gKTtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgZmV0Y2hDdXJyZW50Qm9va21hcmsoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCB7ZmV0Y2hDdXJyZW50Qm9va21hcmt9ID0gcmVxdWlyZSgnLi9oZy1ib29rbWFyay1oZWxwZXJzJyk7XG4gICAgcmV0dXJuIGZldGNoQ3VycmVudEJvb2ttYXJrKHBhdGguam9pbih0aGlzLl93b3JraW5nRGlyZWN0b3J5LCAnLmhnJykpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBIZ1NlcnZpY2U6LmRlZjpvYnNlcnZlSGdCb29rbWFya0RpZENoYW5nZSBmb3IgZGV0YWlscy5cbiAgICovXG4gIG9ic2VydmVIZ0Jvb2ttYXJrRGlkQ2hhbmdlKCk6IE9ic2VydmFibGU8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLl9oZ0Jvb2ttYXJrRGlkQ2hhbmdlT2JzZXJ2ZXI7XG4gIH1cblxuICAvKipcbiAgICogU2VjdGlvbjogUmVwb3NpdG9yeSBTdGF0ZSBhdCBTcGVjaWZpYyBSZXZpc2lvbnNcbiAgICovXG5cbiAgZmV0Y2hGaWxlQ29udGVudEF0UmV2aXNpb24oZmlsZVBhdGg6IE51Y2xpZGVVcmksIHJldmlzaW9uOiA/c3RyaW5nKTogUHJvbWlzZTw/c3RyaW5nPiB7XG4gICAgcmV0dXJuIGZldGNoRmlsZUNvbnRlbnRBdFJldmlzaW9uKGZpbGVQYXRoLCByZXZpc2lvbiwgdGhpcy5fd29ya2luZ0RpcmVjdG9yeSk7XG4gIH1cblxuICBmZXRjaEZpbGVzQ2hhbmdlZEF0UmV2aXNpb24ocmV2aXNpb246IHN0cmluZyk6IFByb21pc2U8P1JldmlzaW9uRmlsZUNoYW5nZXM+IHtcbiAgICByZXR1cm4gZmV0Y2hGaWxlc0NoYW5nZWRBdFJldmlzaW9uKHJldmlzaW9uLCB0aGlzLl93b3JraW5nRGlyZWN0b3J5KTtcbiAgfVxuXG4gIGFzeW5jIGZldGNoUmV2aXNpb25JbmZvQmV0d2VlbkhlYWRBbmRCYXNlKCk6IFByb21pc2U8P0FycmF5PFJldmlzaW9uSW5mbz4+IHtcbiAgICBjb25zdCBmb2tCYXNlTmFtZSA9IGF3YWl0IGdldEZvcmtCYXNlTmFtZSh0aGlzLl93b3JraW5nRGlyZWN0b3J5KTtcbiAgICBjb25zdCBjb21tb25BbmNlc3RvclJldmlzaW9uID0gYXdhaXQgZmV0Y2hDb21tb25BbmNlc3Rvck9mSGVhZEFuZFJldmlzaW9uKFxuICAgICAgZm9rQmFzZU5hbWUsXG4gICAgICB0aGlzLl93b3JraW5nRGlyZWN0b3J5LFxuICAgICk7XG4gICAgaWYgKCFjb21tb25BbmNlc3RvclJldmlzaW9uKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgcmV2aXNpb25zSW5mbyA9IGF3YWl0IGZldGNoUmV2aXNpb25JbmZvQmV0d2VlblJldmlzaW9ucyhcbiAgICAgIGNvbW1vbkFuY2VzdG9yUmV2aXNpb24sXG4gICAgICBleHByZXNzaW9uRm9yUmV2aXNpb25zQmVmb3JlSGVhZCgwKSxcbiAgICAgIHRoaXMuX3dvcmtpbmdEaXJlY3RvcnksXG4gICAgKTtcbiAgICByZXR1cm4gcmV2aXNpb25zSW5mbztcbiAgfVxuXG4gIGFzeW5jIGdldEJsYW1lQXRIZWFkKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogUHJvbWlzZTxNYXA8c3RyaW5nLCBzdHJpbmc+PiB7XG4gICAgY29uc3QgYXJncyA9XG4gICAgICBbJ2JsYW1lJywgJy1yJywgJ3dkaXIoKScsICctVGpzb24nLCAnLS1jaGFuZ2VzZXQnLCAnLS11c2VyJywgJy0tbGluZS1udW1iZXInLCBmaWxlUGF0aF07XG4gICAgY29uc3QgZXhlY09wdGlvbnMgPSB7XG4gICAgICBjd2Q6IHRoaXMuZ2V0V29ya2luZ0RpcmVjdG9yeSgpLFxuICAgIH07XG4gICAgbGV0IG91dHB1dDtcbiAgICB0cnkge1xuICAgICAgb3V0cHV0ID0gYXdhaXQgdGhpcy5faGdBc3luY0V4ZWN1dGUoYXJncywgZXhlY09wdGlvbnMpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGdldExvZ2dlcigpLmVycm9yKFxuICAgICAgICAgIGBMb2NhbEhnU2VydmljZUJhc2UgZmFpbGVkIHRvIGZldGNoIGJsYW1lIGZvciBmaWxlOiAke2ZpbGVQYXRofS4gRXJyb3I6ICR7ZS5zdGRlcnJ9YCk7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgICByZXR1cm4gcGFyc2VIZ0JsYW1lT3V0cHV0KG91dHB1dC5zdGRvdXQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgaW1wbGVtZW50YXRpb24gcmVsaWVzIG9uIHRoZSBcInBoYWJkaWZmXCIgdGVtcGxhdGUgYmVpbmcgYXZhaWxhYmxlIGFzIGRlZmluZWQgaW46XG4gICAqIGh0dHBzOi8vYml0YnVja2V0Lm9yZy9mYWNlYm9vay9oZy1leHBlcmltZW50YWwvc3JjL2ZiZjIzYjNmOTZiYWRlNTk4NjEyMWE3YzU3ZDc0MDA1ODVkNzVmNTQvcGhhYmRpZmYucHkuXG4gICAqL1xuICBhc3luYyBnZXREaWZmZXJlbnRpYWxSZXZpc2lvbkZvckNoYW5nZVNldElkKGNoYW5nZVNldElkOiBzdHJpbmcpOiBQcm9taXNlPD9zdHJpbmc+IHtcbiAgICBjb25zdCBhcmdzID0gWydsb2cnLCAnLVQnLCAne3BoYWJkaWZmfVxcbicsICctLWxpbWl0JywgJzEnLCAnLS1yZXYnLCBjaGFuZ2VTZXRJZF07XG4gICAgY29uc3QgZXhlY09wdGlvbnMgPSB7XG4gICAgICBjd2Q6IHRoaXMuZ2V0V29ya2luZ0RpcmVjdG9yeSgpLFxuICAgIH07XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG91dHB1dCA9IGF3YWl0IHRoaXMuX2hnQXN5bmNFeGVjdXRlKGFyZ3MsIGV4ZWNPcHRpb25zKTtcbiAgICAgIGNvbnN0IHN0ZG91dCA9IG91dHB1dC5zdGRvdXQudHJpbSgpO1xuICAgICAgcmV0dXJuIHN0ZG91dCA/IHN0ZG91dCA6IG51bGw7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gVGhpcyBzaG91bGQgbm90IGhhcHBlbjogYGhnIGxvZ2AgZG9lcyBub3QgZXJyb3IgZXZlbiBpZiBpdCBkb2VzIG5vdCByZWNvZ25pemUgdGhlIHRlbXBsYXRlLlxuICAgICAgZ2V0TG9nZ2VyKCkuZXJyb3IoYEZhaWxlZCB3aGVuIHRyeWluZyB0byBnZXQgZGlmZmVyZW50aWFsIHJldmlzaW9uIGZvcjogJHtjaGFuZ2VTZXRJZH1gKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRPRE8gKGNoZW5zaGVuKSBUaGUgcmV0dXJuIHR5cGUgc2hvdWxkIGJlIGBBc3luY0V4ZWN1dGVSZXRgIGluZiBgSGdTZXJ2aWNlLmRlZmAsIGJ1dCBmbG93XG4gIC8vIGRvZXNuJ3QgYWxsb3cgaW1wb3J0aW5nIGAuZGVmYCBmaWxlIHVubGVzcyB3ZSBtZXJnZSBgSGdTZXJ2aWNlLmRlZmAgdG8gdGhpcyBmaWxlLlxuICBhc3luYyBnZXRTbWFydGxvZyh0dHlPdXRwdXQ6IGJvb2xlYW4sIGNvbmNpc2U6IGJvb2xlYW4pOiBQcm9taXNlPE9iamVjdD4ge1xuICAgIC8vIGRpc2FibGUgdGhlIHBhZ2VyIGV4dGVuc2lvbiBzbyB0aGF0ICdoZyBzbCcgdGVybWluYXRlcy4gV2UgY2FuJ3QganVzdCB1c2VcbiAgICAvLyBIR1BMQUlOIGJlY2F1c2Ugd2UgaGF2ZSBub3QgZm91bmQgYSB3YXkgdG8gZ2V0IGNvbG9yZWQgb3V0cHV0IHdoZW4gd2UgZG8uXG4gICAgY29uc3QgYXJncyA9IFsnLS1jb25maWcnLCAnZXh0ZW5zaW9ucy5wYWdlcj0hJywgY29uY2lzZSA/ICdzbCcgOiAnc21hcnRsb2cnXTtcbiAgICBjb25zdCBleGVjT3B0aW9ucyA9IHtcbiAgICAgIGN3ZDogdGhpcy5nZXRXb3JraW5nRGlyZWN0b3J5KCksXG4gICAgICBOT19IR1BMQUlOOiBjb25jaXNlLCAvLyBgaGcgc2xgIGlzIGxpa2VseSB1c2VyLWRlZmluZWQuXG4gICAgICBUVFlfT1VUUFVUOiB0dHlPdXRwdXQsXG4gICAgfTtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5faGdBc3luY0V4ZWN1dGUoYXJncywgZXhlY09wdGlvbnMpO1xuICB9XG5cbiAgYXN5bmMgY2hlY2tvdXQocmV2aXNpb246IHN0cmluZywgY3JlYXRlOiBib29sZWFuKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIGN3ZDogdGhpcy5nZXRXb3JraW5nRGlyZWN0b3J5KCksXG4gICAgfTtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5faGdBc3luY0V4ZWN1dGUoWydjaGVja291dCcsIHJldmlzaW9uXSwgb3B0aW9ucyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gSGdTZXJ2aWNlQmFzZTtcbiJdfQ==