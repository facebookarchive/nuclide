'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import fs from 'fs';
import path from 'path';
import invariant from 'assert';
import Module from 'module';

import NodeTranspiler from '../../nuclide-node-transpiler/lib/NodeTranspiler';

import type {
  Definitions,
  ReturnKind,
  Type,
} from './types';

/** Cache for definitions. */
const definitionsCache: Map<string, Definitions> = new Map();
/** Cache for remote proxies. */
const proxiesCache: Map<string, {factory: Function; proxies: WeakMap}> = new Map();

export type RpcContext = {
  callRemoteFunction(functionName: string, returnType: ReturnKind, args: Array<any>): any;
  callRemoteMethod(
    objectId: number,
    methodName: string,
    returnType: ReturnKind,
    args: Array<any>
  ): any;
  createRemoteObject(
    interfaceName: string,
    thisArg: Object,
    unmarshalledArgs: Array<any>,
    argTypes: Array<Type>
  ): void;
  disposeRemoteObject(object: Object): Promise<void>;
  marshal(value: any, type: Type): any;
  unmarshal(value: any, type: Type): any;
};

/**
 * Load the definitions, cached by their resolved file path.
 * @param definitionPath - The path to the definition file, relative to the module of
 *  the caller.
 * @returns - The Definitions that represents the API of the definiition file.
 */
// $FlowFixMe
export function getDefinitions(definitionPath: string): Definitions {
  const resolvedPath = resolvePath(definitionPath);

  // Cache definitions by the resolved file path they were loaded from.
  if (!definitionsCache.has(resolvedPath)) {
    const {parseServiceDefinition} = require('./service-parser');
    definitionsCache.set(resolvedPath,
      parseServiceDefinition(resolvedPath, fs.readFileSync(resolvedPath, 'utf8')));
  }
  return definitionsCache.get(resolvedPath);
}

/**
 * Get a proxy module for a given (service, client) pair. This function generates
 * the definitions if the they don't exist, and caches the proxy module if it has
 * already been generated before.
 * @param clientObject {ClientComponent} The client object that needs to be able to marhsal
 *   and unmarshal objects, as well as make RPC calls.
 * @returns - A proxy module that exports the API specified by the definition
 */
export function getProxy(
  serviceName: string,
  definitionPath: string,
  clientObject: RpcContext
): any {
  const resolvedPath = resolvePath(definitionPath);
  const defs = getDefinitions(definitionPath);

  // Cache proxy factory functions by the resolved definition file path.
  if (!proxiesCache.has(resolvedPath)) {
    const {generateProxy} = require('./proxy-generator');

    // Transpile this code (since it will use anonymous classes and arrow functions).
    const code = generateProxy(serviceName, defs);
    const filename = path.parse(definitionPath).name + 'Proxy.js';
    const transpiled = (new NodeTranspiler()).transformWithCache(code, filename);

    // Load the module directly from a string,
    const m = new Module();
    // as if it were a sibling to this file.
    m.filename = m.id = path.join(__dirname, filename);
    m.paths = ((module: any).paths: Array<string>);
    m._compile(transpiled, filename);

    // Add the factory function to a cache.
    proxiesCache.set(resolvedPath, {
      factory: m.exports,
      proxies: new WeakMap(),
    });
  }

  // Cache remote proxy modules by the (definition path, client object) tuple.
  const cache = proxiesCache.get(resolvedPath);
  invariant(cache != null);
  if (!cache.proxies.has(clientObject)) {
    cache.proxies.set(clientObject, cache.factory(clientObject));
  }
  return cache.proxies.get(clientObject);
}

/**
 * Resolve definitionPath based on the caller's module, and fallback to
 * this file's module in case module.parent doesn't exist (we are using repl).
 * Note that `require('module')._resolveFilename(path, module)` is equivelent to
 * `require.resolve(path)` under the context of given module.
 */
function resolvePath(definitionPath: string): string {
  return Module._resolveFilename(definitionPath, module.parent ? module.parent : module);
}

// Export caches for testing.
export const __test__ = {
  definitionsCache,
  proxiesCache,
};
