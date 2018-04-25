/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

package com.facebook.nuclide.debugger;

import java.net.InetSocketAddress;
import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;
import org.json.JSONObject;

public class WebSocketServer extends org.java_websocket.server.WebSocketServer {
  private static final String ROOT_PATH = "/NuclideJavaDebuggerServer";
  private static final String ENDPOINT_NAME = "WebSocketServer";
  private static final AppExitEvent _appExitEvent = new AppExitEvent();

  private NuclideCommandInterpreter _interpreter = null;
  private int _port = -1;

  public WebSocketServer(int port) {
    super(new InetSocketAddress(port));
    _port = port;
  }

  @Override
  public void onOpen(WebSocket conn, ClientHandshake handshake) {
    if (_interpreter != null) {
      // We only accept one connection.
      conn.close();
    }

    _interpreter = new NuclideCommandInterpreter(conn, _appExitEvent);
  }

  @Override
  public void onClose(WebSocket conn, int code, String reason, boolean remote) {
    Utils.logVerbose("Client disconnected (" + reason + "), shutting down server.");
    System.exit(0);
  }

  @Override
  public void onMessage(WebSocket conn, String message) {
    String responseJsonString = null;
    JSONObject request = new JSONObject(message);
    try {
      JSONObject response = _interpreter.processCommand(request);
      responseJsonString = response.toString();
      conn.send(responseJsonString);
    } catch (Exception ex) {
      Utils.logException("Error evaluating command", ex);
    }
  }

  @Override
  public void onStart() {
    // Telling client which WS PORT to connect. Print to stdout because the debugger client is
    // waiting to read port and address info from this process in order to connect its web socket.
    System.out.println((String.format("Port: %d", _port)));
    System.out.println((String.format("ws://localhost:%d%s/%s", _port, ROOT_PATH, ENDPOINT_NAME)));
  }

  @Override
  public void onError(WebSocket conn, Exception ex) {
    Utils.logException("Websocket error:", ex);
    System.exit(0);
  }
}
