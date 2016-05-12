

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function consumeFirstProvider(keyPath) {
  var version = arguments.length <= 1 || arguments[1] === undefined ? '0.0.0' : arguments[1];

  return new Promise(function (resolve, reject) {
    var subscription = atom.packages.serviceHub.consume(keyPath, version, function (provider) {
      resolve(provider);
      subscription.dispose();
    });
  });
}

module.exports = {
  consumeFirstProvider: consumeFirstProvider
};