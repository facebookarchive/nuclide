/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

package com.facebook.nuclide.debugger;

import com.sun.jdi.AbsentInformationException;
import com.sun.jdi.LocalVariable;
import com.sun.jdi.StackFrame;
import com.sun.jdi.Value;
import com.sun.jdi.ArrayReference;
import com.sun.jdi.StringReference;
import com.sun.jdi.ObjectReference;
import com.sun.jdi.ReferenceType;
import com.sun.jdi.Field;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Manages the lifetime of all the RemoteObject(s).
 */
public class RemoteObjectManager {
  private final ConcurrentMap<String, RemoteObject> _idToObjectMap = new ConcurrentHashMap<>();

  public RemoteObjectManager() {
  }

  /**
   * Register local variables of input StackFrame and return its containing RemoteObject.
   */
  public RemoteObject registerLocals(StackFrame stackFrame) throws AbsentInformationException {
    List<LocalVariable> localVariables = stackFrame.visibleVariables();
    Map<LocalVariable, Value> variableValueMap = stackFrame.getValues(localVariables);
    RemoteObject localsRemoteObject = new VariableListRemoteObject(this, variableValueMap);
    addObject(localsRemoteObject);
    return localsRemoteObject;
  }

  public RemoteObject getObject(String objectId) {
    return _idToObjectMap.get(objectId);
  }

  /**
   * Serialize value into RemoteObject in json representation.
   */
  public JSONObject serializeValue(Value value) {
    JSONObject result = new JSONObject();
    if (value instanceof ArrayReference) {
      ArrayReferenceRemoteObject arrayReferenceRemoteObject =
          new ArrayReferenceRemoteObject(this, (ArrayReference) value);
      addObject(arrayReferenceRemoteObject);
      result = arrayReferenceRemoteObject.getSerializedValue();
    } else if (value instanceof ObjectReference) {
      ObjectReferenceRemoteObject objectReferenceRemoteObject =
          new ObjectReferenceRemoteObject(this, (ObjectReference) value);
      addObject(objectReferenceRemoteObject);
      result = objectReferenceRemoteObject.getSerializedValue();
    } else {
      // Primitive type.
      // TODO: get concrete type.
      result.put("type", "object");
      result.put("description", value == null ? "null": value.toString());
    }
    return result;
  }

  private void addObject(RemoteObject object) {
    _idToObjectMap.put(object.getId(), object);
    // TODO: add object group concepet for cleanup.
  }
}
