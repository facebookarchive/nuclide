"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertDefinitions = convertDefinitions;

function _HackHelpers() {
  const data = require("./HackHelpers");

  _HackHelpers = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
function convertDefinitions(hackDefinitions, filePath, projectRoot) {
  function convertDefinition(definition) {
    const {
      definition_pos,
      definition_span,
      name
    } = definition;

    if (!(definition_pos != null)) {
      throw new Error("Invariant violation: \"definition_pos != null\"");
    }

    return {
      path: definition_pos.filename || filePath,
      position: (0, _HackHelpers().atomPointOfHackRangeStart)(definition_pos),
      range: definition_span == null ? undefined : (0, _HackHelpers().hackSpanToAtomRange)(definition_span),
      // TODO: definition_id
      id: name,
      name,
      language: 'php',
      projectRoot
    };
  }

  const filteredDefinitions = hackDefinitions.filter(definition => definition.definition_pos != null);

  if (filteredDefinitions.length === 0) {
    return null;
  }

  const definitions = filteredDefinitions.map(convertDefinition);
  return {
    queryRange: [(0, _HackHelpers().hackRangeToAtomRange)(filteredDefinitions[0].pos)],
    definitions
  };
}