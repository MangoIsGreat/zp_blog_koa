const requireDirectory = require("require-directory");
const Router = require("koa-router");

class InitManager {
  static initCore(app) {
    // 入口方法：
    InitManager.app = app;
    InitManager.initLoadRouters();
    InitManager.loadHttpException(); // 程序启动时将所有的错误异常类挂载到global全局变量中
  }

  static initLoadRouters() {
    const apiDirectory = `${process.cwd()}/app/api`;
    requireDirectory(module, apiDirectory, {
      visit: whenLoadModule,
    });

    function whenLoadModule(obj) {
      if (obj instanceof Router) {
        InitManager.app.use(obj.routes());
      }
    }
  }

  static loadHttpException() {
    const errors = require("./http-exception");
    global.errs = errors;
  }
}

module.exports = InitManager;
