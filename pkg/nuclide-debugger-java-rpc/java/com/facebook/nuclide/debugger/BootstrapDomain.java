/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

package com.facebook.nuclide.debugger;

import com.sun.jdi.VirtualMachine;
import com.sun.jdi.connect.IllegalConnectorArgumentsException;
import com.sun.jdi.connect.VMStartException;
import org.json.JSONObject;

import java.io.IOException;

/**
 * Implement Nuclide bootstrap domain protocols.
 * TODO: document this domain protocls in protocol.json.
 */
public class BootstrapDomain extends DomainHandlerBase {
  public BootstrapDomain(ContextManager contextManager) {
    super("LaunchHook", contextManager);
  }

  JSONObject handleMethod(String id, String methodName, JSONObject params) throws DomainHandlerException {
    JSONObject response = new JSONObject();
    switch (methodName) {
      case "launch":
        String sourcePath = params.has("sourcePath") ? String.valueOf(params.get("sourcePath")) : null;
        launch(
            String.valueOf(params.get("commandLine")),
            String.valueOf(params.get("classPath")),
            sourcePath
        );
        break;

      case "attachPort":
        attachPort((int)params.get("port"));
        break;

      case "listen":
        startListening((int)params.get("port"));
        break;

      default:
        throwUndefinedMethodException(methodName);
        break;
    }
    return response;
  }

  private void startListening(int port) throws DomainHandlerException {
    JVMConnector jvmConnector = new JVMConnector();
    final VirtualMachine virtualMachine;
    try {
      virtualMachine = jvmConnector.startListening(port);
    } catch (IOException | IllegalConnectorArgumentsException e) {
      String errorMessage = String.format("Listening failed for port '%s'", port);
      throw new DomainHandlerException(errorMessage, e);
    }
    getContextManager().setVirtualMachine(virtualMachine);
    startEventThread(getContextManager().getVirtualMachine());
  }

  private void launch(String launchCommandLine, String classPath, String sourcePath) throws DomainHandlerException {
    // TODO: validate classPath/sourcePath?
    getContextManager().setClassPath(classPath);
    if (sourcePath != null) {
      getContextManager().setSourcePath(sourcePath);
    }
    try {
      launchDebugger(launchCommandLine);
    } catch (VMStartException | IOException | IllegalConnectorArgumentsException e) {
      String errorMessage = String.format("Launch failed for '%s'", launchCommandLine);
      throw new DomainHandlerException(errorMessage, e);
    }
    startEventThread(getContextManager().getVirtualMachine());
  }

  private void startEventThread(VirtualMachine vm) {
    EventThread eventThread = new EventThread(getContextManager());
    eventThread.start();
  }

  private void launchDebugger(String commandLine) throws VMStartException, IOException, IllegalConnectorArgumentsException {
    JVMConnector jvmConnector = new JVMConnector();
    String vmArgs = String.format("-classpath %s", getContextManager().getClassPath());
    final VirtualMachine virtualMachine = jvmConnector.launch(vmArgs, commandLine);
    getContextManager().setVirtualMachine(virtualMachine);
  }

  private void attachPort(int port) throws DomainHandlerException {
    try {
      attachDebugger(port);
    } catch (IOException | IllegalConnectorArgumentsException e) {
      String errorMessage = String.format("Attach failed for local port '%d'", port);
      throw new DomainHandlerException(errorMessage, e);
    }
    startEventThread(getContextManager().getVirtualMachine());
  }

  private void attachDebugger(int port) throws IOException, IllegalConnectorArgumentsException {
    JVMConnector jvmConnector = new JVMConnector();
    final VirtualMachine virtualMachine = jvmConnector.attachPort("localhost", port);
    getContextManager().setVirtualMachine(virtualMachine);
  }
}
