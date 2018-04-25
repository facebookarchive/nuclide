/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

package com.facebook.nuclide.debugger;

import org.json.JSONObject;

public abstract class base$ProtocolMessage {
  public static int nextSeq = 1;
  public int seq;
  private String type;

  public base$ProtocolMessage(String type) {
    this.seq = nextSeq++;
    this.type = type;
  }

  public base$ProtocolMessage(int seq, String type) {
    this.seq = seq;
    this.type = type;
    nextSeq++;
  }

  public JSONObject toJSON() {
    return new JSONObject().put("seq", seq).put("type", type);
  }
}
