/**
 * author: zp
 * description: 粉丝模块
 * date: 2021/7/30
 */
const Router = require("koa-router");
const { Fans } = require("../../models/fans");
const { Auth } = require("../../../middlewares/auth");
const router = new Router({
  prefix: "/v1/fans",
});

// 关注用户
router.post("/follow", new Auth().m, async (ctx, next) => {
  const result = await Fans.follow({
    byFollowers: ctx.request.body.leader,
    followers: ctx.auth.uid,
  });

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

module.exports = router;
