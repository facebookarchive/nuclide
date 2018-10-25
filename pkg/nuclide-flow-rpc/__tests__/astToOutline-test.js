"use strict";

function _astToOutline() {
  const data = require("../lib/astToOutline");

  _astToOutline = function () {
    return data;
  };

  return data;
}

function _classAstOld() {
  const data = _interopRequireDefault(require("../__mocks__/fixtures/class-ast-old.json"));

  _classAstOld = function () {
    return data;
  };

  return data;
}

function _classAstV() {
  const data = _interopRequireDefault(require("../__mocks__/fixtures/class-ast-v0.34.json"));

  _classAstV = function () {
    return data;
  };

  return data;
}

function _jasmineAstOld() {
  const data = _interopRequireDefault(require("../__mocks__/fixtures/jasmine-ast-old.json"));

  _jasmineAstOld = function () {
    return data;
  };

  return data;
}

function _jasmineAstV() {
  const data = _interopRequireDefault(require("../__mocks__/fixtures/jasmine-ast-v0.34.json"));

  _jasmineAstV = function () {
    return data;
  };

  return data;
}

function _toplevelAstOld() {
  const data = _interopRequireDefault(require("../__mocks__/fixtures/toplevel-ast-old.json"));

  _toplevelAstOld = function () {
    return data;
  };

  return data;
}

function _toplevelAstV() {
  const data = _interopRequireDefault(require("../__mocks__/fixtures/toplevel-ast-v0.34.json"));

  _toplevelAstV = function () {
    return data;
  };

  return data;
}

function _exportsAstOld() {
  const data = _interopRequireDefault(require("../__mocks__/fixtures/exports-ast-old.json"));

  _exportsAstOld = function () {
    return data;
  };

  return data;
}

function _exportsAstV() {
  const data = _interopRequireDefault(require("../__mocks__/fixtures/exports-ast-v0.34.json"));

  _exportsAstV = function () {
    return data;
  };

  return data;
}

function _exportsClassAst() {
  const data = _interopRequireDefault(require("../__mocks__/fixtures/exports-class-ast.json"));

  _exportsClassAst = function () {
    return data;
  };

  return data;
}

function _exportDefaultArrowFuncV() {
  const data = _interopRequireDefault(require("../__mocks__/fixtures/export-default-arrow-func-v0.34.json"));

  _exportDefaultArrowFuncV = function () {
    return data;
  };

  return data;
}

function _exportDefaultAnonymousFuncV() {
  const data = _interopRequireDefault(require("../__mocks__/fixtures/export-default-anonymous-func-v0.34.json"));

  _exportDefaultAnonymousFuncV = function () {
    return data;
  };

  return data;
}

function _typesAstOld() {
  const data = _interopRequireDefault(require("../__mocks__/fixtures/types-ast-old.json"));

  _typesAstOld = function () {
    return data;
  };

  return data;
}

function _typesAstV() {
  const data = _interopRequireDefault(require("../__mocks__/fixtures/types-ast-v0.34.json"));

  _typesAstV = function () {
    return data;
  };

  return data;
}

function _declareAst() {
  const data = _interopRequireDefault(require("../__mocks__/fixtures/declare-ast.json"));

  _declareAst = function () {
    return data;
  };

  return data;
}

function _interfacesAst() {
  const data = _interopRequireDefault(require("../__mocks__/fixtures/interfaces-ast.json"));

  _interfacesAst = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 * @emails oncall+nuclide
 */
describe('astToOutline', () => {
  it('should provide a class outline', () => {
    // Old version
    expect((0, _astToOutline().astToOutline)(_classAstOld().default).outlineTrees).toMatchSnapshot(); // Newer, introduced AssignmentPattern for default function args (v0.33), made a bunch of other
    // changes (v0.34)

    expect((0, _astToOutline().astToOutline)(_classAstV().default).outlineTrees).toMatchSnapshot();
  });
  it('should provide an outline for miscellaneous top-level statements', () => {
    expect((0, _astToOutline().astToOutline)(_toplevelAstOld().default).outlineTrees).toMatchSnapshot();
    expect((0, _astToOutline().astToOutline)(_toplevelAstV().default).outlineTrees).toMatchSnapshot();
  });
  it('should provide an outline for Jasmine specs', () => {
    expect((0, _astToOutline().astToOutline)(_jasmineAstOld().default).outlineTrees).toMatchSnapshot();
    expect((0, _astToOutline().astToOutline)(_jasmineAstV().default).outlineTrees).toMatchSnapshot();
  });
  it('should provide an outline for module.exports', () => {
    expect((0, _astToOutline().astToOutline)(_exportsAstOld().default).outlineTrees).toMatchSnapshot();
    expect((0, _astToOutline().astToOutline)(_exportsAstV().default).outlineTrees).toMatchSnapshot();
  });
  it('should provide an outline for module.exports class expression assignments', () => {
    expect((0, _astToOutline().astToOutline)(_exportsClassAst().default).outlineTrees).toMatchSnapshot();
  });
  it('should provide an outline for type declarations', () => {
    expect((0, _astToOutline().astToOutline)(_typesAstOld().default).outlineTrees).toMatchSnapshot();
    expect((0, _astToOutline().astToOutline)(_typesAstV().default).outlineTrees).toMatchSnapshot();
  });
  it('should provide an outline for export default () => {}', () => {
    expect((0, _astToOutline().astToOutline)(_exportDefaultArrowFuncV().default).outlineTrees).toMatchSnapshot();
  });
  it('should provide an outline for export default function() {}', () => {
    expect((0, _astToOutline().astToOutline)(_exportDefaultAnonymousFuncV().default).outlineTrees).toMatchSnapshot();
  });
  it('should provide an outline for declare class, declare module and declare function', () => {
    expect((0, _astToOutline().astToOutline)(_declareAst().default).outlineTrees).toMatchSnapshot();
  });
  it('should provide an outline with interface declarations', () => {
    expect((0, _astToOutline().astToOutline)(_interfacesAst().default).outlineTrees).toMatchSnapshot();
  });
});