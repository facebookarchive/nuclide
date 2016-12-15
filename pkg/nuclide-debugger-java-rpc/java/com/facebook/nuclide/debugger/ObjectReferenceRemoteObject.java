/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

package com.facebook.nuclide.debugger;

import com.sun.jdi.Field;
import com.sun.jdi.Value;
import com.sun.jdi.ObjectReference;
import com.sun.jdi.ReferenceType;
import com.sun.jdi.StringReference;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Map;

/**
 * A remote object that represents single java object in VM.
 */
class ObjectReferenceRemoteObject extends RemoteObject {
  private final ObjectReference _objectReference;

  ObjectReferenceRemoteObject(RemoteObjectManager remoteObjectManager, ObjectReference objectReference) {
    super(remoteObjectManager);
    _objectReference = objectReference;
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
    if (_objectReference instanceof StringReference) {
      return String.format("\"%s\"", ((StringReference)_objectReference).value());
    } else {
      // TODO: make the description more informational.
      return String.format("%s", _objectReference.type().name());
    }
  }

  @Override
  JSONObject getProperties() {
    JSONArray fieldsList = new JSONArray();
    ReferenceType referenceType = _objectReference.referenceType();
    Map<Field, Value> fieldValueMap = _objectReference.getValues(referenceType.allFields());
    for (Field field : fieldValueMap.keySet()) {
      Value fieldValue = fieldValueMap.get(field);

      // IntelliJ only shows non-static fields by default.
      // TODO: provide an option to show static fields.
      if (!field.isStatic()) {
        JSONObject fieldJson = new JSONObject();
        fieldJson.put("name", field.name());
        fieldJson.put("value", getRemoteObjectManager().serializeValue(fieldValue));
        fieldsList.put(fieldJson);
      }
    }

    JSONObject resultJson = new JSONObject();
    resultJson.put("result", fieldsList);
    return resultJson;
  }
}
