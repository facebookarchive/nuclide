"use strict";

module.exports = _client => {
  const remoteModule = {};
  remoteModule.Unregister = class {
    constructor() {
      throw Error("constructors are not supported for remote objects");
    }

    dispose() {
      return _client.disposeRemoteObject(this);
    }

  };
  remoteModule.FileNotifier = class {
    constructor() {
      throw Error("constructors are not supported for remote objects");
    }

    onFileEvent(arg0) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 62
        },
        name: "FileNotifier"
      }), "onFileEvent", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "event",
        type: {
          kind: "named",
          name: "FileEvent"
        }
      }])).then(value => {
        return _client.unmarshal(value, {
          kind: "void"
        });
      });
    }

    onDirectoriesChanged(arg0) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 62
        },
        name: "FileNotifier"
      }), "onDirectoriesChanged", "promise", _client.marshalArguments(Array.from(arguments), [{
        name: "openDirectories",
        type: {
          kind: "set",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
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
  remoteModule.AtomCommands = class {
    constructor() {
      throw Error("constructors are not supported for remote objects");
    }

    openFile(arg0, arg1, arg2, arg3) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 47
        },
        name: "AtomCommands"
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
          line: 47
        },
        name: "AtomCommands"
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
          line: 47
        },
        name: "AtomCommands"
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

    getProjectState() {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 47
        },
        name: "AtomCommands"
      }), "getProjectState", "promise", _client.marshalArguments(Array.from(arguments), [])).then(value => {
        return _client.unmarshal(value, {
          kind: "named",
          name: "ProjectState"
        });
      });
    }

    addNotification(arg0) {
      return _client.callRemoteMethod(_client.marshal(this, {
        kind: "named",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 47
        },
        name: "AtomCommands"
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

  remoteModule.registerAtomCommands = function (arg0, arg1) {
    return _client.callRemoteFunction("RemoteCommandService/registerAtomCommands", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "fileNotifier",
      type: {
        kind: "named",
        name: "FileNotifier"
      }
    }, {
      name: "atomCommands",
      type: {
        kind: "named",
        name: "AtomCommands"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "Unregister"
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
    Unregister: {
      kind: "interface",
      name: "Unregister",
      location: {
        type: "source",
        fileName: "RemoteCommandService.js",
        line: 24
      },
      staticMethods: {},
      instanceMethods: {
        dispose: {
          location: {
            type: "source",
            fileName: "RemoteCommandService.js",
            line: 25
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "void"
          }
        }
      }
    },
    FileVersion: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 68
      },
      name: "FileVersion",
      definition: {
        kind: "object",
        fields: [{
          name: "notifier",
          type: {
            kind: "named",
            name: "FileNotifier"
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
          name: "version",
          type: {
            kind: "number"
          },
          optional: false
        }]
      }
    },
    FileOpenEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 14
      },
      name: "FileOpenEvent",
      definition: {
        kind: "object",
        fields: [{
          name: "kind",
          type: {
            kind: "string-literal",
            value: "open"
          },
          optional: false
        }, {
          name: "fileVersion",
          type: {
            kind: "named",
            name: "FileVersion"
          },
          optional: false
        }, {
          name: "contents",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "languageId",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    FileCloseEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 29
      },
      name: "FileCloseEvent",
      definition: {
        kind: "object",
        fields: [{
          name: "kind",
          type: {
            kind: "string-literal",
            value: "close"
          },
          optional: false
        }, {
          name: "fileVersion",
          type: {
            kind: "named",
            name: "FileVersion"
          },
          optional: false
        }]
      }
    },
    FileEditEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 34
      },
      name: "FileEditEvent",
      definition: {
        kind: "object",
        fields: [{
          name: "kind",
          type: {
            kind: "string-literal",
            value: "edit"
          },
          optional: false
        }, {
          name: "fileVersion",
          type: {
            kind: "named",
            name: "FileVersion"
          },
          optional: false
        }, {
          name: "oldRange",
          type: {
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }, {
          name: "newRange",
          type: {
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }, {
          name: "oldText",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "newText",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    FileSaveEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 43
      },
      name: "FileSaveEvent",
      definition: {
        kind: "object",
        fields: [{
          name: "kind",
          type: {
            kind: "string-literal",
            value: "save"
          },
          optional: false
        }, {
          name: "fileVersion",
          type: {
            kind: "named",
            name: "FileVersion"
          },
          optional: false
        }]
      }
    },
    FileSyncEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 22
      },
      name: "FileSyncEvent",
      definition: {
        kind: "object",
        fields: [{
          name: "kind",
          type: {
            kind: "string-literal",
            value: "sync"
          },
          optional: false
        }, {
          name: "fileVersion",
          type: {
            kind: "named",
            name: "FileVersion"
          },
          optional: false
        }, {
          name: "contents",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "languageId",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    FileEvent: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 49
      },
      name: "FileEvent",
      definition: {
        kind: "union",
        types: [{
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "open"
            },
            optional: false
          }, {
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            },
            optional: false
          }, {
            name: "contents",
            type: {
              kind: "string"
            },
            optional: false
          }, {
            name: "languageId",
            type: {
              kind: "string"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "close"
            },
            optional: false
          }, {
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "edit"
            },
            optional: false
          }, {
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            },
            optional: false
          }, {
            name: "oldRange",
            type: {
              kind: "named",
              name: "atom$Range"
            },
            optional: false
          }, {
            name: "newRange",
            type: {
              kind: "named",
              name: "atom$Range"
            },
            optional: false
          }, {
            name: "oldText",
            type: {
              kind: "string"
            },
            optional: false
          }, {
            name: "newText",
            type: {
              kind: "string"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "save"
            },
            optional: false
          }, {
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "sync"
            },
            optional: false
          }, {
            name: "fileVersion",
            type: {
              kind: "named",
              name: "FileVersion"
            },
            optional: false
          }, {
            name: "contents",
            type: {
              kind: "string"
            },
            optional: false
          }, {
            name: "languageId",
            type: {
              kind: "string"
            },
            optional: false
          }]
        }],
        discriminantField: "kind"
      }
    },
    FileNotifier: {
      kind: "interface",
      name: "FileNotifier",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 62
      },
      staticMethods: {},
      instanceMethods: {
        onFileEvent: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 63
          },
          kind: "function",
          argumentTypes: [{
            name: "event",
            type: {
              kind: "named",
              name: "FileEvent"
            }
          }],
          returnType: {
            kind: "promise",
            type: {
              kind: "void"
            }
          }
        },
        onDirectoriesChanged: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 64
          },
          kind: "function",
          argumentTypes: [{
            name: "openDirectories",
            type: {
              kind: "set",
              type: {
                kind: "named",
                name: "NuclideUri"
              }
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
            line: 65
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "void"
          }
        }
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
    AtomCommands: {
      kind: "interface",
      name: "AtomCommands",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 47
      },
      staticMethods: {},
      instanceMethods: {
        openFile: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 48
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
            line: 55
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
            line: 68
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
        getProjectState: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 74
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "promise",
            type: {
              kind: "named",
              name: "ProjectState"
            }
          }
        },
        addNotification: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 76
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
            line: 78
          },
          kind: "function",
          argumentTypes: [],
          returnType: {
            kind: "void"
          }
        }
      }
    },
    registerAtomCommands: {
      kind: "function",
      name: "registerAtomCommands",
      location: {
        type: "source",
        fileName: "RemoteCommandService.js",
        line: 31
      },
      type: {
        location: {
          type: "source",
          fileName: "RemoteCommandService.js",
          line: 31
        },
        kind: "function",
        argumentTypes: [{
          name: "fileNotifier",
          type: {
            kind: "named",
            name: "FileNotifier"
          }
        }, {
          name: "atomCommands",
          type: {
            kind: "named",
            name: "AtomCommands"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "named",
            name: "Unregister"
          }
        }
      }
    }
  }
});