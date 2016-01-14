var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

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

var FORK_BASE_BOOKMARK_NAME = 'remote/master';

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
      var commonAncestorRevision = yield (0, _hgRevisionExpressionHelpers.fetchCommonAncestorOfHeadAndRevision)(
      // TODO(most): Better way to specify the fork/base that works with `fbsource`
      // and other mercurial configurations. t8769378
      FORK_BASE_BOOKMARK_NAME, this._workingDirectory);
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
//# sourceMappingURL=data:application/json;base64,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bUIsRUFBRTtBQUMvQixrQkFBVSxFQUFFLE9BQU87QUFDbkIsa0JBQVUsRUFBRSxTQUFTO09BQ3RCLENBQUM7QUFDRixhQUFPLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUM7S0FDdEQ7Ozs2QkFFYSxXQUFDLFFBQWdCLEVBQUUsTUFBZSxFQUFvQjtBQUNsRSxVQUFNLE9BQU8sR0FBRztBQUNkLFdBQUcsRUFBRSxJQUFJLENBQUMsbUJBQW1CLEVBQUU7T0FDaEMsQ0FBQztBQUNGLFVBQUk7QUFDRixjQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7T0FDN0QsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLGVBQU8sS0FBSyxDQUFDO09BQ2Q7QUFDRCxhQUFPLElBQUksQ0FBQztLQUNiOzs7U0FqUUcsYUFBYTs7O0FBcVFuQixNQUFNLENBQUMsT0FBTyxHQUFHLGFBQWEsQ0FBQyIsImZpbGUiOiJIZ1NlcnZpY2VCYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuLyogQHByb3ZpZGVzTW9kdWxlIExvY2FsSGdTZXJ2aWNlQmFzZSAqL1xuXG5pbXBvcnQge0hnU3RhdHVzT3B0aW9ufSBmcm9tICcuL2hnLWNvbnN0YW50cyc7XG5pbXBvcnQge09ic2VydmFibGUsIFN1YmplY3R9IGZyb20gJ3J4JztcbmltcG9ydCB7cGFyc2VIZ0JsYW1lT3V0cHV0fSBmcm9tICcuL2hnLWJsYW1lLW91dHB1dC1wYXJzZXInO1xuaW1wb3J0IHtwYXJzZU11bHRpRmlsZUhnRGlmZlVuaWZpZWRPdXRwdXR9IGZyb20gJy4vaGctZGlmZi1vdXRwdXQtcGFyc2VyJztcbmltcG9ydCB7XG4gIGZldGNoQ29tbW9uQW5jZXN0b3JPZkhlYWRBbmRSZXZpc2lvbixcbiAgZXhwcmVzc2lvbkZvclJldmlzaW9uc0JlZm9yZUhlYWQsXG4gIGZldGNoUmV2aXNpb25JbmZvQmV0d2VlblJldmlzaW9ucyxcbn0gZnJvbSAnLi9oZy1yZXZpc2lvbi1leHByZXNzaW9uLWhlbHBlcnMnO1xuaW1wb3J0IHtcbiAgZmV0Y2hGaWxlQ29udGVudEF0UmV2aXNpb24sXG4gIGZldGNoRmlsZXNDaGFuZ2VkQXRSZXZpc2lvbixcbn0gZnJvbSAnLi9oZy1yZXZpc2lvbi1zdGF0ZS1oZWxwZXJzJztcbmltcG9ydCB7YXN5bmNFeGVjdXRlLCBjcmVhdGVBcmdzRm9yU2NyaXB0Q29tbWFuZH0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuaW1wb3J0IHR5cGUge0RpZmZJbmZvLCBSZXZpc2lvbkZpbGVDaGFuZ2VzLCBTdGF0dXNDb2RlSWRWYWx1ZSwgUmV2aXNpb25JbmZvfSBmcm9tICcuL2hnLWNvbnN0YW50cyc7XG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5cbmNvbnN0IEZPUktfQkFTRV9CT09LTUFSS19OQU1FID0gJ3JlbW90ZS9tYXN0ZXInO1xuXG5sZXQgbG9nZ2VyO1xuZnVuY3Rpb24gZ2V0TG9nZ2VyKCkge1xuICBpZiAoIWxvZ2dlcikge1xuICAgIGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL2xvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcbiAgfVxuICByZXR1cm4gbG9nZ2VyO1xufVxuXG5jbGFzcyBIZ1NlcnZpY2VCYXNlIHtcbiAgX3dvcmtpbmdEaXJlY3Rvcnk6IHN0cmluZztcbiAgX2ZpbGVzRGlkQ2hhbmdlT2JzZXJ2ZXI6IFN1YmplY3Q7XG4gIF9oZ0lnbm9yZUZpbGVEaWRDaGFuZ2VPYnNlcnZlcjogU3ViamVjdDtcbiAgX2hnUmVwb1N0YXRlRGlkQ2hhbmdlT2JzZXJ2ZXI6IFN1YmplY3Q7XG4gIF9oZ0Jvb2ttYXJrRGlkQ2hhbmdlT2JzZXJ2ZXI6IFN1YmplY3Q7XG5cbiAgY29uc3RydWN0b3Iod29ya2luZ0RpcmVjdG9yeTogc3RyaW5nKSB7XG4gICAgdGhpcy5fd29ya2luZ0RpcmVjdG9yeSA9IHdvcmtpbmdEaXJlY3Rvcnk7XG4gICAgdGhpcy5fZmlsZXNEaWRDaGFuZ2VPYnNlcnZlciA9IG5ldyBTdWJqZWN0KCk7XG4gICAgdGhpcy5faGdJZ25vcmVGaWxlRGlkQ2hhbmdlT2JzZXJ2ZXIgPSBuZXcgU3ViamVjdCgpO1xuICAgIHRoaXMuX2hnUmVwb1N0YXRlRGlkQ2hhbmdlT2JzZXJ2ZXIgPSBuZXcgU3ViamVjdCgpO1xuICAgIHRoaXMuX2hnQm9va21hcmtEaWRDaGFuZ2VPYnNlcnZlciA9IG5ldyBTdWJqZWN0KCk7XG4gIH1cblxuICBhc3luYyBkaXNwb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuX2ZpbGVzRGlkQ2hhbmdlT2JzZXJ2ZXIub25Db21wbGV0ZWQoKTtcbiAgICB0aGlzLl9oZ0lnbm9yZUZpbGVEaWRDaGFuZ2VPYnNlcnZlci5vbkNvbXBsZXRlZCgpO1xuICAgIHRoaXMuX2hnUmVwb1N0YXRlRGlkQ2hhbmdlT2JzZXJ2ZXIub25Db21wbGV0ZWQoKTtcbiAgICB0aGlzLl9oZ0Jvb2ttYXJrRGlkQ2hhbmdlT2JzZXJ2ZXIub25Db21wbGV0ZWQoKTtcbiAgfVxuXG4gIGdldFdvcmtpbmdEaXJlY3RvcnkoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fd29ya2luZ0RpcmVjdG9yeTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgSGdTZXJ2aWNlOjpmZXRjaFN0YXR1c2VzIGZvciBkZXRhaWxzLlxuICAgKi9cbiAgYXN5bmMgZmV0Y2hTdGF0dXNlcyhcbiAgICBmaWxlUGF0aHM6IEFycmF5PHN0cmluZz4sXG4gICAgb3B0aW9uczogP2FueVxuICApOiBQcm9taXNlPE1hcDxzdHJpbmcsIFN0YXR1c0NvZGVJZFZhbHVlPj4ge1xuICAgIGNvbnN0IHN0YXR1c01hcCA9IG5ldyBNYXAoKTtcblxuICAgIGxldCBhcmdzID0gWydzdGF0dXMnLCAnLVRqc29uJ107XG4gICAgaWYgKG9wdGlvbnMgJiYgKCdoZ1N0YXR1c09wdGlvbicgaW4gb3B0aW9ucykpIHtcbiAgICAgIGlmIChvcHRpb25zLmhnU3RhdHVzT3B0aW9uID09PSBIZ1N0YXR1c09wdGlvbi5PTkxZX0lHTk9SRUQpIHtcbiAgICAgICAgYXJncy5wdXNoKCctLWlnbm9yZWQnKTtcbiAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5oZ1N0YXR1c09wdGlvbiA9PT0gSGdTdGF0dXNPcHRpb24uQUxMX1NUQVRVU0VTKSB7XG4gICAgICAgIGFyZ3MucHVzaCgnLS1hbGwnKTtcbiAgICAgIH1cbiAgICB9XG4gICAgYXJncyA9IGFyZ3MuY29uY2F0KGZpbGVQYXRocyk7XG4gICAgY29uc3QgZXhlY09wdGlvbnMgPSB7XG4gICAgICBjd2Q6IHRoaXMuZ2V0V29ya2luZ0RpcmVjdG9yeSgpLFxuICAgIH07XG4gICAgbGV0IG91dHB1dDtcbiAgICB0cnkge1xuICAgICAgb3V0cHV0ID0gYXdhaXQgdGhpcy5faGdBc3luY0V4ZWN1dGUoYXJncywgZXhlY09wdGlvbnMpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBzdGF0dXNNYXA7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RhdHVzZXMgPSBKU09OLnBhcnNlKG91dHB1dC5zdGRvdXQpO1xuICAgIHN0YXR1c2VzLmZvckVhY2goKHN0YXR1cykgPT4ge1xuICAgICAgc3RhdHVzTWFwLnNldCh0aGlzLl9hYnNvbHV0aXplKHN0YXR1cy5wYXRoKSwgc3RhdHVzLnN0YXR1cyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHN0YXR1c01hcDtcbiAgfVxuXG4gIC8vIE1lcmN1cmlhbCByZXR1cm5zIGFsbCBwYXRocyByZWxhdGl2ZSB0byB0aGUgcmVwb3NpdG9yeSdzIHdvcmtpbmcgZGlyZWN0b3J5LlxuICAvLyBUaGlzIG1ldGhvZCB0cmFuc2Zvcm1zIGEgcGF0aCByZWxhdGl2ZSB0byB0aGUgd29ya2luZyBkaXJlY290cnkgaW50byBhblxuICAvLyBhYnNvbHV0ZSBwYXRoLlxuICBfYWJzb2x1dGl6ZShwYXRoUmVsYXRpdmVUb1dvcmtpbmdEaXJlY3Rvcnk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHBhdGguam9pbih0aGlzLl93b3JraW5nRGlyZWN0b3J5LCBwYXRoUmVsYXRpdmVUb1dvcmtpbmdEaXJlY3RvcnkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBIZ1NlcnZpY2UuZGVmOjpvYnNlcnZlRmlsZXNEaWRDaGFuZ2UgZm9yIGRldGFpbHMuXG4gICAqL1xuICBvYnNlcnZlRmlsZXNEaWRDaGFuZ2UoKTogT2JzZXJ2YWJsZTxBcnJheTxOdWNsaWRlVXJpPj4ge1xuICAgIHJldHVybiB0aGlzLl9maWxlc0RpZENoYW5nZU9ic2VydmVyO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBIZ1NlcnZpY2UuZGVmOjpvYnNlcnZlSGdJZ25vcmVGaWxlRGlkQ2hhbmdlIGZvciBkZXRhaWxzLlxuICAgKi9cbiAgb2JzZXJ2ZUhnSWdub3JlRmlsZURpZENoYW5nZSgpOiBPYnNlcnZhYmxlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5faGdJZ25vcmVGaWxlRGlkQ2hhbmdlT2JzZXJ2ZXI7XG4gIH1cblxuICAvKipcbiAgICogU2VlIEhnU2VydmljZS5kZWY6Om9ic2VydmVIZ1JlcG9TdGF0ZURpZENoYW5nZSBmb3IgZGV0YWlscy5cbiAgICovXG4gIG9ic2VydmVIZ1JlcG9TdGF0ZURpZENoYW5nZSgpOiBPYnNlcnZhYmxlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5faGdSZXBvU3RhdGVEaWRDaGFuZ2VPYnNlcnZlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgSGdTZXJ2aWNlLmRlZjo6ZmV0Y2hEaWZmSW5mb0ZvclBhdGhzIGZvciBkZXRhaWxzLlxuICAgKi9cbiAgYXN5bmMgZmV0Y2hEaWZmSW5mbyhcbiAgICBmaWxlUGF0aHM6IEFycmF5PE51Y2xpZGVVcmk+LFxuICApOiBQcm9taXNlPD9NYXA8TnVjbGlkZVVyaSwgRGlmZkluZm8+PlxuICB7XG4gICAgLy8gJy0tdW5pZmllZCAwJyBnaXZlcyB1cyAwIGxpbmVzIG9mIGNvbnRleHQgYXJvdW5kIGVhY2ggY2hhbmdlICh3ZSBkb24ndFxuICAgIC8vIGNhcmUgYWJvdXQgdGhlIGNvbnRleHQpLlxuICAgIC8vICctLW5vcHJlZml4JyBvbWl0cyB0aGUgYS8gYW5kIGIvIHByZWZpeGVzIGZyb20gZmlsZW5hbWVzLlxuICAgIGNvbnN0IGFyZ3MgPSBbJ2RpZmYnLCAnLS11bmlmaWVkJywgJzAnLCAnLS1ub3ByZWZpeCddLmNvbmNhdChmaWxlUGF0aHMpO1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICBjd2Q6IHRoaXMuZ2V0V29ya2luZ0RpcmVjdG9yeSgpLFxuICAgIH07XG4gICAgbGV0IG91dHB1dDtcbiAgICB0cnkge1xuICAgICAgb3V0cHV0ID0gYXdhaXQgdGhpcy5faGdBc3luY0V4ZWN1dGUoYXJncywgb3B0aW9ucyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgZ2V0TG9nZ2VyKCkuZXJyb3IoXG4gICAgICAgICAgYEVycm9yIHdoZW4gcnVubmluZyBoZyBkaWZmIGZvciBwYXRoczogJHtmaWxlUGF0aHN9IFxcblxcdEVycm9yOiAke2Uuc3RkZXJyfWApO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHBhdGhUb0RpZmZJbmZvID0gcGFyc2VNdWx0aUZpbGVIZ0RpZmZVbmlmaWVkT3V0cHV0KG91dHB1dC5zdGRvdXQpO1xuICAgIGNvbnN0IGFic29sdXRlUGF0aFRvRGlmZkluZm8gPSBuZXcgTWFwKCk7XG4gICAgZm9yIChjb25zdCBbZmlsZVBhdGgsIGRpZmZJbmZvXSBvZiBwYXRoVG9EaWZmSW5mbykge1xuICAgICAgYWJzb2x1dGVQYXRoVG9EaWZmSW5mby5zZXQodGhpcy5fYWJzb2x1dGl6ZShmaWxlUGF0aCksIGRpZmZJbmZvKTtcbiAgICB9XG4gICAgcmV0dXJuIGFic29sdXRlUGF0aFRvRGlmZkluZm87XG4gIH1cblxuICAvKipcbiAgICogQ2FsbHMgb3V0IHRvIGFzeW5jRXhlY3V0ZSB1c2luZyB0aGUgJ2hnJyBjb21tYW5kLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBhcyBzcGVjaWZpZWQgYnkgaHR0cDovL25vZGVqcy5vcmcvYXBpL2NoaWxkX3Byb2Nlc3MuaHRtbC4gQWRkaXRpb25hbCBvcHRpb25zOlxuICAgKiAgIC0gTk9fSEdQTEFJTiBzZXQgaWYgdGhlICRIR1BMQUlOIGVudmlyb25tZW50IHZhcmlhYmxlIHNob3VsZCBub3QgYmUgdXNlZC5cbiAgICogICAtIFRUWV9PVVRQVVQgc2V0IGlmIHRoZSBjb21tYW5kIHNob3VsZCBiZSBydW4gYXMgaWYgaXQgd2VyZSBhdHRhY2hlZCB0byBhIHR0eS5cbiAgICovXG4gIGFzeW5jIF9oZ0FzeW5jRXhlY3V0ZShhcmdzOiBBcnJheTxzdHJpbmc+LCBvcHRpb25zOiBhbnkpOiBQcm9taXNlPGFueT4ge1xuICAgIGlmICghb3B0aW9uc1snTk9fSEdQTEFJTiddKSB7XG4gICAgICAvLyBTZXR0aW5nIEhHUExBSU49MSBvdmVycmlkZXMgYW55IGN1c3RvbSBhbGlhc2VzIGEgdXNlciBoYXMgZGVmaW5lZC5cbiAgICAgIGlmIChvcHRpb25zLmVudikge1xuICAgICAgICBvcHRpb25zLmVudlsnSEdQTEFJTiddID0gMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHthc3NpZ259ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9ucycpLm9iamVjdDtcbiAgICAgICAgY29uc3QgZW52ID0geydIR1BMQUlOJzogMX07XG4gICAgICAgIGFzc2lnbihlbnYsIHByb2Nlc3MuZW52KTtcbiAgICAgICAgb3B0aW9ucy5lbnYgPSBlbnY7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGNtZDtcbiAgICBpZiAob3B0aW9uc1snVFRZX09VVFBVVCddKSB7XG4gICAgICBjbWQgPSAnc2NyaXB0JztcbiAgICAgIGFyZ3MgPSBjcmVhdGVBcmdzRm9yU2NyaXB0Q29tbWFuZCgnaGcnLCBhcmdzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY21kID0gJ2hnJztcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBhd2FpdCBhc3luY0V4ZWN1dGUoY21kLCBhcmdzLCBvcHRpb25zKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBnZXRMb2dnZXIoKS5lcnJvcihgRXJyb3IgZXhlY3V0aW5nIGhnIGNvbW1hbmQ6ICR7SlNPTi5zdHJpbmdpZnkoYXJncyl9IGAgK1xuICAgICAgICAgIGBvcHRpb25zOiAke0pTT04uc3RyaW5naWZ5KG9wdGlvbnMpfSAke0pTT04uc3RyaW5naWZ5KGUpfWApO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cblxuICBmZXRjaEN1cnJlbnRCb29rbWFyaygpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHtmZXRjaEN1cnJlbnRCb29rbWFya30gPSByZXF1aXJlKCcuL2hnLWJvb2ttYXJrLWhlbHBlcnMnKTtcbiAgICByZXR1cm4gZmV0Y2hDdXJyZW50Qm9va21hcmsocGF0aC5qb2luKHRoaXMuX3dvcmtpbmdEaXJlY3RvcnksICcuaGcnKSk7XG4gIH1cblxuICAvKipcbiAgICogU2VlIEhnU2VydmljZTouZGVmOm9ic2VydmVIZ0Jvb2ttYXJrRGlkQ2hhbmdlIGZvciBkZXRhaWxzLlxuICAgKi9cbiAgb2JzZXJ2ZUhnQm9va21hcmtEaWRDaGFuZ2UoKTogT2JzZXJ2YWJsZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuX2hnQm9va21hcmtEaWRDaGFuZ2VPYnNlcnZlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWN0aW9uOiBSZXBvc2l0b3J5IFN0YXRlIGF0IFNwZWNpZmljIFJldmlzaW9uc1xuICAgKi9cblxuICBmZXRjaEZpbGVDb250ZW50QXRSZXZpc2lvbihmaWxlUGF0aDogTnVjbGlkZVVyaSwgcmV2aXNpb246ID9zdHJpbmcpOiBQcm9taXNlPD9zdHJpbmc+IHtcbiAgICByZXR1cm4gZmV0Y2hGaWxlQ29udGVudEF0UmV2aXNpb24oZmlsZVBhdGgsIHJldmlzaW9uLCB0aGlzLl93b3JraW5nRGlyZWN0b3J5KTtcbiAgfVxuXG4gIGZldGNoRmlsZXNDaGFuZ2VkQXRSZXZpc2lvbihyZXZpc2lvbjogc3RyaW5nKTogUHJvbWlzZTw/UmV2aXNpb25GaWxlQ2hhbmdlcz4ge1xuICAgIHJldHVybiBmZXRjaEZpbGVzQ2hhbmdlZEF0UmV2aXNpb24ocmV2aXNpb24sIHRoaXMuX3dvcmtpbmdEaXJlY3RvcnkpO1xuICB9XG5cbiAgYXN5bmMgZmV0Y2hSZXZpc2lvbkluZm9CZXR3ZWVuSGVhZEFuZEJhc2UoKTogUHJvbWlzZTw/QXJyYXk8UmV2aXNpb25JbmZvPj4ge1xuICAgIGNvbnN0IGNvbW1vbkFuY2VzdG9yUmV2aXNpb24gPSBhd2FpdCBmZXRjaENvbW1vbkFuY2VzdG9yT2ZIZWFkQW5kUmV2aXNpb24oXG4gICAgICAvLyBUT0RPKG1vc3QpOiBCZXR0ZXIgd2F5IHRvIHNwZWNpZnkgdGhlIGZvcmsvYmFzZSB0aGF0IHdvcmtzIHdpdGggYGZic291cmNlYFxuICAgICAgLy8gYW5kIG90aGVyIG1lcmN1cmlhbCBjb25maWd1cmF0aW9ucy4gdDg3NjkzNzhcbiAgICAgIEZPUktfQkFTRV9CT09LTUFSS19OQU1FLFxuICAgICAgdGhpcy5fd29ya2luZ0RpcmVjdG9yeSxcbiAgICApO1xuICAgIGlmICghY29tbW9uQW5jZXN0b3JSZXZpc2lvbikge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHJldmlzaW9uc0luZm8gPSBhd2FpdCBmZXRjaFJldmlzaW9uSW5mb0JldHdlZW5SZXZpc2lvbnMoXG4gICAgICBjb21tb25BbmNlc3RvclJldmlzaW9uLFxuICAgICAgZXhwcmVzc2lvbkZvclJldmlzaW9uc0JlZm9yZUhlYWQoMCksXG4gICAgICB0aGlzLl93b3JraW5nRGlyZWN0b3J5LFxuICAgICk7XG4gICAgcmV0dXJuIHJldmlzaW9uc0luZm87XG4gIH1cblxuICBhc3luYyBnZXRCbGFtZUF0SGVhZChmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8TWFwPHN0cmluZywgc3RyaW5nPj4ge1xuICAgIGNvbnN0IGFyZ3MgPVxuICAgICAgWydibGFtZScsICctcicsICd3ZGlyKCknLCAnLVRqc29uJywgJy0tY2hhbmdlc2V0JywgJy0tdXNlcicsICctLWxpbmUtbnVtYmVyJywgZmlsZVBhdGhdO1xuICAgIGNvbnN0IGV4ZWNPcHRpb25zID0ge1xuICAgICAgY3dkOiB0aGlzLmdldFdvcmtpbmdEaXJlY3RvcnkoKSxcbiAgICB9O1xuICAgIGxldCBvdXRwdXQ7XG4gICAgdHJ5IHtcbiAgICAgIG91dHB1dCA9IGF3YWl0IHRoaXMuX2hnQXN5bmNFeGVjdXRlKGFyZ3MsIGV4ZWNPcHRpb25zKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBnZXRMb2dnZXIoKS5lcnJvcihcbiAgICAgICAgICBgTG9jYWxIZ1NlcnZpY2VCYXNlIGZhaWxlZCB0byBmZXRjaCBibGFtZSBmb3IgZmlsZTogJHtmaWxlUGF0aH0uIEVycm9yOiAke2Uuc3RkZXJyfWApO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcnNlSGdCbGFtZU91dHB1dChvdXRwdXQuc3Rkb3V0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGltcGxlbWVudGF0aW9uIHJlbGllcyBvbiB0aGUgXCJwaGFiZGlmZlwiIHRlbXBsYXRlIGJlaW5nIGF2YWlsYWJsZSBhcyBkZWZpbmVkIGluOlxuICAgKiBodHRwczovL2JpdGJ1Y2tldC5vcmcvZmFjZWJvb2svaGctZXhwZXJpbWVudGFsL3NyYy9mYmYyM2IzZjk2YmFkZTU5ODYxMjFhN2M1N2Q3NDAwNTg1ZDc1ZjU0L3BoYWJkaWZmLnB5LlxuICAgKi9cbiAgYXN5bmMgZ2V0RGlmZmVyZW50aWFsUmV2aXNpb25Gb3JDaGFuZ2VTZXRJZChjaGFuZ2VTZXRJZDogc3RyaW5nKTogUHJvbWlzZTw/c3RyaW5nPiB7XG4gICAgY29uc3QgYXJncyA9IFsnbG9nJywgJy1UJywgJ3twaGFiZGlmZn1cXG4nLCAnLS1saW1pdCcsICcxJywgJy0tcmV2JywgY2hhbmdlU2V0SWRdO1xuICAgIGNvbnN0IGV4ZWNPcHRpb25zID0ge1xuICAgICAgY3dkOiB0aGlzLmdldFdvcmtpbmdEaXJlY3RvcnkoKSxcbiAgICB9O1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBvdXRwdXQgPSBhd2FpdCB0aGlzLl9oZ0FzeW5jRXhlY3V0ZShhcmdzLCBleGVjT3B0aW9ucyk7XG4gICAgICBjb25zdCBzdGRvdXQgPSBvdXRwdXQuc3Rkb3V0LnRyaW0oKTtcbiAgICAgIHJldHVybiBzdGRvdXQgPyBzdGRvdXQgOiBudWxsO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIFRoaXMgc2hvdWxkIG5vdCBoYXBwZW46IGBoZyBsb2dgIGRvZXMgbm90IGVycm9yIGV2ZW4gaWYgaXQgZG9lcyBub3QgcmVjb2duaXplIHRoZSB0ZW1wbGF0ZS5cbiAgICAgIGdldExvZ2dlcigpLmVycm9yKGBGYWlsZWQgd2hlbiB0cnlpbmcgdG8gZ2V0IGRpZmZlcmVudGlhbCByZXZpc2lvbiBmb3I6ICR7Y2hhbmdlU2V0SWR9YCk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvLyBUT0RPIChjaGVuc2hlbikgVGhlIHJldHVybiB0eXBlIHNob3VsZCBiZSBgQXN5bmNFeGVjdXRlUmV0YCBpbmYgYEhnU2VydmljZS5kZWZgLCBidXQgZmxvd1xuICAvLyBkb2Vzbid0IGFsbG93IGltcG9ydGluZyBgLmRlZmAgZmlsZSB1bmxlc3Mgd2UgbWVyZ2UgYEhnU2VydmljZS5kZWZgIHRvIHRoaXMgZmlsZS5cbiAgYXN5bmMgZ2V0U21hcnRsb2codHR5T3V0cHV0OiBib29sZWFuLCBjb25jaXNlOiBib29sZWFuKTogUHJvbWlzZTxPYmplY3Q+IHtcbiAgICAvLyBkaXNhYmxlIHRoZSBwYWdlciBleHRlbnNpb24gc28gdGhhdCAnaGcgc2wnIHRlcm1pbmF0ZXMuIFdlIGNhbid0IGp1c3QgdXNlXG4gICAgLy8gSEdQTEFJTiBiZWNhdXNlIHdlIGhhdmUgbm90IGZvdW5kIGEgd2F5IHRvIGdldCBjb2xvcmVkIG91dHB1dCB3aGVuIHdlIGRvLlxuICAgIGNvbnN0IGFyZ3MgPSBbJy0tY29uZmlnJywgJ2V4dGVuc2lvbnMucGFnZXI9IScsIGNvbmNpc2UgPyAnc2wnIDogJ3NtYXJ0bG9nJ107XG4gICAgY29uc3QgZXhlY09wdGlvbnMgPSB7XG4gICAgICBjd2Q6IHRoaXMuZ2V0V29ya2luZ0RpcmVjdG9yeSgpLFxuICAgICAgTk9fSEdQTEFJTjogY29uY2lzZSwgLy8gYGhnIHNsYCBpcyBsaWtlbHkgdXNlci1kZWZpbmVkLlxuICAgICAgVFRZX09VVFBVVDogdHR5T3V0cHV0LFxuICAgIH07XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuX2hnQXN5bmNFeGVjdXRlKGFyZ3MsIGV4ZWNPcHRpb25zKTtcbiAgfVxuXG4gIGFzeW5jIGNoZWNrb3V0KHJldmlzaW9uOiBzdHJpbmcsIGNyZWF0ZTogYm9vbGVhbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICBjd2Q6IHRoaXMuZ2V0V29ya2luZ0RpcmVjdG9yeSgpLFxuICAgIH07XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuX2hnQXN5bmNFeGVjdXRlKFsnY2hlY2tvdXQnLCByZXZpc2lvbl0sIG9wdGlvbnMpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEhnU2VydmljZUJhc2U7XG4iXX0=