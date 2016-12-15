/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

package com.facebook.nuclide.debugger;

import com.sun.jdi.IncompatibleThreadStateException;
import com.sun.jdi.StackFrame;
import com.sun.jdi.ThreadReference;
import org.json.JSONObject;

import java.util.Scanner;

/**
 * Console mode command interpreter.(Test Only)
 */
public class ConsoleCommandInterpreter extends CommandInterpreterBase {
  private int _protocolIdSeed = 0;
  private String _classPath;
  private String _sourcePath;

  public ConsoleCommandInterpreter() {
    // AppExitEvent is not used in console mode.
    super(new ConsoleNotificationChannel(), new AppExitEvent());
  }

  public void start() {
    Scanner scanner = new Scanner(System.in);
    boolean shouldContinue = true;
    while (shouldContinue) {
      System.out.print("dbg> ");
      String input = scanner.nextLine();
      try {
        shouldContinue = processCommand(input);
      } catch (DomainHandlerException ex) {
        // In console mode, we swallow command failure so that user can try again.
        System.err.println(ex.toString());
      }
    }
    // Notify even thread before exiting command loop.
    getContextManager().getEventThread().interrupt();
  }

  private void printBacktrace() {
    ThreadReference stopThread = getContextManager().getCurrentThread();
    try {
      for (int i = 0; i < stopThread.frameCount(); ++i) {
        StackFrame frame = stopThread.frame(i);
        System.out.println(String.format("[%d] %s at %s",
            i,
            Utils.getFrameName(frame),
            frame.location().toString()
        ));
      }
    } catch (IncompatibleThreadStateException e) {
      e.printStackTrace();
    }
  }

  private boolean processCommand(String input) throws DomainHandlerException {
    if (input == null || input.isEmpty()) {
      return true;
    }
    return processCommand(input.split(" "));
  }

  private boolean processCommand(String[] args) throws DomainHandlerException {
    String command = args[0];
    switch (command) {
      case "ls":
        startListening(args);
        break;

      case "launch":
        launch(args);
        break;

      case "ap":
        attachPort(args);
        break;

      case "pause":
        callDomainMethod("Debugger", "pause");
        break;

      case "c":
        callDomainMethod("Debugger", "resume");
        break;

      case "n":
        callDomainMethod("Debugger", "stepOver");
        break;

      case "si":
        callDomainMethod("Debugger", "stepInto");
        break;

      case "so":
        callDomainMethod("Debugger", "stepOut");
        break;

      case "bp":
        setBreakpoint(args);
        break;

      case "bt":
        printBacktrace();
        break;

      case "classpath":
        setClassPath(args);
        break;

      case "sourcepath":
        setSourcePath(args);
        break;

      case "locals":
        callDomainMethod("Debugger", "locals");
        break;

      case "expand":
        expandObjectId(args);
        break;

      case "q":
        return false;

      default:
        // TODO: create a dedicated console exception for unknown command.
        throw new DomainHandlerException(String.format("Unknown commmand: %s", command));
    }
    return true;
  }

  private void expandObjectId(String[] args) throws DomainHandlerException {
    if (args.length != 2) {
      System.err.println("Usage: expand <objectId>");
      return;
    }
    JSONObject params = new JSONObject();
    params.put("objectId", args[1]);
    callDomainMethod("Runtime", "getProperties", params);
  }

  private void startListening(String[] args) throws DomainHandlerException {
    if (args.length != 2) {
      System.err.println("Usage: ls <path1:path2:path3>");
      return;
    }
    JSONObject params = new JSONObject();
    params.put("port", args[1]);
    callDomainMethod("Bootstrap", "listen", params);

    // Enable the debugger domain.
    callDomainMethod("Debugger", "enable", params);
  }

  private void attachPort(String[] args) throws DomainHandlerException {
    if (args.length != 2) {
      System.err.println("Usage: ap <port>");
      return;
    }

    JSONObject params = new JSONObject();
    params.put("port", Integer.parseInt(args[1]));
    callDomainMethod("Bootstrap", "attachPort", params);

    // Enable the debugger domain.
    callDomainMethod("Debugger", "enable", params);
  }

  private void setClassPath(String[] args) {
    if (args.length != 2) {
      System.err.println("Usage: classpath <path1:path2:path3>");
      return;
    }
    _classPath = args[1];
  }

  private void setSourcePath(String[] args) {
    if (args.length != 2) {
      System.err.println("Usage: classpath <path1:path2:path3>");
      return;
    }
    _sourcePath = args[1];
  }

  private void launch(String[] args) throws DomainHandlerException {
    if (args.length < 2) {
      System.err.println("Usage: launch <commandLine>");
      return;
    }
    String commandLine = args[1];
    for (int i = 2; i < args.length; ++i) {
      commandLine += " " + args[i];
    }
    JSONObject params = new JSONObject();
    params.put("commandLine", commandLine);
    params.put("classPath", _classPath);
    params.put("sourcePath", _sourcePath);
    callDomainMethod("Bootstrap", "launch", params);

    // Enable the debugger domain.
    callDomainMethod("Debugger", "enable", params);
  }

  private void setBreakpoint(String[] args) throws DomainHandlerException {
    if (args.length != 3) {
      System.err.println("Usage: bp <filePath> <line>");
      return;
    }
    JSONObject params = new JSONObject();
    params.put("url", args[1]);
    params.put("lineNumber", Integer.valueOf(args[2]) - 1);   // lineNumber will be increased by DebuggerDomain.
    callDomainMethod("Debugger", "setBreakpointByUrl", params);
  }

  private void callDomainMethod(String domainName, String methodName) throws DomainHandlerException {
    callDomainMethod(domainName, methodName, new JSONObject());
  }

  private void callDomainMethod(String domainName, String methodName, JSONObject params) throws DomainHandlerException {
    JSONObject response = getContextManager().getDomain(domainName).handleMethod(
        String.valueOf(++_protocolIdSeed),
        methodName,
        params
    );
    Utils.logLine(response.toString());
  }
}
