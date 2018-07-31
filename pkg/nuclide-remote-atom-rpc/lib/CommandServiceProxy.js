"use strict";

module.exports = _client => {
  const remoteModule = {};
  remoteModule.MultiConnectionAtomCommands = class {
    constructor() {
      throw Error("constructors are not supported for remote objects");
    }

    getConnectionCount() {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 87
        },
        name: "MultiConnectionAtomCommands"
      }), "getConnectionCount", "promise", _client.marshalArguments(Array.from(arguments), [])).then(value => {
        return _client.unmarshal(value, {
          kind: "number"
        });
      });
    }

    openFile(arg0, arg1, arg2, arg3) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 87
        },
        name: "MultiConnectionAtomCommands"
      }), "openFile", "observable", _client.marshalArguments(Array.from(arguments), [{
        name: "filePath",
        type: {
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "line",
        type: {
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          kind: "number"
        }
      }, {
        name: "isWaiting",
        type: {
          kind: "boolean"
        }
      }])).map(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "AtomFileEvent"
        });
      }).publish();
    }

    openRemoteFile(arg0, arg1, arg2, arg3) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 87
        },
        name: "MultiConnectionAtomCommands"
      }), "openRemoteFile", "observable", _client.marshalArguments(Array.from(arguments), [{
        name: "uri",
        type: {
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          kind: "number"
        }
      }, {
        name: "isWaiting",
        type: {
          kind: "boolean"
        }
      }])).map(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "AtomFileEvent"
        });
      }).publish();
    }

    addProject(arg0, arg1) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 87
        },
        name: "MultiConnectionAtomCommands"
      }), "addProject", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "projectPath",
        type: {
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "newWindow",
        type: {
          kind: "boolean"
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    getProjectStates() {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 87
        },
        name: "MultiConnectionAtomCommands"
      }), "getProjectStates", "promise", _client.marshalArguments(Array.from(arguments), [])).then(value => {
        return _client.unmarshal(value, {
          kind: "array",
          type: {
            kind: "named",
            name: "ProjectState"
          }
        });
      });
    }

    addNotification(arg0) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 87
        },
        name: "MultiConnectionAtomCommands"
      }), "addNotification", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "notification",
        type: {
          kind: "named",
          name: "AtomNotification"
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    dispose() {
      return _client.disposeRemoteObject(this);
    }

  };

  remoteModule.getAtomCommands = function () {
    return _client.callRemoteFunction("CommandService/getAtomCommands", "promise", _client.marshalArguments(Array.from(arguments), [])).then(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "MultiConnectionAtomCommands"
      });
    });
  };

  remoteModule.getConnectionDetails = function () {
    return _client.callRemoteFunction("CommandService/getConnectionDetails", "promise", _client.marshalArguments(Array.from(arguments), [])).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "named",
          name: "ConnectionDetails"
        }
      });
    });
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
    AtomFileEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 24
      },
      name: "AtomFileEvent",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "open"
        }, {
          kind: "string-literal",
          value: "close"
        }]
      }
    },
    ProjectState: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 15
      },
      name: "ProjectState",
      definition: {
        kind: "object",
        fields: [{
          name: "rootFolders",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          },
          optional: false
        }]
      }
    },
    AtomNotificationType: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 26
      },
      name: "AtomNotificationType",
      definition: {
        kind: "union",
        types: [{
          kind: "string-literal",
          value: "success"
        }, {
          kind: "string-literal",
          value: "info"
        }, {
          kind: "string-literal",
          value: "warning"
        }, {
          kind: "string-literal",
          value: "error"
        }, {
          kind: "string-literal",
          value: "fatal"
        }]
      }
    },
    AtomNotification: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 33
      },
      name: "AtomNotification",
      definition: {
        kind: "object",
        fields: [{
          name: "message",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "type",
          type: {
            kind: "named",
            name: "AtomNotificationType"
          },
          optional: false
        }, {
          name: "description",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "detail",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "icon",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "dismissable",
          type: {
            kind: "boolean"
          },
          optional: true
        }]
      }
    },
    MultiConnectionAtomCommands: {
      kind: "interface",
      name: "MultiConnectionAtomCommands",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 87
      },
      staticMethods: {},
      instanceMethods: {
        getConnectionCount: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 89
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "promise",
            type: {
              kind: "number"
            }
          }
        },
        openFile: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 95
          },
          kind: "function",
          argumentTypes: [{
            name: "filePath",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          }, {
            name: "line",
            type: {
              kind: "number"
            }
          }, {
            name: "column",
            type: {
              kind: "number"
            }
          }, {
            name: "isWaiting",
            type: {
              kind: "boolean"
            }
          }],
          returnType: {
            kind: "observable",
            type: {
              kind: "named",
              name: "AtomFileEvent"
            }
          }
        },
        openRemoteFile: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 107
          },
          kind: "function",
          argumentTypes: [{
            name: "uri",
            type: {
              kind: "string"
            }
          }, {
            name: "line",
            type: {
              kind: "number"
            }
          }, {
            name: "column",
            type: {
              kind: "number"
            }
          }, {
            name: "isWaiting",
            type: {
              kind: "boolean"
            }
          }],
          returnType: {
            kind: "observable",
            type: {
              kind: "named",
              name: "AtomFileEvent"
            }
          }
        },
        addProject: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 123
          },
          kind: "function",
          argumentTypes: [{
            name: "projectPath",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          }, {
            name: "newWindow",
            type: {
              kind: "boolean"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        },
        getProjectStates: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 129
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "promise",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "ProjectState"
              }
            }
          }
        },
        addNotification: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 134
          },
          kind: "function",
          argumentTypes: [{
            name: "notification",
            type: {
              kind: "named",
              name: "AtomNotification"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        },
        dispose: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 136
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "void"
          }
        }
      }
    },
    getAtomCommands: {
      kind: "function",
      name: "getAtomCommands",
      location: {
        type: "source",
        fileName: "CommandService.js",
        line: 21
      },
      type: {
        location: {
          type: "source",
          fileName: "CommandService.js",
          line: 21
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          kind: "promise",
          type: {
            kind: "named",
            name: "MultiConnectionAtomCommands"
          }
        }
      }
    },
    ConnectionDetails: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 139
      },
      name: "ConnectionDetails",
      definition: {
        kind: "object",
        fields: [{
          name: "port",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "family",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    getConnectionDetails: {
      kind: "function",
      name: "getConnectionDetails",
      location: {
        type: "source",
        fileName: "CommandService.js",
        line: 25
      },
      type: {
        location: {
          type: "source",
          fileName: "CommandService.js",
          line: 25
        },
        kind: "function",
        argumentTypes: [],
        returnType: {
          kind: "promise",
          type: {
            kind: "nullable",
            type: {
              kind: "named",
              name: "ConnectionDetails"
            }
          }
        }
      }
    }
  }
});