"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flattenPHPQueryData = flattenPHPQueryData;

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict
 * @format
 */

/**
 * Flattens all objects and arrays contained in the input object into a shallow
 * object that can be sent to PHP (still needs value encoding though).
 * The keys of the returned object correspond to the flattened version of all
 * objects and arrays found in the input object. The keys are serialized in a
 * way that allows PHP to reconstruct the original object.
 * When sending data to PHP each parameter sent with the request should
 * represent the actual leaf data (if considering the object a tree) where the
 * name of the parameter encodes the entire path to the data.
 * The code was borrowed from www/html/shared/core/flattenPHPQueryData.js.
 *
 * Example with following JS object:
 * {
 *   "id": 1,
 *   "numbers": ["one", "two"],
 *   "fruit": {
 *     "name": "mellon",
 *     "colors": ["green", "white"]
 *   }
 * }
 *
 * The resulting flattened object:
 * {
 *   "id": 1,
 *   "numbers[0]": "one",
 *   "numbers[1]": "two",
 *   "fruit[name]": "mellon",
 *   "fruit[colors][0]": "green",
 *   "fruit[colors][1]": "white",
 * }
 *
 * @param  Object obj Map of query keys to values.
 * @return Object Flattened version of the input object.
 */
function flattenPHPQueryData(obj) {
  /* Ideally the return type would be TFlattened<T> but it generated too
     many type errors at the existing callsites. */
  return _flattenPHPQueryData(obj, '', {});
}

function _flattenPHPQueryData(obj, name, componentsObject) {
  if (obj == null || obj === undefined) {
    componentsObject[name] = undefined;
  } else if (typeof obj === 'object') {
    if (!(typeof obj.appendChild !== 'function')) {
      throw new Error('Trying to serialize a DOM node. Bad idea.');
    }

    for (const k in obj) {
      // $$typeof markings are only for internal use, and do not
      // need to be serialized for forms.
      if (k !== '$$typeof' && Object.prototype.hasOwnProperty.call(obj, k) && obj[k] !== undefined) {
        _flattenPHPQueryData(obj[k], name ? name + '[' + k + ']' : k, componentsObject);
      }
    }
  } else {
    componentsObject[name] = obj;
  }

  return componentsObject;
}