"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.getAtomCommands = function () {
    return _client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("CommandService/getAtomCommands", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "CommandService.js",
          line: 16
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "CommandService.js",
            line: 16
          },
          kind: "named",
          name: "AtomCommands"
        }
      });
    });
  };

  remoteModule.getConnectionDetails = function () {
    return _client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("CommandService/getConnectionDetails", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "CommandService.js",
          line: 20
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "CommandService.js",
            line: 20
          },
          kind: "named",
          name: "ConnectionDetails"
        }
      });
    });
  };

  remoteModule.AtomCommands = class {
    openFile(arg0, arg1, arg2, arg3) {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 17
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 18
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 19
          },
          kind: "number"
        }
      }, {
        name: "isWaiting",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 20
          },
          kind: "boolean"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 15
          },
          name: "AtomCommands"
        }).then(id => {
          return _client.callRemoteMethod(id, "openFile", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 21
          },
          kind: "named",
          name: "AtomFileEvent"
        });
      }).publish();
    }

    openRemoteFile(arg0, arg1, arg2, arg3) {
      return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
        name: "uri",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 23
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 24
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 25
          },
          kind: "number"
        }
      }, {
        name: "isWaiting",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 26
          },
          kind: "boolean"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 15
          },
          name: "AtomCommands"
        }).then(id => {
          return _client.callRemoteMethod(id, "openRemoteFile", "observable", args);
        });
      })).concatMap(id => id).concatMap(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 27
          },
          kind: "named",
          name: "AtomFileEvent"
        });
      }).publish();
    }

    addProject(arg0) {
      return _client.marshalArguments(Array.from(arguments), [{
        name: "projectPath",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 28
          },
          kind: "named",
          name: "NuclideUri"
        }
      }]).then(args => {
        return _client.marshal(this, {
          kind: "named",
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 15
          },
          name: "AtomCommands"
        }).then(id => {
          return _client.callRemoteMethod(id, "addProject", "promise", args);
        });
      }).then(value => {
        return _client.unmarshal(value, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 28
          },
          kind: "void"
        });
      });
    }

    dispose() {
      return _client.disposeRemoteObject(this);
    }

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
    getAtomCommands: {
      kind: "function",
      name: "getAtomCommands",
      location: {
        type: "source",
        fileName: "CommandService.js",
        line: 16
      },
      type: {
        location: {
          type: "source",
          fileName: "CommandService.js",
          line: 16
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          location: {
            type: "source",
            fileName: "CommandService.js",
            line: 16
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "CommandService.js",
              line: 16
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "CommandService.js",
                line: 16
              },
              kind: "named",
              name: "AtomCommands"
            }
          }
        }
      }
    },
    getConnectionDetails: {
      kind: "function",
      name: "getConnectionDetails",
      location: {
        type: "source",
        fileName: "CommandService.js",
        line: 20
      },
      type: {
        location: {
          type: "source",
          fileName: "CommandService.js",
          line: 20
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          location: {
            type: "source",
            fileName: "CommandService.js",
            line: 20
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "CommandService.js",
              line: 20
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "CommandService.js",
                line: 20
              },
              kind: "named",
              name: "ConnectionDetails"
            }
          }
        }
      }
    },
    AtomFileEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 14
      },
      name: "AtomFileEvent",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 14
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 14
          },
          kind: "string-literal",
          value: "open"
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 14
          },
          kind: "string-literal",
          value: "close"
        }]
      }
    },
    AtomCommands: {
      kind: "interface",
      name: "AtomCommands",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 15
      },
      constructorArgs: null,
      staticMethods: {},
      instanceMethods: {
        openFile: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 16
          },
          kind: "function",
          argumentTypes: [{
            name: "filePath",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 17
              },
              kind: "named",
              name: "NuclideUri"
            }
          }, {
            name: "line",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 18
              },
              kind: "number"
            }
          }, {
            name: "column",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 19
              },
              kind: "number"
            }
          }, {
            name: "isWaiting",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 20
              },
              kind: "boolean"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 21
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 21
              },
              kind: "named",
              name: "AtomFileEvent"
            }
          }
        },
        openRemoteFile: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 22
          },
          kind: "function",
          argumentTypes: [{
            name: "uri",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 23
              },
              kind: "string"
            }
          }, {
            name: "line",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 24
              },
              kind: "number"
            }
          }, {
            name: "column",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 25
              },
              kind: "number"
            }
          }, {
            name: "isWaiting",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 26
              },
              kind: "boolean"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 27
            },
            kind: "observable",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 27
              },
              kind: "named",
              name: "AtomFileEvent"
            }
          }
        },
        addProject: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 28
          },
          kind: "function",
          argumentTypes: [{
            name: "projectPath",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 28
              },
              kind: "named",
              name: "NuclideUri"
            }
          }],
          returnType: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 28
            },
            kind: "promise",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 28
              },
              kind: "void"
            }
          }
        },
        dispose: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 29
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 29
            },
            kind: "void"
          }
        }
      }
    },
    ConnectionDetails: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 32
      },
      name: "ConnectionDetails",
      definition: {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 32
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 33
          },
          name: "port",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 33
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 34
          },
          name: "family",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 34
            },
            kind: "string"
          },
          optional: false
        }]
      }
    }
  }
});