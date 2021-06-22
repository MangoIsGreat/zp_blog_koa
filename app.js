const Koa = require("koa");
const bodyparser = require("koa-bodyparser");
const InitManager = require("./core/init");
const catchError = require("./middlewares/exceptions");
const helmet = require("koa-helmet");

const app = new Koa();

// 注册helmet中间件防止xss攻击
app.use(helmet());

// 注册全局异常处理中间件：
app.use(catchError);
app.use(bodyparser());
// 初始化管理器:
InitManager.initCore(app);

app.listen(3000, () => {
  console.log("程序已启动...");
});
