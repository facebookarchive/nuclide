'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var UPPER_CAMEL_CASE = /^[A-Z][A-Za-z0-9]*$/;

module.exports = {
  isUpperCamelCase(str: string): boolean {
    return UPPER_CAMEL_CASE.test(str);
  },
};
