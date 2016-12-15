/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

package com.facebook.nuclide.debugger;

import javax.websocket.Session;
import java.io.IOException;

/**
 * Notification channel for Nuclide IDE.
 */
public class NuclideNotificationChannel extends NotificationChannel {
  private final Session _session;

  public NuclideNotificationChannel(Session session) {
    _session = session;
  }

  @Override
  protected void sendHelper(String message) {
    try {
      _session.getBasicRemote().sendText(message);
    } catch (IOException e) {
      // The WebSocket channel is broken which we can't recover
      // throw RuntimeException to crash.
      Utils.logLine(e.toString());
      throw new RuntimeException(e);
    }
  }
}
