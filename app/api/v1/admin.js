const Router = require("koa-router");
const { generateToken } = require("../../../core/util");
const { Admin } = require("../../models/admin");
const {
  AdminTokenValidator,
  AdminRegisterValidator,
} = require("../../validators/validator");
const { Auth } = require("../../../middlewares/auth");
const { success } = require("../../lib/helper");

const router = new Router({
  prefix: "/v1/admin",
});

router.post("/login", async (ctx) => {
  const v = await new AdminTokenValidator().validate(ctx);

  let token = await emailLogin(v.get("body.account"), v.get("body.secret"));

  if (!token) return;

  let data = await Admin.getLoginUserInfo(v.get("body.account"));

  ctx.body = {
    code: 200,
    msg: "ok",
    error_code: 0,
    token,
    data,
  };
});

router.post("/register", async (ctx) => {
  const v = await new AdminRegisterValidator().validate(ctx);

  const user = {
    email: v.get("body.email"),
    password: v.get("body.password"),
    nickname: v.get("body.nickname"),
    auth_type: v.get("body.auth_type"),
    avatar: global.config.dev_host + "/default_avatar.png",
  };

  await Admin.create(user);

  success();
});

// 获取用户信息
router.get("/userInfo", new Auth().m, async (ctx) => {
  const content = {
    id: ctx.auth.uid,
  };

  const result = await Admin.findOne(content);

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

async function emailLogin(account, secret) {
  const user = await Admin.verifyEmailPassword(account, secret);
  return (token = generateToken(user.id, user.auth_type));
}

module.exports = router;
