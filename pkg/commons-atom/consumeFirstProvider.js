'use strict';
'use babel';

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

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = consumeFirstProvider;

function consumeFirstProvider(keyPath) {
  let version = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '0.0.0';

  return new Promise((resolve, reject) => {
    const subscription = atom.packages.serviceHub.consume(keyPath, version, provider => {
      resolve(provider);
      subscription.dispose();
    });
  });
}
module.exports = exports['default'];