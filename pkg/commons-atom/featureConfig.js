'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

const NUCLIDE_CONFIG_SCOPE = 'nuclide.';

function formatKeyPath(keyPath) {
  return `${ NUCLIDE_CONFIG_SCOPE }${ keyPath }`;
}

/*
 * Returns the value of a setting for a Nuclide feature key. Takes and returns the same types as
 * `atom.config.get` exception `keyPath` is not optional. To get the entire config object, use
 * `atom.config.get`.
 */
function get(keyPath, options) {
  return atom.config.get(formatKeyPath(keyPath), ...Array.prototype.slice.call(arguments, 1));
}

/*
 * Gets the schema of a setting for a Nuclide feature key. Takes and returns the same types as
 * `atom.config.getSchema`.
 */
function getSchema(keyPath) {
  return atom.config.getSchema(formatKeyPath(keyPath));
}

/*
 * Takes and returns the same types as `atom.config.observe` except `keyPath` is not optional.
 * To observe changes on the entire config, use `atom.config.observe`.
 */
function observe(keyPath, optionsOrCallback, callback) {
  return atom.config.observe(formatKeyPath(keyPath), ...Array.prototype.slice.call(arguments, 1));
}

/*
 * Behaves similarly to the `observe` function, but returns a stream of values, rather
 * then receiving a callback.
 */
function observeAsStream(keyPath) {
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return _rxjsBundlesRxMinJs.Observable.create(observer => {
    const disposable = observe(keyPath, options, observer.next.bind(observer));
    return disposable.dispose.bind(disposable);
  });
}

/*
 * Takes and returns the same types as `atom.config.onDidChange` except `keyPath` is not optional.
 * To listen to changes on all key paths, use `atom.config.onDidChange`.
 */
function onDidChange(keyPath, optionsOrCallback, callback) {
  return atom.config.onDidChange(formatKeyPath(keyPath), ...Array.prototype.slice.call(arguments, 1));
}

/*
 * Sets the value of a setting for a Nuclide feature key. Takes and returns the same types as
 * `atom.config.set`.
 */
function set(keyPath, value, options) {
  return atom.config.set(formatKeyPath(keyPath), ...Array.prototype.slice.call(arguments, 1));
}

/*
 * Sets the schema of a setting for a Nuclide feature key. Takes and returns the same types as
 * `atom.config.setSchema`.
 */
function setSchema(keyPath, schema) {
  return atom.config.setSchema(formatKeyPath(keyPath), ...Array.prototype.slice.call(arguments, 1));
}

/*
 * Restores a setting for a Nuclide feature key to its default value. Takes and returns the same
 * types as `atom.config.set`.
 */
function unset(keyPath, options) {
  return atom.config.unset(formatKeyPath(keyPath), ...Array.prototype.slice.call(arguments, 1));
}

/**
 * Returns `true` if the feature with the given name is disabled either directly or because the
 *   'nuclide' package itself is disabled.
 */
function isFeatureDisabled(name) {
  return atom.packages.isPackageDisabled('nuclide') || !atom.config.get(`nuclide.use.${ name }`);
}

exports.default = {
  get: get,
  getSchema: getSchema,
  observe: observe,
  observeAsStream: observeAsStream,
  onDidChange: onDidChange,
  set: set,
  setSchema: setSchema,
  unset: unset,
  isFeatureDisabled: isFeatureDisabled
};
module.exports = exports['default'];