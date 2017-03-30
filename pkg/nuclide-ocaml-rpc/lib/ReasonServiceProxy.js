"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.format = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "content",
      type: {
        location: {
          type: "source",
          fileName: "ReasonService.js",
          line: 16
        },
        kind: "string"
      }
    }, {
      name: "flags",
      type: {
        location: {
          type: "source",
          fileName: "ReasonService.js",
          line: 16
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "ReasonService.js",
            line: 16
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("ReasonService/format", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ReasonService.js",
          line: 16
        },
        kind: "named",
        name: "refmtResult"
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
    refmtResult: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "ReasonService.js",
        line: 13
      },
      name: "refmtResult",
      definition: {
        location: {
          type: "source",
          fileName: "ReasonService.js",
          line: 14
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "ReasonService.js",
            line: 14
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "ReasonService.js",
              line: 14
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "ReasonService.js",
                line: 14
              },
              kind: "string-literal",
              value: "result"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "ReasonService.js",
              line: 14
            },
            name: "formattedResult",
            type: {
              location: {
                type: "source",
                fileName: "ReasonService.js",
                line: 14
              },
              kind: "string"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "ReasonService.js",
            line: 14
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "ReasonService.js",
              line: 14
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "ReasonService.js",
                line: 14
              },
              kind: "string-literal",
              value: "error"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "ReasonService.js",
              line: 14
            },
            name: "error",
            type: {
              location: {
                type: "source",
                fileName: "ReasonService.js",
                line: 14
              },
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
        line: 16
      },
      type: {
        location: {
          type: "source",
          fileName: "ReasonService.js",
          line: 16
        },
        kind: "function",
        argumentTypes: [{
          name: "content",
          type: {
            location: {
              type: "source",
              fileName: "ReasonService.js",
              line: 16
            },
            kind: "string"
          }
        }, {
          name: "flags",
          type: {
            location: {
              type: "source",
              fileName: "ReasonService.js",
              line: 16
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "ReasonService.js",
                line: 16
              },
              kind: "string"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "ReasonService.js",
            line: 16
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "ReasonService.js",
              line: 16
            },
            kind: "named",
            name: "refmtResult"
          }
        }
      }
    }
  }
});