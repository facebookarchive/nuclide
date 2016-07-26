'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';

/**
 * Create an Atom package from an Activation constructor.
 *
 * Atom packages are obstensibly singletons, however they contain `activate()` and `deactivate()`
 * lifecycle methods which can be called multiple times. There's no use-case (so far as we know) for
 * invoking any other package methods while a package is not activated. Therefore, it makes more
 * sense to build packages as instances, constructed when a package is activated and destroyed when
 * the package is deactivated.
 */
export default function createPackage(Activation: Class<any>): Object {
  let activation = null;
  const pkg = {};

  // Proxy method calls on the package to the activation object.
  for (const property of getPropertyList(Activation.prototype)) {
    if (typeof Activation.prototype[property] !== 'function') {
      continue;
    }
    if (property === 'constructor') {
      continue;
    }
    if (property === 'activate') {
      throw new Error(
        'Your activation class contains an "activate" method, but that work should be done in the'
        + ' constructor.',
      );
    }
    if (property === 'deactivate') {
      throw new Error(
        'Your activation class contains an "deactivate" method. Please use "dispose" instead.',
      );
    }

    pkg[property] = function(...args) {
      invariant(activation != null, 'Package not activated');
      return activation[property](...args);
    };
  }

  return {
    ...pkg,

    /**
     * Calling `activate()` creates a new instance.
     */
    activate(initialState: ?Object): void {
      invariant(activation == null, 'Package already activated');
      activation = new Activation(initialState);
    },

    /**
     * The `deactivate()` method is special-cased to null our activation instance reference.
     */
    deactivate(): void {
      invariant(activation != null, 'Package not activated');
      if (typeof activation.dispose === 'function') {
        activation.dispose();
      }
      activation = null;
    },
  };
}

function getPrototypeChain(prototype: Class<any>): Array<Class<any>> {
  let currentPrototype = prototype;
  const prototypes = [];
  while (currentPrototype != null) {
    prototypes.push(currentPrototype);
    currentPrototype = Object.getPrototypeOf(currentPrototype);
  }
  return prototypes;
}

/**
 * List the properties (including inherited ones) of the provided prototype, excluding the ones
 * inherited from `Object`.
 */
function getPropertyList(prototype: Class<any>): Array<string> {
  const properties = [];
  for (const proto of getPrototypeChain(prototype)) {
    if (proto === (Object: any).prototype) {
      break;
    }
    for (const property of Object.getOwnPropertyNames(proto)) {
      properties.push(property);
    }
  }
  return properties;
}
