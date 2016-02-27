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

var _nuclideCommons = require('../../../nuclide/commons');

var _remoteUri = require('../../remote-uri');

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
      // '--nodates' avoids appending dates to the file path line.
      var args = ['diff', '--unified', '0', '--noprefix', '--nodates'].concat(filePaths);
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
      var revisionsInfo = yield (0, _hgRevisionExpressionHelpers.fetchRevisionInfoBetweenRevisions)((0, _hgRevisionExpressionHelpers.expressionForCommonAncestor)(fokBaseName), (0, _hgRevisionExpressionHelpers.expressionForRevisionsBeforeHead)(0), this._workingDirectory);
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
  }, {
    key: 'getConfigValueAsync',
    value: _asyncToGenerator(function* (key) {
      var args = ['config', key];
      var execOptions = {
        cwd: this.getWorkingDirectory()
      };
      return (yield this._hgAsyncExecute(args, execOptions)).stdout;
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
    key: '_commitCode',
    value: _asyncToGenerator(function* (message) {
      var extraArgs = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      var args = ['commit'];
      var tempFile = null;
      if (message != null) {
        tempFile = yield _nuclideCommons.fsPromise.tempfile();
        yield _nuclideCommons.fsPromise.writeFile(tempFile, message);
        args.push('-l', tempFile);
      }
      var execOptions = {
        cwd: this.getWorkingDirectory()
      };
      try {
        yield this._hgAsyncExecute(args.concat(extraArgs), execOptions);
      } finally {
        if (tempFile != null) {
          yield _nuclideCommons.fsPromise.unlink(tempFile);
        }
      }
    })
  }, {
    key: 'commit',
    value: _asyncToGenerator(function* (message) {
      yield this._commitCode(message);
    })
  }, {
    key: 'amend',
    value: _asyncToGenerator(function* (message) {
      var extraArgs = ['--amend'];
      if (message == null) {
        extraArgs.push('--reuse-message', '.');
      }
      yield this._commitCode(message, extraArgs);
    })
  }, {
    key: '_runSimpleInWorkingDirectory',
    value: _asyncToGenerator(function* (action, args) {
      var options = {
        cwd: this.getWorkingDirectory()
      };
      var cmd = [action].concat(args);
      try {
        yield this._hgAsyncExecute(cmd, options);
      } catch (e) {
        getLogger().error('hg %s failed with [%s] arguments: %s', cmd, args.toString(), e.toString());
        throw e;
      }
    })
  }, {
    key: 'checkout',
    value: _asyncToGenerator(function* (revision, create) {
      yield this._runSimpleInWorkingDirectory('checkout', [revision]);
    })
  }, {
    key: 'rename',
    value: _asyncToGenerator(function* (oldFilePath, newFilePath) {
      yield this._runSimpleInWorkingDirectory('rename', [(0, _remoteUri.getPath)(oldFilePath), (0, _remoteUri.getPath)(newFilePath)]);
    })
  }, {
    key: 'remove',
    value: _asyncToGenerator(function* (filePath) {
      yield this._runSimpleInWorkingDirectory('remove', ['-f', (0, _remoteUri.getPath)(filePath)]);
    })
  }, {
    key: 'add',
    value: _asyncToGenerator(function* (filePath) {
      yield this._runSimpleInWorkingDirectory('add', [(0, _remoteUri.getPath)(filePath)]);
    })
  }]);

  return HgServiceBase;
})();

