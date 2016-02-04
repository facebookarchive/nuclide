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
        return false;
      }
      return true;
    })
  }, {
    key: 'checkout',
    value: function checkout(revision, create) {
      return this._runSimpleInWorkingDirectory('checkout', [revision]);
    }
  }, {
    key: 'rename',
    value: function rename(oldFilePath, newFilePath) {
      return this._runSimpleInWorkingDirectory('rename', [oldFilePath, newFilePath]);
    }
  }, {
    key: 'remove',
    value: function remove(filePath) {
      return this._runSimpleInWorkingDirectory('remove', [filePath]);
    }
  }, {
    key: 'add',
    value: function add(filePath) {
      return this._runSimpleInWorkingDirectory('add', [filePath]);
    }
  }]);

  return HgServiceBase;
})();

module.exports = HgServiceBase;
//# sourceMappingURL=data:application/json;base64,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LENBQUMsVUFBVSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztLQUNsRTs7O1dBRUssZ0JBQUMsV0FBbUIsRUFBRSxXQUFtQixFQUFvQjtBQUNqRSxhQUFPLElBQUksQ0FBQyw0QkFBNEIsQ0FDdEMsUUFBUSxFQUNSLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUMzQixDQUFDO0tBQ0g7OztXQUVLLGdCQUFDLFFBQWdCLEVBQW9CO0FBQ3pDLGFBQU8sSUFBSSxDQUFDLDRCQUE0QixDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7S0FDaEU7OztXQUVFLGFBQUMsUUFBZ0IsRUFBb0I7QUFDdEMsYUFBTyxJQUFJLENBQUMsNEJBQTRCLENBQUMsS0FBSyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztLQUM3RDs7O1NBN1JHLGFBQWE7OztBQWlTbkIsTUFBTSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUMiLCJmaWxlIjoiSGdTZXJ2aWNlQmFzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbi8qIEBwcm92aWRlc01vZHVsZSBMb2NhbEhnU2VydmljZUJhc2UgKi9cblxuaW1wb3J0IHtIZ1N0YXR1c09wdGlvbn0gZnJvbSAnLi9oZy1jb25zdGFudHMnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBTdWJqZWN0fSBmcm9tICdyeCc7XG5pbXBvcnQge3BhcnNlSGdCbGFtZU91dHB1dH0gZnJvbSAnLi9oZy1ibGFtZS1vdXRwdXQtcGFyc2VyJztcbmltcG9ydCB7cGFyc2VNdWx0aUZpbGVIZ0RpZmZVbmlmaWVkT3V0cHV0fSBmcm9tICcuL2hnLWRpZmYtb3V0cHV0LXBhcnNlcic7XG5pbXBvcnQge1xuICBmZXRjaENvbW1vbkFuY2VzdG9yT2ZIZWFkQW5kUmV2aXNpb24sXG4gIGV4cHJlc3Npb25Gb3JSZXZpc2lvbnNCZWZvcmVIZWFkLFxuICBmZXRjaFJldmlzaW9uSW5mb0JldHdlZW5SZXZpc2lvbnMsXG59IGZyb20gJy4vaGctcmV2aXNpb24tZXhwcmVzc2lvbi1oZWxwZXJzJztcbmltcG9ydCB7XG4gIGZldGNoRmlsZUNvbnRlbnRBdFJldmlzaW9uLFxuICBmZXRjaEZpbGVzQ2hhbmdlZEF0UmV2aXNpb24sXG59IGZyb20gJy4vaGctcmV2aXNpb24tc3RhdGUtaGVscGVycyc7XG5pbXBvcnQge2FzeW5jRXhlY3V0ZSwgY3JlYXRlQXJnc0ZvclNjcmlwdENvbW1hbmR9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmltcG9ydCB0eXBlIHtEaWZmSW5mbywgUmV2aXNpb25GaWxlQ2hhbmdlcywgU3RhdHVzQ29kZUlkVmFsdWUsIFJldmlzaW9uSW5mb30gZnJvbSAnLi9oZy1jb25zdGFudHMnO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuXG5pbXBvcnQge3JlYWRBcmNDb25maWd9IGZyb20gJy4uLy4uL2FyY2FuaXN0LWJhc2UnO1xuXG5jb25zdCBERUZBVUxUX0ZPUktfQkFTRV9OQU1FID0gJ2RlZmF1bHQnO1xuXG5sZXQgbG9nZ2VyO1xuZnVuY3Rpb24gZ2V0TG9nZ2VyKCkge1xuICBpZiAoIWxvZ2dlcikge1xuICAgIGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL2xvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcbiAgfVxuICByZXR1cm4gbG9nZ2VyO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRGb3JrQmFzZU5hbWUoZGlyZWN0b3J5UGF0aDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgY29uc3QgYXJjQ29uZmlnID0gYXdhaXQgcmVhZEFyY0NvbmZpZyhkaXJlY3RvcnlQYXRoKTtcbiAgaWYgKGFyY0NvbmZpZyAhPSBudWxsKSB7XG4gICAgcmV0dXJuIGFyY0NvbmZpZ1snYXJjLmZlYXR1cmUuc3RhcnQuZGVmYXVsdCddIHx8IGFyY0NvbmZpZ1snYXJjLmxhbmQub250by5kZWZhdWx0J107XG4gIH1cbiAgcmV0dXJuIERFRkFVTFRfRk9SS19CQVNFX05BTUU7XG59XG5cbmNsYXNzIEhnU2VydmljZUJhc2Uge1xuICBfd29ya2luZ0RpcmVjdG9yeTogc3RyaW5nO1xuICBfZmlsZXNEaWRDaGFuZ2VPYnNlcnZlcjogU3ViamVjdDtcbiAgX2hnSWdub3JlRmlsZURpZENoYW5nZU9ic2VydmVyOiBTdWJqZWN0O1xuICBfaGdSZXBvU3RhdGVEaWRDaGFuZ2VPYnNlcnZlcjogU3ViamVjdDtcbiAgX2hnQm9va21hcmtEaWRDaGFuZ2VPYnNlcnZlcjogU3ViamVjdDtcblxuICBjb25zdHJ1Y3Rvcih3b3JraW5nRGlyZWN0b3J5OiBzdHJpbmcpIHtcbiAgICB0aGlzLl93b3JraW5nRGlyZWN0b3J5ID0gd29ya2luZ0RpcmVjdG9yeTtcbiAgICB0aGlzLl9maWxlc0RpZENoYW5nZU9ic2VydmVyID0gbmV3IFN1YmplY3QoKTtcbiAgICB0aGlzLl9oZ0lnbm9yZUZpbGVEaWRDaGFuZ2VPYnNlcnZlciA9IG5ldyBTdWJqZWN0KCk7XG4gICAgdGhpcy5faGdSZXBvU3RhdGVEaWRDaGFuZ2VPYnNlcnZlciA9IG5ldyBTdWJqZWN0KCk7XG4gICAgdGhpcy5faGdCb29rbWFya0RpZENoYW5nZU9ic2VydmVyID0gbmV3IFN1YmplY3QoKTtcbiAgfVxuXG4gIGFzeW5jIGRpc3Bvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5fZmlsZXNEaWRDaGFuZ2VPYnNlcnZlci5vbkNvbXBsZXRlZCgpO1xuICAgIHRoaXMuX2hnSWdub3JlRmlsZURpZENoYW5nZU9ic2VydmVyLm9uQ29tcGxldGVkKCk7XG4gICAgdGhpcy5faGdSZXBvU3RhdGVEaWRDaGFuZ2VPYnNlcnZlci5vbkNvbXBsZXRlZCgpO1xuICAgIHRoaXMuX2hnQm9va21hcmtEaWRDaGFuZ2VPYnNlcnZlci5vbkNvbXBsZXRlZCgpO1xuICB9XG5cbiAgZ2V0V29ya2luZ0RpcmVjdG9yeSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl93b3JraW5nRGlyZWN0b3J5O1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBIZ1NlcnZpY2U6OmZldGNoU3RhdHVzZXMgZm9yIGRldGFpbHMuXG4gICAqL1xuICBhc3luYyBmZXRjaFN0YXR1c2VzKFxuICAgIGZpbGVQYXRoczogQXJyYXk8c3RyaW5nPixcbiAgICBvcHRpb25zOiA/YW55XG4gICk6IFByb21pc2U8TWFwPHN0cmluZywgU3RhdHVzQ29kZUlkVmFsdWU+PiB7XG4gICAgY29uc3Qgc3RhdHVzTWFwID0gbmV3IE1hcCgpO1xuXG4gICAgbGV0IGFyZ3MgPSBbJ3N0YXR1cycsICctVGpzb24nXTtcbiAgICBpZiAob3B0aW9ucyAmJiAoJ2hnU3RhdHVzT3B0aW9uJyBpbiBvcHRpb25zKSkge1xuICAgICAgaWYgKG9wdGlvbnMuaGdTdGF0dXNPcHRpb24gPT09IEhnU3RhdHVzT3B0aW9uLk9OTFlfSUdOT1JFRCkge1xuICAgICAgICBhcmdzLnB1c2goJy0taWdub3JlZCcpO1xuICAgICAgfSBlbHNlIGlmIChvcHRpb25zLmhnU3RhdHVzT3B0aW9uID09PSBIZ1N0YXR1c09wdGlvbi5BTExfU1RBVFVTRVMpIHtcbiAgICAgICAgYXJncy5wdXNoKCctLWFsbCcpO1xuICAgICAgfVxuICAgIH1cbiAgICBhcmdzID0gYXJncy5jb25jYXQoZmlsZVBhdGhzKTtcbiAgICBjb25zdCBleGVjT3B0aW9ucyA9IHtcbiAgICAgIGN3ZDogdGhpcy5nZXRXb3JraW5nRGlyZWN0b3J5KCksXG4gICAgfTtcbiAgICBsZXQgb3V0cHV0O1xuICAgIHRyeSB7XG4gICAgICBvdXRwdXQgPSBhd2FpdCB0aGlzLl9oZ0FzeW5jRXhlY3V0ZShhcmdzLCBleGVjT3B0aW9ucyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIHN0YXR1c01hcDtcbiAgICB9XG5cbiAgICBjb25zdCBzdGF0dXNlcyA9IEpTT04ucGFyc2Uob3V0cHV0LnN0ZG91dCk7XG4gICAgc3RhdHVzZXMuZm9yRWFjaCgoc3RhdHVzKSA9PiB7XG4gICAgICBzdGF0dXNNYXAuc2V0KHRoaXMuX2Fic29sdXRpemUoc3RhdHVzLnBhdGgpLCBzdGF0dXMuc3RhdHVzKTtcbiAgICB9KTtcbiAgICByZXR1cm4gc3RhdHVzTWFwO1xuICB9XG5cbiAgLy8gTWVyY3VyaWFsIHJldHVybnMgYWxsIHBhdGhzIHJlbGF0aXZlIHRvIHRoZSByZXBvc2l0b3J5J3Mgd29ya2luZyBkaXJlY3RvcnkuXG4gIC8vIFRoaXMgbWV0aG9kIHRyYW5zZm9ybXMgYSBwYXRoIHJlbGF0aXZlIHRvIHRoZSB3b3JraW5nIGRpcmVjb3RyeSBpbnRvIGFuXG4gIC8vIGFic29sdXRlIHBhdGguXG4gIF9hYnNvbHV0aXplKHBhdGhSZWxhdGl2ZVRvV29ya2luZ0RpcmVjdG9yeTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gcGF0aC5qb2luKHRoaXMuX3dvcmtpbmdEaXJlY3RvcnksIHBhdGhSZWxhdGl2ZVRvV29ya2luZ0RpcmVjdG9yeSk7XG4gIH1cblxuICAvKipcbiAgICogU2VlIEhnU2VydmljZS5kZWY6Om9ic2VydmVGaWxlc0RpZENoYW5nZSBmb3IgZGV0YWlscy5cbiAgICovXG4gIG9ic2VydmVGaWxlc0RpZENoYW5nZSgpOiBPYnNlcnZhYmxlPEFycmF5PE51Y2xpZGVVcmk+PiB7XG4gICAgcmV0dXJuIHRoaXMuX2ZpbGVzRGlkQ2hhbmdlT2JzZXJ2ZXI7XG4gIH1cblxuICAvKipcbiAgICogU2VlIEhnU2VydmljZS5kZWY6Om9ic2VydmVIZ0lnbm9yZUZpbGVEaWRDaGFuZ2UgZm9yIGRldGFpbHMuXG4gICAqL1xuICBvYnNlcnZlSGdJZ25vcmVGaWxlRGlkQ2hhbmdlKCk6IE9ic2VydmFibGU8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLl9oZ0lnbm9yZUZpbGVEaWRDaGFuZ2VPYnNlcnZlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgSGdTZXJ2aWNlLmRlZjo6b2JzZXJ2ZUhnUmVwb1N0YXRlRGlkQ2hhbmdlIGZvciBkZXRhaWxzLlxuICAgKi9cbiAgb2JzZXJ2ZUhnUmVwb1N0YXRlRGlkQ2hhbmdlKCk6IE9ic2VydmFibGU8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLl9oZ1JlcG9TdGF0ZURpZENoYW5nZU9ic2VydmVyO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBIZ1NlcnZpY2UuZGVmOjpmZXRjaERpZmZJbmZvRm9yUGF0aHMgZm9yIGRldGFpbHMuXG4gICAqL1xuICBhc3luYyBmZXRjaERpZmZJbmZvKFxuICAgIGZpbGVQYXRoczogQXJyYXk8TnVjbGlkZVVyaT4sXG4gICk6IFByb21pc2U8P01hcDxOdWNsaWRlVXJpLCBEaWZmSW5mbz4+XG4gIHtcbiAgICAvLyAnLS11bmlmaWVkIDAnIGdpdmVzIHVzIDAgbGluZXMgb2YgY29udGV4dCBhcm91bmQgZWFjaCBjaGFuZ2UgKHdlIGRvbid0XG4gICAgLy8gY2FyZSBhYm91dCB0aGUgY29udGV4dCkuXG4gICAgLy8gJy0tbm9wcmVmaXgnIG9taXRzIHRoZSBhLyBhbmQgYi8gcHJlZml4ZXMgZnJvbSBmaWxlbmFtZXMuXG4gICAgY29uc3QgYXJncyA9IFsnZGlmZicsICctLXVuaWZpZWQnLCAnMCcsICctLW5vcHJlZml4J10uY29uY2F0KGZpbGVQYXRocyk7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIGN3ZDogdGhpcy5nZXRXb3JraW5nRGlyZWN0b3J5KCksXG4gICAgfTtcbiAgICBsZXQgb3V0cHV0O1xuICAgIHRyeSB7XG4gICAgICBvdXRwdXQgPSBhd2FpdCB0aGlzLl9oZ0FzeW5jRXhlY3V0ZShhcmdzLCBvcHRpb25zKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBnZXRMb2dnZXIoKS5lcnJvcihcbiAgICAgICAgICBgRXJyb3Igd2hlbiBydW5uaW5nIGhnIGRpZmYgZm9yIHBhdGhzOiAke2ZpbGVQYXRoc30gXFxuXFx0RXJyb3I6ICR7ZS5zdGRlcnJ9YCk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgcGF0aFRvRGlmZkluZm8gPSBwYXJzZU11bHRpRmlsZUhnRGlmZlVuaWZpZWRPdXRwdXQob3V0cHV0LnN0ZG91dCk7XG4gICAgY29uc3QgYWJzb2x1dGVQYXRoVG9EaWZmSW5mbyA9IG5ldyBNYXAoKTtcbiAgICBmb3IgKGNvbnN0IFtmaWxlUGF0aCwgZGlmZkluZm9dIG9mIHBhdGhUb0RpZmZJbmZvKSB7XG4gICAgICBhYnNvbHV0ZVBhdGhUb0RpZmZJbmZvLnNldCh0aGlzLl9hYnNvbHV0aXplKGZpbGVQYXRoKSwgZGlmZkluZm8pO1xuICAgIH1cbiAgICByZXR1cm4gYWJzb2x1dGVQYXRoVG9EaWZmSW5mbztcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxscyBvdXQgdG8gYXN5bmNFeGVjdXRlIHVzaW5nIHRoZSAnaGcnIGNvbW1hbmQuXG4gICAqIEBwYXJhbSBvcHRpb25zIGFzIHNwZWNpZmllZCBieSBodHRwOi8vbm9kZWpzLm9yZy9hcGkvY2hpbGRfcHJvY2Vzcy5odG1sLiBBZGRpdGlvbmFsIG9wdGlvbnM6XG4gICAqICAgLSBOT19IR1BMQUlOIHNldCBpZiB0aGUgJEhHUExBSU4gZW52aXJvbm1lbnQgdmFyaWFibGUgc2hvdWxkIG5vdCBiZSB1c2VkLlxuICAgKiAgIC0gVFRZX09VVFBVVCBzZXQgaWYgdGhlIGNvbW1hbmQgc2hvdWxkIGJlIHJ1biBhcyBpZiBpdCB3ZXJlIGF0dGFjaGVkIHRvIGEgdHR5LlxuICAgKi9cbiAgYXN5bmMgX2hnQXN5bmNFeGVjdXRlKGFyZ3M6IEFycmF5PHN0cmluZz4sIG9wdGlvbnM6IGFueSk6IFByb21pc2U8YW55PiB7XG4gICAgaWYgKCFvcHRpb25zWydOT19IR1BMQUlOJ10pIHtcbiAgICAgIC8vIFNldHRpbmcgSEdQTEFJTj0xIG92ZXJyaWRlcyBhbnkgY3VzdG9tIGFsaWFzZXMgYSB1c2VyIGhhcyBkZWZpbmVkLlxuICAgICAgaWYgKG9wdGlvbnMuZW52KSB7XG4gICAgICAgIG9wdGlvbnMuZW52WydIR1BMQUlOJ10gPSAxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qge2Fzc2lnbn0gPSByZXF1aXJlKCcuLi8uLi9jb21tb25zJykub2JqZWN0O1xuICAgICAgICBjb25zdCBlbnYgPSB7J0hHUExBSU4nOiAxfTtcbiAgICAgICAgYXNzaWduKGVudiwgcHJvY2Vzcy5lbnYpO1xuICAgICAgICBvcHRpb25zLmVudiA9IGVudjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgY21kO1xuICAgIGlmIChvcHRpb25zWydUVFlfT1VUUFVUJ10pIHtcbiAgICAgIGNtZCA9ICdzY3JpcHQnO1xuICAgICAgYXJncyA9IGNyZWF0ZUFyZ3NGb3JTY3JpcHRDb21tYW5kKCdoZycsIGFyZ3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjbWQgPSAnaGcnO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGF3YWl0IGFzeW5jRXhlY3V0ZShjbWQsIGFyZ3MsIG9wdGlvbnMpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGdldExvZ2dlcigpLmVycm9yKGBFcnJvciBleGVjdXRpbmcgaGcgY29tbWFuZDogJHtKU09OLnN0cmluZ2lmeShhcmdzKX0gYCArXG4gICAgICAgICAgYG9wdGlvbnM6ICR7SlNPTi5zdHJpbmdpZnkob3B0aW9ucyl9ICR7SlNPTi5zdHJpbmdpZnkoZSl9YCk7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxuXG4gIGZldGNoQ3VycmVudEJvb2ttYXJrKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3Qge2ZldGNoQ3VycmVudEJvb2ttYXJrfSA9IHJlcXVpcmUoJy4vaGctYm9va21hcmstaGVscGVycycpO1xuICAgIHJldHVybiBmZXRjaEN1cnJlbnRCb29rbWFyayhwYXRoLmpvaW4odGhpcy5fd29ya2luZ0RpcmVjdG9yeSwgJy5oZycpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgSGdTZXJ2aWNlOi5kZWY6b2JzZXJ2ZUhnQm9va21hcmtEaWRDaGFuZ2UgZm9yIGRldGFpbHMuXG4gICAqL1xuICBvYnNlcnZlSGdCb29rbWFya0RpZENoYW5nZSgpOiBPYnNlcnZhYmxlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5faGdCb29rbWFya0RpZENoYW5nZU9ic2VydmVyO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlY3Rpb246IFJlcG9zaXRvcnkgU3RhdGUgYXQgU3BlY2lmaWMgUmV2aXNpb25zXG4gICAqL1xuXG4gIGZldGNoRmlsZUNvbnRlbnRBdFJldmlzaW9uKGZpbGVQYXRoOiBOdWNsaWRlVXJpLCByZXZpc2lvbjogP3N0cmluZyk6IFByb21pc2U8P3N0cmluZz4ge1xuICAgIHJldHVybiBmZXRjaEZpbGVDb250ZW50QXRSZXZpc2lvbihmaWxlUGF0aCwgcmV2aXNpb24sIHRoaXMuX3dvcmtpbmdEaXJlY3RvcnkpO1xuICB9XG5cbiAgZmV0Y2hGaWxlc0NoYW5nZWRBdFJldmlzaW9uKHJldmlzaW9uOiBzdHJpbmcpOiBQcm9taXNlPD9SZXZpc2lvbkZpbGVDaGFuZ2VzPiB7XG4gICAgcmV0dXJuIGZldGNoRmlsZXNDaGFuZ2VkQXRSZXZpc2lvbihyZXZpc2lvbiwgdGhpcy5fd29ya2luZ0RpcmVjdG9yeSk7XG4gIH1cblxuICBhc3luYyBmZXRjaFJldmlzaW9uSW5mb0JldHdlZW5IZWFkQW5kQmFzZSgpOiBQcm9taXNlPD9BcnJheTxSZXZpc2lvbkluZm8+PiB7XG4gICAgY29uc3QgZm9rQmFzZU5hbWUgPSBhd2FpdCBnZXRGb3JrQmFzZU5hbWUodGhpcy5fd29ya2luZ0RpcmVjdG9yeSk7XG4gICAgY29uc3QgY29tbW9uQW5jZXN0b3JSZXZpc2lvbiA9IGF3YWl0IGZldGNoQ29tbW9uQW5jZXN0b3JPZkhlYWRBbmRSZXZpc2lvbihcbiAgICAgIGZva0Jhc2VOYW1lLFxuICAgICAgdGhpcy5fd29ya2luZ0RpcmVjdG9yeSxcbiAgICApO1xuICAgIGlmICghY29tbW9uQW5jZXN0b3JSZXZpc2lvbikge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHJldmlzaW9uc0luZm8gPSBhd2FpdCBmZXRjaFJldmlzaW9uSW5mb0JldHdlZW5SZXZpc2lvbnMoXG4gICAgICBjb21tb25BbmNlc3RvclJldmlzaW9uLFxuICAgICAgZXhwcmVzc2lvbkZvclJldmlzaW9uc0JlZm9yZUhlYWQoMCksXG4gICAgICB0aGlzLl93b3JraW5nRGlyZWN0b3J5LFxuICAgICk7XG4gICAgcmV0dXJuIHJldmlzaW9uc0luZm87XG4gIH1cblxuICBhc3luYyBnZXRCbGFtZUF0SGVhZChmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8TWFwPHN0cmluZywgc3RyaW5nPj4ge1xuICAgIGNvbnN0IGFyZ3MgPVxuICAgICAgWydibGFtZScsICctcicsICd3ZGlyKCknLCAnLVRqc29uJywgJy0tY2hhbmdlc2V0JywgJy0tdXNlcicsICctLWxpbmUtbnVtYmVyJywgZmlsZVBhdGhdO1xuICAgIGNvbnN0IGV4ZWNPcHRpb25zID0ge1xuICAgICAgY3dkOiB0aGlzLmdldFdvcmtpbmdEaXJlY3RvcnkoKSxcbiAgICB9O1xuICAgIGxldCBvdXRwdXQ7XG4gICAgdHJ5IHtcbiAgICAgIG91dHB1dCA9IGF3YWl0IHRoaXMuX2hnQXN5bmNFeGVjdXRlKGFyZ3MsIGV4ZWNPcHRpb25zKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBnZXRMb2dnZXIoKS5lcnJvcihcbiAgICAgICAgICBgTG9jYWxIZ1NlcnZpY2VCYXNlIGZhaWxlZCB0byBmZXRjaCBibGFtZSBmb3IgZmlsZTogJHtmaWxlUGF0aH0uIEVycm9yOiAke2Uuc3RkZXJyfWApO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcnNlSGdCbGFtZU91dHB1dChvdXRwdXQuc3Rkb3V0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGltcGxlbWVudGF0aW9uIHJlbGllcyBvbiB0aGUgXCJwaGFiZGlmZlwiIHRlbXBsYXRlIGJlaW5nIGF2YWlsYWJsZSBhcyBkZWZpbmVkIGluOlxuICAgKiBodHRwczovL2JpdGJ1Y2tldC5vcmcvZmFjZWJvb2svaGctZXhwZXJpbWVudGFsL3NyYy9mYmYyM2IzZjk2YmFkZTU5ODYxMjFhN2M1N2Q3NDAwNTg1ZDc1ZjU0L3BoYWJkaWZmLnB5LlxuICAgKi9cbiAgYXN5bmMgZ2V0RGlmZmVyZW50aWFsUmV2aXNpb25Gb3JDaGFuZ2VTZXRJZChjaGFuZ2VTZXRJZDogc3RyaW5nKTogUHJvbWlzZTw/c3RyaW5nPiB7XG4gICAgY29uc3QgYXJncyA9IFsnbG9nJywgJy1UJywgJ3twaGFiZGlmZn1cXG4nLCAnLS1saW1pdCcsICcxJywgJy0tcmV2JywgY2hhbmdlU2V0SWRdO1xuICAgIGNvbnN0IGV4ZWNPcHRpb25zID0ge1xuICAgICAgY3dkOiB0aGlzLmdldFdvcmtpbmdEaXJlY3RvcnkoKSxcbiAgICB9O1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBvdXRwdXQgPSBhd2FpdCB0aGlzLl9oZ0FzeW5jRXhlY3V0ZShhcmdzLCBleGVjT3B0aW9ucyk7XG4gICAgICBjb25zdCBzdGRvdXQgPSBvdXRwdXQuc3Rkb3V0LnRyaW0oKTtcbiAgICAgIHJldHVybiBzdGRvdXQgPyBzdGRvdXQgOiBudWxsO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIFRoaXMgc2hvdWxkIG5vdCBoYXBwZW46IGBoZyBsb2dgIGRvZXMgbm90IGVycm9yIGV2ZW4gaWYgaXQgZG9lcyBub3QgcmVjb2duaXplIHRoZSB0ZW1wbGF0ZS5cbiAgICAgIGdldExvZ2dlcigpLmVycm9yKGBGYWlsZWQgd2hlbiB0cnlpbmcgdG8gZ2V0IGRpZmZlcmVudGlhbCByZXZpc2lvbiBmb3I6ICR7Y2hhbmdlU2V0SWR9YCk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvLyBUT0RPIChjaGVuc2hlbikgVGhlIHJldHVybiB0eXBlIHNob3VsZCBiZSBgQXN5bmNFeGVjdXRlUmV0YCBpbmYgYEhnU2VydmljZS5kZWZgLCBidXQgZmxvd1xuICAvLyBkb2Vzbid0IGFsbG93IGltcG9ydGluZyBgLmRlZmAgZmlsZSB1bmxlc3Mgd2UgbWVyZ2UgYEhnU2VydmljZS5kZWZgIHRvIHRoaXMgZmlsZS5cbiAgYXN5bmMgZ2V0U21hcnRsb2codHR5T3V0cHV0OiBib29sZWFuLCBjb25jaXNlOiBib29sZWFuKTogUHJvbWlzZTxPYmplY3Q+IHtcbiAgICAvLyBkaXNhYmxlIHRoZSBwYWdlciBleHRlbnNpb24gc28gdGhhdCAnaGcgc2wnIHRlcm1pbmF0ZXMuIFdlIGNhbid0IGp1c3QgdXNlXG4gICAgLy8gSEdQTEFJTiBiZWNhdXNlIHdlIGhhdmUgbm90IGZvdW5kIGEgd2F5IHRvIGdldCBjb2xvcmVkIG91dHB1dCB3aGVuIHdlIGRvLlxuICAgIGNvbnN0IGFyZ3MgPSBbJy0tY29uZmlnJywgJ2V4dGVuc2lvbnMucGFnZXI9IScsIGNvbmNpc2UgPyAnc2wnIDogJ3NtYXJ0bG9nJ107XG4gICAgY29uc3QgZXhlY09wdGlvbnMgPSB7XG4gICAgICBjd2Q6IHRoaXMuZ2V0V29ya2luZ0RpcmVjdG9yeSgpLFxuICAgICAgTk9fSEdQTEFJTjogY29uY2lzZSwgLy8gYGhnIHNsYCBpcyBsaWtlbHkgdXNlci1kZWZpbmVkLlxuICAgICAgVFRZX09VVFBVVDogdHR5T3V0cHV0LFxuICAgIH07XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuX2hnQXN5bmNFeGVjdXRlKGFyZ3MsIGV4ZWNPcHRpb25zKTtcbiAgfVxuXG4gIGFzeW5jIF9ydW5TaW1wbGVJbldvcmtpbmdEaXJlY3RvcnkoXG4gICAgYWN0aW9uOiBzdHJpbmcsXG4gICAgYXJnczogQXJyYXk8c3RyaW5nPixcbiAgKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIGN3ZDogdGhpcy5nZXRXb3JraW5nRGlyZWN0b3J5KCksXG4gICAgfTtcbiAgICBjb25zdCBjbWQgPSBbYWN0aW9uXS5jb25jYXQoYXJncyk7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuX2hnQXN5bmNFeGVjdXRlKGNtZCwgb3B0aW9ucyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgZ2V0TG9nZ2VyKCkuZXJyb3IoXG4gICAgICAgICdoZyAlcyBmYWlsZWQgd2l0aCBbJXNdIGFyZ3VtZW50czogJXMnLFxuICAgICAgICBjbWQsXG4gICAgICAgIGFyZ3MudG9TdHJpbmcoKSxcbiAgICAgICAgZS50b1N0cmluZygpLFxuICAgICAgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBjaGVja291dChyZXZpc2lvbjogc3RyaW5nLCBjcmVhdGU6IGJvb2xlYW4pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5fcnVuU2ltcGxlSW5Xb3JraW5nRGlyZWN0b3J5KCdjaGVja291dCcsIFtyZXZpc2lvbl0pO1xuICB9XG5cbiAgcmVuYW1lKG9sZEZpbGVQYXRoOiBzdHJpbmcsIG5ld0ZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5fcnVuU2ltcGxlSW5Xb3JraW5nRGlyZWN0b3J5KFxuICAgICAgJ3JlbmFtZScsXG4gICAgICBbb2xkRmlsZVBhdGgsIG5ld0ZpbGVQYXRoXSxcbiAgICApO1xuICB9XG5cbiAgcmVtb3ZlKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5fcnVuU2ltcGxlSW5Xb3JraW5nRGlyZWN0b3J5KCdyZW1vdmUnLCBbZmlsZVBhdGhdKTtcbiAgfVxuXG4gIGFkZChmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHRoaXMuX3J1blNpbXBsZUluV29ya2luZ0RpcmVjdG9yeSgnYWRkJywgW2ZpbGVQYXRoXSk7XG4gIH1cbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEhnU2VydmljZUJhc2U7XG4iXX0=