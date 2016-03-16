'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function consumeFirstProvider(keyPath: string, version: string = '0.0.0'): Promise {
  return new Promise((resolve, reject) => {
    const subscription = atom.packages.serviceHub.consume(keyPath, version, provider => {
      resolve(provider);
      subscription.dispose();
    });
  });
}

module.exports = {
  consumeFirstProvider,
};
