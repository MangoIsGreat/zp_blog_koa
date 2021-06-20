const bcrypt = require("bcrypt");
const Router = require("koa-router");
const { RegisterValidator } = require("../../validators/validator");
const { User } = require("../../models/user");

const router = new Router({
  prefix: "/v1/user",
});

router.post("/register", async (ctx) => {
  const v = await new RegisterValidator().validate(ctx);
  const salt = bcrypt.genSaltSync(10);
  const psw = bcrypt.hashSync(v.get("body.password2"), salt);
  const user = {
    email: v.get("body.email"),
    password: psw,
    nickname: v.get("body.nickname"),
  };

  User.create(user);
});

module.exports = router;
