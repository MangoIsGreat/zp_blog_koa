const Router = require("koa-router");
const router = new Router();

const { PositiveIntegerValidator } = require("../../validators/validator.js");

router.post("/v1/:id/classic/latest", (ctx, next) => {
  const v = new PositiveIntegerValidator().validate(ctx);
});

module.exports = router;
