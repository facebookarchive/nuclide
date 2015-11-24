'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const babel = require('babel-core');
const fs = require('fs');
const {isEventMethodName} = require('./method-name-parser');

const cache: Map<string, any> = new Map();

function parseAst(sourceFilePath: string): any {
  const sourceCode = fs.readFileSync(sourceFilePath, 'utf8');

  return babel.transform(sourceCode, {
    blacklist: ['es6.classes', 'flow', 'strict'],
    optional: ['es7.classProperties'],
  }).ast;
}

/**
 * Parse service definition file and return an object like:
 * {className: $className, rpcMethodNames: [$methodName, ...], eventMethodNames: [$methodName, ..]}.
 * Keep it sync as it will be called from NuclideServer's constructor.
 */
function parseServiceApiSync(
  absoluteServiceDefinitionClassFilePath: string,
  serviceName: string,
): any {
  if (cache.has(absoluteServiceDefinitionClassFilePath)) {
    return cache.get(absoluteServiceDefinitionClassFilePath);
  }

  const ast = parseAst(absoluteServiceDefinitionClassFilePath);

  const [classDeclaration] = ast.program.body
      .filter(astNode => astNode.type === 'ClassDeclaration' && astNode.id.name === serviceName);

  const methodNames = classDeclaration.body.body
    // Because class bodies in ES7 can contain static property intializers, ensure a part is a
    // "MethodDefinition" before using it. Static properties have type "ClassProperty".
    .filter(bodyPart => bodyPart.type === 'MethodDefinition')
    .map(methodDefinition => methodDefinition.key.name);
  const rpcMethodNames = methodNames.filter(methodName => !isEventMethodName(methodName));
  const eventMethodNames = methodNames.filter(methodName => isEventMethodName(methodName));

  const serviceStructure = {
    className: classDeclaration.id.name,
    eventMethodNames,
    rpcMethodNames,
  };

  cache.set(absoluteServiceDefinitionClassFilePath + '$' + serviceName, serviceStructure);

  return serviceStructure;
}

module.exports = parseServiceApiSync;
