"use strict";

module.exports = _client => {
  const remoteModule = {};

  remoteModule.grepReplace = function (arg0, arg1, arg2, arg3) {
    return _client.callRemoteFunction("GrepService/grepReplace", "observable", _client.marshalArguments(Array.from(arguments), [{
      name: "filePaths",
      type: {
        kind: "array",
        type: {
          kind: "named",
          name: "NuclideUri"
        }
      }
    }, {
      name: "regex",
      type: {
        kind: "named",
        name: "RegExp"
      }
    }, {
      name: "replacementText",
      type: {
        kind: "string"
      }
    }, {
      name: "concurrency",
      type: {
        kind: "nullable",
        type: {
          kind: "number"
        }
      }
    }])).map(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "search$ReplaceResult"
      });
    }).publish();
  };

  return remoteModule;
};

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
    search$ReplaceResult: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "GrepService.js",
        line: 17
      },
      name: "search$ReplaceResult",
      definition: {
        kind: "union",
        types: [{
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "success"
            },
            optional: false
          }, {
            name: "filePath",
            type: {
              kind: "named",
              name: "NuclideUri"
            },
            optional: false
          }, {
            name: "replacements",
            type: {
              kind: "number"
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
            name: "filePath",
            type: {
              kind: "named",
              name: "NuclideUri"
            },
            optional: false
          }, {
            name: "message",
            type: {
              kind: "string"
            },
            optional: false
          }]
        }],
        discriminantField: "type"
      }
    },
    grepReplace: {
      kind: "function",
      name: "grepReplace",
      location: {
        type: "source",
        fileName: "GrepService.js",
        line: 29
      },
      type: {
        location: {
          type: "source",
          fileName: "GrepService.js",
          line: 29
        },
        kind: "function",
        argumentTypes: [{
          name: "filePaths",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          }
        }, {
          name: "regex",
          type: {
            kind: "named",
            name: "RegExp"
          }
        }, {
          name: "replacementText",
          type: {
            kind: "string"
          }
        }, {
          name: "concurrency",
          type: {
            kind: "nullable",
            type: {
              kind: "number"
            }
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "named",
            name: "search$ReplaceResult"
          }
        }
      }
    }
  }
});