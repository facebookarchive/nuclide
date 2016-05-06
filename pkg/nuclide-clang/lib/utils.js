'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import path from 'path';

const HEADER_EXTENSIONS = new Set(['.h', '.hh', '.hpp', '.hxx', '.h++']);
const SOURCE_EXTENSIONS = new Set(['.c', '.cc', '.cpp', '.cxx', '.c++', '.m', '.mm']);

export function isHeaderFile(filename: string): boolean {
  return HEADER_EXTENSIONS.has(path.extname(filename));
}

export function isSourceFile(filename: string): boolean {
  return SOURCE_EXTENSIONS.has(path.extname(filename));
}
