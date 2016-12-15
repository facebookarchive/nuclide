/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

package com.facebook.nuclide.debugger;

import com.sun.jdi.AbsentInformationException;
import com.sun.jdi.ArrayType;
import com.sun.jdi.Location;
import com.sun.jdi.ReferenceType;
import com.sun.jdi.request.BreakpointRequest;
import com.sun.jdi.request.EventRequest;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/**
 * Source line breakpoint spec.
 * Threading: access from both request and event threads.
 */
public class BreakpointSpec {
  private static int _breakpointIdSeed = 0;
  private final String _breakpointId;
  private final ContextManager _contextManager;
  private final BreakpointLocationInfo _locationInfo;
  private final String _fileName;
  private Location _boundLocation;
  private final Object _breakpointRequestsLock = new Object();
  private final List<BreakpointRequest> _breakpointRequests = new ArrayList<>();

  public BreakpointSpec(ContextManager contextManager, BreakpointLocationInfo locationInfo) {
    _breakpointId = String.format("BreakpointSpec.%d", ++_breakpointIdSeed);
    _contextManager = contextManager;
    _fileName = Utils.getFileNameFromPath(locationInfo.filePath);
    _locationInfo = locationInfo;
  }

  /**
   * Resolve the breakpoint immediately in current loaded classes list.
   */
  public void resolveImmediate() {
    if (_contextManager.getVirtualMachine() == null) {
      // Haven't start debugging yet.
      return;
    }

    for (ReferenceType clazz : getAllClassesInFile()) {
      if (resolveForClass(clazz)) {
        // Successfully found a class resolve the breakpoint, early return.
        // In theory there should only be one class covering a file line.
        break;
      }
    }
  }

  /**
   * Resolve the breakpoint for input class if possible.
   * Threading: called by event thread.
   */
  public void resolve(ReferenceType clazz) {
    // TODO: guard it into a debug switch.
    // try {
    //     System.out.println(String.format("BreakpointSpec.resolve(%d) for : (%s, %s, %s)", clazz.name(), clazz.sourceName(), clazz.sourcePaths(clazz.virtualMachine().getDefaultStratum())));
    // } catch (AbsentInformationException e) {
    //    e.printStackTrace();
    // }
    if (doesClassMatchBreakpointFile(clazz)) {
      // TODO: guard it into a debug switch
      // Utils.logLine(String.format("Found match class: %s", clazz.name()));
      resolveForClass(clazz);
    }
  }

  /**
   * Used by debugger UI to remote unique identify this breakpoint.
   */
  public String getId() {
    return _breakpointId;
  }

  /**
   * Whether this breakpoint is resolved or not.
   */
  public boolean isResolved() {
    return _boundLocation != null;
  }

  public BreakpointLocationInfo getLocationInfo() {
    return _locationInfo;
  }

  private boolean resolveForClass(ReferenceType clazz) {
    Location location = getMatchLocationFromClass(clazz);
    if (location != null) {
      _boundLocation = location;
      BreakpointRequest breakpointRequest = _contextManager.getVirtualMachine().eventRequestManager().createBreakpointRequest(location);
      breakpointRequest.setSuspendPolicy(EventRequest.SUSPEND_ALL);
      breakpointRequest.enable();
      synchronized (_breakpointRequestsLock) {
        _breakpointRequests.add(breakpointRequest);
      }
      sendBreakpointResolvedNotification();
      return true;
    }
    return false;
  }

  /**
   * Notify debugger UI this breakpoint is resolved to certain location.
   */
  private void sendBreakpointResolvedNotification() {
    JSONObject params = new JSONObject();
    params.put("breakpointId", _breakpointId);
    params.put("location", Utils.getBreakpointLocationJson(_contextManager.getFileManager(), this));

    JSONObject messageJson = new JSONObject();
    messageJson.put("method", "Debugger.breakpointResolved");
    messageJson.put("params", params);

    _contextManager.getNotificationChannel().send(messageJson.toString());
  }

  private Location getMatchLocationFromClass(ReferenceType refType) {
    try {
      List<Location> locations = refType.locationsOfLine(_locationInfo.line);
      // TODO: handle multiple locations.
      if (!locations.isEmpty()) {
        return locations.get(0);
      }
    } catch (AbsentInformationException e) {
      // This type does not have line info, ignore it.
    }
    return null;
  }

  private ArrayList<ReferenceType> getAllClassesInFile() {
    ArrayList<ReferenceType> result = new ArrayList<ReferenceType>();
    for (ReferenceType clazz : _contextManager.getVirtualMachine().allClasses()) {
      if (clazz.isPrepared() && doesClassMatchBreakpointFile(clazz)) {
        Utils.logLine(String.format("Found match class: %s", clazz.name()));
        result.add(clazz);
      }
    }
    return result;
  }

  private boolean doesClassMatchBreakpointFile(ReferenceType clazz) {
    // Android JDI implementation will crash while calling ArrayType.sourceName().
    if (clazz instanceof ArrayType) {
      return false;
    }

    try {
      // Use file base name to set breakpoint because the source file path may be changed.
      // e.g. user moved the source file from one location to another.
      return clazz.sourceName().equals(_fileName);
    } catch (AbsentInformationException e) {
      // This type does not have source info.
      return false;
    }
  }

  public void clear() {
    synchronized (_breakpointRequestsLock) {
      _contextManager.getVirtualMachine().eventRequestManager().deleteEventRequests(_breakpointRequests);
      _breakpointRequests.clear();
    }
  }
}
