/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

package com.facebook.nuclide.debugger;

import org.json.JSONObject;

import javax.websocket.Session;

/**
 * Inpterprets Nuclide protocol and dispatch to corresponding domain.
 */
public class NuclideCommandInterpreter extends CommandInterpreterBase {
  private int _protocolIdSeed = 0;

  public NuclideCommandInterpreter(Session session, Object appExitNotifier) {
    super(new NuclideNotificationChannel(session), appExitNotifier);
  }

  public JSONObject processCommand(JSONObject message) {
    Utils.logLine(String.format("Process Nuclide command: %s", message.toString()));
    String id = String.valueOf(message.get("id"));
    String[] methodWithDomain = String.valueOf(message.get("method")).split("\\.");
    assert methodWithDomain.length == 2;
    String domainName = methodWithDomain[0];
    String methodName = methodWithDomain[1];
    JSONObject params = message.has("params") ? (JSONObject) message.get("params") : null;
    DomainHandlerBase domainHandler = getContextManager().getDomain(domainName);

    JSONObject response = new JSONObject();
    JSONObject result = null;
    if (domainHandler != null) {
      try {
        result = domainHandler.handleMethod(id, methodName, params);
      } catch (DomainHandlerException ex) {
        response.put("error", ex.getMessage());
      }
    } else {
      response.put("error", String.format("Undefined domain %s", domainName));
    }
    response.put("id", id);
    response.put("result", result);

    return response;
  }
}
