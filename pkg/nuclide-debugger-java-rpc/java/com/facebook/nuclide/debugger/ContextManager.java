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
  private final NotificationChannel _channel;
  private final FileManager _fileManager = new FileManager(this);
  private String _classPath = null;
  private final RemoteObjectManager _remoteObjectManager = new RemoteObjectManager();
  private final AppExitEvent _appExitEvent;
  private EventThread _eventThread;

  public ContextManager(CommandInterpreterBase interpreter, NotificationChannel channel, AppExitEvent appExitEvent) {
    _interpreter = interpreter;
    _channel = channel;
    _appExitEvent = appExitEvent;
    _domainHandlerMap.put("Bootstrap", new BootstrapDomain(this));
    _domainHandlerMap.put("Debugger", new DebuggerDomain(this));
    _domainHandlerMap.put("Runtime", new RuntimeDomain(this));
  }

  public void setVirtualMachine(VirtualMachine virtualMachine) {
    _virtualMachine = virtualMachine;
  }

  public VirtualMachine getVirtualMachine() {
    return _virtualMachine;
  }

  public ThreadReference getCurrentThread() {
    return _currentThread;
  }

  public AppExitEvent getAppExitEvent() {
    return _appExitEvent;
  }

  public DomainHandlerBase getDomain(String domain) {
    return _domainHandlerMap.get(domain);
  }

  public BreakpointManager getBreakpointManager() {
    return _breakpointManager;
  }

  public SourceLocator getSourceLocator() {
    return _sourceLocator;
  }

  public RemoteObjectManager getRemoteObjectManager() {
    return _remoteObjectManager;
  }

  public void setClassPath(String classPath) {
    _classPath = classPath;
    _sourceLocator.setClassPath(classPath);
  }

  public void setSourcePath(String sourcePath) {
    _sourceLocator.setClassPath(sourcePath);
  }

  public String getClassPath() {
    return _classPath;
  }

  public CommandInterpreterBase getInterpreter() {
    return _interpreter;
  }

  public NotificationChannel getNotificationChannel() {
    return _channel;
  }

  public FileManager getFileManager() {
    return _fileManager;
  }

  public void updateCurrentThread(Event event) {
    if (event instanceof LocatableEvent) {
      _currentThread = ((LocatableEvent) event).thread();
    }
  }

  public void setEventThread(EventThread eventThread) {
    _eventThread = eventThread;
  }

  public EventThread getEventThread() {
    return _eventThread;
  }
}
