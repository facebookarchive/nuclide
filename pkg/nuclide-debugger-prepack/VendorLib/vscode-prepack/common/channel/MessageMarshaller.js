"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MessageMarshaller = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _DebugMessage = require("./DebugMessage.js");

var _invariant = require("./../invariant.js");

var _invariant2 = _interopRequireDefault(_invariant);

var _DebuggerError = require("./../DebuggerError.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MessageMarshaller = exports.MessageMarshaller = function () {
  function MessageMarshaller() {
    _classCallCheck(this, MessageMarshaller);

    this._lastRunRequestID = 0;
  }

  _createClass(MessageMarshaller, [{
    key: "marshallBreakpointAcknowledge",
    value: function marshallBreakpointAcknowledge(requestID, messageType, breakpoints) {
      return requestID + " " + messageType + " " + JSON.stringify(breakpoints);
    }
  }, {
    key: "marshallStoppedResponse",
    value: function marshallStoppedResponse(reason, filePath, line, column) {
      var result = {
        kind: "stopped",
        reason: reason,
        filePath: filePath,
        line: line,
        column: column
      };
      return this._lastRunRequestID + " " + _DebugMessage.DebugMessage.STOPPED_RESPONSE + " " + JSON.stringify(result);
    }
  }, {
    key: "marshallDebuggerStart",
    value: function marshallDebuggerStart(requestID) {
      return requestID + " " + _DebugMessage.DebugMessage.DEBUGGER_ATTACHED;
    }
  }, {
    key: "marshallContinueRequest",
    value: function marshallContinueRequest(requestID) {
      return requestID + " " + _DebugMessage.DebugMessage.PREPACK_RUN_COMMAND;
    }
  }, {
    key: "marshallSetBreakpointsRequest",
    value: function marshallSetBreakpointsRequest(requestID, breakpoints) {
      return requestID + " " + _DebugMessage.DebugMessage.BREAKPOINT_ADD_COMMAND + " " + JSON.stringify(breakpoints);
    }
  }, {
    key: "marshallStackFramesRequest",
    value: function marshallStackFramesRequest(requestID) {
      return requestID + " " + _DebugMessage.DebugMessage.STACKFRAMES_COMMAND;
    }
  }, {
    key: "marshallStackFramesResponse",
    value: function marshallStackFramesResponse(requestID, stackframes) {
      return requestID + " " + _DebugMessage.DebugMessage.STACKFRAMES_RESPONSE + " " + JSON.stringify(stackframes);
    }
  }, {
    key: "marshallScopesRequest",
    value: function marshallScopesRequest(requestID, frameId) {
      return requestID + " " + _DebugMessage.DebugMessage.SCOPES_COMMAND + " " + frameId;
    }
  }, {
    key: "marshallScopesResponse",
    value: function marshallScopesResponse(requestID, scopes) {
      return requestID + " " + _DebugMessage.DebugMessage.SCOPES_RESPONSE + " " + JSON.stringify(scopes);
    }
  }, {
    key: "marshallVariablesRequest",
    value: function marshallVariablesRequest(requestID, variablesReference) {
      return requestID + " " + _DebugMessage.DebugMessage.VARIABLES_COMMAND + " " + variablesReference;
    }
  }, {
    key: "marshallVariablesResponse",
    value: function marshallVariablesResponse(requestID, variables) {
      return requestID + " " + _DebugMessage.DebugMessage.VARIABLES_RESPONSE + " " + JSON.stringify(variables);
    }
  }, {
    key: "marshallStepIntoRequest",
    value: function marshallStepIntoRequest(requestID) {
      return requestID + " " + _DebugMessage.DebugMessage.STEPINTO_COMMAND;
    }
  }, {
    key: "marshallStepOverRequest",
    value: function marshallStepOverRequest(requestID) {
      return requestID + " " + _DebugMessage.DebugMessage.STEPOVER_COMMAND;
    }
  }, {
    key: "marshallEvaluateRequest",
    value: function marshallEvaluateRequest(requestID, frameId, expression) {
      var evalArgs = {
        kind: "evaluate",
        expression: expression
      };
      if (frameId !== undefined) {
        evalArgs.frameId = frameId;
      }
      return requestID + " " + _DebugMessage.DebugMessage.EVALUATE_COMMAND + " " + JSON.stringify(evalArgs);
    }
  }, {
    key: "marshallEvaluateResponse",
    value: function marshallEvaluateResponse(requestID, evalResult) {
      return requestID + " " + _DebugMessage.DebugMessage.EVALUATE_RESPONSE + " " + JSON.stringify(evalResult);
    }
  }, {
    key: "unmarshallRequest",
    value: function unmarshallRequest(message) {
      var parts = message.split(" ");
      // each request must have a length and a command
      (0, _invariant2.default)(parts.length >= 2, "Request is not well formed");
      // unique ID for each request
      var requestID = parseInt(parts[0], 10);
      (0, _invariant2.default)(!isNaN(requestID), "Request ID must be a number");
      var command = parts[1];
      var args = void 0;
      switch (command) {
        case _DebugMessage.DebugMessage.PREPACK_RUN_COMMAND:
          this._lastRunRequestID = requestID;
          var runArgs = {
            kind: "run"
          };
          args = runArgs;
          break;
        case _DebugMessage.DebugMessage.BREAKPOINT_ADD_COMMAND:
          args = this._unmarshallBreakpointsArguments(requestID, parts.slice(2).join(" "));
          break;
        case _DebugMessage.DebugMessage.STACKFRAMES_COMMAND:
          var stackFrameArgs = {
            kind: "stackframe"
          };
          args = stackFrameArgs;
          break;
        case _DebugMessage.DebugMessage.SCOPES_COMMAND:
          args = this._unmarshallScopesArguments(requestID, parts[2]);
          break;
        case _DebugMessage.DebugMessage.VARIABLES_COMMAND:
          args = this._unmarshallVariablesArguments(requestID, parts[2]);
          break;
        case _DebugMessage.DebugMessage.STEPINTO_COMMAND:
          this._lastRunRequestID = requestID;
          var stepIntoArgs = {
            kind: "stepInto"
          };
          args = stepIntoArgs;
          break;
        case _DebugMessage.DebugMessage.STEPOVER_COMMAND:
          this._lastRunRequestID = requestID;
          var stepOverArgs = {
            kind: "stepOver"
          };
          args = stepOverArgs;
          break;
        case _DebugMessage.DebugMessage.EVALUATE_COMMAND:
          args = this._unmarshallEvaluateArguments(requestID, parts.slice(2).join(" "));
          break;
        default:
          throw new _DebuggerError.DebuggerError("Invalid command", "Invalid command from adapter: " + command);
      }
      (0, _invariant2.default)(args !== undefined);
      var result = {
        id: requestID,
        command: command,
        arguments: args
      };
      return result;
    }
  }, {
    key: "_unmarshallBreakpointsArguments",
    value: function _unmarshallBreakpointsArguments(requestID, responseString) {
      var breakpoints = JSON.parse(responseString);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = breakpoints[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var breakpoint = _step.value;

          (0, _invariant2.default)(breakpoint.hasOwnProperty("filePath"), "breakpoint missing filePath property");
          (0, _invariant2.default)(breakpoint.hasOwnProperty("line"), "breakpoint missing line property");
          (0, _invariant2.default)(breakpoint.hasOwnProperty("column"), "breakpoint missing column property");
          (0, _invariant2.default)(!isNaN(breakpoint.line));
          (0, _invariant2.default)(!isNaN(breakpoint.column));
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      var result = {
        kind: "breakpoint",
        breakpoints: breakpoints
      };
      return result;
    }
  }, {
    key: "_unmarshallScopesArguments",
    value: function _unmarshallScopesArguments(requestID, responseString) {
      var frameId = parseInt(responseString, 10);
      (0, _invariant2.default)(!isNaN(frameId));
      var result = {
        kind: "scopes",
        frameId: frameId
      };
      return result;
    }
  }, {
    key: "_unmarshallVariablesArguments",
    value: function _unmarshallVariablesArguments(requestID, responseString) {
      var varRef = parseInt(responseString, 10);
      (0, _invariant2.default)(!isNaN(varRef));
      var result = {
        kind: "variables",
        variablesReference: varRef
      };
      return result;
    }
  }, {
    key: "_unmarshallEvaluateArguments",
    value: function _unmarshallEvaluateArguments(requestID, responseString) {
      var evalArgs = JSON.parse(responseString);
      (0, _invariant2.default)(evalArgs.hasOwnProperty("kind"), "Evaluate arguments missing kind field");
      (0, _invariant2.default)(evalArgs.hasOwnProperty("expression"), "Evaluate arguments missing expression field");
      if (evalArgs.hasOwnProperty("frameId")) (0, _invariant2.default)(!isNaN(evalArgs.frameId));
      return evalArgs;
    }
  }, {
    key: "unmarshallResponse",
    value: function unmarshallResponse(message) {
      try {
        var parts = message.split(" ");
        var requestID = parseInt(parts[0], 10);
        (0, _invariant2.default)(!isNaN(requestID));
        var messageType = parts[1];
        var dbgResult = void 0;
        var resultString = parts.slice(2).join(" ");
        if (messageType === _DebugMessage.DebugMessage.PREPACK_READY_RESPONSE) {
          dbgResult = this._unmarshallReadyResult();
        } else if (messageType === _DebugMessage.DebugMessage.BREAKPOINT_ADD_ACKNOWLEDGE) {
          dbgResult = this._unmarshallBreakpointsAddResult(resultString);
        } else if (messageType === _DebugMessage.DebugMessage.STOPPED_RESPONSE) {
          dbgResult = this._unmarshallStoppedResult(resultString);
        } else if (messageType === _DebugMessage.DebugMessage.STACKFRAMES_RESPONSE) {
          dbgResult = this._unmarshallStackframesResult(resultString);
        } else if (messageType === _DebugMessage.DebugMessage.SCOPES_RESPONSE) {
          dbgResult = this._unmarshallScopesResult(resultString);
        } else if (messageType === _DebugMessage.DebugMessage.VARIABLES_RESPONSE) {
          dbgResult = this._unmarshallVariablesResult(resultString);
        } else if (messageType === _DebugMessage.DebugMessage.EVALUATE_RESPONSE) {
          dbgResult = this._unmarshallEvaluateResult(resultString);
        } else {
          (0, _invariant2.default)(false, "Unexpected response type");
        }

        var dbgResponse = {
          id: requestID,
          result: dbgResult
        };
        return dbgResponse;
      } catch (e) {
        throw new _DebuggerError.DebuggerError("Invalid command", e.message);
      }
    }
  }, {
    key: "_unmarshallStackframesResult",
    value: function _unmarshallStackframesResult(resultString) {
      var frames = JSON.parse(resultString);
      (0, _invariant2.default)(Array.isArray(frames), "Stack frames is not an array");
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = frames[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var frame = _step2.value;

          (0, _invariant2.default)(frame.hasOwnProperty("id"), "Stack frame is missing id");
          (0, _invariant2.default)(frame.hasOwnProperty("fileName"), "Stack frame is missing filename");
          (0, _invariant2.default)(frame.hasOwnProperty("line"), "Stack frame is missing line number");
          (0, _invariant2.default)(frame.hasOwnProperty("column"), "Stack frame is missing column number");
          (0, _invariant2.default)(frame.hasOwnProperty("functionName"), "Stack frame is missing function name");
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      var result = {
        kind: "stackframe",
        stackframes: frames
      };
      return result;
    }
  }, {
    key: "_unmarshallScopesResult",
    value: function _unmarshallScopesResult(resultString) {
      var scopes = JSON.parse(resultString);
      (0, _invariant2.default)(Array.isArray(scopes), "Scopes is not an array");
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = scopes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var scope = _step3.value;

          (0, _invariant2.default)(scope.hasOwnProperty("name"), "Scope is missing name");
          (0, _invariant2.default)(scope.hasOwnProperty("variablesReference"), "Scope is missing variablesReference");
          (0, _invariant2.default)(scope.hasOwnProperty("expensive"), "Scope is missing expensive");
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      var result = {
        kind: "scopes",
        scopes: scopes
      };
      return result;
    }
  }, {
    key: "_unmarshallVariablesResult",
    value: function _unmarshallVariablesResult(resultString) {
      var variables = JSON.parse(resultString);
      (0, _invariant2.default)(Array.isArray(variables), "Variables is not an array");
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = variables[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var variable = _step4.value;

          (0, _invariant2.default)(variable.hasOwnProperty("name"));
          (0, _invariant2.default)(variable.hasOwnProperty("value"));
          (0, _invariant2.default)(variable.hasOwnProperty("variablesReference"));
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      var result = {
        kind: "variables",
        variables: variables
      };
      return result;
    }
  }, {
    key: "_unmarshallEvaluateResult",
    value: function _unmarshallEvaluateResult(resultString) {
      var evalResult = JSON.parse(resultString);
      (0, _invariant2.default)(evalResult.hasOwnProperty("kind"), "eval result missing kind property");
      (0, _invariant2.default)(evalResult.kind === "evaluate", "eval result is the wrong kind");
      (0, _invariant2.default)(evalResult.hasOwnProperty("displayValue", "eval result missing display value property"));
      (0, _invariant2.default)(evalResult.hasOwnProperty("type", "eval result missing type property"));
      (0, _invariant2.default)(evalResult.hasOwnProperty("variablesReference", "eval result missing variablesReference property"));
      return evalResult;
    }
  }, {
    key: "_unmarshallBreakpointsAddResult",
    value: function _unmarshallBreakpointsAddResult(resultString) {
      var breakpoints = JSON.parse(resultString);
      (0, _invariant2.default)(Array.isArray(breakpoints));
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = breakpoints[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var breakpoint = _step5.value;

          (0, _invariant2.default)(breakpoint.hasOwnProperty("filePath"), "breakpoint missing filePath property");
          (0, _invariant2.default)(breakpoint.hasOwnProperty("line"), "breakpoint missing line property");
          (0, _invariant2.default)(breakpoint.hasOwnProperty("column"), "breakpoint missing column property");
          (0, _invariant2.default)(!isNaN(breakpoint.line));
          (0, _invariant2.default)(!isNaN(breakpoint.column));
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      var result = {
        kind: "breakpoint-add",
        breakpoints: breakpoints
      };
      return result;
    }
  }, {
    key: "_unmarshallStoppedResult",
    value: function _unmarshallStoppedResult(resultString) {
      var result = JSON.parse(resultString);
      (0, _invariant2.default)(result.kind === "stopped");
      (0, _invariant2.default)(result.hasOwnProperty("reason"));
      (0, _invariant2.default)(result.hasOwnProperty("filePath"));
      (0, _invariant2.default)(result.hasOwnProperty("line"));
      (0, _invariant2.default)(!isNaN(result.line));
      (0, _invariant2.default)(result.hasOwnProperty("column"));
      (0, _invariant2.default)(!isNaN(result.column));
      return result;
    }
  }, {
    key: "_unmarshallReadyResult",
    value: function _unmarshallReadyResult() {
      var result = {
        kind: "ready"
      };
      return result;
    }
  }]);

  return MessageMarshaller;
}();
//# sourceMappingURL=MessageMarshaller.js.map