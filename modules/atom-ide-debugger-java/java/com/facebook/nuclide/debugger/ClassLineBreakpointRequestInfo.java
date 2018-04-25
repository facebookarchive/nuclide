/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

package com.facebook.nuclide.debugger;

class ClassLineBreakpointRequestInfo extends BreakpointRequestInfo {
  private final String _className;
  private final int _line;

  ClassLineBreakpointRequestInfo(String className, int line) {
    _className = className;
    _line = line;
  }

  public String getClassName() {
    return _className;
  }

  public int getLine() {
    return _line;
  }
}
