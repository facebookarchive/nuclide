"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.exists = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/exists", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "boolean"
      });
    });
  };

  remoteModule.findNearestAncestorNamed = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        kind: "string"
      }
    }, {
      name: "pathToDirectory",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/findNearestAncestorNamed", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "named",
          name: "NuclideUri"
        }
      });
    });
  };

  remoteModule.findFilesInDirectories = function (arg0, arg1) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "searchPaths",
      type: {
        kind: "array",
        type: {
          kind: "named",
          name: "NuclideUri"
        }
      }
    }, {
      name: "fileName",
      type: {
        kind: "string"
      }
    }])).switchMap(args => {
      return _client.callRemoteFunction("FileSystemService/findFilesInDirectories", "observable", args);
    }).concatMap(value => {
      return _client.unmarshal(value, {
        kind: "array",
        type: {
          kind: "named",
          name: "NuclideUri"
        }
      });
    }).publish();
  };

  remoteModule.lstat = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/lstat", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "fs.Stats"
      });
    });
  };

  remoteModule.mkdir = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/mkdir", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
  };

  remoteModule.mkdirp = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/mkdirp", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "boolean"
      });
    });
  };

  remoteModule.chmod = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "mode",
      type: {
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/chmod", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
  };

  remoteModule.newFile = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/newFile", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "boolean"
      });
    });
  };

  remoteModule.readdir = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/readdir", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "array",
        type: {
          kind: "named",
          name: "DirectoryEntry"
        }
      });
    });
  };

  remoteModule.realpath = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/realpath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "NuclideUri"
      });
    });
  };

  remoteModule.resolveRealPath = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/resolveRealPath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "string"
      });
    });
  };

  remoteModule.rename = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "sourcePath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "destinationPath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/rename", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
  };

  remoteModule.move = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "sourcePaths",
      type: {
        kind: "array",
        type: {
          kind: "named",
          name: "NuclideUri"
        }
      }
    }, {
      name: "destDir",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/move", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
  };

  remoteModule.copy = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "sourcePath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "destinationPath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/copy", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "boolean"
      });
    });
  };

  remoteModule.copyDir = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "sourcePath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "destinationPath",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/copyDir", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "boolean"
      });
    });
  };

  remoteModule.rmdir = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/rmdir", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
  };

  remoteModule.rmdirAll = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "paths",
      type: {
        kind: "array",
        type: {
          kind: "named",
          name: "NuclideUri"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/rmdirAll", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
  };

  remoteModule.stat = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/stat", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "fs.Stats"
      });
    });
  };

  remoteModule.unlink = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/unlink", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
  };

  remoteModule.readFile = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "options",
      type: {
        kind: "nullable",
        type: {
          kind: "object",
          fields: [{
            name: "flag",
            type: {
              kind: "string"
            },
            optional: true
          }]
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/readFile", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "Buffer"
      });
    });
  };

  remoteModule.createReadStream = function (arg0, arg1) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "options",
      type: {
        kind: "nullable",
        type: {
          kind: "object",
          fields: [{
            name: "flag",
            type: {
              kind: "string"
            },
            optional: true
          }]
        }
      }
    }])).switchMap(args => {
      return _client.callRemoteFunction("FileSystemService/createReadStream", "observable", args);
    }).concatMap(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "Buffer"
      });
    }).publish();
  };

  remoteModule.isNfs = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/isNfs", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "boolean"
      });
    });
  };

  remoteModule.writeFile = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "data",
      type: {
        kind: "string"
      }
    }, {
      name: "options",
      type: {
        kind: "nullable",
        type: {
          kind: "object",
          fields: [{
            name: "encoding",
            type: {
              kind: "string"
            },
            optional: true
          }, {
            name: "mode",
            type: {
              kind: "number"
            },
            optional: true
          }, {
            name: "flag",
            type: {
              kind: "string"
            },
            optional: true
          }]
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/writeFile", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
  };

  remoteModule.writeFileBuffer = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "data",
      type: {
        kind: "named",
        name: "Buffer"
      }
    }, {
      name: "options",
      type: {
        kind: "nullable",
        type: {
          kind: "object",
          fields: [{
            name: "encoding",
            type: {
              kind: "string"
            },
            optional: true
          }, {
            name: "mode",
            type: {
              kind: "number"
            },
            optional: true
          }, {
            name: "flag",
            type: {
              kind: "string"
            },
            optional: true
          }]
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/writeFileBuffer", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
  };

  remoteModule.getFreeSpace = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/getFreeSpace", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "number"
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
    DirectoryEntry: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 30
      },
      name: "DirectoryEntry",
      definition: {
        kind: "tuple",
        types: [{
          kind: "string"
        }, {
          kind: "boolean"
        }, {
          kind: "boolean"
        }]
      }
    },
    exists: {
      kind: "function",
      name: "exists",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 43
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 43
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "boolean"
          }
        }
      }
    },
    findNearestAncestorNamed: {
      kind: "function",
      name: "findNearestAncestorNamed",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 53
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 53
        },
        kind: "function",
        argumentTypes: [{
          name: "fileName",
          type: {
            kind: "string"
          }
        }, {
          name: "pathToDirectory",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "nullable",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          }
        }
      }
    },
    findFilesInDirectories: {
      kind: "function",
      name: "findFilesInDirectories",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 65
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 65
        },
        kind: "function",
        argumentTypes: [{
          name: "searchPaths",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          }
        }, {
          name: "fileName",
          type: {
            kind: "string"
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          }
        }
      }
    },
    lstat: {
      kind: "function",
      name: "lstat",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 84
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 84
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "named",
            name: "fs.Stats"
          }
        }
      }
    },
    mkdir: {
      kind: "function",
      name: "mkdir",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 93
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 93
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "void"
          }
        }
      }
    },
    mkdirp: {
      kind: "function",
      name: "mkdirp",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 104
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 104
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "boolean"
          }
        }
      }
    },
    chmod: {
      kind: "function",
      name: "chmod",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 111
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 111
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "mode",
          type: {
            kind: "number"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "void"
          }
        }
      }
    },
    newFile: {
      kind: "function",
      name: "newFile",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 122
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 122
        },
        kind: "function",
        argumentTypes: [{
          name: "filePath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "boolean"
          }
        }
      }
    },
    readdir: {
      kind: "function",
      name: "readdir",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 135
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 135
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "DirectoryEntry"
            }
          }
        }
      }
    },
    realpath: {
      kind: "function",
      name: "realpath",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 166
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 166
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }
      }
    },
    resolveRealPath: {
      kind: "function",
      name: "resolveRealPath",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 174
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 174
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            kind: "string"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "string"
          }
        }
      }
    },
    rename: {
      kind: "function",
      name: "rename",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 181
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 181
        },
        kind: "function",
        argumentTypes: [{
          name: "sourcePath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "destinationPath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "void"
          }
        }
      }
    },
    move: {
      kind: "function",
      name: "move",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 191
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 191
        },
        kind: "function",
        argumentTypes: [{
          name: "sourcePaths",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          }
        }, {
          name: "destDir",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "void"
          }
        }
      }
    },
    copy: {
      kind: "function",
      name: "copy",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 207
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 207
        },
        kind: "function",
        argumentTypes: [{
          name: "sourcePath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "destinationPath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "boolean"
          }
        }
      }
    },
    copyDir: {
      kind: "function",
      name: "copyDir",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 224
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 224
        },
        kind: "function",
        argumentTypes: [{
          name: "sourcePath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "destinationPath",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "boolean"
          }
        }
      }
    },
    rmdir: {
      kind: "function",
      name: "rmdir",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 252
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 252
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "void"
          }
        }
      }
    },
    rmdirAll: {
      kind: "function",
      name: "rmdirAll",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 256
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 256
        },
        kind: "function",
        argumentTypes: [{
          name: "paths",
          type: {
            kind: "array",
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
      }
    },
    stat: {
      kind: "function",
      name: "stat",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 284
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 284
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "named",
            name: "fs.Stats"
          }
        }
      }
    },
    unlink: {
      kind: "function",
      name: "unlink",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 291
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 291
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "void"
          }
        }
      }
    },
    readFile: {
      kind: "function",
      name: "readFile",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 307
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 307
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "options",
          type: {
            kind: "nullable",
            type: {
              kind: "object",
              fields: [{
                name: "flag",
                type: {
                  kind: "string"
                },
                optional: true
              }]
            }
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "named",
            name: "Buffer"
          }
        }
      }
    },
    createReadStream: {
      kind: "function",
      name: "createReadStream",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 318
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 318
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "options",
          type: {
            kind: "nullable",
            type: {
              kind: "object",
              fields: [{
                name: "flag",
                type: {
                  kind: "string"
                },
                optional: true
              }]
            }
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "named",
            name: "Buffer"
          }
        }
      }
    },
    isNfs: {
      kind: "function",
      name: "isNfs",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 328
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 328
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "boolean"
          }
        }
      }
    },
    writeFile: {
      kind: "function",
      name: "writeFile",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 378
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 378
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "data",
          type: {
            kind: "string"
          }
        }, {
          name: "options",
          type: {
            kind: "nullable",
            type: {
              kind: "object",
              fields: [{
                name: "encoding",
                type: {
                  kind: "string"
                },
                optional: true
              }, {
                name: "mode",
                type: {
                  kind: "number"
                },
                optional: true
              }, {
                name: "flag",
                type: {
                  kind: "string"
                },
                optional: true
              }]
            }
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "void"
          }
        }
      }
    },
    writeFileBuffer: {
      kind: "function",
      name: "writeFileBuffer",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 391
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 391
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "data",
          type: {
            kind: "named",
            name: "Buffer"
          }
        }, {
          name: "options",
          type: {
            kind: "nullable",
            type: {
              kind: "object",
              fields: [{
                name: "encoding",
                type: {
                  kind: "string"
                },
                optional: true
              }, {
                name: "mode",
                type: {
                  kind: "number"
                },
                optional: true
              }, {
                name: "flag",
                type: {
                  kind: "string"
                },
                optional: true
              }]
            }
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "void"
          }
        }
      }
    },
    getFreeSpace: {
      kind: "function",
      name: "getFreeSpace",
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 437
      },
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 437
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "nullable",
            type: {
              kind: "number"
            }
          }
        }
      }
    }
  }
});