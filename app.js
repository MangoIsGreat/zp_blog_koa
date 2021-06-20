const Koa = require("koa");
const bodyparser = require("koa-bodyparser");
const InitManager = require("./core/init");
const catchError = require("./middlewares/exceptions");

const app = new Koa();

// 注册全局异常处理中间件：
app.use(catchError);
app.use(bodyparser());
// 初始化管理器:
InitManager.initCore(app);

app.listen(3000, () => {
    console.log("程序已启动...")
});
