'use babel';
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
/* @flow */

function consumeFirstProvider(keyPath: string, version = '0.0.0'): Promise {
  return new Promise((resolve, reject) => {
    var sub = atom.packages.serviceHub.consume(keyPath, version, provider => {
      resolve(provider);
      // Workaround for https://github.com/atom/service-hub/issues/7.
      setTimeout(() => sub.dispose(), 0);
    });
  });
}

module.exports = {
  consumeFirstProvider,
};
