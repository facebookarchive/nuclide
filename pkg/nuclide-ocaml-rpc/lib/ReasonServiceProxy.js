"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.format = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "content",
      type: {
        kind: "string"
      }
    }, {
      name: "filePath",
      type: {
        kind: "string"
      }
    }, {
      name: "language",
      type: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "re"
        }, {
          kind: "string-literal",
          value: "ml"
        }]
      }
    }, {
      name: "refmtFlags",
      type: {
        kind: "array",
        type: {
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("ReasonService/format", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "formatResult"
      });
    });
  };

  return remoteModule;
};

Object.defineProperty(module.exports, "inject", {
  value: function () {
    Observable = arguments[0];
  }
});
Object.defineProperty(module.exports, "defs", {
  value: {
    Object: {
      kind: "alias",
      name: "Object",
      location: {
        type: "builtin"
      }
    },
    Date: {
      kind: "alias",
      name: "Date",
      location: {
        type: "builtin"
      }
    },
    RegExp: {
      kind: "alias",
      name: "RegExp",
      location: {
        type: "builtin"
      }
    },
    Buffer: {
      kind: "alias",
      name: "Buffer",
      location: {
        type: "builtin"
      }
    },
    "fs.Stats": {
      kind: "alias",
      name: "fs.Stats",
      location: {
        type: "builtin"
      }
    },
    NuclideUri: {
      kind: "alias",
      name: "NuclideUri",
      location: {
        type: "builtin"
      }
    },
    atom$Point: {
      kind: "alias",
      name: "atom$Point",
      location: {
        type: "builtin"
      }
    },
    atom$Range: {
      kind: "alias",
      name: "atom$Range",
      location: {
        type: "builtin"
      }
    },
    formatResult: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "ReasonService.js",
        line: 14
      },
      name: "formatResult",
      definition: {
        kind: "union",
        types: [{
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "result"
            },
            optional: false
          }, {
            name: "formattedResult",
            type: {
              kind: "string"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "error"
            },
            optional: false
          }, {
            name: "error",
            type: {
              kind: "string"
            },
            optional: false
          }]
        }],
        discriminantField: "type"
      }
    },
    format: {
      kind: "function",
      name: "format",
      location: {
        type: "source",
        fileName: "ReasonService.js",
        line: 18
      },
      type: {
        location: {
          type: "source",
          fileName: "ReasonService.js",
          line: 18
        },
        kind: "function",
        argumentTypes: [{
          name: "content",
          type: {
            kind: "string"
          }
        }, {
          name: "filePath",
          type: {
            kind: "string"
          }
        }, {
          name: "language",
          type: {
            kind: "union",
            types: [{
              kind: "string-literal",
              value: "re"
            }, {
              kind: "string-literal",
              value: "ml"
            }]
          }
        }, {
          name: "refmtFlags",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "named",
            name: "formatResult"
          }
        }
      }
    }
  }
});