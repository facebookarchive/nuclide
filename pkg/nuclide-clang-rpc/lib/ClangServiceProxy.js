"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.compile = function (arg0, arg1, arg2) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 108
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 109
        },
        kind: "string"
      }
    }, {
      name: "defaultFlags",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 110
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 110
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 110
            },
            kind: "string"
          }
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("ClangService/compile", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 111
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 111
          },
          kind: "named",
          name: "ClangCompileResult"
        }
      });
    }).publish();
  };

  remoteModule.getCompletions = function (arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 123
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 124
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 125
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 126
        },
        kind: "number"
      }
    }, {
      name: "tokenStartColumn",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 127
        },
        kind: "number"
      }
    }, {
      name: "prefix",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 128
        },
        kind: "string"
      }
    }, {
      name: "defaultFlags",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 129
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 129
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 129
            },
            kind: "string"
          }
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("ClangService/getCompletions", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 130
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 130
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 130
            },
            kind: "named",
            name: "ClangCompletion"
          }
        }
      });
    });
  };

  remoteModule.getDeclaration = function (arg0, arg1, arg2, arg3, arg4) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 144
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 145
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 146
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 147
        },
        kind: "number"
      }
    }, {
      name: "defaultFlags",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 148
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 148
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 148
            },
            kind: "string"
          }
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("ClangService/getDeclaration", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 149
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 149
          },
          kind: "named",
          name: "ClangDeclaration"
        }
      });
    });
  };

  remoteModule.getDeclarationInfo = function (arg0, arg1, arg2, arg3, arg4) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 164
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 165
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 166
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 167
        },
        kind: "number"
      }
    }, {
      name: "defaultFlags",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 168
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 168
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 168
            },
            kind: "string"
          }
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("ClangService/getDeclarationInfo", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 169
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 169
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 169
            },
            kind: "named",
            name: "ClangCursor"
          }
        }
      });
    });
  };

  remoteModule.getOutline = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 181
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 182
        },
        kind: "string"
      }
    }, {
      name: "defaultFlags",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 183
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 183
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 183
            },
            kind: "string"
          }
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("ClangService/getOutline", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 184
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 184
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 184
            },
            kind: "named",
            name: "ClangOutlineTree"
          }
        }
      });
    });
  };

  remoteModule.getLocalReferences = function (arg0, arg1, arg2, arg3, arg4) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 192
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 193
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 194
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 195
        },
        kind: "number"
      }
    }, {
      name: "defaultFlags",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 196
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 196
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 196
            },
            kind: "string"
          }
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("ClangService/getLocalReferences", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 197
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 197
          },
          kind: "named",
          name: "ClangLocalReferences"
        }
      });
    });
  };

  remoteModule.formatCode = function (arg0, arg1, arg2, arg3, arg4) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 205
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 206
        },
        kind: "string"
      }
    }, {
      name: "cursor",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 207
        },
        kind: "number"
      }
    }, {
      name: "offset",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 208
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 208
          },
          kind: "number"
        }
      }
    }, {
      name: "length",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 209
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 209
          },
          kind: "number"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("ClangService/formatCode", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 210
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 210
          },
          name: "newCursor",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 210
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 210
          },
          name: "formatted",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 210
            },
            kind: "string"
          },
          optional: false
        }]
      });
    });
  };

  remoteModule.reset = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 237
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 237
          },
          kind: "named",
          name: "NuclideUri"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("ClangService/reset", "void", args);
    });
  };

  remoteModule.dispose = function () {
    return _client.marshalArguments(Array.from(arguments), []).then(args => {
      return _client.callRemoteFunction("ClangService/dispose", "void", args);
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
  }], ["compile", {
    kind: "function",
    name: "compile",
    location: {
      type: "source",
      fileName: "ClangService.js",
      line: 107
    },
    type: {
      location: {
        type: "source",
        fileName: "ClangService.js",
        line: 107
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 108
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "contents",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 109
          },
          kind: "string"
        }
      }, {
        name: "defaultFlags",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 110
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 110
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 110
              },
              kind: "string"
            }
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 111
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 111
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 111
            },
            kind: "named",
            name: "ClangCompileResult"
          }
        }
      }
    }
  }], ["getCompletions", {
    kind: "function",
    name: "getCompletions",
    location: {
      type: "source",
      fileName: "ClangService.js",
      line: 122
    },
    type: {
      location: {
        type: "source",
        fileName: "ClangService.js",
        line: 122
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 123
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "contents",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 124
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 125
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 126
          },
          kind: "number"
        }
      }, {
        name: "tokenStartColumn",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 127
          },
          kind: "number"
        }
      }, {
        name: "prefix",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 128
          },
          kind: "string"
        }
      }, {
        name: "defaultFlags",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 129
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 129
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 129
              },
              kind: "string"
            }
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 130
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 130
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 130
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 130
              },
              kind: "named",
              name: "ClangCompletion"
            }
          }
        }
      }
    }
  }], ["getDeclaration", {
    kind: "function",
    name: "getDeclaration",
    location: {
      type: "source",
      fileName: "ClangService.js",
      line: 143
    },
    type: {
      location: {
        type: "source",
        fileName: "ClangService.js",
        line: 143
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 144
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "contents",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 145
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 146
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 147
          },
          kind: "number"
        }
      }, {
        name: "defaultFlags",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 148
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 148
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 148
              },
              kind: "string"
            }
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 149
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 149
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 149
            },
            kind: "named",
            name: "ClangDeclaration"
          }
        }
      }
    }
  }], ["getDeclarationInfo", {
    kind: "function",
    name: "getDeclarationInfo",
    location: {
      type: "source",
      fileName: "ClangService.js",
      line: 163
    },
    type: {
      location: {
        type: "source",
        fileName: "ClangService.js",
        line: 163
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 164
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "contents",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 165
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 166
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 167
          },
          kind: "number"
        }
      }, {
        name: "defaultFlags",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 168
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 168
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 168
              },
              kind: "string"
            }
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 169
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 169
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 169
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 169
              },
              kind: "named",
              name: "ClangCursor"
            }
          }
        }
      }
    }
  }], ["getOutline", {
    kind: "function",
    name: "getOutline",
    location: {
      type: "source",
      fileName: "ClangService.js",
      line: 180
    },
    type: {
      location: {
        type: "source",
        fileName: "ClangService.js",
        line: 180
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 181
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "contents",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 182
          },
          kind: "string"
        }
      }, {
        name: "defaultFlags",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 183
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 183
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 183
              },
              kind: "string"
            }
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 184
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 184
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 184
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 184
              },
              kind: "named",
              name: "ClangOutlineTree"
            }
          }
        }
      }
    }
  }], ["getLocalReferences", {
    kind: "function",
    name: "getLocalReferences",
    location: {
      type: "source",
      fileName: "ClangService.js",
      line: 191
    },
    type: {
      location: {
        type: "source",
        fileName: "ClangService.js",
        line: 191
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 192
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "contents",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 193
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 194
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 195
          },
          kind: "number"
        }
      }, {
        name: "defaultFlags",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 196
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 196
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 196
              },
              kind: "string"
            }
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 197
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 197
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 197
            },
            kind: "named",
            name: "ClangLocalReferences"
          }
        }
      }
    }
  }], ["formatCode", {
    kind: "function",
    name: "formatCode",
    location: {
      type: "source",
      fileName: "ClangService.js",
      line: 204
    },
    type: {
      location: {
        type: "source",
        fileName: "ClangService.js",
        line: 204
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 205
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "contents",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 206
          },
          kind: "string"
        }
      }, {
        name: "cursor",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 207
          },
          kind: "number"
        }
      }, {
        name: "offset",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 208
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 208
            },
            kind: "number"
          }
        }
      }, {
        name: "length",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 209
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 209
            },
            kind: "number"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 210
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 210
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 210
            },
            name: "newCursor",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 210
              },
              kind: "number"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 210
            },
            name: "formatted",
            type: {
              location: {
                type: "source",
                fileName: "ClangService.js",
                line: 210
              },
              kind: "string"
            },
            optional: false
          }]
        }
      }
    }
  }], ["reset", {
    kind: "function",
    name: "reset",
    location: {
      type: "source",
      fileName: "ClangService.js",
      line: 237
    },
    type: {
      location: {
        type: "source",
        fileName: "ClangService.js",
        line: 237
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "ClangService.js",
            line: 237
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "ClangService.js",
              line: 237
            },
            kind: "named",
            name: "NuclideUri"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 237
        },
        kind: "void"
      }
    }
  }], ["dispose", {
    kind: "function",
    name: "dispose",
    location: {
      type: "source",
      fileName: "ClangService.js",
      line: 241
    },
    type: {
      location: {
        type: "source",
        fileName: "ClangService.js",
        line: 241
      },
      kind: "function",
      argumentTypes: [],
      returnType: {
        location: {
          type: "source",
          fileName: "ClangService.js",
          line: 241
        },
        kind: "void"
      }
    }
  }], ["ClangCursorType", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 19
    },
    name: "ClangCursorType",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 19
      },
      kind: "string"
    }
  }], ["ClangLocation", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 21
    },
    name: "ClangLocation",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 21
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 22
        },
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 22
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 22
            },
            kind: "named",
            name: "NuclideUri"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 23
        },
        name: "point",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 23
          },
          kind: "named",
          name: "atom$Point"
        },
        optional: false
      }]
    }
  }], ["ClangSourceRange", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 26
    },
    name: "ClangSourceRange",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 26
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 27
        },
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 27
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 27
            },
            kind: "named",
            name: "NuclideUri"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 28
        },
        name: "range",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 28
          },
          kind: "named",
          name: "atom$Range"
        },
        optional: false
      }]
    }
  }], ["ClangCompileResult", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 31
    },
    name: "ClangCompileResult",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 31
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 32
        },
        name: "diagnostics",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 32
          },
          kind: "array",
          type: {
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
              name: "spelling",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 33
                },
                kind: "string"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 34
              },
              name: "severity",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 34
                },
                kind: "number"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 35
              },
              name: "location",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 35
                },
                kind: "named",
                name: "ClangLocation"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 36
              },
              name: "ranges",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 36
                },
                kind: "nullable",
                type: {
                  location: {
                    type: "source",
                    fileName: "rpc-types.js",
                    line: 36
                  },
                  kind: "array",
                  type: {
                    location: {
                      type: "source",
                      fileName: "rpc-types.js",
                      line: 36
                    },
                    kind: "named",
                    name: "ClangSourceRange"
                  }
                }
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 37
              },
              name: "fixits",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 37
                },
                kind: "array",
                type: {
                  location: {
                    type: "source",
                    fileName: "rpc-types.js",
                    line: 37
                  },
                  kind: "object",
                  fields: [{
                    location: {
                      type: "source",
                      fileName: "rpc-types.js",
                      line: 38
                    },
                    name: "range",
                    type: {
                      location: {
                        type: "source",
                        fileName: "rpc-types.js",
                        line: 38
                      },
                      kind: "named",
                      name: "ClangSourceRange"
                    },
                    optional: false
                  }, {
                    location: {
                      type: "source",
                      fileName: "rpc-types.js",
                      line: 39
                    },
                    name: "value",
                    type: {
                      location: {
                        type: "source",
                        fileName: "rpc-types.js",
                        line: 39
                      },
                      kind: "string"
                    },
                    optional: false
                  }]
                }
              },
              optional: true
            }, {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 49
              },
              name: "children",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 49
                },
                kind: "array",
                type: {
                  location: {
                    type: "source",
                    fileName: "rpc-types.js",
                    line: 49
                  },
                  kind: "object",
                  fields: [{
                    location: {
                      type: "source",
                      fileName: "rpc-types.js",
                      line: 50
                    },
                    name: "spelling",
                    type: {
                      location: {
                        type: "source",
                        fileName: "rpc-types.js",
                        line: 50
                      },
                      kind: "string"
                    },
                    optional: false
                  }, {
                    location: {
                      type: "source",
                      fileName: "rpc-types.js",
                      line: 51
                    },
                    name: "location",
                    type: {
                      location: {
                        type: "source",
                        fileName: "rpc-types.js",
                        line: 51
                      },
                      kind: "named",
                      name: "ClangLocation"
                    },
                    optional: false
                  }, {
                    location: {
                      type: "source",
                      fileName: "rpc-types.js",
                      line: 52
                    },
                    name: "ranges",
                    type: {
                      location: {
                        type: "source",
                        fileName: "rpc-types.js",
                        line: 52
                      },
                      kind: "array",
                      type: {
                        location: {
                          type: "source",
                          fileName: "rpc-types.js",
                          line: 52
                        },
                        kind: "named",
                        name: "ClangSourceRange"
                      }
                    },
                    optional: false
                  }]
                }
              },
              optional: true
            }]
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 57
        },
        name: "accurateFlags",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 57
          },
          kind: "boolean"
        },
        optional: true
      }]
    }
  }], ["ClangCompletion", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 60
    },
    name: "ClangCompletion",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 60
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 61
        },
        name: "chunks",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 61
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 61
            },
            kind: "object",
            fields: [{
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 62
              },
              name: "spelling",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 62
                },
                kind: "string"
              },
              optional: false
            }, {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 63
              },
              name: "isPlaceHolder",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 63
                },
                kind: "boolean"
              },
              optional: true
            }, {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 64
              },
              name: "isOptional",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 64
                },
                kind: "boolean"
              },
              optional: true
            }, {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 65
              },
              name: "kind",
              type: {
                location: {
                  type: "source",
                  fileName: "rpc-types.js",
                  line: 65
                },
                kind: "string"
              },
              optional: true
            }]
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 67
        },
        name: "result_type",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 67
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 68
        },
        name: "spelling",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 68
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 69
        },
        name: "cursor_kind",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 69
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 70
        },
        name: "brief_comment",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 70
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 70
            },
            kind: "string"
          }
        },
        optional: false
      }]
    }
  }], ["ClangDeclaration", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 73
    },
    name: "ClangDeclaration",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 73
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 74
        },
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 74
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 75
        },
        name: "point",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 75
          },
          kind: "named",
          name: "atom$Point"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 76
        },
        name: "spelling",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 76
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 76
            },
            kind: "string"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 77
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 77
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 77
            },
            kind: "string"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 78
        },
        name: "extent",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 78
          },
          kind: "named",
          name: "atom$Range"
        },
        optional: false
      }]
    }
  }], ["ClangCursor", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 81
    },
    name: "ClangCursor",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 81
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 82
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 82
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 83
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 83
          },
          kind: "named",
          name: "ClangCursorType"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 84
        },
        name: "cursor_usr",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 84
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 85
        },
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 85
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 85
            },
            kind: "named",
            name: "NuclideUri"
          }
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 86
        },
        name: "extent",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 86
          },
          kind: "named",
          name: "atom$Range"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 87
        },
        name: "is_definition",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 87
          },
          kind: "boolean"
        },
        optional: false
      }]
    }
  }], ["ClangOutlineTree", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 90
    },
    name: "ClangOutlineTree",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 90
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 91
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 91
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 92
        },
        name: "extent",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 92
          },
          kind: "named",
          name: "atom$Range"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 93
        },
        name: "cursor_kind",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 93
          },
          kind: "named",
          name: "ClangCursorType"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 95
        },
        name: "cursor_type",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 95
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 98
        },
        name: "params",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 98
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 98
            },
            kind: "string"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 100
        },
        name: "tparams",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 100
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 100
            },
            kind: "string"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 102
        },
        name: "children",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 102
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 102
            },
            kind: "named",
            name: "ClangOutlineTree"
          }
        },
        optional: true
      }]
    }
  }], ["ClangLocalReferences", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 105
    },
    name: "ClangLocalReferences",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 105
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 106
        },
        name: "cursor_name",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 106
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 107
        },
        name: "cursor_kind",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 107
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 108
        },
        name: "references",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 108
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 108
            },
            kind: "named",
            name: "atom$Range"
          }
        },
        optional: false
      }]
    }
  }]])
});