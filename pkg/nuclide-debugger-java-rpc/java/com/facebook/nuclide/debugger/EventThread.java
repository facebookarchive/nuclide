/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

package com.facebook.nuclide.debugger;

import com.sun.jdi.AbsentInformationException;
import com.sun.jdi.IncompatibleThreadStateException;
import com.sun.jdi.StackFrame;
import com.sun.jdi.ThreadReference;
import com.sun.jdi.VMDisconnectedException;
import com.sun.jdi.event.Event;
import com.sun.jdi.event.EventSet;
import com.sun.jdi.event.VMDeathEvent;
import com.sun.jdi.event.VMDisconnectEvent;
import com.sun.jdi.event.EventIterator;
import com.sun.jdi.event.EventQueue;
import com.sun.jdi.event.ClassPrepareEvent;
import com.sun.jdi.event.VMStartEvent;
import com.sun.jdi.event.BreakpointEvent;
import com.sun.jdi.event.StepEvent;

import com.sun.jdi.request.BreakpointRequest;
import com.sun.jdi.request.EventRequest;
import com.sun.jdi.request.EventRequestManager;
import com.sun.jdi.request.StepRequest;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.IOError;
import java.io.FileReader;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * This class processes incoming JDI events.
 */
public class EventThread extends Thread {

  private final ContextManager _contextManager;
  private boolean _connected = true;  // Connected to VM.
  private boolean _vmDied = false;    // VMDeath occurred.

  EventThread(ContextManager contextManager) {
    super("event-handler");
    _contextManager = contextManager;
  }

  /**
   * Run the event handling thread.
   * As long as we are connected, get event sets off
   * the queue and dispatch the events within them.
   */
  @Override
  public void run() {
    EventQueue queue = _contextManager.getVirtualMachine().eventQueue();
    try {
      while (_connected) {
        try {
          EventSet eventSet = queue.remove();
          EventIterator it = eventSet.eventIterator();
          boolean resume = true;
          while (it.hasNext()) {
            resume &= handleEvent(it.nextEvent());
          }
          if (resume) {
            eventSet.resume();
          }
        } catch (VMDisconnectedException discExc){
          handleDisconnectedException();
          break;
        }
      }
    } catch (InterruptedException e) {
      // Someone notified us to exit.
    }
    _contextManager.getAppExitEvent().notifyExit();
  }

  // TODO: synchronize data structures(threading)?

  /**
   * Dispatch incoming events
   */
  private boolean handleEvent(Event event) {
    boolean resume = true;
    _contextManager.updateCurrentThread(event);

    if (event instanceof VMDeathEvent) {
      handleVMDeathEvent((VMDeathEvent) event);
    } else if (event instanceof VMDisconnectEvent) {
      handleVMDisconnectEvent((VMDisconnectEvent) event);
    } else if (event instanceof ClassPrepareEvent) {
      _contextManager.getBreakpointManager().handleClassPrepareEvent((ClassPrepareEvent) event);
    } else if (event instanceof VMStartEvent || event instanceof BreakpointEvent || event instanceof StepEvent) {
      handleDebuggerPause(event);
      resume = false;
    } else {
      // TODO:
    }
    return resume;
  }

  private void handleDebuggerPause(Event event) {
      JSONArray callFrames = new JSONArray();
      ThreadReference stopThread = _contextManager.getCurrentThread();
      if (stopThread != null) {
        try {
          // TODO: should only enable in debug mode.
          printLocationSource(_contextManager.getCurrentThread().frame(0));
          for (StackFrame frame : stopThread.frames()) {
            JSONObject callFrameJson = new JSONObject();
            String frameName = Utils.getFrameName(frame);
            callFrameJson.put("callFrameId", frameName);
            callFrameJson.put("functionName", frameName);
            callFrameJson.put("location", Utils.getFrameLocationJson(_contextManager.getFileManager(), frame));
            callFrameJson.put("scopeChain", getLocalsScopeChain(frame));
            callFrames.put(callFrameJson);
          }
        } catch (IncompatibleThreadStateException | IOException e) {
          // If we fail to get stack frames due to exception, just log the exception
          // and display empty call frames in UI.
          Utils.logLine(e.toString());
        }
      }
      JSONObject params = new JSONObject();
      params.put("reason", "Hitting breakpoint");
      params.put("callFrames", callFrames);

      JSONObject messageJson = new JSONObject();
      messageJson.put("method", "Debugger.paused");
      messageJson.put("params", params);

    try {
      sendClient(messageJson.toString());
    } catch (IOException e) {
      // Debugger pause notification can't be sent to client something
      // is serious wrong, let's crash the server with RuntimeException.
      Utils.logLine(e.toString());
      throw new IOError(e);
    }
  }

  private JSONArray getLocalsScopeChain(StackFrame frame) {
    JSONObject localScopeJson = new JSONObject();
    localScopeJson.put("type", "locals");

    JSONObject localsJson = null;
    try {
      localsJson = _contextManager.getRemoteObjectManager().registerLocals(frame).getSerializedValue();
    } catch (AbsentInformationException e) {
      // No locals, can happen for frame without source.
      // Fallback with empty locals.
      localsJson = new JSONObject();
    }
    localScopeJson.put("object", localsJson);

    JSONArray scopeChainJson = new JSONArray();
    scopeChainJson.put(localScopeJson);
    return scopeChainJson;
  }

  private void sendClient(String message) throws IOException {
    _contextManager.getNotificationChannel().send(message);
  }

  // Test only(for console mode).
  private void printLocationSource(StackFrame frame) throws IOException {
    Utils.logLine("Source:");
    int locationLine = frame.location().lineNumber();
    Optional<File> file = Optional.empty();
    try {
      file = _contextManager.getSourceLocator().findSourceFile(frame.location().sourcePath());
    } catch (AbsentInformationException e) {
      // No source file.
    }
    if (file.isPresent()) {
      try {
        BufferedReader reader = new BufferedReader(new FileReader(file.get()));
        int lineIndex = 0;
        String line;
        while ((line = reader.readLine()) != null) {
          ++lineIndex;
          if (locationLine - 1 <= lineIndex && lineIndex <= locationLine + 1) {
            Utils.logLine(String.format("%d%s%s",
                lineIndex,
                lineIndex == locationLine ? "*" : "",
                line
            ));
          }
        }
      } catch (FileNotFoundException e) {
        e.printStackTrace();
      }
    }
    System.out.println();
  }

  /***
   * A VMDisconnectedException has happened while dealing with
   * another event. We need to flush the event queue, dealing only
   * with exit events (VMDeath, VMDisconnect) so that we terminate
   * correctly.
   */
  private synchronized void handleDisconnectedException() throws InterruptedException {
    EventQueue queue = _contextManager.getVirtualMachine().eventQueue();
    while (_connected) {
      EventSet eventSet = queue.remove();
      EventIterator iter = eventSet.eventIterator();
      while (iter.hasNext()) {
        Event event = iter.nextEvent();
        if (event instanceof VMDeathEvent) {
          handleVMDeathEvent((VMDeathEvent) event);
        } else if (event instanceof VMDisconnectEvent) {
          handleVMDisconnectEvent((VMDisconnectEvent) event);
        }
      }
      eventSet.resume(); // Resume the VM
    }
  }

  private void handleVMDeathEvent(VMDeathEvent event) {
    _vmDied = true;
    Utils.logLine("-- The application exited --");
  }

  private void handleVMDisconnectEvent(VMDisconnectEvent event) {
    _connected = false;
    if (!_vmDied) {
      Utils.logLine("-- The application has been disconnected --");
    }
  }
}
