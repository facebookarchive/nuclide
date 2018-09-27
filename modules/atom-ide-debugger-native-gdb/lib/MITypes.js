"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toCommandError = toCommandError;
exports.breakInsertResult = breakInsertResult;
exports.dataEvaluateExpressionResult = dataEvaluateExpressionResult;
exports.dataListRegisterNamesResult = dataListRegisterNamesResult;
exports.dataListRegisterValuesResult = dataListRegisterValuesResult;
exports.threadInfoResult = threadInfoResult;
exports.stackInfoDepthResult = stackInfoDepthResult;
exports.stackListFramesResult = stackListFramesResult;
exports.stackListVariablesResult = stackListVariablesResult;
exports.varCreateResult = varCreateResult;
exports.varListChildrenResult = varListChildrenResult;
exports.varInfoNumChildrenResult = varInfoNumChildrenResult;
exports.varInfoTypeResult = varInfoTypeResult;
exports.varEvaluateExpressionResult = varEvaluateExpressionResult;
exports.varAssignResult = varAssignResult;
exports.stoppedEventResult = stoppedEventResult;
exports.breakpointModifiedEventResult = breakpointModifiedEventResult;
exports.dataDisassembleResult = dataDisassembleResult;

function _MIRecord() {
  const data = require("./MIRecord");

  _MIRecord = function () {
    return data;
  };

  return data;
}

/**
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
function toCommandError(record) {
  if (!record.error) {
    throw new Error("Invariant violation: \"record.error\"");
  }

  return record.result;
} // break-insert


function breakInsertResult(record) {
  if (!!record.error) {
    throw new Error("Invariant violation: \"!record.error\"");
  }

  return record.result;
} // data-evaluate-expression


function dataEvaluateExpressionResult(record) {
  if (!!record.error) {
    throw new Error("Invariant violation: \"!record.error\"");
  }

  return record.result;
} // data-list-register-names


function dataListRegisterNamesResult(record) {
  if (!!record.error) {
    throw new Error("Invariant violation: \"!record.error\"");
  }

  return record.result;
} // data-list-register-values


function dataListRegisterValuesResult(record) {
  if (!!record.error) {
    throw new Error("Invariant violation: \"!record.error\"");
  }

  return record.result;
} // thread-info


function threadInfoResult(record) {
  if (!!record.error) {
    throw new Error("Invariant violation: \"!record.error\"");
  }

  return record.result;
} // stack-info-depth


function stackInfoDepthResult(record) {
  if (!!record.error) {
    throw new Error("Invariant violation: \"!record.error\"");
  }

  return record.result;
} // stack-list-frames


function stackListFramesResult(record) {
  if (!!record.error) {
    throw new Error("Invariant violation: \"!record.error\"");
  }

  return record.result;
} // stack-list-variables


function stackListVariablesResult(record) {
  if (!!record.error) {
    throw new Error("Invariant violation: \"!record.error\"");
  }

  return record.result;
} // var-create


function varCreateResult(record) {
  if (!!record.error) {
    throw new Error("Invariant violation: \"!record.error\"");
  }

  return record.result;
} // var-list-children


function varListChildrenResult(record) {
  if (!!record.error) {
    throw new Error("Invariant violation: \"!record.error\"");
  }

  return record.result;
} // var-info-num-children


function varInfoNumChildrenResult(record) {
  if (!!record.error) {
    throw new Error("Invariant violation: \"!record.error\"");
  }

  return record.result;
} // var-info-type


function varInfoTypeResult(record) {
  if (!!record.error) {
    throw new Error("Invariant violation: \"!record.error\"");
  }

  return record.result;
} // var-evaluate-expression


function varEvaluateExpressionResult(record) {
  if (!!record.error) {
    throw new Error("Invariant violation: \"!record.error\"");
  }

  return record.result;
} // var-assign


function varAssignResult(record) {
  if (!!record.error) {
    throw new Error("Invariant violation: \"!record.error\"");
  }

  return record.result;
} // stopped async event


function stoppedEventResult(record) {
  if (!(record.asyncClass === 'stopped')) {
    throw new Error("Invariant violation: \"record.asyncClass === 'stopped'\"");
  }

  return record.result;
} // breakpoint modified event


function breakpointModifiedEventResult(record) {
  if (!(record.asyncClass === 'breakpoint-modified')) {
    throw new Error("Invariant violation: \"record.asyncClass === 'breakpoint-modified'\"");
  }

  return record.result;
} // data-disassemble result


function dataDisassembleResult(record) {
  if (!!record.error) {
    throw new Error("Invariant violation: \"!record.error\"");
  }

  return record.result;
}