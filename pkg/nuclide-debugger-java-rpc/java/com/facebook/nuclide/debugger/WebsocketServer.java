/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

package com.facebook.nuclide.debugger;

import org.glassfish.tyrus.server.Server;
import org.json.JSONObject;

import javax.websocket.DeploymentException;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;

@ServerEndpoint("/WebSocketServer")
public class WebSocketServer {
  // TODO: generate a random PORT so that multiple debugger instances can exist.
  private static final int PORT = 8025;
  private static final String ROOT_PATH = "/NuclideJavaDebuggerServer";
  private static final String ENDPOINT_NAME = "WebSocketServer";
  private static final AppExitEvent _appExitEvent = new AppExitEvent();
  private NuclideCommandInterpreter _interpreter;

  public static void start() throws DeploymentException {
    Server server = new Server("localhost", PORT, ROOT_PATH, WebSocketServer.class);
    server.start();

    // Telling client which WS PORT to connect.
    Utils.logLine((String.format("Port: %d", PORT)));
    Utils.logLine((String.format("ws://localhost:%d%s/%s", PORT, ROOT_PATH, ENDPOINT_NAME)));

    try {
      _appExitEvent.waitForExitReady();
    } catch (InterruptedException e) {
      Utils.logLine(String.format("App exits due to interruption: %s", e.toString()));
    }
  }

  @OnOpen
  public void onOpen(Session session) {
    _interpreter = new NuclideCommandInterpreter(session, _appExitEvent);
    Utils.logLine(("Connected: " + session.getId()));
  }

  @OnMessage
  public void onMessage(Session session, String message) throws IOException {
    String responseJsonString = null;
    JSONObject request = new JSONObject(message);
    JSONObject response = _interpreter.processCommand(request);
    responseJsonString = response.toString();
    session.getBasicRemote().sendText(responseJsonString);
  }
}
