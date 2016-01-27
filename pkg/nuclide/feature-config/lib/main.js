'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const NUCLIDE_CONFIG_SCOPE = 'nuclide.';

function formatKeyPath(keyPath: string): string {
  return `${NUCLIDE_CONFIG_SCOPE}${keyPath}`;
}

module.exports = {
  /*
   * Returns the value of a setting for a Nuclide feature key. Takes and returns the same types as
   * `atom.config.get` exception `keyPath` is not optional. To get the entire config object, use
   * `atom.config.get`.
   */
  get(
    keyPath: string,
    options?: {
      excludeSources?: Array<string>;
      sources?: Array<string>;
      scope?: Object;
    }
  ): mixed {
    return atom.config.get(formatKeyPath(keyPath), ...Array.prototype.slice.call(arguments, 1));
  },

  /*
   * Gets the schema of a setting for a Nuclide feature key. Takes and returns the same types as
   * `atom.config.getSchema`.
   */
  getSchema(
    keyPath: string
  ): atom$ConfigSchema {
    return atom.config.getSchema(formatKeyPath(keyPath));
  },

  /*
   * Takes and returns the same types as `atom.config.observe` except `keyPath` is not optional.
   * To observe changes on the entire config, use `atom.config.observe`.
   */
  observe(
    keyPath: string,
    optionsOrCallback: (Object | (value: any) => void),
    callback?: (value: any) => void
  ): IDisposable {
    return atom.config.observe(formatKeyPath(keyPath), ...Array.prototype.slice.call(arguments, 1));
  },

  /*
   * Takes and returns the same types as `atom.config.onDidChange` except `keyPath` is not optional.
   * To listen to changes on all key paths, use `atom.config.onDidChange`.
   */
  onDidChange(
    keyPath: string,
    optionsOrCallback: (Object | (event: Object) => void),
    callback?: (event: Object) => void
  ): IDisposable {
    return atom.config.onDidChange(
      formatKeyPath(keyPath),
      ...Array.prototype.slice.call(arguments, 1)
    );
  },

  /*
   * Sets the value of a setting for a Nuclide feature key. Takes and returns the same types as
   * `atom.config.set`.
   */
  set(
    keyPath: string,
    value: ?mixed,
    options?: {
      scopeSelector?: string,
      source?: string,
    }
  ): boolean {
    return atom.config.set(formatKeyPath(keyPath), ...Array.prototype.slice.call(arguments, 1));
  },

  /*
   * Sets the schema of a setting for a Nuclide feature key. Takes and returns the same types as
   * `atom.config.setSchema`.
   */
  setSchema(
    keyPath: string,
    schema: Object
  ): void {
    return atom.config.setSchema(
      formatKeyPath(keyPath),
      ...Array.prototype.slice.call(arguments, 1)
    );
  },

  /*
   * Restores a setting for a Nuclide feature key to its default value. Takes and returns the same
   * types as `atom.config.set`.
   */
  unset(
    keyPath: string,
    options?: {
      scopeSelector?: string,
      source?: string,
    }
  ): void {
    return atom.config.unset(formatKeyPath(keyPath), ...Array.prototype.slice.call(arguments, 1));
  },
};
