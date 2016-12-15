/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

package com.facebook.nuclide.debugger;

import com.sun.jdi.LocalVariable;
import com.sun.jdi.Value;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Map;

/**
 * A remote object that contains a list of variables.
 */
class VariableListRemoteObject extends RemoteObject {
  private final Map<LocalVariable, Value> _variableValueMap;

  VariableListRemoteObject(RemoteObjectManager remoteObjectManager, Map<LocalVariable, Value> variableValueMap) {
    super(remoteObjectManager);
    _variableValueMap = variableValueMap;
  }

  @Override
  JSONObject getSerializedValue() {
    JSONObject jsonObj = new JSONObject();
    jsonObj.put("type", "object");
    jsonObj.put("objectId", getId());
    return jsonObj;
  }

  @Override
  JSONObject getProperties() {
    JSONArray variableList = new JSONArray();
    for (LocalVariable variable : _variableValueMap.keySet()) {
      Value value = _variableValueMap.get(variable);

      JSONObject variableJson = new JSONObject();
      variableJson.put("name", variable.name());
      variableJson.put("value", getRemoteObjectManager().serializeValue(value));
      variableList.put(variableJson);
    }

    JSONObject resultJson = new JSONObject();
    resultJson.put("result", variableList);
    return resultJson;
  }
}
