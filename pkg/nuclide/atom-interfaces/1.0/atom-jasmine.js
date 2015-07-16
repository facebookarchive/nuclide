/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/*eslint-disable no-unused-vars */

// Type declarations for Atom's extensions to Jasmine v1.3
// https://github.com/atom/atom/blob/master/spec/spec-helper.coffee

declare function waitsForPromise(func: () => Promise<mixed>): void;
