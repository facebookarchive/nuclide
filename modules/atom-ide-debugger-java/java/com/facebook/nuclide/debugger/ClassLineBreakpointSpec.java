/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

package com.facebook.nuclide.debugger;

import com.sun.jdi.AbsentInformationException;
import com.sun.jdi.Location;
import com.sun.jdi.ReferenceType;
import com.sun.jdi.request.ClassPrepareRequest;
import com.sun.jdi.request.EventRequest;
import com.sun.jdi.request.EventRequestManager;
import java.util.Optional;
import java.util.Set;
import org.json.JSONObject;

/**
 * Breakpoint spec using full class name and line number. Threading: access from both request and
 * event threads.
 */
public class ClassLineBreakpointSpec extends BreakpointSpec {
  private final ClassLineBreakpointRequestInfo _requestInfo;
  private volatile Optional<ClassPrepareRequest> _classPrepareRequest = Optional.empty();

  public ClassLineBreakpointSpec(
      ContextManager contextManager, ClassLineBreakpointRequestInfo requestInfo) {
    super(contextManager, null);
    _requestInfo = requestInfo;
  }

  @Override
  public void enable() {
    resolveImmediate();
    if (isResolved()) {
      // Breakpoint is already resolved to a physical location, no need to watch for
      // further class prepare.
      return;
    }
    watchForClassPrepare();
  }

  /** Watch for future class prepare/load if not resolved yet. */
  private void watchForClassPrepare() {
    EventRequestManager em = getContextManager().getVirtualMachine().eventRequestManager();
    _classPrepareRequest = Optional.of(em.createClassPrepareRequest());
    _classPrepareRequest.get().addClassFilter(_requestInfo.getClassName());
    _classPrepareRequest.get().setSuspendPolicy(EventRequest.SUSPEND_ALL);
    _classPrepareRequest.get().enable();
  }

  @Override
  protected void handleBreakpointResolved() {
    // No need to watch future class prepare after breakpoint resolved.
    if (_classPrepareRequest.isPresent()) {
      _classPrepareRequest.get().disable();
      getContextManager()
          .getVirtualMachine()
          .eventRequestManager()
          .deleteEventRequest(_classPrepareRequest.get());
      _classPrepareRequest = Optional.empty();
    }
  }

  @Override
  public JSONObject getLocationJson() {
    SourceFileSpec sourceFile = getContextManager().getFileManager().register(getBoundLocation());
    return Utils.getLocationJson(sourceFile.getScriptId(), _requestInfo.getLine());
  }

  @Override
  public int getLine() {
    return _requestInfo.getLine();
  }

  @Override
  protected Optional<Location> getMatchLocationFromClass(ReferenceType refType) {
    try {
      // TODO: handle multiple locations.
      return refType.locationsOfLine(_requestInfo.getLine()).stream().findFirst();
    } catch (AbsentInformationException e) {
      // This type does not have line info, ignore it.
      return Optional.empty();
    }
  }

  @Override
  protected Set<ReferenceType> getMatchingClasses() {
    return getContextManager()
        .getBreakpointManager()
        .getClassesFromName(_requestInfo.getClassName());
  }
}