module.exports = HgServiceBase;
//# sourceMappingURL=data:application/json;base64,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O0FBQ0YsY0FBTSxDQUFDLENBQUM7T0FDVDtLQUNGOzs7NkJBRWEsV0FBQyxRQUFnQixFQUFFLE1BQWUsRUFBaUI7QUFDL0QsWUFBTSxJQUFJLENBQUMsNEJBQTRCLENBQUMsVUFBVSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztLQUNqRTs7OzZCQUVXLFdBQUMsV0FBdUIsRUFBRSxXQUF1QixFQUFpQjtBQUM1RSxZQUFNLElBQUksQ0FBQyw0QkFBNEIsQ0FDckMsUUFBUSxFQUNSLENBQUMsd0JBQVEsV0FBVyxDQUFDLEVBQUUsd0JBQVEsV0FBVyxDQUFDLENBQUMsQ0FDN0MsQ0FBQztLQUNIOzs7NkJBRVcsV0FBQyxRQUFvQixFQUFpQjtBQUNoRCxZQUFNLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsd0JBQVEsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzlFOzs7NkJBRVEsV0FBQyxRQUFvQixFQUFpQjtBQUM3QyxZQUFNLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxLQUFLLEVBQUUsQ0FBQyx3QkFBUSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDckU7OztTQTlURyxhQUFhOzs7QUFrVW5CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFDIiwiZmlsZSI6IkhnU2VydmljZUJhc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4vKiBAcHJvdmlkZXNNb2R1bGUgTG9jYWxIZ1NlcnZpY2VCYXNlICovXG5cbmltcG9ydCB7SGdTdGF0dXNPcHRpb259IGZyb20gJy4vaGctY29uc3RhbnRzJztcbmltcG9ydCB7T2JzZXJ2YWJsZSwgU3ViamVjdH0gZnJvbSAncngnO1xuaW1wb3J0IHtwYXJzZUhnQmxhbWVPdXRwdXR9IGZyb20gJy4vaGctYmxhbWUtb3V0cHV0LXBhcnNlcic7XG5pbXBvcnQge3BhcnNlTXVsdGlGaWxlSGdEaWZmVW5pZmllZE91dHB1dH0gZnJvbSAnLi9oZy1kaWZmLW91dHB1dC1wYXJzZXInO1xuaW1wb3J0IHtcbiAgZXhwcmVzc2lvbkZvckNvbW1vbkFuY2VzdG9yLFxuICBleHByZXNzaW9uRm9yUmV2aXNpb25zQmVmb3JlSGVhZCxcbiAgZmV0Y2hSZXZpc2lvbkluZm9CZXR3ZWVuUmV2aXNpb25zLFxufSBmcm9tICcuL2hnLXJldmlzaW9uLWV4cHJlc3Npb24taGVscGVycyc7XG5pbXBvcnQge1xuICBmZXRjaEZpbGVDb250ZW50QXRSZXZpc2lvbixcbiAgZmV0Y2hGaWxlc0NoYW5nZWRBdFJldmlzaW9uLFxufSBmcm9tICcuL2hnLXJldmlzaW9uLXN0YXRlLWhlbHBlcnMnO1xuaW1wb3J0IHthc3luY0V4ZWN1dGUsIGNyZWF0ZUFyZ3NGb3JTY3JpcHRDb21tYW5kfSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCB7ZnNQcm9taXNlfSBmcm9tICcuLi8uLi8uLi9udWNsaWRlL2NvbW1vbnMnO1xuaW1wb3J0IHtnZXRQYXRofSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQgdHlwZSB7RGlmZkluZm8sIFJldmlzaW9uRmlsZUNoYW5nZXMsIFN0YXR1c0NvZGVJZFZhbHVlLCBSZXZpc2lvbkluZm99IGZyb20gJy4vaGctY29uc3RhbnRzJztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcblxuaW1wb3J0IHtyZWFkQXJjQ29uZmlnfSBmcm9tICcuLi8uLi9hcmNhbmlzdC1iYXNlJztcblxuY29uc3QgREVGQVVMVF9GT1JLX0JBU0VfTkFNRSA9ICdkZWZhdWx0JztcblxubGV0IGxvZ2dlcjtcbmZ1bmN0aW9uIGdldExvZ2dlcigpIHtcbiAgaWYgKCFsb2dnZXIpIHtcbiAgICBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG4gIH1cbiAgcmV0dXJuIGxvZ2dlcjtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0Rm9ya0Jhc2VOYW1lKGRpcmVjdG9yeVBhdGg6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gIGNvbnN0IGFyY0NvbmZpZyA9IGF3YWl0IHJlYWRBcmNDb25maWcoZGlyZWN0b3J5UGF0aCk7XG4gIGlmIChhcmNDb25maWcgIT0gbnVsbCkge1xuICAgIHJldHVybiBhcmNDb25maWdbJ2FyYy5mZWF0dXJlLnN0YXJ0LmRlZmF1bHQnXSB8fCBhcmNDb25maWdbJ2FyYy5sYW5kLm9udG8uZGVmYXVsdCddO1xuICB9XG4gIHJldHVybiBERUZBVUxUX0ZPUktfQkFTRV9OQU1FO1xufVxuXG5jbGFzcyBIZ1NlcnZpY2VCYXNlIHtcbiAgX3dvcmtpbmdEaXJlY3Rvcnk6IHN0cmluZztcbiAgX2ZpbGVzRGlkQ2hhbmdlT2JzZXJ2ZXI6IFN1YmplY3Q7XG4gIF9oZ0lnbm9yZUZpbGVEaWRDaGFuZ2VPYnNlcnZlcjogU3ViamVjdDtcbiAgX2hnUmVwb1N0YXRlRGlkQ2hhbmdlT2JzZXJ2ZXI6IFN1YmplY3Q7XG4gIF9oZ0Jvb2ttYXJrRGlkQ2hhbmdlT2JzZXJ2ZXI6IFN1YmplY3Q7XG5cbiAgY29uc3RydWN0b3Iod29ya2luZ0RpcmVjdG9yeTogc3RyaW5nKSB7XG4gICAgdGhpcy5fd29ya2luZ0RpcmVjdG9yeSA9IHdvcmtpbmdEaXJlY3Rvcnk7XG4gICAgdGhpcy5fZmlsZXNEaWRDaGFuZ2VPYnNlcnZlciA9IG5ldyBTdWJqZWN0KCk7XG4gICAgdGhpcy5faGdJZ25vcmVGaWxlRGlkQ2hhbmdlT2JzZXJ2ZXIgPSBuZXcgU3ViamVjdCgpO1xuICAgIHRoaXMuX2hnUmVwb1N0YXRlRGlkQ2hhbmdlT2JzZXJ2ZXIgPSBuZXcgU3ViamVjdCgpO1xuICAgIHRoaXMuX2hnQm9va21hcmtEaWRDaGFuZ2VPYnNlcnZlciA9IG5ldyBTdWJqZWN0KCk7XG4gIH1cblxuICBhc3luYyBkaXNwb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuX2ZpbGVzRGlkQ2hhbmdlT2JzZXJ2ZXIub25Db21wbGV0ZWQoKTtcbiAgICB0aGlzLl9oZ0lnbm9yZUZpbGVEaWRDaGFuZ2VPYnNlcnZlci5vbkNvbXBsZXRlZCgpO1xuICAgIHRoaXMuX2hnUmVwb1N0YXRlRGlkQ2hhbmdlT2JzZXJ2ZXIub25Db21wbGV0ZWQoKTtcbiAgICB0aGlzLl9oZ0Jvb2ttYXJrRGlkQ2hhbmdlT2JzZXJ2ZXIub25Db21wbGV0ZWQoKTtcbiAgfVxuXG4gIGdldFdvcmtpbmdEaXJlY3RvcnkoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fd29ya2luZ0RpcmVjdG9yeTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgSGdTZXJ2aWNlOjpmZXRjaFN0YXR1c2VzIGZvciBkZXRhaWxzLlxuICAgKi9cbiAgYXN5bmMgZmV0Y2hTdGF0dXNlcyhcbiAgICBmaWxlUGF0aHM6IEFycmF5PHN0cmluZz4sXG4gICAgb3B0aW9uczogP2FueVxuICApOiBQcm9taXNlPE1hcDxzdHJpbmcsIFN0YXR1c0NvZGVJZFZhbHVlPj4ge1xuICAgIGNvbnN0IHN0YXR1c01hcCA9IG5ldyBNYXAoKTtcblxuICAgIGxldCBhcmdzID0gWydzdGF0dXMnLCAnLVRqc29uJ107XG4gICAgaWYgKG9wdGlvbnMgJiYgKCdoZ1N0YXR1c09wdGlvbicgaW4gb3B0aW9ucykpIHtcbiAgICAgIGlmIChvcHRpb25zLmhnU3RhdHVzT3B0aW9uID09PSBIZ1N0YXR1c09wdGlvbi5PTkxZX0lHTk9SRUQpIHtcbiAgICAgICAgYXJncy5wdXNoKCctLWlnbm9yZWQnKTtcbiAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5oZ1N0YXR1c09wdGlvbiA9PT0gSGdTdGF0dXNPcHRpb24uQUxMX1NUQVRVU0VTKSB7XG4gICAgICAgIGFyZ3MucHVzaCgnLS1hbGwnKTtcbiAgICAgIH1cbiAgICB9XG4gICAgYXJncyA9IGFyZ3MuY29uY2F0KGZpbGVQYXRocyk7XG4gICAgY29uc3QgZXhlY09wdGlvbnMgPSB7XG4gICAgICBjd2Q6IHRoaXMuZ2V0V29ya2luZ0RpcmVjdG9yeSgpLFxuICAgIH07XG4gICAgbGV0IG91dHB1dDtcbiAgICB0cnkge1xuICAgICAgb3V0cHV0ID0gYXdhaXQgdGhpcy5faGdBc3luY0V4ZWN1dGUoYXJncywgZXhlY09wdGlvbnMpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBzdGF0dXNNYXA7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RhdHVzZXMgPSBKU09OLnBhcnNlKG91dHB1dC5zdGRvdXQpO1xuICAgIHN0YXR1c2VzLmZvckVhY2goc3RhdHVzID0+IHtcbiAgICAgIHN0YXR1c01hcC5zZXQodGhpcy5fYWJzb2x1dGl6ZShzdGF0dXMucGF0aCksIHN0YXR1cy5zdGF0dXMpO1xuICAgIH0pO1xuICAgIHJldHVybiBzdGF0dXNNYXA7XG4gIH1cblxuICAvLyBNZXJjdXJpYWwgcmV0dXJucyBhbGwgcGF0aHMgcmVsYXRpdmUgdG8gdGhlIHJlcG9zaXRvcnkncyB3b3JraW5nIGRpcmVjdG9yeS5cbiAgLy8gVGhpcyBtZXRob2QgdHJhbnNmb3JtcyBhIHBhdGggcmVsYXRpdmUgdG8gdGhlIHdvcmtpbmcgZGlyZWNvdHJ5IGludG8gYW5cbiAgLy8gYWJzb2x1dGUgcGF0aC5cbiAgX2Fic29sdXRpemUocGF0aFJlbGF0aXZlVG9Xb3JraW5nRGlyZWN0b3J5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBwYXRoLmpvaW4odGhpcy5fd29ya2luZ0RpcmVjdG9yeSwgcGF0aFJlbGF0aXZlVG9Xb3JraW5nRGlyZWN0b3J5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgSGdTZXJ2aWNlLmRlZjo6b2JzZXJ2ZUZpbGVzRGlkQ2hhbmdlIGZvciBkZXRhaWxzLlxuICAgKi9cbiAgb2JzZXJ2ZUZpbGVzRGlkQ2hhbmdlKCk6IE9ic2VydmFibGU8QXJyYXk8TnVjbGlkZVVyaT4+IHtcbiAgICByZXR1cm4gdGhpcy5fZmlsZXNEaWRDaGFuZ2VPYnNlcnZlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgSGdTZXJ2aWNlLmRlZjo6b2JzZXJ2ZUhnSWdub3JlRmlsZURpZENoYW5nZSBmb3IgZGV0YWlscy5cbiAgICovXG4gIG9ic2VydmVIZ0lnbm9yZUZpbGVEaWRDaGFuZ2UoKTogT2JzZXJ2YWJsZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuX2hnSWdub3JlRmlsZURpZENoYW5nZU9ic2VydmVyO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBIZ1NlcnZpY2UuZGVmOjpvYnNlcnZlSGdSZXBvU3RhdGVEaWRDaGFuZ2UgZm9yIGRldGFpbHMuXG4gICAqL1xuICBvYnNlcnZlSGdSZXBvU3RhdGVEaWRDaGFuZ2UoKTogT2JzZXJ2YWJsZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuX2hnUmVwb1N0YXRlRGlkQ2hhbmdlT2JzZXJ2ZXI7XG4gIH1cblxuICAvKipcbiAgICogU2VlIEhnU2VydmljZS5kZWY6OmZldGNoRGlmZkluZm9Gb3JQYXRocyBmb3IgZGV0YWlscy5cbiAgICovXG4gIGFzeW5jIGZldGNoRGlmZkluZm8oZmlsZVBhdGhzOiBBcnJheTxOdWNsaWRlVXJpPik6IFByb21pc2U8P01hcDxOdWNsaWRlVXJpLCBEaWZmSW5mbz4+IHtcbiAgICAvLyAnLS11bmlmaWVkIDAnIGdpdmVzIHVzIDAgbGluZXMgb2YgY29udGV4dCBhcm91bmQgZWFjaCBjaGFuZ2UgKHdlIGRvbid0XG4gICAgLy8gY2FyZSBhYm91dCB0aGUgY29udGV4dCkuXG4gICAgLy8gJy0tbm9wcmVmaXgnIG9taXRzIHRoZSBhLyBhbmQgYi8gcHJlZml4ZXMgZnJvbSBmaWxlbmFtZXMuXG4gICAgLy8gJy0tbm9kYXRlcycgYXZvaWRzIGFwcGVuZGluZyBkYXRlcyB0byB0aGUgZmlsZSBwYXRoIGxpbmUuXG4gICAgY29uc3QgYXJncyA9IFsnZGlmZicsICctLXVuaWZpZWQnLCAnMCcsICctLW5vcHJlZml4JywgJy0tbm9kYXRlcyddLmNvbmNhdChmaWxlUGF0aHMpO1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICBjd2Q6IHRoaXMuZ2V0V29ya2luZ0RpcmVjdG9yeSgpLFxuICAgIH07XG4gICAgbGV0IG91dHB1dDtcbiAgICB0cnkge1xuICAgICAgb3V0cHV0ID0gYXdhaXQgdGhpcy5faGdBc3luY0V4ZWN1dGUoYXJncywgb3B0aW9ucyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgZ2V0TG9nZ2VyKCkuZXJyb3IoXG4gICAgICAgICAgYEVycm9yIHdoZW4gcnVubmluZyBoZyBkaWZmIGZvciBwYXRoczogJHtmaWxlUGF0aHN9IFxcblxcdEVycm9yOiAke2Uuc3RkZXJyfWApO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHBhdGhUb0RpZmZJbmZvID0gcGFyc2VNdWx0aUZpbGVIZ0RpZmZVbmlmaWVkT3V0cHV0KG91dHB1dC5zdGRvdXQpO1xuICAgIGNvbnN0IGFic29sdXRlUGF0aFRvRGlmZkluZm8gPSBuZXcgTWFwKCk7XG4gICAgZm9yIChjb25zdCBbZmlsZVBhdGgsIGRpZmZJbmZvXSBvZiBwYXRoVG9EaWZmSW5mbykge1xuICAgICAgYWJzb2x1dGVQYXRoVG9EaWZmSW5mby5zZXQodGhpcy5fYWJzb2x1dGl6ZShmaWxlUGF0aCksIGRpZmZJbmZvKTtcbiAgICB9XG4gICAgcmV0dXJuIGFic29sdXRlUGF0aFRvRGlmZkluZm87XG4gIH1cblxuICAvKipcbiAgICogQ2FsbHMgb3V0IHRvIGFzeW5jRXhlY3V0ZSB1c2luZyB0aGUgJ2hnJyBjb21tYW5kLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBhcyBzcGVjaWZpZWQgYnkgaHR0cDovL25vZGVqcy5vcmcvYXBpL2NoaWxkX3Byb2Nlc3MuaHRtbC4gQWRkaXRpb25hbCBvcHRpb25zOlxuICAgKiAgIC0gTk9fSEdQTEFJTiBzZXQgaWYgdGhlICRIR1BMQUlOIGVudmlyb25tZW50IHZhcmlhYmxlIHNob3VsZCBub3QgYmUgdXNlZC5cbiAgICogICAtIFRUWV9PVVRQVVQgc2V0IGlmIHRoZSBjb21tYW5kIHNob3VsZCBiZSBydW4gYXMgaWYgaXQgd2VyZSBhdHRhY2hlZCB0byBhIHR0eS5cbiAgICovXG4gIGFzeW5jIF9oZ0FzeW5jRXhlY3V0ZShhcmdzOiBBcnJheTxzdHJpbmc+LCBvcHRpb25zOiBhbnkpOiBQcm9taXNlPGFueT4ge1xuICAgIGlmICghb3B0aW9uc1snTk9fSEdQTEFJTiddKSB7XG4gICAgICAvLyBTZXR0aW5nIEhHUExBSU49MSBvdmVycmlkZXMgYW55IGN1c3RvbSBhbGlhc2VzIGEgdXNlciBoYXMgZGVmaW5lZC5cbiAgICAgIGlmIChvcHRpb25zLmVudikge1xuICAgICAgICBvcHRpb25zLmVudlsnSEdQTEFJTiddID0gMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHthc3NpZ259ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9ucycpLm9iamVjdDtcbiAgICAgICAgY29uc3QgZW52ID0geydIR1BMQUlOJzogMX07XG4gICAgICAgIGFzc2lnbihlbnYsIHByb2Nlc3MuZW52KTtcbiAgICAgICAgb3B0aW9ucy5lbnYgPSBlbnY7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGNtZDtcbiAgICBpZiAob3B0aW9uc1snVFRZX09VVFBVVCddKSB7XG4gICAgICBjbWQgPSAnc2NyaXB0JztcbiAgICAgIGFyZ3MgPSBjcmVhdGVBcmdzRm9yU2NyaXB0Q29tbWFuZCgnaGcnLCBhcmdzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY21kID0gJ2hnJztcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBhd2FpdCBhc3luY0V4ZWN1dGUoY21kLCBhcmdzLCBvcHRpb25zKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBnZXRMb2dnZXIoKS5lcnJvcihgRXJyb3IgZXhlY3V0aW5nIGhnIGNvbW1hbmQ6ICR7SlNPTi5zdHJpbmdpZnkoYXJncyl9IGAgK1xuICAgICAgICAgIGBvcHRpb25zOiAke0pTT04uc3RyaW5naWZ5KG9wdGlvbnMpfSAke0pTT04uc3RyaW5naWZ5KGUpfWApO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cblxuICBmZXRjaEN1cnJlbnRCb29rbWFyaygpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHtmZXRjaEN1cnJlbnRCb29rbWFya30gPSByZXF1aXJlKCcuL2hnLWJvb2ttYXJrLWhlbHBlcnMnKTtcbiAgICByZXR1cm4gZmV0Y2hDdXJyZW50Qm9va21hcmsocGF0aC5qb2luKHRoaXMuX3dvcmtpbmdEaXJlY3RvcnksICcuaGcnKSk7XG4gIH1cblxuICAvKipcbiAgICogU2VlIEhnU2VydmljZTouZGVmOm9ic2VydmVIZ0Jvb2ttYXJrRGlkQ2hhbmdlIGZvciBkZXRhaWxzLlxuICAgKi9cbiAgb2JzZXJ2ZUhnQm9va21hcmtEaWRDaGFuZ2UoKTogT2JzZXJ2YWJsZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuX2hnQm9va21hcmtEaWRDaGFuZ2VPYnNlcnZlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWN0aW9uOiBSZXBvc2l0b3J5IFN0YXRlIGF0IFNwZWNpZmljIFJldmlzaW9uc1xuICAgKi9cblxuICBmZXRjaEZpbGVDb250ZW50QXRSZXZpc2lvbihmaWxlUGF0aDogTnVjbGlkZVVyaSwgcmV2aXNpb246ID9zdHJpbmcpOiBQcm9taXNlPD9zdHJpbmc+IHtcbiAgICByZXR1cm4gZmV0Y2hGaWxlQ29udGVudEF0UmV2aXNpb24oZmlsZVBhdGgsIHJldmlzaW9uLCB0aGlzLl93b3JraW5nRGlyZWN0b3J5KTtcbiAgfVxuXG4gIGZldGNoRmlsZXNDaGFuZ2VkQXRSZXZpc2lvbihyZXZpc2lvbjogc3RyaW5nKTogUHJvbWlzZTw/UmV2aXNpb25GaWxlQ2hhbmdlcz4ge1xuICAgIHJldHVybiBmZXRjaEZpbGVzQ2hhbmdlZEF0UmV2aXNpb24ocmV2aXNpb24sIHRoaXMuX3dvcmtpbmdEaXJlY3RvcnkpO1xuICB9XG5cbiAgYXN5bmMgZmV0Y2hSZXZpc2lvbkluZm9CZXR3ZWVuSGVhZEFuZEJhc2UoKTogUHJvbWlzZTw/QXJyYXk8UmV2aXNpb25JbmZvPj4ge1xuICAgIGNvbnN0IGZva0Jhc2VOYW1lID0gYXdhaXQgZ2V0Rm9ya0Jhc2VOYW1lKHRoaXMuX3dvcmtpbmdEaXJlY3RvcnkpO1xuICAgIGNvbnN0IHJldmlzaW9uc0luZm8gPSBhd2FpdCBmZXRjaFJldmlzaW9uSW5mb0JldHdlZW5SZXZpc2lvbnMoXG4gICAgICBleHByZXNzaW9uRm9yQ29tbW9uQW5jZXN0b3IoZm9rQmFzZU5hbWUpLFxuICAgICAgZXhwcmVzc2lvbkZvclJldmlzaW9uc0JlZm9yZUhlYWQoMCksXG4gICAgICB0aGlzLl93b3JraW5nRGlyZWN0b3J5LFxuICAgICk7XG4gICAgcmV0dXJuIHJldmlzaW9uc0luZm87XG4gIH1cblxuICBhc3luYyBnZXRCbGFtZUF0SGVhZChmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8TWFwPHN0cmluZywgc3RyaW5nPj4ge1xuICAgIGNvbnN0IGFyZ3MgPVxuICAgICAgWydibGFtZScsICctcicsICd3ZGlyKCknLCAnLVRqc29uJywgJy0tY2hhbmdlc2V0JywgJy0tdXNlcicsICctLWxpbmUtbnVtYmVyJywgZmlsZVBhdGhdO1xuICAgIGNvbnN0IGV4ZWNPcHRpb25zID0ge1xuICAgICAgY3dkOiB0aGlzLmdldFdvcmtpbmdEaXJlY3RvcnkoKSxcbiAgICB9O1xuICAgIGxldCBvdXRwdXQ7XG4gICAgdHJ5IHtcbiAgICAgIG91dHB1dCA9IGF3YWl0IHRoaXMuX2hnQXN5bmNFeGVjdXRlKGFyZ3MsIGV4ZWNPcHRpb25zKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBnZXRMb2dnZXIoKS5lcnJvcihcbiAgICAgICAgICBgTG9jYWxIZ1NlcnZpY2VCYXNlIGZhaWxlZCB0byBmZXRjaCBibGFtZSBmb3IgZmlsZTogJHtmaWxlUGF0aH0uIEVycm9yOiAke2Uuc3RkZXJyfWApO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcnNlSGdCbGFtZU91dHB1dChvdXRwdXQuc3Rkb3V0KTtcbiAgfVxuXG4gIGFzeW5jIGdldENvbmZpZ1ZhbHVlQXN5bmMoa2V5OiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IGFyZ3MgPSBbJ2NvbmZpZycsIGtleV07XG4gICAgY29uc3QgZXhlY09wdGlvbnMgPSB7XG4gICAgICBjd2Q6IHRoaXMuZ2V0V29ya2luZ0RpcmVjdG9yeSgpLFxuICAgIH07XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLl9oZ0FzeW5jRXhlY3V0ZShhcmdzLCBleGVjT3B0aW9ucykpLnN0ZG91dDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGltcGxlbWVudGF0aW9uIHJlbGllcyBvbiB0aGUgXCJwaGFiZGlmZlwiIHRlbXBsYXRlIGJlaW5nIGF2YWlsYWJsZSBhcyBkZWZpbmVkIGluOlxuICAgKiBodHRwczovL2JpdGJ1Y2tldC5vcmcvZmFjZWJvb2svaGctZXhwZXJpbWVudGFsL3NyYy9mYmYyM2IzZjk2YmFkZTU5ODYxMjFhN2M1N2Q3NDAwNTg1ZDc1ZjU0L3BoYWJkaWZmLnB5LlxuICAgKi9cbiAgYXN5bmMgZ2V0RGlmZmVyZW50aWFsUmV2aXNpb25Gb3JDaGFuZ2VTZXRJZChjaGFuZ2VTZXRJZDogc3RyaW5nKTogUHJvbWlzZTw/c3RyaW5nPiB7XG4gICAgY29uc3QgYXJncyA9IFsnbG9nJywgJy1UJywgJ3twaGFiZGlmZn1cXG4nLCAnLS1saW1pdCcsICcxJywgJy0tcmV2JywgY2hhbmdlU2V0SWRdO1xuICAgIGNvbnN0IGV4ZWNPcHRpb25zID0ge1xuICAgICAgY3dkOiB0aGlzLmdldFdvcmtpbmdEaXJlY3RvcnkoKSxcbiAgICB9O1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBvdXRwdXQgPSBhd2FpdCB0aGlzLl9oZ0FzeW5jRXhlY3V0ZShhcmdzLCBleGVjT3B0aW9ucyk7XG4gICAgICBjb25zdCBzdGRvdXQgPSBvdXRwdXQuc3Rkb3V0LnRyaW0oKTtcbiAgICAgIHJldHVybiBzdGRvdXQgPyBzdGRvdXQgOiBudWxsO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIFRoaXMgc2hvdWxkIG5vdCBoYXBwZW46IGBoZyBsb2dgIGRvZXMgbm90IGVycm9yIGV2ZW4gaWYgaXQgZG9lcyBub3QgcmVjb2duaXplIHRoZSB0ZW1wbGF0ZS5cbiAgICAgIGdldExvZ2dlcigpLmVycm9yKGBGYWlsZWQgd2hlbiB0cnlpbmcgdG8gZ2V0IGRpZmZlcmVudGlhbCByZXZpc2lvbiBmb3I6ICR7Y2hhbmdlU2V0SWR9YCk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvLyBUT0RPIChjaGVuc2hlbikgVGhlIHJldHVybiB0eXBlIHNob3VsZCBiZSBgQXN5bmNFeGVjdXRlUmV0YCBpbmYgYEhnU2VydmljZS5kZWZgLCBidXQgZmxvd1xuICAvLyBkb2Vzbid0IGFsbG93IGltcG9ydGluZyBgLmRlZmAgZmlsZSB1bmxlc3Mgd2UgbWVyZ2UgYEhnU2VydmljZS5kZWZgIHRvIHRoaXMgZmlsZS5cbiAgYXN5bmMgZ2V0U21hcnRsb2codHR5T3V0cHV0OiBib29sZWFuLCBjb25jaXNlOiBib29sZWFuKTogUHJvbWlzZTxPYmplY3Q+IHtcbiAgICAvLyBkaXNhYmxlIHRoZSBwYWdlciBleHRlbnNpb24gc28gdGhhdCAnaGcgc2wnIHRlcm1pbmF0ZXMuIFdlIGNhbid0IGp1c3QgdXNlXG4gICAgLy8gSEdQTEFJTiBiZWNhdXNlIHdlIGhhdmUgbm90IGZvdW5kIGEgd2F5IHRvIGdldCBjb2xvcmVkIG91dHB1dCB3aGVuIHdlIGRvLlxuICAgIGNvbnN0IGFyZ3MgPSBbJy0tY29uZmlnJywgJ2V4dGVuc2lvbnMucGFnZXI9IScsIGNvbmNpc2UgPyAnc2wnIDogJ3NtYXJ0bG9nJ107XG4gICAgY29uc3QgZXhlY09wdGlvbnMgPSB7XG4gICAgICBjd2Q6IHRoaXMuZ2V0V29ya2luZ0RpcmVjdG9yeSgpLFxuICAgICAgTk9fSEdQTEFJTjogY29uY2lzZSwgLy8gYGhnIHNsYCBpcyBsaWtlbHkgdXNlci1kZWZpbmVkLlxuICAgICAgVFRZX09VVFBVVDogdHR5T3V0cHV0LFxuICAgIH07XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuX2hnQXN5bmNFeGVjdXRlKGFyZ3MsIGV4ZWNPcHRpb25zKTtcbiAgfVxuXG4gIGFzeW5jIF9jb21taXRDb2RlKFxuICAgIG1lc3NhZ2U6ID9zdHJpbmcsXG4gICAgZXh0cmFBcmdzPzogQXJyYXk8c3RyaW5nPiA9IFtdLFxuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBhcmdzID0gWydjb21taXQnXTtcbiAgICBsZXQgdGVtcEZpbGUgPSBudWxsO1xuICAgIGlmIChtZXNzYWdlICE9IG51bGwpIHtcbiAgICAgIHRlbXBGaWxlID0gYXdhaXQgZnNQcm9taXNlLnRlbXBmaWxlKCk7XG4gICAgICBhd2FpdCBmc1Byb21pc2Uud3JpdGVGaWxlKHRlbXBGaWxlLCBtZXNzYWdlKTtcbiAgICAgIGFyZ3MucHVzaCgnLWwnLCB0ZW1wRmlsZSk7XG4gICAgfVxuICAgIGNvbnN0IGV4ZWNPcHRpb25zID0ge1xuICAgICAgY3dkOiB0aGlzLmdldFdvcmtpbmdEaXJlY3RvcnkoKSxcbiAgICB9O1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLl9oZ0FzeW5jRXhlY3V0ZShhcmdzLmNvbmNhdChleHRyYUFyZ3MpLCBleGVjT3B0aW9ucyk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmICh0ZW1wRmlsZSAhPSBudWxsKSB7XG4gICAgICAgIGF3YWl0IGZzUHJvbWlzZS51bmxpbmsodGVtcEZpbGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGNvbW1pdChtZXNzYWdlOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLl9jb21taXRDb2RlKG1lc3NhZ2UpO1xuICB9XG5cbiAgYXN5bmMgYW1lbmQobWVzc2FnZTogP3N0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGV4dHJhQXJncyA9IFsnLS1hbWVuZCddO1xuICAgIGlmIChtZXNzYWdlID09IG51bGwpIHtcbiAgICAgIGV4dHJhQXJncy5wdXNoKCctLXJldXNlLW1lc3NhZ2UnLCAnLicpO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLl9jb21taXRDb2RlKG1lc3NhZ2UsIGV4dHJhQXJncyk7XG4gIH1cblxuICBhc3luYyBfcnVuU2ltcGxlSW5Xb3JraW5nRGlyZWN0b3J5KFxuICAgIGFjdGlvbjogc3RyaW5nLFxuICAgIGFyZ3M6IEFycmF5PHN0cmluZz4sXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICBjd2Q6IHRoaXMuZ2V0V29ya2luZ0RpcmVjdG9yeSgpLFxuICAgIH07XG4gICAgY29uc3QgY21kID0gW2FjdGlvbl0uY29uY2F0KGFyZ3MpO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLl9oZ0FzeW5jRXhlY3V0ZShjbWQsIG9wdGlvbnMpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGdldExvZ2dlcigpLmVycm9yKFxuICAgICAgICAnaGcgJXMgZmFpbGVkIHdpdGggWyVzXSBhcmd1bWVudHM6ICVzJyxcbiAgICAgICAgY21kLFxuICAgICAgICBhcmdzLnRvU3RyaW5nKCksXG4gICAgICAgIGUudG9TdHJpbmcoKSxcbiAgICAgICk7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGNoZWNrb3V0KHJldmlzaW9uOiBzdHJpbmcsIGNyZWF0ZTogYm9vbGVhbik6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuX3J1blNpbXBsZUluV29ya2luZ0RpcmVjdG9yeSgnY2hlY2tvdXQnLCBbcmV2aXNpb25dKTtcbiAgfVxuXG4gIGFzeW5jIHJlbmFtZShvbGRGaWxlUGF0aDogTnVjbGlkZVVyaSwgbmV3RmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLl9ydW5TaW1wbGVJbldvcmtpbmdEaXJlY3RvcnkoXG4gICAgICAncmVuYW1lJyxcbiAgICAgIFtnZXRQYXRoKG9sZEZpbGVQYXRoKSwgZ2V0UGF0aChuZXdGaWxlUGF0aCldLFxuICAgICk7XG4gIH1cblxuICBhc3luYyByZW1vdmUoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLl9ydW5TaW1wbGVJbldvcmtpbmdEaXJlY3RvcnkoJ3JlbW92ZScsIFsnLWYnLCBnZXRQYXRoKGZpbGVQYXRoKV0pO1xuICB9XG5cbiAgYXN5bmMgYWRkKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5fcnVuU2ltcGxlSW5Xb3JraW5nRGlyZWN0b3J5KCdhZGQnLCBbZ2V0UGF0aChmaWxlUGF0aCldKTtcbiAgfVxufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gSGdTZXJ2aWNlQmFzZTtcbiJdfQ==