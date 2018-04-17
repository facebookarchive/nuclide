'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generatePropertyArray = generatePropertyArray;
function generatePropertyArray(launchOrAttachConfigProperties, required, visible) {
  const propertyArray = Object.entries(launchOrAttachConfigProperties).map(property => {
    const name = property[0];
    const propertyDetails = property[1];
    const autoGenProperty = {
      name,
      type: propertyDetails.type,
      description: propertyDetails.description,
      required: required.includes(name),
      visible: visible.includes(name)
    };
    if (typeof propertyDetails.default !== 'undefined') {
      autoGenProperty.defaultValue = propertyDetails.default;
    }
    if (propertyDetails.items != null && typeof propertyDetails.items.type !== 'undefined') {
      autoGenProperty.itemType = propertyDetails.items.type;
    }
    return autoGenProperty;
  }).sort((p1, p2) => {
    // TODO (goom): sort all configs, not just ones generated from the json
    if (p1.required && !p2.required) {
      return -1;
    }
    if (p2.required && !p1.required) {
      return 1;
    }
    return 0;
  });
  return propertyArray;
} /**
   * Copyright (c) 2017-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the BSD-style license found in the
   * LICENSE file in the root directory of this source tree. An additional grant
   * of patent rights can be found in the PATENTS file in the same directory.
   *
   * 
   * @format
   */