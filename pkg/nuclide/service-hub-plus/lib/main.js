'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function consumeFirstProvider(keyPath: string, version = '0.0.0'): Promise {
  return new Promise((resolve, reject) => {
    var sub = atom.packages.serviceHub.consume(keyPath, version, provider => {
      resolve(provider);
      sub.dispose();
    });
  });
}

module.exports = {
  consumeFirstProvider,
};
