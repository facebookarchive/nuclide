/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

package com.facebook.nuclide.debugger;

import com.sun.jdi.ReferenceType;
import com.sun.jdi.event.ClassPrepareEvent;

import java.util.HashMap;
import java.util.Map;

/**
 * Providing breakpoint management functionality.
 * Threading: access from both request and event threads.
 */
public class BreakpointManager {
  private final ContextManager _contextManager;
  private final Object _breakpointMapLock = new Object();
  private final Map<String, BreakpointSpec> _breakpointMap = new HashMap<>();

  BreakpointManager(ContextManager contextManager) {
    _contextManager = contextManager;
  }

  /**
   * Threading: called by event thread.
   */
  public void handleClassPrepareEvent(ClassPrepareEvent classPrepareEvent) {
    ReferenceType loadClass = classPrepareEvent.referenceType();
    synchronized (_breakpointMapLock) {
      for (BreakpointSpec breakpoint : _breakpointMap.values()) {
        breakpoint.resolve(loadClass);
      }
    }
  }

  public String setFileLineBreakpoint(String filePath, Integer line) {
    // Any files usser tries to set breakpoint are potential source search paths.
    _contextManager.getSourceLocator().addPotentialPath(filePath);

    /**
     * TODO: currently client IDE prevents duplicate breakpoint request to be sent to backend,
     * but we should deal with duplicate breakpoint in future.
     */
    BreakpointSpec breakpoint = new BreakpointSpec(_contextManager, new BreakpointLocationInfo(filePath, line));
    breakpoint.resolveImmediate();
    synchronized (_breakpointMapLock) {
      _breakpointMap.putIfAbsent(breakpoint.getId(), breakpoint);
    }
    return breakpoint.getId();
  }

  public BreakpointSpec getBreakpointFromId(String breakpointId) {
    synchronized (_breakpointMapLock) {
      return _breakpointMap.get(breakpointId);
    }
  }

  public void removeBreakpoint(String breakpointId) {
    synchronized (_breakpointMapLock){
      BreakpointSpec breakpoint = _breakpointMap.get(breakpointId);
      if (breakpoint != null) {
        breakpoint.clear();
        _breakpointMap.remove(breakpointId);
      } else {
        // TODO: throw exception?
      }
    }
  }
}
