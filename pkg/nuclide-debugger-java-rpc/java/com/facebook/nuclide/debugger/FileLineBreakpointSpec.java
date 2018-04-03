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

/** Source line breakpoint spec. Threading: access from both request and event threads. */
public class FileLineBreakpointSpec extends BreakpointSpec {
  private final FileLineBreakpointRequestInfo _requestInfo;
  private final String _fileName;
  private volatile Optional<ClassPrepareRequest> _classPrepareRequest = Optional.empty();

  public FileLineBreakpointSpec(
      ContextManager contextManager, FileLineBreakpointRequestInfo locationInfo, String condition) {
    super(contextManager, condition);
    _fileName = Utils.getFileNameFromPath(locationInfo.getFilePath());
    _requestInfo = locationInfo;
  }

  @Override
  public void enable() {
    resolveImmediate();
    if (isResolved()) {
      // Breakpoint is already resolved to a physical location, no need to watch for
      // further class prepare.
      // TODO: is there any case one source line binds to multiple physical locations?
      return;
    }
    watchForClassPrepare();
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

    // Now that this is resolved, we should have a bound location. Tell the
    // breakpoint manager.
    Optional<Location> location = getBoundLocation();
    if (location.isPresent()) {
      getContextManager().getBreakpointManager().addResolvedBreakpoint(this, location.get());
    }
  }

  /** Watch for future class prepare/load if not resolved yet. */
  private void watchForClassPrepare() {
    // TODO: deal with breakpoints set before VM started.
    EventRequestManager em = getContextManager().getVirtualMachine().eventRequestManager();
    _classPrepareRequest = Optional.of(em.createClassPrepareRequest());
    /**
     * Ideally we want to use addSourceNameFilter() to filter; unfortunately, I always got
     * UnsupportedOperationException while targeting android JVM. Workaround using packageHint
     * instead.
     */
    String packageHint = _requestInfo.getPackageHint();
    if (!packageHint.isEmpty()) {
      _classPrepareRequest.get().addClassFilter(packageHint + "*");
    }
    _classPrepareRequest.get().setSuspendPolicy(EventRequest.SUSPEND_ALL);
    _classPrepareRequest.get().enable();
  }

  @Override
  public JSONObject getLocationJson() {
    SourceFileSpec sourceFile =
        getContextManager()
            .getFileManager()
            .register(_requestInfo.getFilePath(), _requestInfo.getFilePath());
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
    return getContextManager().getBreakpointManager().getClassesFromSourceName(_fileName);
  }
}
