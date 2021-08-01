const Koa = require("koa");
// const bodyparser = require("koa-bodyparser");
const koaBody = require("koa-body");
const InitManager = require("./core/init");
const catchError = require("./middlewares/exceptions");
const cors = require("koa-cors");
const helmet = require("koa-helmet");
const koaStatic = require("koa-static");
const path = require("path");

const app = new Koa();

// 注册helmet中间件防止xss攻击
app.use(helmet());

// 允许跨域
app.use(
  cors({
    origin: "*",
  })
);

// 处理静态资源
app.use(koaStatic(path.join(__dirname, "./uploads/article")));
app.use(koaStatic(path.join(__dirname, "./uploads/avatar")));
app.use(koaStatic(path.join(__dirname, "./uploads/circle")));

// 注册全局异常处理中间件：
app.use(catchError);
// app.use(bodyparser());
app.use(
  koaBody({
    multipart: true,
  })
);
// 初始化管理器:
InitManager.initCore(app);

app.listen(3001, () => {
  console.log("程序已启动...");
});
