'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * The module formerly known as "service-hub-plus". Provides a workaround for
 * https://github.com/atom/service-hub/issues/6
 */

export default function consumeFirstProvider(
  keyPath: string,
  version: string = '0.0.0',
): Promise {
  return new Promise((resolve, reject) => {
    const subscription =
      atom.packages.serviceHub.consume(keyPath, version, provider => {
        resolve(provider);
        subscription.dispose();
      });
  });
}
