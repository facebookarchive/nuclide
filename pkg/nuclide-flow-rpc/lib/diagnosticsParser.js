Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.flowStatusOutputToDiagnostics = flowStatusOutputToDiagnostics;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function flowStatusOutputToDiagnostics(root, statusOutput) {
  var errors = statusOutput.errors;
  var messages = errors.map(function (flowStatusError) {
    var flowMessageComponents = flowStatusError.message;
    var level = flowStatusError.level;

    var messageComponents = flowMessageComponents.map(flowMessageComponentToMessageComponent);
    var operation = flowStatusError.operation;
    if (operation != null) {
      var operationComponent = flowMessageComponentToMessageComponent(operation);
      operationComponent.descr = 'See also: ' + operationComponent.descr;
      messageComponents.push(operationComponent);
    }
    var extra = flowStatusError.extra;
    if (extra != null) {
      var _ref;

      var flatExtra = (_ref = []).concat.apply(_ref, _toConsumableArray(extra.map(function (_ref2) {
        var message = _ref2.message;
        return message;
      })));
      messageComponents.push.apply(messageComponents, _toConsumableArray(flatExtra.map(flowMessageComponentToMessageComponent)));
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