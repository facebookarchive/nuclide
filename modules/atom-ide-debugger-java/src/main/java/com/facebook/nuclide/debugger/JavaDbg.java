/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

package com.facebook.nuclide.debugger;

import java.util.logging.Level;

/** Entry point class. */
public class JavaDbg {
  private final String[] _args;
  private static final int DEFAULT_PORT = 8025;

  private JavaDbg(String[] args) {
    _args = args;
  }

  private void start() {
    (new JavaDebuggerServer()).start();
  }

  /** Entry point for the whole program. */
  public static void main(String[] args) {
    Level level = Level.INFO;
    for (String arg : args) {
      if (arg.contains("verbose")) {
        // Set log level to verbose only if specified on command line. This amount
        // of logging slows the debug server down noticably.
        System.err.println("Verbose logging enabled.");
        level = Level.ALL;
        break;
      }
    }

    Utils.initializeLogging(level);
    Utils.logInfo("Java Debugger started!");
    Utils.logVerbose("Starting JavaDbg with args:" + String.join(" ", args));

    JavaDbg debugger = new JavaDbg(args);
    debugger.start();
  }
}
