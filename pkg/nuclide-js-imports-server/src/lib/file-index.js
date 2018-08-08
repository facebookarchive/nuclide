"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFileIndex = getFileIndex;
exports.watchDirectory = watchDirectory;

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _collection() {
  const data = require("../../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _process() {
  const data = require("../../../../modules/nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("../../../../modules/nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var _os = _interopRequireDefault(require("os"));

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _nuclideWatchmanHelpers() {
  const data = require("../../../../modules/nuclide-watchman-helpers");

  _nuclideWatchmanHelpers = function () {
    return data;
  };

  return data;
}

function _ExportCache() {
  const data = _interopRequireDefault(require("./ExportCache"));

  _ExportCache = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
const TO_IGNORE = ['**/node_modules/**', '**/VendorLib/**', '**/flow-typed/**'];

async function getFileIndex(root, configFromFlow) {
  const client = new (_nuclideWatchmanHelpers().WatchmanClient)();
  const exportCache = new (_ExportCache().default)({
    root,
    configFromFlow
  });
  const loadPromise = exportCache.load().then(success => {
    const logger = (0, _log4js().getLogger)('js-imports-server');

    if (success) {
      logger.info(`Restored exports cache: ${exportCache.getByteSize()} bytes`);
    } else {
      logger.warn(`Could not find cached exports at ${exportCache.getPath()}`);
    }
  }); // This is easier and performant enough to express as a glob.

  const nodeModulesPackageJsonFilesPromise = globListFiles(root, 'node_modules/*/package.json');
  const [jsFiles, nodeModulesPackageJsonFiles, mainFiles] = await Promise.all([watchmanListFiles(client, root, '*.js').catch(err => {
    (0, _log4js().getLogger)('js-imports-server').warn('Failed to get files with Watchman: falling back to glob', err);
    return hgListFiles(root, '**.js', TO_IGNORE).catch(() => findListFiles(root, '*.js', TO_IGNORE)).catch(() => globListFiles(root, '**/*.js', TO_IGNORE)).catch(() => []).then(filesWithoutHash);
  }), nodeModulesPackageJsonFilesPromise, watchmanListFiles(client, root, 'package.json').then(files => getMainFiles(root, files.map(file => file.name))).catch(() => {
    return hgListFiles(root, '**/package.json', TO_IGNORE).catch(() => findListFiles(root, 'package.json', TO_IGNORE)).catch(() => globListFiles(root, '**/package.json', TO_IGNORE)).catch(() => []).then(files => getMainFiles(root, files));
  }), loadPromise]);
  client.dispose();
  return {
    root,
    exportCache,
    jsFiles,
    nodeModulesPackageJsonFiles,
    mainFiles
  };
}

function getOutputLines(command, args, opts) {
  return (0, _process().spawn)(command, args, opts).switchMap(proc => {
    return (0, _process().getOutputStream)(proc).reduce((acc, result) => {
      if (result.kind === 'stdout') {
        acc.push(result.data.trimRight());
      }

      return acc;
    }, []);
  });
}

function hgListFiles(root, pattern, ignore) {
  const ignorePatterns = (0, _collection().arrayFlatten)(ignore.map(x => ['-X', x]));
  return getOutputLines('hg', ['files', '-I', pattern, ...ignorePatterns], {
    cwd: root
  }).toPromise();
}

function findListFiles(root, pattern, ignore) {
  const ignorePatterns = (0, _collection().arrayFlatten)(ignore.map(x => ['-not', '-path', x]));
  return getOutputLines('find', ['.', '-name', pattern, ...ignorePatterns], {
    cwd: root
  }) // Strip the leading "./".
  .map(files => files.map(f => f.substr(2))).toPromise();
}

function globListFiles(root, pattern, ignore) {
  return _fsPromise().default.glob(pattern, {
    cwd: root,
    ignore
  });
}

function watchmanListFiles(client, root, pattern) {
  return client.listFiles(root, getWatchmanExpression(root, pattern)).then(files => files.map(data => {
    // content.sha1hex may be an object with an "error" property
    const sha1 = data['content.sha1hex'];
    return {
      name: data.name,
      sha1: typeof sha1 === 'string' ? sha1 : null
    };
  }));
}

async function getMainFiles(root, packageJsons) {
  const cpus = _os.default.cpus();

  const results = await (0, _promise().asyncLimit)(packageJsons, cpus ? Math.max(1, cpus.length) : 1, async packageJson => {
    try {
      const fullPath = _nuclideUri().default.join(root, packageJson);

      const data = await _fsPromise().default.readFile(fullPath, 'utf8');
      let main = JSON.parse(data).main || 'index.js'; // Ignore things that go outside the scope of the package.json.

      if (main.startsWith('..')) {
        return null;
      }

      if (!main.endsWith('.js')) {
        main += '.js';
      }

      const dirname = _nuclideUri().default.dirname(fullPath); // Note: the main file may not necessarily exist.
      // We don't really need to check existence here, since non-existent files
      // will never be indexed anyway.


      return [_nuclideUri().default.resolve(dirname, main), dirname];
    } catch (err) {
      return null;
    }
  });
  return new Map(results.filter(Boolean));
}

function filesWithoutHash(files) {
  return files.map(name => ({
    name,
    sha1: null
  }));
} // TODO: watch node_modules and package.json files for changes.


function watchDirectory(root) {
  return _RxMin.Observable.defer(() => {
    const watchmanClient = new (_nuclideWatchmanHelpers().WatchmanClient)();
    return _RxMin.Observable.using(() => new (_UniversalDisposable().default)(watchmanClient), () => _RxMin.Observable.fromPromise(watchmanClient.watchDirectoryRecursive(root, 'js-imports-subscription', getWatchmanExpression(root, '*.js'))).switchMap(watchmanSubscription => {
      return _RxMin.Observable.fromEvent(watchmanSubscription, 'change').switchMap(changes => _RxMin.Observable.from(changes.map(change => {
        const name = _nuclideUri().default.join(watchmanSubscription.root, change.name);

        if (!_nuclideUri().default.contains(root, name)) {
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
    return ['not', ['match', patternToIgnore, 'wholename', {
      includedotfiles: true
    }]];
  });
}