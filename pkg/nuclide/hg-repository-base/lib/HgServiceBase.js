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
    key: 'commit',
    value: _asyncToGenerator(function* (message) {
      var tempFile = yield _nuclideCommons.fsPromise.tempfile();
      var execOptions = {
        cwd: this.getWorkingDirectory()
      };
      try {
        yield _nuclideCommons.fsPromise.writeFile(tempFile, message);
        var args = ['commit', '-l', tempFile];
        yield this._hgAsyncExecute(args, execOptions);
      } finally {
        yield _nuclideCommons.fsPromise.unlink(tempFile);
      }
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
//# sourceMappingURL=data:application/json;base64,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VUFBSTtBQUNGLGNBQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7T0FDMUMsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLGlCQUFTLEVBQUUsQ0FBQyxLQUFLLENBQ2Ysc0NBQXNDLEVBQ3RDLEdBQUcsRUFDSCxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQ2YsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUNiLENBQUM7QUFDRixjQUFNLENBQUMsQ0FBQztPQUNUO0tBQ0Y7Ozs2QkFFYSxXQUFDLFFBQWdCLEVBQUUsTUFBZSxFQUFpQjtBQUMvRCxZQUFNLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0tBQ2pFOzs7NkJBRVcsV0FBQyxXQUF1QixFQUFFLFdBQXVCLEVBQWlCO0FBQzVFLFlBQU0sSUFBSSxDQUFDLDRCQUE0QixDQUNyQyxRQUFRLEVBQ1IsQ0FBQyx3QkFBUSxXQUFXLENBQUMsRUFBRSx3QkFBUSxXQUFXLENBQUMsQ0FBQyxDQUM3QyxDQUFDO0tBQ0g7Ozs2QkFFVyxXQUFDLFFBQW9CLEVBQWlCO0FBQ2hELFlBQU0sSUFBSSxDQUFDLDRCQUE0QixDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSx3QkFBUSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDOUU7Ozs2QkFFUSxXQUFDLFFBQW9CLEVBQWlCO0FBQzdDLFlBQU0sSUFBSSxDQUFDLDRCQUE0QixDQUFDLEtBQUssRUFBRSxDQUFDLHdCQUFRLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNyRTs7O1NBalNHLGFBQWE7OztBQXFTbkIsTUFBTSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUMiLCJmaWxlIjoiSGdTZXJ2aWNlQmFzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbi8qIEBwcm92aWRlc01vZHVsZSBMb2NhbEhnU2VydmljZUJhc2UgKi9cblxuaW1wb3J0IHtIZ1N0YXR1c09wdGlvbn0gZnJvbSAnLi9oZy1jb25zdGFudHMnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBTdWJqZWN0fSBmcm9tICdyeCc7XG5pbXBvcnQge3BhcnNlSGdCbGFtZU91dHB1dH0gZnJvbSAnLi9oZy1ibGFtZS1vdXRwdXQtcGFyc2VyJztcbmltcG9ydCB7cGFyc2VNdWx0aUZpbGVIZ0RpZmZVbmlmaWVkT3V0cHV0fSBmcm9tICcuL2hnLWRpZmYtb3V0cHV0LXBhcnNlcic7XG5pbXBvcnQge1xuICBleHByZXNzaW9uRm9yQ29tbW9uQW5jZXN0b3IsXG4gIGV4cHJlc3Npb25Gb3JSZXZpc2lvbnNCZWZvcmVIZWFkLFxuICBmZXRjaFJldmlzaW9uSW5mb0JldHdlZW5SZXZpc2lvbnMsXG59IGZyb20gJy4vaGctcmV2aXNpb24tZXhwcmVzc2lvbi1oZWxwZXJzJztcbmltcG9ydCB7XG4gIGZldGNoRmlsZUNvbnRlbnRBdFJldmlzaW9uLFxuICBmZXRjaEZpbGVzQ2hhbmdlZEF0UmV2aXNpb24sXG59IGZyb20gJy4vaGctcmV2aXNpb24tc3RhdGUtaGVscGVycyc7XG5pbXBvcnQge2FzeW5jRXhlY3V0ZSwgY3JlYXRlQXJnc0ZvclNjcmlwdENvbW1hbmR9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IHtmc1Byb21pc2V9IGZyb20gJy4uLy4uLy4uL251Y2xpZGUvY29tbW9ucyc7XG5pbXBvcnQge2dldFBhdGh9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmltcG9ydCB0eXBlIHtEaWZmSW5mbywgUmV2aXNpb25GaWxlQ2hhbmdlcywgU3RhdHVzQ29kZUlkVmFsdWUsIFJldmlzaW9uSW5mb30gZnJvbSAnLi9oZy1jb25zdGFudHMnO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuXG5pbXBvcnQge3JlYWRBcmNDb25maWd9IGZyb20gJy4uLy4uL2FyY2FuaXN0LWJhc2UnO1xuXG5jb25zdCBERUZBVUxUX0ZPUktfQkFTRV9OQU1FID0gJ2RlZmF1bHQnO1xuXG5sZXQgbG9nZ2VyO1xuZnVuY3Rpb24gZ2V0TG9nZ2VyKCkge1xuICBpZiAoIWxvZ2dlcikge1xuICAgIGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL2xvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcbiAgfVxuICByZXR1cm4gbG9nZ2VyO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRGb3JrQmFzZU5hbWUoZGlyZWN0b3J5UGF0aDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgY29uc3QgYXJjQ29uZmlnID0gYXdhaXQgcmVhZEFyY0NvbmZpZyhkaXJlY3RvcnlQYXRoKTtcbiAgaWYgKGFyY0NvbmZpZyAhPSBudWxsKSB7XG4gICAgcmV0dXJuIGFyY0NvbmZpZ1snYXJjLmZlYXR1cmUuc3RhcnQuZGVmYXVsdCddIHx8IGFyY0NvbmZpZ1snYXJjLmxhbmQub250by5kZWZhdWx0J107XG4gIH1cbiAgcmV0dXJuIERFRkFVTFRfRk9SS19CQVNFX05BTUU7XG59XG5cbmNsYXNzIEhnU2VydmljZUJhc2Uge1xuICBfd29ya2luZ0RpcmVjdG9yeTogc3RyaW5nO1xuICBfZmlsZXNEaWRDaGFuZ2VPYnNlcnZlcjogU3ViamVjdDtcbiAgX2hnSWdub3JlRmlsZURpZENoYW5nZU9ic2VydmVyOiBTdWJqZWN0O1xuICBfaGdSZXBvU3RhdGVEaWRDaGFuZ2VPYnNlcnZlcjogU3ViamVjdDtcbiAgX2hnQm9va21hcmtEaWRDaGFuZ2VPYnNlcnZlcjogU3ViamVjdDtcblxuICBjb25zdHJ1Y3Rvcih3b3JraW5nRGlyZWN0b3J5OiBzdHJpbmcpIHtcbiAgICB0aGlzLl93b3JraW5nRGlyZWN0b3J5ID0gd29ya2luZ0RpcmVjdG9yeTtcbiAgICB0aGlzLl9maWxlc0RpZENoYW5nZU9ic2VydmVyID0gbmV3IFN1YmplY3QoKTtcbiAgICB0aGlzLl9oZ0lnbm9yZUZpbGVEaWRDaGFuZ2VPYnNlcnZlciA9IG5ldyBTdWJqZWN0KCk7XG4gICAgdGhpcy5faGdSZXBvU3RhdGVEaWRDaGFuZ2VPYnNlcnZlciA9IG5ldyBTdWJqZWN0KCk7XG4gICAgdGhpcy5faGdCb29rbWFya0RpZENoYW5nZU9ic2VydmVyID0gbmV3IFN1YmplY3QoKTtcbiAgfVxuXG4gIGFzeW5jIGRpc3Bvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5fZmlsZXNEaWRDaGFuZ2VPYnNlcnZlci5vbkNvbXBsZXRlZCgpO1xuICAgIHRoaXMuX2hnSWdub3JlRmlsZURpZENoYW5nZU9ic2VydmVyLm9uQ29tcGxldGVkKCk7XG4gICAgdGhpcy5faGdSZXBvU3RhdGVEaWRDaGFuZ2VPYnNlcnZlci5vbkNvbXBsZXRlZCgpO1xuICAgIHRoaXMuX2hnQm9va21hcmtEaWRDaGFuZ2VPYnNlcnZlci5vbkNvbXBsZXRlZCgpO1xuICB9XG5cbiAgZ2V0V29ya2luZ0RpcmVjdG9yeSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl93b3JraW5nRGlyZWN0b3J5O1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBIZ1NlcnZpY2U6OmZldGNoU3RhdHVzZXMgZm9yIGRldGFpbHMuXG4gICAqL1xuICBhc3luYyBmZXRjaFN0YXR1c2VzKFxuICAgIGZpbGVQYXRoczogQXJyYXk8c3RyaW5nPixcbiAgICBvcHRpb25zOiA/YW55XG4gICk6IFByb21pc2U8TWFwPHN0cmluZywgU3RhdHVzQ29kZUlkVmFsdWU+PiB7XG4gICAgY29uc3Qgc3RhdHVzTWFwID0gbmV3IE1hcCgpO1xuXG4gICAgbGV0IGFyZ3MgPSBbJ3N0YXR1cycsICctVGpzb24nXTtcbiAgICBpZiAob3B0aW9ucyAmJiAoJ2hnU3RhdHVzT3B0aW9uJyBpbiBvcHRpb25zKSkge1xuICAgICAgaWYgKG9wdGlvbnMuaGdTdGF0dXNPcHRpb24gPT09IEhnU3RhdHVzT3B0aW9uLk9OTFlfSUdOT1JFRCkge1xuICAgICAgICBhcmdzLnB1c2goJy0taWdub3JlZCcpO1xuICAgICAgfSBlbHNlIGlmIChvcHRpb25zLmhnU3RhdHVzT3B0aW9uID09PSBIZ1N0YXR1c09wdGlvbi5BTExfU1RBVFVTRVMpIHtcbiAgICAgICAgYXJncy5wdXNoKCctLWFsbCcpO1xuICAgICAgfVxuICAgIH1cbiAgICBhcmdzID0gYXJncy5jb25jYXQoZmlsZVBhdGhzKTtcbiAgICBjb25zdCBleGVjT3B0aW9ucyA9IHtcbiAgICAgIGN3ZDogdGhpcy5nZXRXb3JraW5nRGlyZWN0b3J5KCksXG4gICAgfTtcbiAgICBsZXQgb3V0cHV0O1xuICAgIHRyeSB7XG4gICAgICBvdXRwdXQgPSBhd2FpdCB0aGlzLl9oZ0FzeW5jRXhlY3V0ZShhcmdzLCBleGVjT3B0aW9ucyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIHN0YXR1c01hcDtcbiAgICB9XG5cbiAgICBjb25zdCBzdGF0dXNlcyA9IEpTT04ucGFyc2Uob3V0cHV0LnN0ZG91dCk7XG4gICAgc3RhdHVzZXMuZm9yRWFjaChzdGF0dXMgPT4ge1xuICAgICAgc3RhdHVzTWFwLnNldCh0aGlzLl9hYnNvbHV0aXplKHN0YXR1cy5wYXRoKSwgc3RhdHVzLnN0YXR1cyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHN0YXR1c01hcDtcbiAgfVxuXG4gIC8vIE1lcmN1cmlhbCByZXR1cm5zIGFsbCBwYXRocyByZWxhdGl2ZSB0byB0aGUgcmVwb3NpdG9yeSdzIHdvcmtpbmcgZGlyZWN0b3J5LlxuICAvLyBUaGlzIG1ldGhvZCB0cmFuc2Zvcm1zIGEgcGF0aCByZWxhdGl2ZSB0byB0aGUgd29ya2luZyBkaXJlY290cnkgaW50byBhblxuICAvLyBhYnNvbHV0ZSBwYXRoLlxuICBfYWJzb2x1dGl6ZShwYXRoUmVsYXRpdmVUb1dvcmtpbmdEaXJlY3Rvcnk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHBhdGguam9pbih0aGlzLl93b3JraW5nRGlyZWN0b3J5LCBwYXRoUmVsYXRpdmVUb1dvcmtpbmdEaXJlY3RvcnkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBIZ1NlcnZpY2UuZGVmOjpvYnNlcnZlRmlsZXNEaWRDaGFuZ2UgZm9yIGRldGFpbHMuXG4gICAqL1xuICBvYnNlcnZlRmlsZXNEaWRDaGFuZ2UoKTogT2JzZXJ2YWJsZTxBcnJheTxOdWNsaWRlVXJpPj4ge1xuICAgIHJldHVybiB0aGlzLl9maWxlc0RpZENoYW5nZU9ic2VydmVyO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBIZ1NlcnZpY2UuZGVmOjpvYnNlcnZlSGdJZ25vcmVGaWxlRGlkQ2hhbmdlIGZvciBkZXRhaWxzLlxuICAgKi9cbiAgb2JzZXJ2ZUhnSWdub3JlRmlsZURpZENoYW5nZSgpOiBPYnNlcnZhYmxlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5faGdJZ25vcmVGaWxlRGlkQ2hhbmdlT2JzZXJ2ZXI7XG4gIH1cblxuICAvKipcbiAgICogU2VlIEhnU2VydmljZS5kZWY6Om9ic2VydmVIZ1JlcG9TdGF0ZURpZENoYW5nZSBmb3IgZGV0YWlscy5cbiAgICovXG4gIG9ic2VydmVIZ1JlcG9TdGF0ZURpZENoYW5nZSgpOiBPYnNlcnZhYmxlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5faGdSZXBvU3RhdGVEaWRDaGFuZ2VPYnNlcnZlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgSGdTZXJ2aWNlLmRlZjo6ZmV0Y2hEaWZmSW5mb0ZvclBhdGhzIGZvciBkZXRhaWxzLlxuICAgKi9cbiAgYXN5bmMgZmV0Y2hEaWZmSW5mbyhmaWxlUGF0aHM6IEFycmF5PE51Y2xpZGVVcmk+KTogUHJvbWlzZTw/TWFwPE51Y2xpZGVVcmksIERpZmZJbmZvPj4ge1xuICAgIC8vICctLXVuaWZpZWQgMCcgZ2l2ZXMgdXMgMCBsaW5lcyBvZiBjb250ZXh0IGFyb3VuZCBlYWNoIGNoYW5nZSAod2UgZG9uJ3RcbiAgICAvLyBjYXJlIGFib3V0IHRoZSBjb250ZXh0KS5cbiAgICAvLyAnLS1ub3ByZWZpeCcgb21pdHMgdGhlIGEvIGFuZCBiLyBwcmVmaXhlcyBmcm9tIGZpbGVuYW1lcy5cbiAgICAvLyAnLS1ub2RhdGVzJyBhdm9pZHMgYXBwZW5kaW5nIGRhdGVzIHRvIHRoZSBmaWxlIHBhdGggbGluZS5cbiAgICBjb25zdCBhcmdzID0gWydkaWZmJywgJy0tdW5pZmllZCcsICcwJywgJy0tbm9wcmVmaXgnLCAnLS1ub2RhdGVzJ10uY29uY2F0KGZpbGVQYXRocyk7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIGN3ZDogdGhpcy5nZXRXb3JraW5nRGlyZWN0b3J5KCksXG4gICAgfTtcbiAgICBsZXQgb3V0cHV0O1xuICAgIHRyeSB7XG4gICAgICBvdXRwdXQgPSBhd2FpdCB0aGlzLl9oZ0FzeW5jRXhlY3V0ZShhcmdzLCBvcHRpb25zKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBnZXRMb2dnZXIoKS5lcnJvcihcbiAgICAgICAgICBgRXJyb3Igd2hlbiBydW5uaW5nIGhnIGRpZmYgZm9yIHBhdGhzOiAke2ZpbGVQYXRoc30gXFxuXFx0RXJyb3I6ICR7ZS5zdGRlcnJ9YCk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgcGF0aFRvRGlmZkluZm8gPSBwYXJzZU11bHRpRmlsZUhnRGlmZlVuaWZpZWRPdXRwdXQob3V0cHV0LnN0ZG91dCk7XG4gICAgY29uc3QgYWJzb2x1dGVQYXRoVG9EaWZmSW5mbyA9IG5ldyBNYXAoKTtcbiAgICBmb3IgKGNvbnN0IFtmaWxlUGF0aCwgZGlmZkluZm9dIG9mIHBhdGhUb0RpZmZJbmZvKSB7XG4gICAgICBhYnNvbHV0ZVBhdGhUb0RpZmZJbmZvLnNldCh0aGlzLl9hYnNvbHV0aXplKGZpbGVQYXRoKSwgZGlmZkluZm8pO1xuICAgIH1cbiAgICByZXR1cm4gYWJzb2x1dGVQYXRoVG9EaWZmSW5mbztcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxscyBvdXQgdG8gYXN5bmNFeGVjdXRlIHVzaW5nIHRoZSAnaGcnIGNvbW1hbmQuXG4gICAqIEBwYXJhbSBvcHRpb25zIGFzIHNwZWNpZmllZCBieSBodHRwOi8vbm9kZWpzLm9yZy9hcGkvY2hpbGRfcHJvY2Vzcy5odG1sLiBBZGRpdGlvbmFsIG9wdGlvbnM6XG4gICAqICAgLSBOT19IR1BMQUlOIHNldCBpZiB0aGUgJEhHUExBSU4gZW52aXJvbm1lbnQgdmFyaWFibGUgc2hvdWxkIG5vdCBiZSB1c2VkLlxuICAgKiAgIC0gVFRZX09VVFBVVCBzZXQgaWYgdGhlIGNvbW1hbmQgc2hvdWxkIGJlIHJ1biBhcyBpZiBpdCB3ZXJlIGF0dGFjaGVkIHRvIGEgdHR5LlxuICAgKi9cbiAgYXN5bmMgX2hnQXN5bmNFeGVjdXRlKGFyZ3M6IEFycmF5PHN0cmluZz4sIG9wdGlvbnM6IGFueSk6IFByb21pc2U8YW55PiB7XG4gICAgaWYgKCFvcHRpb25zWydOT19IR1BMQUlOJ10pIHtcbiAgICAgIC8vIFNldHRpbmcgSEdQTEFJTj0xIG92ZXJyaWRlcyBhbnkgY3VzdG9tIGFsaWFzZXMgYSB1c2VyIGhhcyBkZWZpbmVkLlxuICAgICAgaWYgKG9wdGlvbnMuZW52KSB7XG4gICAgICAgIG9wdGlvbnMuZW52WydIR1BMQUlOJ10gPSAxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qge2Fzc2lnbn0gPSByZXF1aXJlKCcuLi8uLi9jb21tb25zJykub2JqZWN0O1xuICAgICAgICBjb25zdCBlbnYgPSB7J0hHUExBSU4nOiAxfTtcbiAgICAgICAgYXNzaWduKGVudiwgcHJvY2Vzcy5lbnYpO1xuICAgICAgICBvcHRpb25zLmVudiA9IGVudjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgY21kO1xuICAgIGlmIChvcHRpb25zWydUVFlfT1VUUFVUJ10pIHtcbiAgICAgIGNtZCA9ICdzY3JpcHQnO1xuICAgICAgYXJncyA9IGNyZWF0ZUFyZ3NGb3JTY3JpcHRDb21tYW5kKCdoZycsIGFyZ3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjbWQgPSAnaGcnO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGF3YWl0IGFzeW5jRXhlY3V0ZShjbWQsIGFyZ3MsIG9wdGlvbnMpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGdldExvZ2dlcigpLmVycm9yKGBFcnJvciBleGVjdXRpbmcgaGcgY29tbWFuZDogJHtKU09OLnN0cmluZ2lmeShhcmdzKX0gYCArXG4gICAgICAgICAgYG9wdGlvbnM6ICR7SlNPTi5zdHJpbmdpZnkob3B0aW9ucyl9ICR7SlNPTi5zdHJpbmdpZnkoZSl9YCk7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxuXG4gIGZldGNoQ3VycmVudEJvb2ttYXJrKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3Qge2ZldGNoQ3VycmVudEJvb2ttYXJrfSA9IHJlcXVpcmUoJy4vaGctYm9va21hcmstaGVscGVycycpO1xuICAgIHJldHVybiBmZXRjaEN1cnJlbnRCb29rbWFyayhwYXRoLmpvaW4odGhpcy5fd29ya2luZ0RpcmVjdG9yeSwgJy5oZycpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgSGdTZXJ2aWNlOi5kZWY6b2JzZXJ2ZUhnQm9va21hcmtEaWRDaGFuZ2UgZm9yIGRldGFpbHMuXG4gICAqL1xuICBvYnNlcnZlSGdCb29rbWFya0RpZENoYW5nZSgpOiBPYnNlcnZhYmxlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5faGdCb29rbWFya0RpZENoYW5nZU9ic2VydmVyO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlY3Rpb246IFJlcG9zaXRvcnkgU3RhdGUgYXQgU3BlY2lmaWMgUmV2aXNpb25zXG4gICAqL1xuXG4gIGZldGNoRmlsZUNvbnRlbnRBdFJldmlzaW9uKGZpbGVQYXRoOiBOdWNsaWRlVXJpLCByZXZpc2lvbjogP3N0cmluZyk6IFByb21pc2U8P3N0cmluZz4ge1xuICAgIHJldHVybiBmZXRjaEZpbGVDb250ZW50QXRSZXZpc2lvbihmaWxlUGF0aCwgcmV2aXNpb24sIHRoaXMuX3dvcmtpbmdEaXJlY3RvcnkpO1xuICB9XG5cbiAgZmV0Y2hGaWxlc0NoYW5nZWRBdFJldmlzaW9uKHJldmlzaW9uOiBzdHJpbmcpOiBQcm9taXNlPD9SZXZpc2lvbkZpbGVDaGFuZ2VzPiB7XG4gICAgcmV0dXJuIGZldGNoRmlsZXNDaGFuZ2VkQXRSZXZpc2lvbihyZXZpc2lvbiwgdGhpcy5fd29ya2luZ0RpcmVjdG9yeSk7XG4gIH1cblxuICBhc3luYyBmZXRjaFJldmlzaW9uSW5mb0JldHdlZW5IZWFkQW5kQmFzZSgpOiBQcm9taXNlPD9BcnJheTxSZXZpc2lvbkluZm8+PiB7XG4gICAgY29uc3QgZm9rQmFzZU5hbWUgPSBhd2FpdCBnZXRGb3JrQmFzZU5hbWUodGhpcy5fd29ya2luZ0RpcmVjdG9yeSk7XG4gICAgY29uc3QgcmV2aXNpb25zSW5mbyA9IGF3YWl0IGZldGNoUmV2aXNpb25JbmZvQmV0d2VlblJldmlzaW9ucyhcbiAgICAgIGV4cHJlc3Npb25Gb3JDb21tb25BbmNlc3Rvcihmb2tCYXNlTmFtZSksXG4gICAgICBleHByZXNzaW9uRm9yUmV2aXNpb25zQmVmb3JlSGVhZCgwKSxcbiAgICAgIHRoaXMuX3dvcmtpbmdEaXJlY3RvcnksXG4gICAgKTtcbiAgICByZXR1cm4gcmV2aXNpb25zSW5mbztcbiAgfVxuXG4gIGFzeW5jIGdldEJsYW1lQXRIZWFkKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogUHJvbWlzZTxNYXA8c3RyaW5nLCBzdHJpbmc+PiB7XG4gICAgY29uc3QgYXJncyA9XG4gICAgICBbJ2JsYW1lJywgJy1yJywgJ3dkaXIoKScsICctVGpzb24nLCAnLS1jaGFuZ2VzZXQnLCAnLS11c2VyJywgJy0tbGluZS1udW1iZXInLCBmaWxlUGF0aF07XG4gICAgY29uc3QgZXhlY09wdGlvbnMgPSB7XG4gICAgICBjd2Q6IHRoaXMuZ2V0V29ya2luZ0RpcmVjdG9yeSgpLFxuICAgIH07XG4gICAgbGV0IG91dHB1dDtcbiAgICB0cnkge1xuICAgICAgb3V0cHV0ID0gYXdhaXQgdGhpcy5faGdBc3luY0V4ZWN1dGUoYXJncywgZXhlY09wdGlvbnMpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGdldExvZ2dlcigpLmVycm9yKFxuICAgICAgICAgIGBMb2NhbEhnU2VydmljZUJhc2UgZmFpbGVkIHRvIGZldGNoIGJsYW1lIGZvciBmaWxlOiAke2ZpbGVQYXRofS4gRXJyb3I6ICR7ZS5zdGRlcnJ9YCk7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgICByZXR1cm4gcGFyc2VIZ0JsYW1lT3V0cHV0KG91dHB1dC5zdGRvdXQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgaW1wbGVtZW50YXRpb24gcmVsaWVzIG9uIHRoZSBcInBoYWJkaWZmXCIgdGVtcGxhdGUgYmVpbmcgYXZhaWxhYmxlIGFzIGRlZmluZWQgaW46XG4gICAqIGh0dHBzOi8vYml0YnVja2V0Lm9yZy9mYWNlYm9vay9oZy1leHBlcmltZW50YWwvc3JjL2ZiZjIzYjNmOTZiYWRlNTk4NjEyMWE3YzU3ZDc0MDA1ODVkNzVmNTQvcGhhYmRpZmYucHkuXG4gICAqL1xuICBhc3luYyBnZXREaWZmZXJlbnRpYWxSZXZpc2lvbkZvckNoYW5nZVNldElkKGNoYW5nZVNldElkOiBzdHJpbmcpOiBQcm9taXNlPD9zdHJpbmc+IHtcbiAgICBjb25zdCBhcmdzID0gWydsb2cnLCAnLVQnLCAne3BoYWJkaWZmfVxcbicsICctLWxpbWl0JywgJzEnLCAnLS1yZXYnLCBjaGFuZ2VTZXRJZF07XG4gICAgY29uc3QgZXhlY09wdGlvbnMgPSB7XG4gICAgICBjd2Q6IHRoaXMuZ2V0V29ya2luZ0RpcmVjdG9yeSgpLFxuICAgIH07XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG91dHB1dCA9IGF3YWl0IHRoaXMuX2hnQXN5bmNFeGVjdXRlKGFyZ3MsIGV4ZWNPcHRpb25zKTtcbiAgICAgIGNvbnN0IHN0ZG91dCA9IG91dHB1dC5zdGRvdXQudHJpbSgpO1xuICAgICAgcmV0dXJuIHN0ZG91dCA/IHN0ZG91dCA6IG51bGw7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gVGhpcyBzaG91bGQgbm90IGhhcHBlbjogYGhnIGxvZ2AgZG9lcyBub3QgZXJyb3IgZXZlbiBpZiBpdCBkb2VzIG5vdCByZWNvZ25pemUgdGhlIHRlbXBsYXRlLlxuICAgICAgZ2V0TG9nZ2VyKCkuZXJyb3IoYEZhaWxlZCB3aGVuIHRyeWluZyB0byBnZXQgZGlmZmVyZW50aWFsIHJldmlzaW9uIGZvcjogJHtjaGFuZ2VTZXRJZH1gKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRPRE8gKGNoZW5zaGVuKSBUaGUgcmV0dXJuIHR5cGUgc2hvdWxkIGJlIGBBc3luY0V4ZWN1dGVSZXRgIGluZiBgSGdTZXJ2aWNlLmRlZmAsIGJ1dCBmbG93XG4gIC8vIGRvZXNuJ3QgYWxsb3cgaW1wb3J0aW5nIGAuZGVmYCBmaWxlIHVubGVzcyB3ZSBtZXJnZSBgSGdTZXJ2aWNlLmRlZmAgdG8gdGhpcyBmaWxlLlxuICBhc3luYyBnZXRTbWFydGxvZyh0dHlPdXRwdXQ6IGJvb2xlYW4sIGNvbmNpc2U6IGJvb2xlYW4pOiBQcm9taXNlPE9iamVjdD4ge1xuICAgIC8vIGRpc2FibGUgdGhlIHBhZ2VyIGV4dGVuc2lvbiBzbyB0aGF0ICdoZyBzbCcgdGVybWluYXRlcy4gV2UgY2FuJ3QganVzdCB1c2VcbiAgICAvLyBIR1BMQUlOIGJlY2F1c2Ugd2UgaGF2ZSBub3QgZm91bmQgYSB3YXkgdG8gZ2V0IGNvbG9yZWQgb3V0cHV0IHdoZW4gd2UgZG8uXG4gICAgY29uc3QgYXJncyA9IFsnLS1jb25maWcnLCAnZXh0ZW5zaW9ucy5wYWdlcj0hJywgY29uY2lzZSA/ICdzbCcgOiAnc21hcnRsb2cnXTtcbiAgICBjb25zdCBleGVjT3B0aW9ucyA9IHtcbiAgICAgIGN3ZDogdGhpcy5nZXRXb3JraW5nRGlyZWN0b3J5KCksXG4gICAgICBOT19IR1BMQUlOOiBjb25jaXNlLCAvLyBgaGcgc2xgIGlzIGxpa2VseSB1c2VyLWRlZmluZWQuXG4gICAgICBUVFlfT1VUUFVUOiB0dHlPdXRwdXQsXG4gICAgfTtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5faGdBc3luY0V4ZWN1dGUoYXJncywgZXhlY09wdGlvbnMpO1xuICB9XG5cbiAgYXN5bmMgY29tbWl0KG1lc3NhZ2U6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHRlbXBGaWxlID0gYXdhaXQgZnNQcm9taXNlLnRlbXBmaWxlKCk7XG4gICAgY29uc3QgZXhlY09wdGlvbnMgPSB7XG4gICAgICBjd2Q6IHRoaXMuZ2V0V29ya2luZ0RpcmVjdG9yeSgpLFxuICAgIH07XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGZzUHJvbWlzZS53cml0ZUZpbGUodGVtcEZpbGUsIG1lc3NhZ2UpO1xuICAgICAgY29uc3QgYXJncyA9IFsnY29tbWl0JywgJy1sJywgdGVtcEZpbGVdO1xuICAgICAgYXdhaXQgdGhpcy5faGdBc3luY0V4ZWN1dGUoYXJncywgZXhlY09wdGlvbnMpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBhd2FpdCBmc1Byb21pc2UudW5saW5rKHRlbXBGaWxlKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBfcnVuU2ltcGxlSW5Xb3JraW5nRGlyZWN0b3J5KFxuICAgIGFjdGlvbjogc3RyaW5nLFxuICAgIGFyZ3M6IEFycmF5PHN0cmluZz4sXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICBjd2Q6IHRoaXMuZ2V0V29ya2luZ0RpcmVjdG9yeSgpLFxuICAgIH07XG4gICAgY29uc3QgY21kID0gW2FjdGlvbl0uY29uY2F0KGFyZ3MpO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLl9oZ0FzeW5jRXhlY3V0ZShjbWQsIG9wdGlvbnMpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGdldExvZ2dlcigpLmVycm9yKFxuICAgICAgICAnaGcgJXMgZmFpbGVkIHdpdGggWyVzXSBhcmd1bWVudHM6ICVzJyxcbiAgICAgICAgY21kLFxuICAgICAgICBhcmdzLnRvU3RyaW5nKCksXG4gICAgICAgIGUudG9TdHJpbmcoKSxcbiAgICAgICk7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGNoZWNrb3V0KHJldmlzaW9uOiBzdHJpbmcsIGNyZWF0ZTogYm9vbGVhbik6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuX3J1blNpbXBsZUluV29ya2luZ0RpcmVjdG9yeSgnY2hlY2tvdXQnLCBbcmV2aXNpb25dKTtcbiAgfVxuXG4gIGFzeW5jIHJlbmFtZShvbGRGaWxlUGF0aDogTnVjbGlkZVVyaSwgbmV3RmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLl9ydW5TaW1wbGVJbldvcmtpbmdEaXJlY3RvcnkoXG4gICAgICAncmVuYW1lJyxcbiAgICAgIFtnZXRQYXRoKG9sZEZpbGVQYXRoKSwgZ2V0UGF0aChuZXdGaWxlUGF0aCldLFxuICAgICk7XG4gIH1cblxuICBhc3luYyByZW1vdmUoZmlsZVBhdGg6IE51Y2xpZGVVcmkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLl9ydW5TaW1wbGVJbldvcmtpbmdEaXJlY3RvcnkoJ3JlbW92ZScsIFsnLWYnLCBnZXRQYXRoKGZpbGVQYXRoKV0pO1xuICB9XG5cbiAgYXN5bmMgYWRkKGZpbGVQYXRoOiBOdWNsaWRlVXJpKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5fcnVuU2ltcGxlSW5Xb3JraW5nRGlyZWN0b3J5KCdhZGQnLCBbZ2V0UGF0aChmaWxlUGF0aCldKTtcbiAgfVxufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gSGdTZXJ2aWNlQmFzZTtcbiJdfQ==