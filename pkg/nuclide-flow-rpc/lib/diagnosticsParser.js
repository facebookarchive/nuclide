'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flowStatusOutputToDiagnostics = flowStatusOutputToDiagnostics;

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
      const flatExtra = [].concat(...extra.map((_ref) => {
        let message = _ref.message;
        return message;
      }));
      messageComponents.push(...flatExtra.map(flowMessageComponentToMessageComponent));
    }

    return {
      level: level,
      messageComponents: messageComponents
    };
  });

  return {
    flowRoot: root,
    messages: messages
  };
}

function flowMessageComponentToMessageComponent(component) {
  return {
    descr: component.descr,
    range: maybeFlowLocToRange(component.loc)
  };
}

function maybeFlowLocToRange(loc) {
  return loc == null ? null : flowLocToRange(loc);
}

function flowLocToRange(loc) {
  return {
    file: loc.source,
    start: {
      line: loc.start.line,
      column: loc.start.column
    },
    end: {
      line: loc.end.line,
      column: loc.end.column
    }
  };
}