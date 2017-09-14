"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.getDefinitionPreview = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "definition",
      type: {
        kind: "named",
        name: "Definition"
      }
    }]).then(args => {
      return _client.callRemoteFunction("DefinitionPreviewService/getDefinitionPreview", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "object",
          fields: [{
            name: "mime",
            type: {
              kind: "string"
            },
            optional: false
          }, {
            name: "contents",
            type: {
              kind: "string"
            },
            optional: false
          }, {
            name: "encoding",
            type: {
              kind: "string"
            },
            optional: false
          }]
        }
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
    Definition: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 15
      },
      name: "Definition",
      definition: {
        kind: "object",
        fields: [{
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "position",
          type: {
            kind: "named",
            name: "atom$Point"
          },
          optional: false
        }, {
          name: "range",
          type: {
            kind: "named",
            name: "atom$Range"
          },
          optional: true
        }, {
          name: "name",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "projectRoot",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: true
        }, {
          name: "language",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    getDefinitionPreview: {
      kind: "function",
      name: "getDefinitionPreview",
      location: {
        type: "source",
        fileName: "DefinitionPreviewService.js",
        line: 16
      },
      type: {
        location: {
          type: "source",
          fileName: "DefinitionPreviewService.js",
          line: 16
        },
        kind: "function",
        argumentTypes: [{
          name: "definition",
          type: {
            kind: "named",
            name: "Definition"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "nullable",
            type: {
              kind: "object",
              fields: [{
                name: "mime",
                type: {
                  kind: "string"
                },
                optional: false
              }, {
                name: "contents",
                type: {
                  kind: "string"
                },
                optional: false
              }, {
                name: "encoding",
                type: {
                  kind: "string"
                },
                optional: false
              }]
            }
          }
        }
      }
    }
  }
});