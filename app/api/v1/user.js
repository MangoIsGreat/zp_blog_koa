const Router = require("koa-router");
const { generateToken } = require("../../../core/util");
const { LoginType } = require("../../lib/enum");
const { User } = require("../../models/user");
const { Fans } = require("../../models/fans");
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
  let type = Number(v.get("body.type"));
  switch (type) {
    case LoginType.USER_EMAIL:
      token = await emailLogin(v.get("body.account"), v.get("body.secret"));

      if (!token) return;

      data = await User.getLoginUserInfo(v.get("body.account"));

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

// 获取用户列表
router.get("/userlist", async (ctx) => {
  const result = await User.getUserList(ctx.request.query);

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

// 获取用户信息
router.get("/userInfo", new Auth().m, async (ctx) => {
  const content = {
    id: ctx.auth.uid,
  };

  const result = await User.findOne({ where: content });

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

// 封禁用户
router.post("/forbid", new Auth(900).m, async (ctx) => {
  const result = await User.forbidUser(ctx.request.body);

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

// 获取用户信息(管理后台)
router.get("/admin/userInfo", new Auth().m, async (ctx) => {
  const result = await User.findOne({
    where: {
      id: ctx.request.query.id,
    },
  });

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

// 获取用户关注列表(管理后台)
router.get("/admin/userInfo/attention", new Auth().m, async (ctx) => {
  const { id, pageIndex, pageSize } = ctx.request.query;

  const users = await Fans.findAll({
    where: {
      followers: id,
      isFollower: true,
    },
    limit: Number(pageSize),
    offset: (Number(pageIndex) - 1) * Number(pageSize),
  });

  const result = [];
  for (let i = 0; i < users.length; i++) {
    const data = await User.findOne({
      where: {
        id: users[i].byFollowers,
      },
    });

    result.push(data);
  }

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: {
      count: result.length,
      rows: result,
    },
  };
});

// 获取用户粉丝列表(管理后台)
router.get("/admin/userInfo/fans", new Auth().m, async (ctx) => {
  const { id, pageIndex, pageSize } = ctx.request.query;

  const users = await Fans.findAll({
    where: {
      byFollowers: id,
      isFollower: true,
    },
    limit: Number(pageSize),
    offset: (Number(pageIndex) - 1) * Number(pageSize),
  });

  const result = [];
  for (let i = 0; i < users.length; i++) {
    const data = await User.findOne({
      where: {
        id: users[i].followers,
      },
    });

    result.push(data);
  }

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: {
      count: result.length,
      rows: result,
    },
  };
});

async function emailLogin(account, secret) {
  const user = await User.verifyEmailPassword(account, secret);
  return (token = generateToken(user.id, Auth.USER));
}

module.exports = router;
