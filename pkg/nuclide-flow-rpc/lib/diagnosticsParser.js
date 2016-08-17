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
exports.oldFlowStatusOutputToDiagnostics = oldFlowStatusOutputToDiagnostics;
exports.newFlowStatusOutputToDiagnostics = newFlowStatusOutputToDiagnostics;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function flowStatusOutputToDiagnostics(root, statusOutput) {
  if (statusOutput.flowVersion != null) {
    return newFlowStatusOutputToDiagnostics(root, statusOutput);
  } else {
    return oldFlowStatusOutputToDiagnostics(root, statusOutput);
  }
}

function oldFlowStatusOutputToDiagnostics(root, statusOutput) {
  var errors = statusOutput.errors;
  var messages = errors.map(function (flowStatusError) {
    var flowMessageComponents = flowStatusError.message;
    var level = flowMessageComponents[0].level;

    var messageComponents = flowMessageComponents.map(flowMessageComponentToMessageComponent);
    var operation = flowStatusError.operation;
    if (operation != null) {
      // The operation field provides additional context. I don't fully understand the motivation
      // behind separating it out, but prepending it with 'See also: ' and adding it to the end of
      // the messages is what the Flow team recommended.
      var operationComponent = flowMessageComponentToMessageComponent(operation);
      operationComponent.descr = 'See also: ' + operationComponent.descr;
      messageComponents.push(operationComponent);
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
  var path = component.path;
  var range = null;

  // Flow returns the empty string instead of null when there is no relevant path. The upcoming
  // format changes described elsewhere in this file fix the issue, but for now we must still work
  // around it.
  if (path != null && path !== '') {
    range = {
      file: path,
      start: {
        line: component.line,
        column: component.start
      },
      end: {
        line: component.endline,
        column: component.end
      }
    };
  }
  return {
    descr: component.descr,
    range: range
  };
}

function newFlowStatusOutputToDiagnostics(root, statusOutput) {
  var errors = statusOutput.errors;
  var messages = errors.map(function (flowStatusError) {
    var flowMessageComponents = flowStatusError.message;
    var level = flowStatusError.level;

    var messageComponents = flowMessageComponents.map(newFlowMessageComponentToMessageComponent);
    var operation = flowStatusError.operation;
    if (operation != null) {
      var operationComponent = newFlowMessageComponentToMessageComponent(operation);
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
      messageComponents.push.apply(messageComponents, _toConsumableArray(flatExtra.map(newFlowMessageComponentToMessageComponent)));
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

function newFlowMessageComponentToMessageComponent(component) {
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