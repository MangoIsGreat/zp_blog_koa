const Router = require("koa-router");
const router = new Router();

router.get("/v1/book/latest", (ctx, next) => {
  const error = new global.errs.ParameterException("为什么错误aaa", 10001);
  throw error;
});

module.exports = router;
