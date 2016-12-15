/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

package com.facebook.nuclide.debugger;

import javax.websocket.DeploymentException;

/**
 * Entry point class.
 */
public class JavaDbg {
  private final String[] _args;

  private JavaDbg(String[] args) {
    _args = args;
  }

  private void start() throws DeploymentException {
    if (_args.length > 0 && _args[0].equals("--nuclide")) {
      WebSocketServer.start();
    } else {
      (new ConsoleCommandInterpreter()).start();
    }
  }

  /**
   * Entry point for the whole program.
   */
  public static void main(String[] args) throws DeploymentException {
    JavaDbg debugger = new JavaDbg(args);
    debugger.start();
  }
}
