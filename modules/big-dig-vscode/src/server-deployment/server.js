"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getServerPackage = getServerPackage;
exports.packageServer = packageServer;

var path = _interopRequireWildcard(require("path"));

function _promise() {
  const data = require("../../../nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _globby() {
  const data = _interopRequireDefault(require("globby"));

  _globby = function () {
    return data;
  };

  return data;
}

function _multimatch() {
  const data = _interopRequireDefault(require("multimatch"));

  _multimatch = function () {
    return data;
  };

  return data;
}

function _Package() {
  const data = require("./Package");

  _Package = function () {
    return data;
  };

  return data;
}

function _dev() {
  const data = require("../dev");

  _dev = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
// eslint-disable-next-line nuclide-internal/prefer-nuclide-uri
const ASYNC_LIMIT = 100;
const SERVER_MODULE_NAME = 'big-dig-vscode-server';

/**
 * Returns the big-dig-vscode-server package.
 */
function getServerPackage() {
  return _Package().Package.from(__dirname, SERVER_MODULE_NAME);
}
/**
 * @return The server version and all files that should be included in its package.
 */


async function packageServer() {
  const server = await getServerPackage(); // Note: this will have to change when we move this into its own repo.
  // eslint-disable-next-line nuclide-internal/modules-dependencies

  const nuclideRoot = path.dirname(require.resolve("../../../../package.json"));
  const deps = await server.allDependencies();
  const serverFiles = (await getPackageFiles(server)).map(file => [path.join(server.root, file), file]);
  const modulesRE = new RegExp('^modules' + path.sep);
  const depsFiles = await (0, _promise().asyncLimit)(deps, ASYNC_LIMIT, async dep => {
    const relPath = path.relative(nuclideRoot, dep.root) // Rename modules/* to node_modules/*
    .replace(modulesRE, 'node_modules' + path.sep);
    return (await getPackageFiles(dep)).map(file => [path.join(dep.root, file), path.join(relPath, file)]);
  });
  const files = await (0, _promise().asyncFilter)(Array.prototype.concat(serverFiles, ...depsFiles), async ([src, dst]) => !(await _fsPromise().default.lstat(src)).isDirectory());
  return {
    version: server.info.version,
    // Only load and return a buffer if transpilation might be necessary:
    files: files.map(([src, dst]) => path.extname(src) === '.js' ? {
      src,
      dst,
      data: () => loadAndTransformFile(src)
    } : {
      src,
      dst
    })
  };
}
/**
 * Loads a newline-separated list of glob patterns from a file.
 */


async function loadIgnoreFile(filename) {
  try {
    const ignore = await _fsPromise().default.readFile(filename, 'utf8'); // Split on newlines and ignore #-line-comments

    const globs = ignore.split(/(?:\n|#.*)+/);
    return globs;
  } catch (err) {
    return [];
  }
}
/**
 * @return All the files that this package needs for deployment.
 */


async function getPackageFiles(pkg) {
  // If defined, a package's included files are the only ones considered. Otherwise, all files
  // under the package's path will be considered.
  // NOTE: we explicitly include package.json
  const includeFiles = pkg.info.files == null ? ['*', '*/**'] : pkg.info.files.map(pattern => [pattern, `${pattern}/**`]).reduce((acc, x) => acc.concat(x), []).concat(['**/package.json']); // A list of patterns to ignore

  const ignoreGlobs = ['.vscodeignore', 'DEVELOPMENT', // Standard stuff than NPM ignores: (https://docs.npmjs.com/files/package.json)
  '.*.swp', '._*', '.DS_Store', '.git', '.hg', '.npmrc', '.lock-wscript', '.svn', '.wafpickle-*', 'config.gypi', 'CVS', 'npm-debug.log', '.npmrc', 'config.gypi', '*.orig', 'package-lock.json']; // Add any ignore patterns from .vscodeignore, if present

  const vscodeIgnore = await loadIgnoreFile(path.join(pkg.root, '.vscodeignore'));
  ignoreGlobs.push(...vscodeIgnore);
  const files = await (0, _globby().default)(includeFiles, {
    cwd: pkg.root
  });
  return files.filter(file => (0, _multimatch().default)(file, ignoreGlobs).length === 0);
}
/**
 * Returns a transpile function. If the `DEVELOPMENT` file is not present, then this returns the
 * identity function.
 */


function getJsTranspiler() {
  if (!_dev().__DEV__) {
    return (data, filename) => data;
  } // In the server, Yarn workspaces are copied into node_modules, so we must
  // specify 'production-modules' to the NodeTranspiler so that import
  // statements are transpiled appropriately.


  process.env.NUCLIDE_TRANSPILE_ENV = 'production-modules'; // We load the transpiler dynamically because it will not be available when we are published.
  // eslint-disable-next-line nuclide-internal/modules-dependencies

  const NodeTranspiler = require("../../../nuclide-node-transpiler/lib/NodeTranspiler");

  const nodeTranspiler = new NodeTranspiler();
  return (data, filename) => {
    if (path.extname(filename) === '.js' && NodeTranspiler.shouldCompile(data)) {
      return new Buffer(nodeTranspiler.transform(data, filename));
    } else {
      return data;
    }
  };
}

const jsTranspiler = getJsTranspiler();
/** Transpiles a file. */

async function loadAndTransformFile(filename) {
  const data = await _fsPromise().default.readFile(filename);
  const tData = jsTranspiler(data, filename);
  return tData;
}