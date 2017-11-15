'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFileIndex = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getFileIndex = exports.getFileIndex = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (root, hasteSettings) {
    const client = new (_main || _load_main()).WatchmanClient();
    const exportCache = new (_ExportCache || _load_ExportCache()).default({ root, hasteSettings });
    const loadPromise = exportCache.load().then(function (success) {
      const logger = (0, (_log4js || _load_log4js()).getLogger)('js-imports-server');
      if (success) {
        logger.info(`Restored exports cache: ${exportCache.getByteSize()} bytes`);
      } else {
        logger.warn(`Could not find cached exports at ${exportCache.getPath()}`);
      }
    });

    // This is easier and performant enough to express as a glob.
    const nodeModulesPackageJsonFilesPromise = globListFiles(root, 'node_modules/*/package.json');
    try {
      const [jsFiles, nodeModulesPackageJsonFiles, mainFiles] = yield Promise.all([watchmanListFiles(client, root, '*.js').then(fromWatchmanResult), nodeModulesPackageJsonFilesPromise, watchmanListFiles(client, root, 'package.json').then(function (files) {
        return getMainFiles(root, files);
      }), loadPromise]);
      return { root, exportCache, jsFiles, nodeModulesPackageJsonFiles, mainFiles };
    } catch (err) {
      const [jsFiles, nodeModulesPackageJsonFiles, mainFiles] = yield Promise.all([globListFiles(root, '**/*.js', TO_IGNORE).then(fromGlobResult), nodeModulesPackageJsonFilesPromise, globListFiles(root, '**/package.json', TO_IGNORE).then(function (files) {
        return getMainFiles(root, files);
      }), loadPromise]);
      return { root, exportCache, jsFiles, nodeModulesPackageJsonFiles, mainFiles };
    } finally {
      client.dispose();
    }
  });

  return function getFileIndex(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

let getMainFiles = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (root, packageJsons) {
    const results = yield (0, (_promise || _load_promise()).asyncLimit)(packageJsons, _os.default.cpus().length, (() => {
      var _ref3 = (0, _asyncToGenerator.default)(function* (packageJson) {
        try {
          const fullPath = (_nuclideUri || _load_nuclideUri()).default.join(root, packageJson);
          const data = yield (_fsPromise || _load_fsPromise()).default.readFile(fullPath, 'utf8');
          let main = JSON.parse(data).main || 'index.js';
          // Ignore things that go outside the scope of the package.json.
          if (main.startsWith('..')) {
            return null;
          }
          if (!main.endsWith('.js')) {
            main += '.js';
          }
          const dirname = (_nuclideUri || _load_nuclideUri()).default.dirname(fullPath);
          // Note: the main file may not necessarily exist.
          // We don't really need to check existence here, since non-existent files
          // will never be indexed anyway.
          return [(_nuclideUri || _load_nuclideUri()).default.resolve(dirname, main), dirname];
        } catch (err) {
          return null;
        }
      });

      return function (_x5) {
        return _ref3.apply(this, arguments);
      };
    })());
    return new Map(results.filter(Boolean));
  });

  return function getMainFiles(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})();

exports.watchDirectory = watchDirectory;

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _os = _interopRequireDefault(require('os'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _main;

function _load_main() {
  return _main = require('../../../nuclide-watchman-helpers/lib/main');
}

var _ExportCache;

function _load_ExportCache() {
  return _ExportCache = _interopRequireDefault(require('./ExportCache'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const TO_IGNORE = ['**/node_modules/**', '**/VendorLib/**', '**/flow-typed/**']; /**
                                                                                  * Copyright (c) 2015-present, Facebook, Inc.
                                                                                  * All rights reserved.
                                                                                  *
                                                                                  * This source code is licensed under the license found in the LICENSE file in
                                                                                  * the root directory of this source tree.
                                                                                  *
                                                                                  * 
                                                                                  * @format
                                                                                  */

function globListFiles(root, pattern, ignore) {
  return (_fsPromise || _load_fsPromise()).default.glob(pattern, { cwd: root, ignore }).catch(() => []);
}

function watchmanListFiles(client, root, pattern) {
  return client.listFiles(root, getWatchmanExpression(root, pattern));
}

function fromWatchmanResult(result) {
  return result.map(data => ({ name: data.name, sha1: data['content.sha1hex'] }));
}

function fromGlobResult(files) {
  return files.map(name => ({ name, sha1: null }));
}

// TODO: watch node_modules and package.json files for changes.
function watchDirectory(root) {
  return _rxjsBundlesRxMinJs.Observable.defer(() => {
    const watchmanClient = new (_main || _load_main()).WatchmanClient();
    return _rxjsBundlesRxMinJs.Observable.using(() => new (_UniversalDisposable || _load_UniversalDisposable()).default(watchmanClient), () => _rxjsBundlesRxMinJs.Observable.fromPromise(watchmanClient.watchDirectoryRecursive(root, 'js-imports-subscription', getWatchmanExpression(root, '*.js'))).switchMap(watchmanSubscription => {
      return _rxjsBundlesRxMinJs.Observable.fromEvent(watchmanSubscription, 'change').switchMap(changes => _rxjsBundlesRxMinJs.Observable.from(changes.map(change => {
        const name = (_nuclideUri || _load_nuclideUri()).default.join(watchmanSubscription.root, change.name);
        if (!(_nuclideUri || _load_nuclideUri()).default.contains(root, name)) {
          return null;
        }
        return Object.assign({}, change, {
          name
        });
      }).filter(Boolean)));
    }));
  });
}

function getWatchmanExpression(root, pattern) {
  return {
    expression: ['allof', ['match', pattern], ['type', 'f'], ...getWatchmanMatchesFromIgnoredFiles()],
    fields: ['name', 'content.sha1hex']
  };
}

function getWatchmanMatchesFromIgnoredFiles() {
  return TO_IGNORE.map(patternToIgnore => {
    return ['not', ['match', patternToIgnore, 'wholename', { includedotfiles: true }]];
  });
}