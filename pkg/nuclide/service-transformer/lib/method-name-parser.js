'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function isEventMethodName(methodName: string): boolean {
  // Checks the method begins with 'on', assuming a camel-cased method name.
  return (methodName.startsWith('on') &&
         (methodName.length === 2 || (methodName[2] === methodName[2].toUpperCase())));
}

module.exports = {
  isEventMethodName,
};
