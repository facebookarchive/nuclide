/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

package com.facebook.nuclide.debugger;

import com.sun.jdi.Bootstrap;
import com.sun.jdi.VirtualMachine;
import com.sun.jdi.VirtualMachineManager;
import com.sun.jdi.connect.Connector;
import com.sun.jdi.connect.IllegalConnectorArgumentsException;
import com.sun.jdi.connect.LaunchingConnector;
import com.sun.jdi.connect.ListeningConnector;
import com.sun.jdi.connect.AttachingConnector;
import com.sun.jdi.connect.VMStartException;
import com.sun.jdi.request.ClassPrepareRequest;
import com.sun.jdi.request.ClassUnloadRequest;
import com.sun.jdi.request.EventRequest;
import com.sun.jdi.request.EventRequestManager;

import java.io.IOException;
import java.util.Map;

/**
 * JVM connector that provides launch/attach/listen functionality for debugger.
 */
public class JVMConnector {
  /**
   * Launch a java class for debugging.
   */
  public VirtualMachine launch(String vmArgs, String commandLine) throws VMStartException, IllegalConnectorArgumentsException, IOException {
    // Use RawCommandLineLaunch instead because machine name may be changed which caused launching to fail.
    // Default launch connector does not allow you to specify machine name while RawCommandLineLaunch allows.
    VirtualMachine vm = launchWithRawConnector(vmArgs, commandLine);
    registerEventHooks(vm);
    return vm;
  }

  private VirtualMachine launchWithRawConnector(String vmArgs, String commandLine) throws VMStartException, IllegalConnectorArgumentsException, IOException {
    LaunchingConnector launchingConnector = getRawLaunchingConnector();
    Map<String, Connector.Argument> args = launchingConnector.defaultArguments();
    String port = "54321";
    String jdwpProtocol = String.format("-Xdebug -Xrunjdwp:transport=dt_socket,address=localhost:%s,suspend=y", port);
    args.get("command").setValue(String.format("java %s %s %s", vmArgs, jdwpProtocol, commandLine));
    args.get("address").setValue(port);
    return launchingConnector.launch(args);
  }

  private VirtualMachine launchWithDefaultConnector(String vmArgs, String commandLine) throws VMStartException, IllegalConnectorArgumentsException, IOException {
    LaunchingConnector launchingConnector = getDefaultLaunchingConnector();
    Map<String, Connector.Argument> args = launchingConnector.defaultArguments();
    args.get("options").setValue(vmArgs);
    args.get("main").setValue(commandLine);
    args.get("suspend").setValue("true");
    return launchingConnector.launch(args);
  }

  private LaunchingConnector getDefaultLaunchingConnector() {
    VirtualMachineManager vmManager = Bootstrap.virtualMachineManager();
    return vmManager.defaultConnector();
  }

  private LaunchingConnector getRawLaunchingConnector() {
    VirtualMachineManager vmManager = Bootstrap.virtualMachineManager();
    for (LaunchingConnector connector : vmManager.launchingConnectors()) {
      if (connector.name().contains("com.sun.jdi.RawCommandLineLaunch")) {
        return connector;
      }
    }
    return null;
  }

  /**
   * Listening for JVM debugging connection on tcp/ip port.
   * The call will be blocked until connection is made.
   */
  public VirtualMachine startListening(String port) throws IOException, IllegalConnectorArgumentsException {
    VirtualMachine vm = this.startListeningInternal(port);
    registerEventHooks(vm);
    return vm;
  }

  private VirtualMachine startListeningInternal(String port) throws IOException, IllegalConnectorArgumentsException {
    ListeningConnector listeningConnector = null;
    for (ListeningConnector connector : Bootstrap.virtualMachineManager().listeningConnectors()) {
      listeningConnector = connector;
    }
    Map<String, Connector.Argument> args = listeningConnector.defaultArguments();
    args.get("port").setValue(port);
    String listeningAddress = listeningConnector.startListening(args);
    Utils.logLine(String.format("Listening at address: %s", listeningAddress));
    return listeningConnector.accept(args);
  }

  /**
   * Register interesting JVM event hooks.
   */
  private void registerEventHooks(VirtualMachine vm) {
    /*
     * We must allow the deferred breakpoints to be resolved before
     * we continue executing the class.
     */
    EventRequestManager em = vm.eventRequestManager();
    ClassPrepareRequest classPrepareRequest = em.createClassPrepareRequest();
    classPrepareRequest.setSuspendPolicy(EventRequest.SUSPEND_ALL);
    classPrepareRequest.enable();

    ClassUnloadRequest classUnloadRequest = em.createClassUnloadRequest();
    classUnloadRequest.setSuspendPolicy(EventRequest.SUSPEND_NONE);
    classUnloadRequest.enable();
  }

  /**
   * Attach to a tcp/ip port on host machine.
   */
  public VirtualMachine attachPort(String hostName, String port) throws IOException, IllegalConnectorArgumentsException {
    VirtualMachine vm = attachInternal(hostName, port);
    registerEventHooks(vm);
    return vm;
  }

  private VirtualMachine attachInternal(String hostName, String port) throws IOException, IllegalConnectorArgumentsException {
    AttachingConnector attachingConnector = this.getAttachingConnector("dt_socket");
    Map<String, Connector.Argument> args = attachingConnector.defaultArguments();
    args.get("hostname").setValue(hostName);
    args.get("port").setValue(port);
    return attachingConnector.attach(args);
  }

  private AttachingConnector getAttachingConnector(String transportName) {
    VirtualMachineManager vmManager = Bootstrap.virtualMachineManager();
    AttachingConnector result = null;
    for (AttachingConnector attachConnector : vmManager.attachingConnectors()) {
      Utils.logLine(attachConnector.transport().name());
      if (attachConnector.transport().name().equals(transportName)) {
        result = attachConnector;
      }
    }
    return result;
  }
}
