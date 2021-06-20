const Router = require("koa-router");
const { RegisterValidator } = require("../../validators/validator");

const router = new Router({
  prefix: "/v1/user",
});

router.post("/register", async (ctx) => {
  const v = new RegisterValidator().validate(ctx);
//   console.log(v)
//   ctx.body = {
//       aaa: "aaa"
//   }
});

module.exports = router;
