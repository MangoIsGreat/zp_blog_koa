const Router = require("koa-router");
const router = new Router();
const { HttpException } = require("../../../core/http-exception");

router.get("/v1/book/latest", (ctx, next) => {
  const error = new HttpException("为什么错误", 10001, 400);
  throw error;
});

module.exports = router;
