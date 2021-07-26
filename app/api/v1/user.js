const Router = require("koa-router");
const { generateToken } = require("../../../core/util");
const { LoginType } = require("../../lib/enum");
const { User } = require("../../models/user");
const {
  TokenValidator,
  RegisterValidator,
  AuthorRankingValidator,
} = require("../../validators/validator");
const { Auth } = require("../../../middlewares/auth");
const { WXManager } = require("../../services/wx");
const { success } = require("../../lib/helper");

const router = new Router({
  prefix: "/v1/user",
});

router.post("/login", async (ctx) => {
  const v = await new TokenValidator().validate(ctx);

  let token;
  let data;
  switch (v.get("body.type")) {
    case LoginType.USER_EMAIL:
      token = await emailLogin(v.get("body.account"), v.get("body.secret"));

      if (!token) return;

      data = await User.getUserInfo(v.get("body.account"));

      break;
    case LoginType.USER_MINI_PROGRAM:
      token = await WXManager.codeToToken(v.get("body.account"));
      break;
    case LoginType.ADMIN_EMAIL:
      break;
    default:
      throw new global.errs.ParameterException("没有相应的处理函数");
  }

  ctx.body = {
    code: 200,
    msg: "ok",
    error_code: 0,
    token,
    data,
  };
});

router.post("/register", async (ctx) => {
  const v = await new RegisterValidator().validate(ctx);

  const user = {
    email: v.get("body.email"),
    password: v.get("body.password"),
    nickname: v.get("body.nickname"),
    avatar: global.config.dev_host + "/default_avatar.png",
  };

  await User.create(user);

  success();
});

router.get("/ranklist", async (ctx) => {
  const v = await new AuthorRankingValidator().validate(ctx);

  const content = {
    profession: v.get("query.profession") || "",
  };

  let result = null;

  if (!content.profession) {
    result = await User.getUserRankList();
  } else {
    result = await new User().getUserAllRankList();
  }

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

async function emailLogin(account, secret) {
  const user = await User.verifyEmailPassword(account, secret);
  return (token = generateToken(user.id, Auth.USER));
}

module.exports = router;
