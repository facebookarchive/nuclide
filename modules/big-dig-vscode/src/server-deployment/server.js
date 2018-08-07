/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

// eslint-disable-next-line nuclide-internal/prefer-nuclide-uri
import * as path from 'path';
import {asyncFilter, asyncLimit} from 'nuclide-commons/promise';
import fs from 'nuclide-commons/fsPromise';
import globby from 'globby';
import multimatch from 'multimatch';

import {Package} from './Package';
import {__DEV__} from '../dev';

const ASYNC_LIMIT = 100;
const SERVER_MODULE_NAME = 'big-dig-vscode-server';

export type PackageFile = {|
  /** Local path to the file. No transpilation necessary. */
  +src: string,
  /** Destination path w.r.t. the server package root. */
  +dst: string,
  /** Contents of the file, transpiled as needed. */
  +data?: () => Promise<Buffer>,
  /** If `true`, then always include this file in the development diff package  */
  +alwaysInclude?: boolean,
|};

/**
 * Returns the big-dig-vscode-server package.
 */
export function getServerPackage(): Promise<Package> {
  return Package.from(__dirname, SERVER_MODULE_NAME);
}

/**
 * @return The server version and all files that should be included in its package.
 */
export async function packageServer(): Promise<{
  version: string,
  files: Array<PackageFile>,
}> {
  const server = await getServerPackage();
  // Note: this will have to change when we move this into its own repo.
  // eslint-disable-next-line nuclide-internal/modules-dependencies
  const nuclideRoot = path.dirname(require.resolve('../../../../package.json'));

  const deps = await server.allDependencies();
  const serverFiles = (await getPackageFiles(server)).map(file => [
    path.join(server.root, file),
    file,
  ]);
  const modulesRE = new RegExp('^modules' + path.sep);
  const depsFiles = await asyncLimit(deps, ASYNC_LIMIT, async dep => {
    const relPath = path
      .relative(nuclideRoot, dep.root)
      // Rename modules/* to node_modules/*
      .replace(modulesRE, 'node_modules' + path.sep);
    return (await getPackageFiles(dep)).map(file => [
      path.join(dep.root, file),
      path.join(relPath, file),
    ]);
  });

  const files = await asyncFilter(
    Array.prototype.concat(serverFiles, ...depsFiles),
    async ([src, dst]) => !(await fs.lstat(src)).isDirectory(),
  );

  return {
    version: server.info.version,
    // Only load and return a buffer if transpilation might be necessary:
    files: files.map(
      ([src, dst]) =>
        path.extname(src) === '.js'
          ? {src, dst, data: () => loadAndTransformFile(src)}
          : {src, dst},
    ),
  };
}

/**
 * Loads a newline-separated list of glob patterns from a file.
 */
async function loadIgnoreFile(filename: string): Promise<Array<string>> {
  try {
    const ignore = await fs.readFile(filename, 'utf8');
    // Split on newlines and ignore #-line-comments
    const globs = ignore.split(/(?:\n|#.*)+/);
    return globs;
  } catch (err) {
    return [];
  }
}

/**
 * @return All the files that this package needs for deployment.
 */
async function getPackageFiles(pkg: Package): Promise<Array<string>> {
  // If defined, a package's included files are the only ones considered. Otherwise, all files
  // under the package's path will be considered.
  // NOTE: we explicitly include package.json
  const includeFiles =
    pkg.info.files == null
      ? ['*', '*/**']
      : pkg.info.files
          .map(pattern => [pattern, `${pattern}/**`])
          .reduce((acc, x) => acc.concat(x), [])
          .concat(['**/package.json']);

  // A list of patterns to ignore
  const ignoreGlobs = [
    '.vscodeignore',
    'DEVELOPMENT',
    // Standard stuff than NPM ignores: (https://docs.npmjs.com/files/package.json)
    '.*.swp',
    '._*',
    '.DS_Store',
    '.git',
    '.hg',
    '.npmrc',
    '.lock-wscript',
    '.svn',
    '.wafpickle-*',
    'config.gypi',
    'CVS',
    'npm-debug.log',
    '.npmrc',
    'config.gypi',
    '*.orig',
    'package-lock.json',
  ];

  // Add any ignore patterns from .vscodeignore, if present
  const vscodeIgnore = await loadIgnoreFile(
    path.join(pkg.root, '.vscodeignore'),
  );
  ignoreGlobs.push(...vscodeIgnore);

  const files = await globby(includeFiles, {cwd: pkg.root});
  return files.filter(file => multimatch(file, ignoreGlobs).length === 0);
}

/**
 * Returns a transpile function. If the `DEVELOPMENT` file is not present, then this returns the
 * identity function.
 */
function getJsTranspiler(): (data: Buffer, filename: string) => Buffer {
  if (!__DEV__) {
    return (data, filename) => data;
  }

  // We load the transpiler dynamically because it will not be available when we are published.
  // eslint-disable-next-line nuclide-internal/modules-dependencies
  const NodeTranspiler = require('nuclide-node-transpiler/lib/NodeTranspiler');
  const nodeTranspiler = new NodeTranspiler();
  return (data, filename) => {
    if (
      path.extname(filename) === '.js' &&
      NodeTranspiler.shouldCompile(data)
    ) {
      return new Buffer(nodeTranspiler.transform(data, filename));
    } else {
      return data;
    }
  };
}
const jsTranspiler = getJsTranspiler();

/** Transpiles a file. */
async function loadAndTransformFile(filename: string): Promise<Buffer> {
  const data = await fs.readFile(filename);
  const tData = jsTranspiler(data, filename);
  return tData;
}
