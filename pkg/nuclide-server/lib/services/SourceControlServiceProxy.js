"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.getHgRepository = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "directoryPath",
      type: {
        location: {
          type: "source",
          fileName: "SourceControlService.js",
          line: 23
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("SourceControlService/getHgRepository", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "SourceControlService.js",
          line: 23
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "SourceControlService.js",
            line: 23
          },
          kind: "named",
          name: "HgRepositoryDescription"
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
    HgRepositoryDescription: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "SourceControlService.js",
        line: 17
      },
      name: "HgRepositoryDescription",
      definition: {
        location: {
          type: "source",
          fileName: "SourceControlService.js",
          line: 17
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "SourceControlService.js",
            line: 18
          },
          name: "repoPath",
          type: {
            location: {
              type: "source",
              fileName: "SourceControlService.js",
              line: 18
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "SourceControlService.js",
            line: 19
          },
          name: "originURL",
          type: {
            location: {
              type: "source",
              fileName: "SourceControlService.js",
              line: 19
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "SourceControlService.js",
                line: 19
              },
              kind: "string"
            }
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "SourceControlService.js",
            line: 20
          },
          name: "workingDirectoryPath",
          type: {
            location: {
              type: "source",
              fileName: "SourceControlService.js",
              line: 20
            },
            kind: "string"
          },
          optional: false
        }]
      }
    },
    getHgRepository: {
      kind: "function",
      name: "getHgRepository",
      location: {
        type: "source",
        fileName: "SourceControlService.js",
        line: 23
      },
      type: {
        location: {
          type: "source",
          fileName: "SourceControlService.js",
          line: 23
        },
        kind: "function",
        argumentTypes: [{
          name: "directoryPath",
          type: {
            location: {
              type: "source",
              fileName: "SourceControlService.js",
              line: 23
            },
            kind: "string"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "SourceControlService.js",
            line: 23
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "SourceControlService.js",
              line: 23
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "SourceControlService.js",
                line: 23
              },
              kind: "named",
              name: "HgRepositoryDescription"
            }
          }
        }
      }
    }
  }
});