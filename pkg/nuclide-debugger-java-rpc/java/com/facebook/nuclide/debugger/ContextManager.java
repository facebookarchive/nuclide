/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

package com.facebook.nuclide.debugger;

import com.sun.jdi.ThreadReference;
import com.sun.jdi.VirtualMachine;
import com.sun.jdi.event.Event;
import com.sun.jdi.event.LocatableEvent;

import java.util.HashMap;
import java.util.Map;


/**
 * Contains all the debugger contextual information for client retrieval.
 */
public class ContextManager {
  private final CommandInterpreterBase _interpreter;
  private VirtualMachine _virtualMachine = null;
  private ThreadReference _currentThread = null;
  private final BreakpointManager _breakpointManager = new BreakpointManager(this);
  // Only accessed from request thread, no need to lock.
  private final Map<String, DomainHandlerBase> _domainHandlerMap = new HashMap<>();
  private final SourceLocator _sourceLocator = new SourceLocator(this);
  private final INotificationChannel _channel;
  private final FileManager _fileManager = new FileManager(this);
  private String _classPath = null;
  private final RemoteObjectManager _remoteObjectManager = new RemoteObjectManager();

  public ContextManager(CommandInterpreterBase interpreter, INotificationChannel channel) {
    _interpreter = interpreter;
    _channel = channel;
    _domainHandlerMap.put("LaunchHook", new LaunchHookDomain(this));
    _domainHandlerMap.put("Debugger", new DebuggerDomain(this));
    _domainHandlerMap.put("Runtime", new RuntimeDomain(this));
  }

  public void setVirtualMachine(VirtualMachine virtualMachine) {
    _virtualMachine = virtualMachine;
  }

  VirtualMachine getVirtualMachine() {
    return _virtualMachine;
  }

  ThreadReference getCurrentThread() {
    return _currentThread;
  }

  DomainHandlerBase getDomain(String domain) {
    return _domainHandlerMap.get(domain);
  }

  BreakpointManager getBreakpointManager() {
    return _breakpointManager;
  }

  SourceLocator getSourceLocator() {
    return _sourceLocator;
  }

  RemoteObjectManager getRemoteObjectManager() {
    return _remoteObjectManager;
  }

  void setClassPath(String classPath) {
    _classPath = classPath;
    _sourceLocator.setClassPath(classPath);
  }

  public void setSourcePath(String sourcePath) {
    _sourceLocator.setClassPath(sourcePath);
  }

  String getClassPath() {
    return _classPath;
  }

  CommandInterpreterBase getInterpreter() {
    return _interpreter;
  }

  INotificationChannel getNotificationChannel() {
    return _channel;
  }

  FileManager getFileManager() {
    return _fileManager;
  }

  public void updateCurrentThread(Event event) {
    if (event instanceof LocatableEvent) {
      _currentThread = ((LocatableEvent) event).thread();
    }
  }
}
