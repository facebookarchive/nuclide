/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

package com.facebook.nuclide.debugger;

class SourceFileSpec {
  private final String _scriptId;
  private final String _sourceFilePath;

  SourceFileSpec(String sourceFilePath) {
    // TODO: deal with files with the same name.
    // Use file base name as scriptId/key.
    _scriptId = Utils.getFileNameFromPath(sourceFilePath);
    _sourceFilePath = sourceFilePath;
  }

  String getScriptId() {
    return _scriptId;
  }

  String getUrl() {
    return "file://" + _sourceFilePath; // TODO: use URL class?
  }
}
