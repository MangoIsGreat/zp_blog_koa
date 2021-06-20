const Router = require("koa-router");
const router = new Router();

const { PositiveIntegerValidator } = require("../../validators/validator.js");

router.post("/v1/:id/classic/latest", async (ctx, next) => {
  const v = await new PositiveIntegerValidator().validate(ctx);
});

module.exports = router;
