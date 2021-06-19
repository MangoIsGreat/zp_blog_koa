const Koa = require("koa");
const bodyparser = require("koa-bodyparser");
const InitManager = require("./core/init");
const catchError = require("./middlewares/exceptions");

const app = new Koa();

// 注册全局异常处理中间件：
app.use(catchError);
// 初始化管理器:
InitManager.initCore(app);

app.use(bodyparser());

app.listen(3000);
