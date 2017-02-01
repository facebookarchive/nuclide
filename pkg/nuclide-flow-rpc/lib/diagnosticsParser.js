'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flowStatusOutputToDiagnostics = flowStatusOutputToDiagnostics;

var _simpleTextBuffer;

function _load_simpleTextBuffer() {
  return _simpleTextBuffer = require('simple-text-buffer');
}

function flowStatusOutputToDiagnostics(root, statusOutput) {
  const errors = statusOutput.errors;
  const messages = errors.map(flowStatusError => {
    const flowMessageComponents = flowStatusError.message;
    const level = flowStatusError.level;

    const messageComponents = flowMessageComponents.map(flowMessageComponentToMessageComponent);
    const operation = flowStatusError.operation;
    if (operation != null) {
      const operationComponent = flowMessageComponentToMessageComponent(operation);
      operationComponent.descr = 'See also: ' + operationComponent.descr;
      messageComponents.push(operationComponent);
    }
    const extra = flowStatusError.extra;
    if (extra != null) {
      const flatExtra = [].concat(...extra.map(({ message }) => message));
      messageComponents.push(...flatExtra.map(flowMessageComponentToMessageComponent));
    }

    return {
      level,
      messageComponents
    };
  });

  return {
    flowRoot: root,
    messages
  };
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   */

function flowMessageComponentToMessageComponent(component) {
  return {
    descr: component.descr,
    rangeInFile: maybeFlowLocToRange(component.loc)
  };
}

function maybeFlowLocToRange(loc) {
  return loc == null ? null : flowLocToRange(loc);
}

function flowLocToRange(loc) {
  return {
    file: loc.source,
    range: new (_simpleTextBuffer || _load_simpleTextBuffer()).Range([loc.start.line, loc.start.column], [loc.end.line, loc.end.column])
  };
}