const Router = require("koa-router");
const router = new Router();

router.get("/v1/book/latest", (ctx, next) => {
  // ctx.body = {
  //   key: "book",
  // };

  // if (true) {
  //   const error = new global.errs.ParameterException();
  //   throw error;
  // }

  throw new Error();
});

module.exports = router;
