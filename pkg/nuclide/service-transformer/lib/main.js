'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var babel = require('babel-core');
var createRemoteServiceTransformer = require('./remote-service-transformer');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var parseServiceApiSync = require('./service-parser');

var TRANSPILED_FILE_FOLDER = path.join(__dirname, '../gen/');

var transpiledFilePaths = new Set();

function transpile(sourceFilePath: string, destFilePath: string): void {
  var sourceCode = fs.readFileSync(sourceFilePath, 'utf8');

  var code = babel.transform(sourceCode, {
    plugins: [createRemoteServiceTransformer(sourceFilePath)],
    blacklist: ['es6.arrowFunctions', 'es6.classes', 'flow', 'strict'],
  }).code;
  // Append a newline at the end of code to make eslint happy.
  code += '\n';

  mkdirp.sync(TRANSPILED_FILE_FOLDER);
  fs.writeFileSync(destFilePath, code);
}

/**
 * Generate and load remote implementation for service defined in serviceDefinitionFilePath.
 * Caution:
 *  1. Service definition class should have unique name.
 *  2. We put this function at main.js and it will try to resolve the path from current
 *     module's parent, which should be the caller module. If anyone move this function into its
 *     own file and require it from main.js, `module.parent` should be changed to
 *     `module.parent.parent` as there is another level of requirement.
 */
function requireRemoteServiceSync(serviceDefinitionFilePath: string): any {
  // Resolve serviceDefinitionFilePath based on the caller's module, and fallback to
  // this file's module in case module.parent doesn't exist (we are using repl).
  // Note that `require('module')._resolveFilename(path, module)` is equivelent to
  // `require.resolve(path)` under the context of given module.
  var resolvedServiceDefinitionFilePath = require('module')._resolveFilename(
      serviceDefinitionFilePath,
      module.parent ? module.parent : module);

  var transpiledRemoteServiceFilePath = path.join(
      TRANSPILED_FILE_FOLDER,
      path.basename(resolvedServiceDefinitionFilePath));

  if (!transpiledFilePaths.has(resolvedServiceDefinitionFilePath)) {
    transpile(resolvedServiceDefinitionFilePath, transpiledRemoteServiceFilePath);
    transpiledFilePaths.add(resolvedServiceDefinitionFilePath);
  }
  return require(transpiledRemoteServiceFilePath);
}

module.exports = {
  parseServiceApiSync,
  requireRemoteServiceSync,
  transpile,
};
