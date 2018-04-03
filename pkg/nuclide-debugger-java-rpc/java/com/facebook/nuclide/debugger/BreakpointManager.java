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
import com.sun.jdi.event.ClassPrepareEvent;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Providing breakpoint management functionality. Threading: access from both request and event
 * threads.
 */
public class BreakpointManager {
  private final ContextManager _contextManager;
  private final Object _breakpointMapLock = new Object();
  // breakpointId -> BreakpointSpec
  private final HashMap<String, BreakpointSpec> _breakpointMap =
      new HashMap<String, BreakpointSpec>();
  // Breakpoint location -> List of breakpoints corresponding to that location.
  private final HashMap<Location, ArrayList<BreakpointSpec>> _breakpointsByFilename =
      new HashMap<Location, ArrayList<BreakpointSpec>>();
  private Map<String, Set<ReferenceType>> nameToClass = null;
  private Map<String, Set<ReferenceType>> sourceNameToClasses = null;

  BreakpointManager(ContextManager contextManager) {
    _contextManager = contextManager;
  }

  public synchronized void addAllClasses(List<ReferenceType> allClasses) {
    // To understand this method, look up the Java Docs for Collectors.groupingBy:
    // https://docs.oracle.com/javase/8/docs/api/java/util/stream/Collectors.html#groupingBy-java.util.function.Function-java.util.stream.Collector-
    nameToClass =
        allClasses
            .parallelStream()
            .filter(ReferenceType::isPrepared)
            .collect(
                Collectors.groupingBy(
                    ReferenceType::name,
                    Collectors.mapping(Function.identity(), Collectors.toSet())));

    sourceNameToClasses =
        allClasses
            .parallelStream()
            .filter(ReferenceType::isPrepared)
            .filter(clazz -> !(clazz instanceof ArrayType))
            .collect(
                Collectors.groupingBy(
                    clazz -> {
                      try {
                        return clazz.sourceName();
                      } catch (AbsentInformationException ex) {
                        // throw away the value by placing it in the empty string className
                        return "";
                      }
                    },
                    Collectors.mapping(Function.identity(), Collectors.toSet())));
  }

  public synchronized void addToMatchableClasses(ReferenceType clazz) {
    if (clazz.isPrepared()) {
      // for ClassLineBreakpointSpec:
      String className = clazz.name();
      nameToClass.putIfAbsent(className, new HashSet<ReferenceType>());
      nameToClass.get(className).add(clazz);

      // for FileLineBreakpointSpec:
      if (clazz instanceof ArrayType) {
        return;
      }
      try {
        String sourceName = clazz.sourceName();
        sourceNameToClasses.putIfAbsent(sourceName, new HashSet<ReferenceType>());
        sourceNameToClasses.get(sourceName).add(clazz);
      } catch (AbsentInformationException ex) {
        // don't add to map
      }
    }
  }

  public synchronized Set<ReferenceType> getClassesFromName(String className) {
    return nameToClass.getOrDefault(className, new HashSet<ReferenceType>());
  }

  public synchronized Set<ReferenceType> getClassesFromSourceName(String sourceName) {
    return sourceNameToClasses.getOrDefault(sourceName, new HashSet<ReferenceType>());
  }

  /** Threading: called by event thread. */
  public void handleClassPrepareEvent(ClassPrepareEvent classPrepareEvent) {
    handleClassPrepareEvent(classPrepareEvent, null);
  }

  public void handleClassPrepareEvent(
      ClassPrepareEvent classPrepareEvent, JavaDebuggerServer javaDebuggerServer) {
    ReferenceType loadClass = classPrepareEvent.referenceType();
    addToMatchableClasses(loadClass);
    synchronized (_breakpointMapLock) {
      for (BreakpointSpec breakpoint : _breakpointMap.values()) {
        breakpoint.resolve(loadClass, javaDebuggerServer);
      }
    }
  }

  public String setFileLineBreakpoint(
      String filePath, int line, String packageHint, String condition) {
    // Any files user tries to set breakpoint are potential source search paths.
    _contextManager.getSourceLocator().addPotentialPath(filePath);
    _contextManager
        .getSourceLocator()
        .addPotentialPath(Utils.packageRootPathFromFilePath(filePath, packageHint));
    BreakpointSpec breakpoint =
        new FileLineBreakpointSpec(
            _contextManager,
            new FileLineBreakpointRequestInfo(filePath, line, packageHint),
            condition);
    return addNewBreakpoint(breakpoint);
  }

  public String setClassLineBreakpoint(String className, int line) {
    BreakpointSpec breakpoint =
        new ClassLineBreakpointSpec(
            _contextManager, new ClassLineBreakpointRequestInfo(className, line));
    return addNewBreakpoint(breakpoint);
  }

  public void forceResolveAll() {
    synchronized (_breakpointMapLock) {
      _breakpointMap.values().stream().forEach(BreakpointSpec::enable);
    }
  }

  private String addNewBreakpoint(BreakpointSpec breakpoint) {
    /**
     * TODO: currently client IDE prevents duplicate breakpoint request to be sent to backend, but
     * we should deal with duplicate breakpoint in future.
     */
    breakpoint.enable();
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
    synchronized (_breakpointMapLock) {
      BreakpointSpec breakpoint = _breakpointMap.get(breakpointId);
      if (breakpoint != null) {
        breakpoint.clear();
        _breakpointMap.remove(breakpointId);
      } else {
        // TODO: throw exception?
      }
    }
  }

  public void addResolvedBreakpoint(BreakpointSpec breakpoint, Location location) {
    synchronized (_breakpointMapLock) {
      ArrayList<BreakpointSpec> breakpoints = _breakpointsByFilename.get(location);
      if (breakpoints == null) {
        breakpoints = new ArrayList<BreakpointSpec>();
        _breakpointsByFilename.put(location, breakpoints);
      }

      breakpoints.add(breakpoint);
    }
  }

  public void removeResolvedBreakpoint(BreakpointSpec breakpoint, Location location) {
    synchronized (_breakpointMapLock) {
      ArrayList<BreakpointSpec> breakpoints = _breakpointsByFilename.get(location);
      if (breakpoints != null) {
        breakpoints.remove(breakpoint);
        if (breakpoints.isEmpty()) {
          _breakpointsByFilename.remove(location);
        }
      }
    }
  }

  public ArrayList<BreakpointSpec> getBreakpointsAtLocation(Location location) {
    synchronized (_breakpointMapLock) {
      ArrayList<BreakpointSpec> breakpointsAtLocation = _breakpointsByFilename.get(location);
      return breakpointsAtLocation != null
          ? new ArrayList<BreakpointSpec>(breakpointsAtLocation)
          : new ArrayList<BreakpointSpec>();
    }
  }
}
