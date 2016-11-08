"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.exists = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 41
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/exists", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 41
        },
        kind: "boolean"
      });
    });
  };

  remoteModule.findNearestFile = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "fileName",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 45
        },
        kind: "string"
      }
    }, {
      name: "pathToDirectory",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 45
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/findNearestFile", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 45
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 45
          },
          kind: "string"
        }
      });
    });
  };

  remoteModule.lstat = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 53
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/lstat", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 53
        },
        kind: "named",
        name: "fs.Stats"
      });
    });
  };

  remoteModule.mkdir = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 62
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/mkdir", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 62
        },
        kind: "void"
      });
    });
  };

  remoteModule.mkdirp = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 73
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/mkdirp", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 73
        },
        kind: "boolean"
      });
    });
  };

  remoteModule.chmod = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 80
        },
        kind: "string"
      }
    }, {
      name: "mode",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 80
        },
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/chmod", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 80
        },
        kind: "void"
      });
    });
  };

  remoteModule.newFile = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "filePath",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 91
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/newFile", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 91
        },
        kind: "boolean"
      });
    });
  };

  remoteModule.readdir = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 110
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/readdir", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 110
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 110
          },
          kind: "named",
          name: "FileWithStats"
        }
      });
    });
  };

  remoteModule.realpath = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 138
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/realpath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 138
        },
        kind: "string"
      });
    });
  };

  remoteModule.resolveRealPath = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 146
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/resolveRealPath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 146
        },
        kind: "string"
      });
    });
  };

  remoteModule.rename = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "sourcePath",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 153
        },
        kind: "string"
      }
    }, {
      name: "destinationPath",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 153
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/rename", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 153
        },
        kind: "void"
      });
    });
  };

  remoteModule.move = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "sourcePaths",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 160
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 160
          },
          kind: "string"
        }
      }
    }, {
      name: "destDir",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 160
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/move", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 160
        },
        kind: "void"
      });
    });
  };

  remoteModule.copy = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "sourcePath",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 171
        },
        kind: "string"
      }
    }, {
      name: "destinationPath",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 171
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/copy", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 171
        },
        kind: "boolean"
      });
    });
  };

  remoteModule.rmdir = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 184
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/rmdir", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 184
        },
        kind: "void"
      });
    });
  };

  remoteModule.rmdirAll = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "paths",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 188
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 188
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/rmdirAll", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 188
        },
        kind: "void"
      });
    });
  };

  remoteModule.stat = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 216
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/stat", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 216
        },
        kind: "named",
        name: "fs.Stats"
      });
    });
  };

  remoteModule.unlink = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 223
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/unlink", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 223
        },
        kind: "void"
      });
    });
  };

  remoteModule.readFile = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 240
        },
        kind: "string"
      }
    }, {
      name: "options",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 241
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 241
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 241
            },
            name: "flag",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 241
              },
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
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 242
        },
        kind: "named",
        name: "Buffer"
      });
    });
  };

  remoteModule.isNfs = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 253
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FileSystemService/isNfs", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 253
        },
        kind: "boolean"
      });
    });
  };

  remoteModule.writeFile = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 294
        },
        kind: "string"
      }
    }, {
      name: "data",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 294
        },
        kind: "string"
      }
    }, {
      name: "options",
      type: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 295
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 295
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 295
            },
            name: "encoding",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 295
              },
              kind: "string"
            },
            optional: true
          }, {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 295
            },
            name: "mode",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 295
              },
              kind: "number"
            },
            optional: true
          }, {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 295
            },
            name: "flag",
            type: {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 295
              },
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
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 295
        },
        kind: "void"
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
  value: new Map([["Object", {
    kind: "alias",
    name: "Object",
    location: {
      type: "builtin"
    }
  }], ["Date", {
    kind: "alias",
    name: "Date",
    location: {
      type: "builtin"
    }
  }], ["RegExp", {
    kind: "alias",
    name: "RegExp",
    location: {
      type: "builtin"
    }
  }], ["Buffer", {
    kind: "alias",
    name: "Buffer",
    location: {
      type: "builtin"
    }
  }], ["fs.Stats", {
    kind: "alias",
    name: "fs.Stats",
    location: {
      type: "builtin"
    }
  }], ["NuclideUri", {
    kind: "alias",
    name: "NuclideUri",
    location: {
      type: "builtin"
    }
  }], ["atom$Point", {
    kind: "alias",
    name: "atom$Point",
    location: {
      type: "builtin"
    }
  }], ["atom$Range", {
    kind: "alias",
    name: "atom$Range",
    location: {
      type: "builtin"
    }
  }], ["FileWithStats", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 24
    },
    name: "FileWithStats",
    definition: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 24
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 25
        },
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 25
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 26
        },
        name: "stats",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 26
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 26
            },
            kind: "named",
            name: "fs.Stats"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 27
        },
        name: "isSymbolicLink",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 27
          },
          kind: "boolean"
        },
        optional: false
      }]
    }
  }], ["exists", {
    kind: "function",
    name: "exists",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 41
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 41
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 41
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 41
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 41
          },
          kind: "boolean"
        }
      }
    }
  }], ["findNearestFile", {
    kind: "function",
    name: "findNearestFile",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 45
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 45
      },
      kind: "function",
      argumentTypes: [{
        name: "fileName",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 45
          },
          kind: "string"
        }
      }, {
        name: "pathToDirectory",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 45
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 45
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 45
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 45
            },
            kind: "string"
          }
        }
      }
    }
  }], ["lstat", {
    kind: "function",
    name: "lstat",
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
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 53
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 53
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 53
          },
          kind: "named",
          name: "fs.Stats"
        }
      }
    }
  }], ["mkdir", {
    kind: "function",
    name: "mkdir",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 62
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 62
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 62
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 62
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 62
          },
          kind: "void"
        }
      }
    }
  }], ["mkdirp", {
    kind: "function",
    name: "mkdirp",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 73
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 73
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 73
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 73
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 73
          },
          kind: "boolean"
        }
      }
    }
  }], ["chmod", {
    kind: "function",
    name: "chmod",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 80
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 80
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 80
          },
          kind: "string"
        }
      }, {
        name: "mode",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 80
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 80
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 80
          },
          kind: "void"
        }
      }
    }
  }], ["newFile", {
    kind: "function",
    name: "newFile",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 91
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 91
      },
      kind: "function",
      argumentTypes: [{
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 91
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 91
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 91
          },
          kind: "boolean"
        }
      }
    }
  }], ["readdir", {
    kind: "function",
    name: "readdir",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 110
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 110
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 110
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 110
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 110
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 110
            },
            kind: "named",
            name: "FileWithStats"
          }
        }
      }
    }
  }], ["realpath", {
    kind: "function",
    name: "realpath",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 138
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 138
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 138
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 138
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 138
          },
          kind: "string"
        }
      }
    }
  }], ["resolveRealPath", {
    kind: "function",
    name: "resolveRealPath",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 146
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 146
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 146
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 146
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 146
          },
          kind: "string"
        }
      }
    }
  }], ["rename", {
    kind: "function",
    name: "rename",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 153
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 153
      },
      kind: "function",
      argumentTypes: [{
        name: "sourcePath",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 153
          },
          kind: "string"
        }
      }, {
        name: "destinationPath",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 153
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 153
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 153
          },
          kind: "void"
        }
      }
    }
  }], ["move", {
    kind: "function",
    name: "move",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 160
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 160
      },
      kind: "function",
      argumentTypes: [{
        name: "sourcePaths",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 160
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 160
            },
            kind: "string"
          }
        }
      }, {
        name: "destDir",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 160
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 160
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 160
          },
          kind: "void"
        }
      }
    }
  }], ["copy", {
    kind: "function",
    name: "copy",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 171
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 171
      },
      kind: "function",
      argumentTypes: [{
        name: "sourcePath",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 171
          },
          kind: "string"
        }
      }, {
        name: "destinationPath",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 171
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 171
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 171
          },
          kind: "boolean"
        }
      }
    }
  }], ["rmdir", {
    kind: "function",
    name: "rmdir",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 184
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 184
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 184
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 184
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 184
          },
          kind: "void"
        }
      }
    }
  }], ["rmdirAll", {
    kind: "function",
    name: "rmdirAll",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 188
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 188
      },
      kind: "function",
      argumentTypes: [{
        name: "paths",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 188
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 188
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 188
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 188
          },
          kind: "void"
        }
      }
    }
  }], ["stat", {
    kind: "function",
    name: "stat",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 216
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 216
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 216
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 216
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 216
          },
          kind: "named",
          name: "fs.Stats"
        }
      }
    }
  }], ["unlink", {
    kind: "function",
    name: "unlink",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 223
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 223
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 223
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 223
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 223
          },
          kind: "void"
        }
      }
    }
  }], ["readFile", {
    kind: "function",
    name: "readFile",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 239
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 239
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 240
          },
          kind: "string"
        }
      }, {
        name: "options",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 241
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 241
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 241
              },
              name: "flag",
              type: {
                location: {
                  type: "source",
                  fileName: "FileSystemService.js",
                  line: 241
                },
                kind: "string"
              },
              optional: true
            }]
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 242
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 242
          },
          kind: "named",
          name: "Buffer"
        }
      }
    }
  }], ["isNfs", {
    kind: "function",
    name: "isNfs",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 253
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 253
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 253
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 253
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 253
          },
          kind: "boolean"
        }
      }
    }
  }], ["writeFile", {
    kind: "function",
    name: "writeFile",
    location: {
      type: "source",
      fileName: "FileSystemService.js",
      line: 294
    },
    type: {
      location: {
        type: "source",
        fileName: "FileSystemService.js",
        line: 294
      },
      kind: "function",
      argumentTypes: [{
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 294
          },
          kind: "string"
        }
      }, {
        name: "data",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 294
          },
          kind: "string"
        }
      }, {
        name: "options",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 295
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "FileSystemService.js",
              line: 295
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 295
              },
              name: "encoding",
              type: {
                location: {
                  type: "source",
                  fileName: "FileSystemService.js",
                  line: 295
                },
                kind: "string"
              },
              optional: true
            }, {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 295
              },
              name: "mode",
              type: {
                location: {
                  type: "source",
                  fileName: "FileSystemService.js",
                  line: 295
                },
                kind: "number"
              },
              optional: true
            }, {
              location: {
                type: "source",
                fileName: "FileSystemService.js",
                line: 295
              },
              name: "flag",
              type: {
                location: {
                  type: "source",
                  fileName: "FileSystemService.js",
                  line: 295
                },
                kind: "string"
              },
              optional: true
            }]
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FileSystemService.js",
          line: 295
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FileSystemService.js",
            line: 295
          },
          kind: "void"
        }
      }
    }
  }]])
});