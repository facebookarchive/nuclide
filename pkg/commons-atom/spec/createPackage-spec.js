'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import createPackage from '../createPackage';

describe('createPackage', () => {

  it('throws when the activation class contains an `activate()`', () => {
    class Activation {
      activate() {}
    }
    expect(() => createPackage(Activation))
      .toThrow(
        'Your activation class contains an "activate" method, but that work should be done in the'
        + ' constructor.',
      );
  });

  it('throws when the activation class contains a `deactivate()`', () => {
    class Activation {
      deactivate() {}
    }
    expect(() => createPackage(Activation))
      .toThrow(
        'Your activation class contains an "deactivate" method. Please use "dispose" instead.',
      );
  });

  it("calls the activation's `dispose()` when deactivated", () => {
    let called = false;
    class Activation {
      dispose() {
        called = true;
      }
    }
    const pkg = createPackage(Activation);
    pkg.activate();
    expect(called).toBe(false);
    pkg.deactivate();
    expect(called).toBe(true);
  });

  it('proxies methods to the activation instance', () => {
    let called = false;
    class Activation {
      doSomething() {
        called = true;
      }
    }
    const pkg = createPackage(Activation);
    pkg.activate();
    pkg.doSomething();
    expect(called).toBe(true);
  });

  it("throws if methods are called when the package isn't activated", () => {
    let called = false;
    class Activation {
      doSomething() {
        called = true;
      }
    }
    const pkg = createPackage(Activation);
    pkg.activate();
    pkg.deactivate();
    expect(() => { pkg.doSomething(); }).toThrow('Package not activated');
    expect(called).toBe(false);
  });

  it('contains methods inherited by the activation class', () => {
    class A {
      inheritedMethod() {}
    }
    class B extends A {}
    const pkg = createPackage(B);
    expect('inheritedMethod' in pkg).toBe(true);
  });

});
