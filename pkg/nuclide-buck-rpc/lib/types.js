'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertBuckClangCompilationDatabase = convertBuckClangCompilationDatabase;


// Remove the warnings field from the buck value.
function convertBuckClangCompilationDatabase(buckDb) {
  if (buckDb != null) {
    const { file, flagsFile, libclangPath } = buckDb;
    return { file, flagsFile, libclangPath };
  }
  return null;
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */