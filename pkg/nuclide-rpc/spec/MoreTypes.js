/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {ImportedType as AliasImportedType} from './Types';

// Use ImportedType from another file - testing, multiple
// imports the same file.
export type AnotherImportedType = {
  field: AliasImportedType,
};
