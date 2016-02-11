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
//# sourceMappingURL=data:application/json;base64,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NEJBQTRCLENBQ3RDLFFBQVEsRUFDUixDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FDM0IsQ0FBQztLQUNIOzs7V0FFSyxnQkFBQyxRQUFnQixFQUFvQjtBQUN6QyxhQUFPLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0tBQ2hFOzs7V0FFRSxhQUFDLFFBQWdCLEVBQW9CO0FBQ3RDLGFBQU8sSUFBSSxDQUFDLDRCQUE0QixDQUFDLEtBQUssRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7S0FDN0Q7OztTQXBSRyxhQUFhOzs7QUF3Um5CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFDIiwiZmlsZSI6IkhnU2VydmljZUJhc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4vKiBAcHJvdmlkZXNNb2R1bGUgTG9jYWxIZ1NlcnZpY2VCYXNlICovXG5cbmltcG9ydCB7SGdTdGF0dXNPcHRpb259IGZyb20gJy4vaGctY29uc3RhbnRzJztcbmltcG9ydCB7T2JzZXJ2YWJsZSwgU3ViamVjdH0gZnJvbSAncngnO1xuaW1wb3J0IHtwYXJzZUhnQmxhbWVPdXRwdXR9IGZyb20gJy4vaGctYmxhbWUtb3V0cHV0LXBhcnNlcic7XG5pbXBvcnQge3BhcnNlTXVsdGlGaWxlSGdEaWZmVW5pZmllZE91dHB1dH0gZnJvbSAnLi9oZy1kaWZmLW91dHB1dC1wYXJzZXInO1xuaW1wb3J0IHtcbiAgZXhwcmVzc2lvbkZvckNvbW1vbkFuY2VzdG9yLFxuICBleHByZXNzaW9uRm9yUmV2aXNpb25zQmVmb3JlSGVhZCxcbiAgZmV0Y2hSZXZpc2lvbkluZm9CZXR3ZWVuUmV2aXNpb25zLFxufSBmcm9tICcuL2hnLXJldmlzaW9uLWV4cHJlc3Npb24taGVscGVycyc7XG5pbXBvcnQge1xuICBmZXRjaEZpbGVDb250ZW50QXRSZXZpc2lvbixcbiAgZmV0Y2hGaWxlc0NoYW5nZWRBdFJldmlzaW9uLFxufSBmcm9tICcuL2hnLXJldmlzaW9uLXN0YXRlLWhlbHBlcnMnO1xuaW1wb3J0IHthc3luY0V4ZWN1dGUsIGNyZWF0ZUFyZ3NGb3JTY3JpcHRDb21tYW5kfSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQgdHlwZSB7RGlmZkluZm8sIFJldmlzaW9uRmlsZUNoYW5nZXMsIFN0YXR1c0NvZGVJZFZhbHVlLCBSZXZpc2lvbkluZm99IGZyb20gJy4vaGctY29uc3RhbnRzJztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcblxuaW1wb3J0IHtyZWFkQXJjQ29uZmlnfSBmcm9tICcuLi8uLi9hcmNhbmlzdC1iYXNlJztcblxuY29uc3QgREVGQVVMVF9GT1JLX0JBU0VfTkFNRSA9ICdkZWZhdWx0JztcblxubGV0IGxvZ2dlcjtcbmZ1bmN0aW9uIGdldExvZ2dlcigpIHtcbiAgaWYgKCFsb2dnZXIpIHtcbiAgICBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG4gIH1cbiAgcmV0dXJuIGxvZ2dlcjtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0Rm9ya0Jhc2VOYW1lKGRpcmVjdG9yeVBhdGg6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gIGNvbnN0IGFyY0NvbmZpZyA9IGF3YWl0IHJlYWRBcmNDb25maWcoZGlyZWN0b3J5UGF0aCk7XG4gIGlmIChhcmNDb25maWcgIT0gbnVsbCkge1xuICAgIHJldHVybiBhcmNDb25maWdbJ2FyYy5mZWF0dXJlLnN0YXJ0LmRlZmF1bHQnXSB8fCBhcmNDb25maWdbJ2FyYy5sYW5kLm9udG8uZGVmYXVsdCddO1xuICB9XG4gIHJldHVybiBERUZBVUxUX0ZPUktfQkFTRV9OQU1FO1xufVxuXG5jbGFzcyBIZ1NlcnZpY2VCYXNlIHtcbiAgX3dvcmtpbmdEaXJlY3Rvcnk6IHN0cmluZztcbiAgX2ZpbGVzRGlkQ2hhbmdlT2JzZXJ2ZXI6IFN1YmplY3Q7XG4gIF9oZ0lnbm9yZUZpbGVEaWRDaGFuZ2VPYnNlcnZlcjogU3ViamVjdDtcbiAgX2hnUmVwb1N0YXRlRGlkQ2hhbmdlT2JzZXJ2ZXI6IFN1YmplY3Q7XG4gIF9oZ0Jvb2ttYXJrRGlkQ2hhbmdlT2JzZXJ2ZXI6IFN1YmplY3Q7XG5cbiAgY29uc3RydWN0b3Iod29ya2luZ0RpcmVjdG9yeTogc3RyaW5nKSB7XG4gICAgdGhpcy5fd29ya2luZ0RpcmVjdG9yeSA9IHdvcmtpbmdEaXJlY3Rvcnk7XG4gICAgdGhpcy5fZmlsZXNEaWRDaGFuZ2VPYnNlcnZlciA9IG5ldyBTdWJqZWN0KCk7XG4gICAgdGhpcy5faGdJZ25vcmVGaWxlRGlkQ2hhbmdlT2JzZXJ2ZXIgPSBuZXcgU3ViamVjdCgpO1xuICAgIHRoaXMuX2hnUmVwb1N0YXRlRGlkQ2hhbmdlT2JzZXJ2ZXIgPSBuZXcgU3ViamVjdCgpO1xuICAgIHRoaXMuX2hnQm9va21hcmtEaWRDaGFuZ2VPYnNlcnZlciA9IG5ldyBTdWJqZWN0KCk7XG4gIH1cblxuICBhc3luYyBkaXNwb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuX2ZpbGVzRGlkQ2hhbmdlT2JzZXJ2ZXIub25Db21wbGV0ZWQoKTtcbiAgICB0aGlzLl9oZ0lnbm9yZUZpbGVEaWRDaGFuZ2VPYnNlcnZlci5vbkNvbXBsZXRlZCgpO1xuICAgIHRoaXMuX2hnUmVwb1N0YXRlRGlkQ2hhbmdlT2JzZXJ2ZXIub25Db21wbGV0ZWQoKTtcbiAgICB0aGlzLl9oZ0Jvb2ttYXJrRGlkQ2hhbmdlT2JzZXJ2ZXIub25Db21wbGV0ZWQoKTtcbiAgfVxuXG4gIGdldFdvcmtpbmdEaXJlY3RvcnkoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fd29ya2luZ0RpcmVjdG9yeTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgSGdTZXJ2aWNlOjpmZXRjaFN0YXR1c2VzIGZvciBkZXRhaWxzLlxuICAgKi9cbiAgYXN5bmMgZmV0Y2hTdGF0dXNlcyhcbiAgICBmaWxlUGF0aHM6IEFycmF5PHN0cmluZz4sXG4gICAgb3B0aW9uczogP2FueVxuICApOiBQcm9taXNlPE1hcDxzdHJpbmcsIFN0YXR1c0NvZGVJZFZhbHVlPj4ge1xuICAgIGNvbnN0IHN0YXR1c01hcCA9IG5ldyBNYXAoKTtcblxuICAgIGxldCBhcmdzID0gWydzdGF0dXMnLCAnLVRqc29uJ107XG4gICAgaWYgKG9wdGlvbnMgJiYgKCdoZ1N0YXR1c09wdGlvbicgaW4gb3B0aW9ucykpIHtcbiAgICAgIGlmIChvcHRpb25zLmhnU3RhdHVzT3B0aW9uID09PSBIZ1N0YXR1c09wdGlvbi5PTkxZX0lHTk9SRUQpIHtcbiAgICAgICAgYXJncy5wdXNoKCctLWlnbm9yZWQnKTtcbiAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5oZ1N0YXR1c09wdGlvbiA9PT0gSGdTdGF0dXNPcHRpb24uQUxMX1NUQVRVU0VTKSB7XG4gICAgICAgIGFyZ3MucHVzaCgnLS1hbGwnKTtcbiAgICAgIH1cbiAgICB9XG4gICAgYXJncyA9IGFyZ3MuY29uY2F0KGZpbGVQYXRocyk7XG4gICAgY29uc3QgZXhlY09wdGlvbnMgPSB7XG4gICAgICBjd2Q6IHRoaXMuZ2V0V29ya2luZ0RpcmVjdG9yeSgpLFxuICAgIH07XG4gICAgbGV0IG91dHB1dDtcbiAgICB0cnkge1xuICAgICAgb3V0cHV0ID0gYXdhaXQgdGhpcy5faGdBc3luY0V4ZWN1dGUoYXJncywgZXhlY09wdGlvbnMpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBzdGF0dXNNYXA7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RhdHVzZXMgPSBKU09OLnBhcnNlKG91dHB1dC5zdGRvdXQpO1xuICAgIHN0YXR1c2VzLmZvckVhY2goc3RhdHVzID0+IHtcbiAgICAgIHN0YXR1c01hcC5zZXQodGhpcy5fYWJzb2x1dGl6ZShzdGF0dXMucGF0aCksIHN0YXR1cy5zdGF0dXMpO1xuICAgIH0pO1xuICAgIHJldHVybiBzdGF0dXNNYXA7XG4gIH1cblxuICAvLyBNZXJjdXJpYWwgcmV0dXJucyBhbGwgcGF0aHMgcmVsYXRpdmUgdG8gdGhlIHJlcG9zaXRvcnkncyB3b3JraW5nIGRpcmVjdG9yeS5cbiAgLy8gVGhpcyBtZXRob2QgdHJhbnNmb3JtcyBhIHBhdGggcmVsYXRpdmUgdG8gdGhlIHdvcmtpbmcgZGlyZWNvdHJ5IGludG8gYW5cbiAgLy8gYWJzb2x1dGUgcGF0aC5cbiAgX2Fic29sdXRpemUocGF0aFJlbGF0aXZlVG9Xb3JraW5nRGlyZWN0b3J5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBwYXRoLmpvaW4odGhpcy5fd29ya2luZ0RpcmVjdG9yeSwgcGF0aFJlbGF0aXZlVG9Xb3JraW5nRGlyZWN0b3J5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgSGdTZXJ2aWNlLmRlZjo6b2JzZXJ2ZUZpbGVzRGlkQ2hhbmdlIGZvciBkZXRhaWxzLlxuICAgKi9cbiAgb2JzZXJ2ZUZpbGVzRGlkQ2hhbmdlKCk6IE9ic2VydmFibGU8QXJyYXk8TnVjbGlkZVVyaT4+IHtcbiAgICByZXR1cm4gdGhpcy5fZmlsZXNEaWRDaGFuZ2VPYnNlcnZlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWUgSGdTZXJ2aWNlLmRlZjo6b2JzZXJ2ZUhnSWdub3JlRmlsZURpZENoYW5nZSBmb3IgZGV0YWlscy5cbiAgICovXG4gIG9ic2VydmVIZ0lnbm9yZUZpbGVEaWRDaGFuZ2UoKTogT2JzZXJ2YWJsZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuX2hnSWdub3JlRmlsZURpZENoYW5nZU9ic2VydmVyO1xuICB9XG5cbiAgLyoqXG4gICAqIFNlZSBIZ1NlcnZpY2UuZGVmOjpvYnNlcnZlSGdSZXBvU3RhdGVEaWRDaGFuZ2UgZm9yIGRldGFpbHMuXG4gICAqL1xuICBvYnNlcnZlSGdSZXBvU3RhdGVEaWRDaGFuZ2UoKTogT2JzZXJ2YWJsZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuX2hnUmVwb1N0YXRlRGlkQ2hhbmdlT2JzZXJ2ZXI7XG4gIH1cblxuICAvKipcbiAgICogU2VlIEhnU2VydmljZS5kZWY6OmZldGNoRGlmZkluZm9Gb3JQYXRocyBmb3IgZGV0YWlscy5cbiAgICovXG4gIGFzeW5jIGZldGNoRGlmZkluZm8oZmlsZVBhdGhzOiBBcnJheTxOdWNsaWRlVXJpPik6IFByb21pc2U8P01hcDxOdWNsaWRlVXJpLCBEaWZmSW5mbz4+IHtcbiAgICAvLyAnLS11bmlmaWVkIDAnIGdpdmVzIHVzIDAgbGluZXMgb2YgY29udGV4dCBhcm91bmQgZWFjaCBjaGFuZ2UgKHdlIGRvbid0XG4gICAgLy8gY2FyZSBhYm91dCB0aGUgY29udGV4dCkuXG4gICAgLy8gJy0tbm9wcmVmaXgnIG9taXRzIHRoZSBhLyBhbmQgYi8gcHJlZml4ZXMgZnJvbSBmaWxlbmFtZXMuXG4gICAgLy8gJy0tbm9kYXRlcycgYXZvaWRzIGFwcGVuZGluZyBkYXRlcyB0byB0aGUgZmlsZSBwYXRoIGxpbmUuXG4gICAgY29uc3QgYXJncyA9IFsnZGlmZicsICctLXVuaWZpZWQnLCAnMCcsICctLW5vcHJlZml4JywgJy0tbm9kYXRlcyddLmNvbmNhdChmaWxlUGF0aHMpO1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICBjd2Q6IHRoaXMuZ2V0V29ya2luZ0RpcmVjdG9yeSgpLFxuICAgIH07XG4gICAgbGV0IG91dHB1dDtcbiAgICB0cnkge1xuICAgICAgb3V0cHV0ID0gYXdhaXQgdGhpcy5faGdBc3luY0V4ZWN1dGUoYXJncywgb3B0aW9ucyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgZ2V0TG9nZ2VyKCkuZXJyb3IoXG4gICAgICAgICAgYEVycm9yIHdoZW4gcnVubmluZyBoZyBkaWZmIGZvciBwYXRoczogJHtmaWxlUGF0aHN9IFxcblxcdEVycm9yOiAke2Uuc3RkZXJyfWApO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHBhdGhUb0RpZmZJbmZvID0gcGFyc2VNdWx0aUZpbGVIZ0RpZmZVbmlmaWVkT3V0cHV0KG91dHB1dC5zdGRvdXQpO1xuICAgIGNvbnN0IGFic29sdXRlUGF0aFRvRGlmZkluZm8gPSBuZXcgTWFwKCk7XG4gICAgZm9yIChjb25zdCBbZmlsZVBhdGgsIGRpZmZJbmZvXSBvZiBwYXRoVG9EaWZmSW5mbykge1xuICAgICAgYWJzb2x1dGVQYXRoVG9EaWZmSW5mby5zZXQodGhpcy5fYWJzb2x1dGl6ZShmaWxlUGF0aCksIGRpZmZJbmZvKTtcbiAgICB9XG4gICAgcmV0dXJuIGFic29sdXRlUGF0aFRvRGlmZkluZm87XG4gIH1cblxuICAvKipcbiAgICogQ2FsbHMgb3V0IHRvIGFzeW5jRXhlY3V0ZSB1c2luZyB0aGUgJ2hnJyBjb21tYW5kLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBhcyBzcGVjaWZpZWQgYnkgaHR0cDovL25vZGVqcy5vcmcvYXBpL2NoaWxkX3Byb2Nlc3MuaHRtbC4gQWRkaXRpb25hbCBvcHRpb25zOlxuICAgKiAgIC0gTk9fSEdQTEFJTiBzZXQgaWYgdGhlICRIR1BMQUlOIGVudmlyb25tZW50IHZhcmlhYmxlIHNob3VsZCBub3QgYmUgdXNlZC5cbiAgICogICAtIFRUWV9PVVRQVVQgc2V0IGlmIHRoZSBjb21tYW5kIHNob3VsZCBiZSBydW4gYXMgaWYgaXQgd2VyZSBhdHRhY2hlZCB0byBhIHR0eS5cbiAgICovXG4gIGFzeW5jIF9oZ0FzeW5jRXhlY3V0ZShhcmdzOiBBcnJheTxzdHJpbmc+LCBvcHRpb25zOiBhbnkpOiBQcm9taXNlPGFueT4ge1xuICAgIGlmICghb3B0aW9uc1snTk9fSEdQTEFJTiddKSB7XG4gICAgICAvLyBTZXR0aW5nIEhHUExBSU49MSBvdmVycmlkZXMgYW55IGN1c3RvbSBhbGlhc2VzIGEgdXNlciBoYXMgZGVmaW5lZC5cbiAgICAgIGlmIChvcHRpb25zLmVudikge1xuICAgICAgICBvcHRpb25zLmVudlsnSEdQTEFJTiddID0gMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHthc3NpZ259ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9ucycpLm9iamVjdDtcbiAgICAgICAgY29uc3QgZW52ID0geydIR1BMQUlOJzogMX07XG4gICAgICAgIGFzc2lnbihlbnYsIHByb2Nlc3MuZW52KTtcbiAgICAgICAgb3B0aW9ucy5lbnYgPSBlbnY7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGNtZDtcbiAgICBpZiAob3B0aW9uc1snVFRZX09VVFBVVCddKSB7XG4gICAgICBjbWQgPSAnc2NyaXB0JztcbiAgICAgIGFyZ3MgPSBjcmVhdGVBcmdzRm9yU2NyaXB0Q29tbWFuZCgnaGcnLCBhcmdzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY21kID0gJ2hnJztcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBhd2FpdCBhc3luY0V4ZWN1dGUoY21kLCBhcmdzLCBvcHRpb25zKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBnZXRMb2dnZXIoKS5lcnJvcihgRXJyb3IgZXhlY3V0aW5nIGhnIGNvbW1hbmQ6ICR7SlNPTi5zdHJpbmdpZnkoYXJncyl9IGAgK1xuICAgICAgICAgIGBvcHRpb25zOiAke0pTT04uc3RyaW5naWZ5KG9wdGlvbnMpfSAke0pTT04uc3RyaW5naWZ5KGUpfWApO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cblxuICBmZXRjaEN1cnJlbnRCb29rbWFyaygpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHtmZXRjaEN1cnJlbnRCb29rbWFya30gPSByZXF1aXJlKCcuL2hnLWJvb2ttYXJrLWhlbHBlcnMnKTtcbiAgICByZXR1cm4gZmV0Y2hDdXJyZW50Qm9va21hcmsocGF0aC5qb2luKHRoaXMuX3dvcmtpbmdEaXJlY3RvcnksICcuaGcnKSk7XG4gIH1cblxuICAvKipcbiAgICogU2VlIEhnU2VydmljZTouZGVmOm9ic2VydmVIZ0Jvb2ttYXJrRGlkQ2hhbmdlIGZvciBkZXRhaWxzLlxuICAgKi9cbiAgb2JzZXJ2ZUhnQm9va21hcmtEaWRDaGFuZ2UoKTogT2JzZXJ2YWJsZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuX2hnQm9va21hcmtEaWRDaGFuZ2VPYnNlcnZlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWN0aW9uOiBSZXBvc2l0b3J5IFN0YXRlIGF0IFNwZWNpZmljIFJldmlzaW9uc1xuICAgKi9cblxuICBmZXRjaEZpbGVDb250ZW50QXRSZXZpc2lvbihmaWxlUGF0aDogTnVjbGlkZVVyaSwgcmV2aXNpb246ID9zdHJpbmcpOiBQcm9taXNlPD9zdHJpbmc+IHtcbiAgICByZXR1cm4gZmV0Y2hGaWxlQ29udGVudEF0UmV2aXNpb24oZmlsZVBhdGgsIHJldmlzaW9uLCB0aGlzLl93b3JraW5nRGlyZWN0b3J5KTtcbiAgfVxuXG4gIGZldGNoRmlsZXNDaGFuZ2VkQXRSZXZpc2lvbihyZXZpc2lvbjogc3RyaW5nKTogUHJvbWlzZTw/UmV2aXNpb25GaWxlQ2hhbmdlcz4ge1xuICAgIHJldHVybiBmZXRjaEZpbGVzQ2hhbmdlZEF0UmV2aXNpb24ocmV2aXNpb24sIHRoaXMuX3dvcmtpbmdEaXJlY3RvcnkpO1xuICB9XG5cbiAgYXN5bmMgZmV0Y2hSZXZpc2lvbkluZm9CZXR3ZWVuSGVhZEFuZEJhc2UoKTogUHJvbWlzZTw/QXJyYXk8UmV2aXNpb25JbmZvPj4ge1xuICAgIGNvbnN0IGZva0Jhc2VOYW1lID0gYXdhaXQgZ2V0Rm9ya0Jhc2VOYW1lKHRoaXMuX3dvcmtpbmdEaXJlY3RvcnkpO1xuICAgIGNvbnN0IHJldmlzaW9uc0luZm8gPSBhd2FpdCBmZXRjaFJldmlzaW9uSW5mb0JldHdlZW5SZXZpc2lvbnMoXG4gICAgICBleHByZXNzaW9uRm9yQ29tbW9uQW5jZXN0b3IoZm9rQmFzZU5hbWUpLFxuICAgICAgZXhwcmVzc2lvbkZvclJldmlzaW9uc0JlZm9yZUhlYWQoMCksXG4gICAgICB0aGlzLl93b3JraW5nRGlyZWN0b3J5LFxuICAgICk7XG4gICAgcmV0dXJuIHJldmlzaW9uc0luZm87XG4gIH1cblxuICBhc3luYyBnZXRCbGFtZUF0SGVhZChmaWxlUGF0aDogTnVjbGlkZVVyaSk6IFByb21pc2U8TWFwPHN0cmluZywgc3RyaW5nPj4ge1xuICAgIGNvbnN0IGFyZ3MgPVxuICAgICAgWydibGFtZScsICctcicsICd3ZGlyKCknLCAnLVRqc29uJywgJy0tY2hhbmdlc2V0JywgJy0tdXNlcicsICctLWxpbmUtbnVtYmVyJywgZmlsZVBhdGhdO1xuICAgIGNvbnN0IGV4ZWNPcHRpb25zID0ge1xuICAgICAgY3dkOiB0aGlzLmdldFdvcmtpbmdEaXJlY3RvcnkoKSxcbiAgICB9O1xuICAgIGxldCBvdXRwdXQ7XG4gICAgdHJ5IHtcbiAgICAgIG91dHB1dCA9IGF3YWl0IHRoaXMuX2hnQXN5bmNFeGVjdXRlKGFyZ3MsIGV4ZWNPcHRpb25zKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBnZXRMb2dnZXIoKS5lcnJvcihcbiAgICAgICAgICBgTG9jYWxIZ1NlcnZpY2VCYXNlIGZhaWxlZCB0byBmZXRjaCBibGFtZSBmb3IgZmlsZTogJHtmaWxlUGF0aH0uIEVycm9yOiAke2Uuc3RkZXJyfWApO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcnNlSGdCbGFtZU91dHB1dChvdXRwdXQuc3Rkb3V0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGltcGxlbWVudGF0aW9uIHJlbGllcyBvbiB0aGUgXCJwaGFiZGlmZlwiIHRlbXBsYXRlIGJlaW5nIGF2YWlsYWJsZSBhcyBkZWZpbmVkIGluOlxuICAgKiBodHRwczovL2JpdGJ1Y2tldC5vcmcvZmFjZWJvb2svaGctZXhwZXJpbWVudGFsL3NyYy9mYmYyM2IzZjk2YmFkZTU5ODYxMjFhN2M1N2Q3NDAwNTg1ZDc1ZjU0L3BoYWJkaWZmLnB5LlxuICAgKi9cbiAgYXN5bmMgZ2V0RGlmZmVyZW50aWFsUmV2aXNpb25Gb3JDaGFuZ2VTZXRJZChjaGFuZ2VTZXRJZDogc3RyaW5nKTogUHJvbWlzZTw/c3RyaW5nPiB7XG4gICAgY29uc3QgYXJncyA9IFsnbG9nJywgJy1UJywgJ3twaGFiZGlmZn1cXG4nLCAnLS1saW1pdCcsICcxJywgJy0tcmV2JywgY2hhbmdlU2V0SWRdO1xuICAgIGNvbnN0IGV4ZWNPcHRpb25zID0ge1xuICAgICAgY3dkOiB0aGlzLmdldFdvcmtpbmdEaXJlY3RvcnkoKSxcbiAgICB9O1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBvdXRwdXQgPSBhd2FpdCB0aGlzLl9oZ0FzeW5jRXhlY3V0ZShhcmdzLCBleGVjT3B0aW9ucyk7XG4gICAgICBjb25zdCBzdGRvdXQgPSBvdXRwdXQuc3Rkb3V0LnRyaW0oKTtcbiAgICAgIHJldHVybiBzdGRvdXQgPyBzdGRvdXQgOiBudWxsO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIFRoaXMgc2hvdWxkIG5vdCBoYXBwZW46IGBoZyBsb2dgIGRvZXMgbm90IGVycm9yIGV2ZW4gaWYgaXQgZG9lcyBub3QgcmVjb2duaXplIHRoZSB0ZW1wbGF0ZS5cbiAgICAgIGdldExvZ2dlcigpLmVycm9yKGBGYWlsZWQgd2hlbiB0cnlpbmcgdG8gZ2V0IGRpZmZlcmVudGlhbCByZXZpc2lvbiBmb3I6ICR7Y2hhbmdlU2V0SWR9YCk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvLyBUT0RPIChjaGVuc2hlbikgVGhlIHJldHVybiB0eXBlIHNob3VsZCBiZSBgQXN5bmNFeGVjdXRlUmV0YCBpbmYgYEhnU2VydmljZS5kZWZgLCBidXQgZmxvd1xuICAvLyBkb2Vzbid0IGFsbG93IGltcG9ydGluZyBgLmRlZmAgZmlsZSB1bmxlc3Mgd2UgbWVyZ2UgYEhnU2VydmljZS5kZWZgIHRvIHRoaXMgZmlsZS5cbiAgYXN5bmMgZ2V0U21hcnRsb2codHR5T3V0cHV0OiBib29sZWFuLCBjb25jaXNlOiBib29sZWFuKTogUHJvbWlzZTxPYmplY3Q+IHtcbiAgICAvLyBkaXNhYmxlIHRoZSBwYWdlciBleHRlbnNpb24gc28gdGhhdCAnaGcgc2wnIHRlcm1pbmF0ZXMuIFdlIGNhbid0IGp1c3QgdXNlXG4gICAgLy8gSEdQTEFJTiBiZWNhdXNlIHdlIGhhdmUgbm90IGZvdW5kIGEgd2F5IHRvIGdldCBjb2xvcmVkIG91dHB1dCB3aGVuIHdlIGRvLlxuICAgIGNvbnN0IGFyZ3MgPSBbJy0tY29uZmlnJywgJ2V4dGVuc2lvbnMucGFnZXI9IScsIGNvbmNpc2UgPyAnc2wnIDogJ3NtYXJ0bG9nJ107XG4gICAgY29uc3QgZXhlY09wdGlvbnMgPSB7XG4gICAgICBjd2Q6IHRoaXMuZ2V0V29ya2luZ0RpcmVjdG9yeSgpLFxuICAgICAgTk9fSEdQTEFJTjogY29uY2lzZSwgLy8gYGhnIHNsYCBpcyBsaWtlbHkgdXNlci1kZWZpbmVkLlxuICAgICAgVFRZX09VVFBVVDogdHR5T3V0cHV0LFxuICAgIH07XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuX2hnQXN5bmNFeGVjdXRlKGFyZ3MsIGV4ZWNPcHRpb25zKTtcbiAgfVxuXG4gIGFzeW5jIF9ydW5TaW1wbGVJbldvcmtpbmdEaXJlY3RvcnkoXG4gICAgYWN0aW9uOiBzdHJpbmcsXG4gICAgYXJnczogQXJyYXk8c3RyaW5nPixcbiAgKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIGN3ZDogdGhpcy5nZXRXb3JraW5nRGlyZWN0b3J5KCksXG4gICAgfTtcbiAgICBjb25zdCBjbWQgPSBbYWN0aW9uXS5jb25jYXQoYXJncyk7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuX2hnQXN5bmNFeGVjdXRlKGNtZCwgb3B0aW9ucyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgZ2V0TG9nZ2VyKCkuZXJyb3IoXG4gICAgICAgICdoZyAlcyBmYWlsZWQgd2l0aCBbJXNdIGFyZ3VtZW50czogJXMnLFxuICAgICAgICBjbWQsXG4gICAgICAgIGFyZ3MudG9TdHJpbmcoKSxcbiAgICAgICAgZS50b1N0cmluZygpLFxuICAgICAgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBjaGVja291dChyZXZpc2lvbjogc3RyaW5nLCBjcmVhdGU6IGJvb2xlYW4pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5fcnVuU2ltcGxlSW5Xb3JraW5nRGlyZWN0b3J5KCdjaGVja291dCcsIFtyZXZpc2lvbl0pO1xuICB9XG5cbiAgcmVuYW1lKG9sZEZpbGVQYXRoOiBzdHJpbmcsIG5ld0ZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5fcnVuU2ltcGxlSW5Xb3JraW5nRGlyZWN0b3J5KFxuICAgICAgJ3JlbmFtZScsXG4gICAgICBbb2xkRmlsZVBhdGgsIG5ld0ZpbGVQYXRoXSxcbiAgICApO1xuICB9XG5cbiAgcmVtb3ZlKGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5fcnVuU2ltcGxlSW5Xb3JraW5nRGlyZWN0b3J5KCdyZW1vdmUnLCBbZmlsZVBhdGhdKTtcbiAgfVxuXG4gIGFkZChmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHRoaXMuX3J1blNpbXBsZUluV29ya2luZ0RpcmVjdG9yeSgnYWRkJywgW2ZpbGVQYXRoXSk7XG4gIH1cbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IEhnU2VydmljZUJhc2U7XG4iXX0=