/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

package com.facebook.nuclide.debugger;

import com.sun.jdi.ArrayReference;
import com.sun.jdi.Value;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.List;

/**
 * A remote object that represents array reference in VM.
 */
class ArrayReferenceRemoteObject extends RemoteObject {
  private final ArrayReference _arrayReference;

  ArrayReferenceRemoteObject(RemoteObjectManager remoteObjectManager, ArrayReference arrayReference) {
    super(remoteObjectManager);
    _arrayReference = arrayReference;
  }

  @Override
  JSONObject getSerializedValue() {
    JSONObject jsonObj = new JSONObject();
    jsonObj.put("type", "object");
    jsonObj.put("objectId", getId());
    jsonObj.put("description", getObjectDescription());
    return jsonObj;
  }

  private String getObjectDescription() {
    // TODO: array content visualizer.
    return "Array";
  }

  @Override
  JSONObject getProperties() {
    JSONArray itemsList = new JSONArray();
    List<Value> arrayValues = _arrayReference.getValues();
    for (int i =0; i < arrayValues.size(); ++i) {
      JSONObject itemJson = new JSONObject();
      itemJson.put("name", String.format("[%d]", i));
      itemJson.put("value", getRemoteObjectManager().serializeValue(arrayValues.get(i)));
      itemsList.put(itemJson);
    }

    JSONObject resultJson = new JSONObject();
    resultJson.put("result", itemsList);
    return resultJson;
  }
}
