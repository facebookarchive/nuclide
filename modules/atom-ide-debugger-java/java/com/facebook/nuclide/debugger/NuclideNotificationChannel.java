/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

package com.facebook.nuclide.debugger;

import org.java_websocket.WebSocket;

/** Notification channel for Nuclide IDE. */
public class NuclideNotificationChannel extends NotificationChannel {
  private final WebSocket _connection;

  public NuclideNotificationChannel(WebSocket connection) {
    _connection = connection;
  }

  @Override
  protected synchronized void sendHelper(String message) {
    try {
      _connection.send(message);
    } catch (Exception e) {
      // The WebSocket channel is broken which we can't recover
      // throw RuntimeException to crash.
      Utils.logException("Failed to send message to websocket:", e);
      throw new RuntimeException(e);
    }
  }
}
