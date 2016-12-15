/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

package com.facebook.nuclide.debugger;

class BreakpointLocationInfo {
  BreakpointLocationInfo(String filePath, int line) {
    this.filePath = filePath;
    this.line = line;
  }

  public final String filePath;
  public final int line;
}
