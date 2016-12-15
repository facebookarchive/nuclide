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
import com.sun.jdi.request.EventRequest;
import com.sun.jdi.request.EventRequestManager;
import com.sun.jdi.request.StepRequest;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/**
 * Implements Nuclide debugger domain protocols.
 */
public class DebuggerDomain extends DomainHandlerBase {

  public DebuggerDomain(ContextManager contextManager) {
    super("Debugger", contextManager);
  }

  public JSONObject handleMethod(String id, String methodName, JSONObject params) throws DomainHandlerException {
    JSONObject result = new JSONObject();
    switch (methodName) {
      case "enable":
        enable();
        break;

      case "setBreakpointByUrl":
        result = setFileLineBreakpoint(
            String.valueOf(params.get("url")),
            (int) params.get("lineNumber") + 1 // Chrome line number is 0-based.
        );
        break;

      case "removeBreakpoint":
        removeBreakpoint(String.valueOf(params.get("breakpointId")));
        break;

      case "stepOver":
        stepOver();
        break;

      case "stepInto":
        stepInto();
        break;

      case "stepOut":
        stepOut();
        break;

      case "resume":
        resume();
        break;

      case "pause":
        pause();
        break;

      // Test only.
      case "locals":
        printLocals();
        break;

      default:
        throwUndefinedMethodException(methodName);
        break;
    }
    return result;
  }

  private void printLocals() {
    StackFrame currentFrame = null;
    try {
      currentFrame = getContextManager().getCurrentThread().frame(0);
      RemoteObject localsRemoteObject = getContextManager().getRemoteObjectManager().registerLocals(currentFrame);
      Utils.logLine(localsRemoteObject.getSerializedValue().toString());
    } catch (IncompatibleThreadStateException | AbsentInformationException e) {
      e.printStackTrace();
    }
  }

  private void removeBreakpoint(String breakpointId) {
    getContextManager().getBreakpointManager().removeBreakpoint(breakpointId);
  }

  private void enable() {
    getContextManager().getNotificationChannel().enable();
  }

  private void resume() {
    clearPreviousSteps();
    getContextManager().getVirtualMachine().resume();
  }

  private void pause() {
    getContextManager().getVirtualMachine().suspend();
  }

  private JSONObject setFileLineBreakpoint(String fileUrl, Integer line) {
    String filePath = Utils.getFilePathFromUrl(fileUrl);
    String breakpointId = getContextManager().getBreakpointManager().setFileLineBreakpoint(filePath, line);
    BreakpointSpec breakpoint = getContextManager().getBreakpointManager().getBreakpointFromId(breakpointId);
    return getBreakpointJson(breakpoint);
  }

  private JSONObject getBreakpointJson(BreakpointSpec breakpoint) {
    JSONObject result = new JSONObject();
    result.put("breakpointId", breakpoint.getId());
    result.put("resolved", breakpoint.isResolved());

    JSONArray locationsJson = new JSONArray();
    locationsJson.put(Utils.getBreakpointLocationJson(getContextManager().getFileManager(), breakpoint));
    result.put("locations", locationsJson);
    return result;
  }

  private void stepOver() {
    generalStep(StepRequest.STEP_OVER);
  }

  private void stepInto() {
    generalStep(StepRequest.STEP_INTO);
  }

  private void stepOut() {
    generalStep(StepRequest.STEP_OUT);
  }

  private void generalStep(int stepKind) {
    clearPreviousSteps();
    EventRequestManager eventRequestManager = getContextManager().getVirtualMachine().eventRequestManager();
    StepRequest stepRequest = eventRequestManager.createStepRequest(
        getContextManager().getCurrentThread(),
        StepRequest.STEP_LINE,
        stepKind
    );
    stepRequest.setSuspendPolicy(EventRequest.SUSPEND_ALL);
    stepRequest.enable();
    getContextManager().getVirtualMachine().resume();
  }

  private void clearPreviousSteps() {
    EventRequestManager eventRequestManager = getContextManager().getVirtualMachine().eventRequestManager();

    // Copy pending remove requests into a new collection to prevent ConcurrentModificationException.
    List<StepRequest> prevSteps = new ArrayList<>();
    for (StepRequest stepRequest : eventRequestManager.stepRequests()) {
      if (stepRequest.thread() == getContextManager().getCurrentThread()) {
        prevSteps.add(stepRequest);
      }
    }

    for (StepRequest stepRequest : prevSteps) {
      eventRequestManager.deleteEventRequest(stepRequest);
    }
  }
}
