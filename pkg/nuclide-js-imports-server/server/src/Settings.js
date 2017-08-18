/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

export const Settings = {
  shouldProvideDiagnostics: false,
  moduleExportsSettings: {
    // When true, module.exports = {a, b} will export IDs a & b
    shouldIndexEachObjectProperty: true,
    // When true, module.exports = {a, b, c} will export entire object as file name.
    shouldIndexObjectAsDefault: true,
  },
  hasteSettings: {
    // When true, we will assume that all JS files have a default export
    // with the same ID as the filename.
    shouldAddAllFilesAsDefaultExport: true,
  },
  indexNodeModulesWhiteList: [/^(.)*\/Nuclide/],
};
