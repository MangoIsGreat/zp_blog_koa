/**
 * author: zp
 * description: “动态”点赞功能
 * date: 2021/8/1
 */
const Router = require("koa-router");
const { DLike } = require("../../models/dlike");
const { Auth } = require("../../../middlewares/auth");
const router = new Router({
  prefix: "/v1/dlike",
});

// 点赞动态
router.post("/like", new Auth().m, async (ctx, next) => {
  const result = await DLike.likeDynamic({
    dynamic: ctx.request.body.dynamic,
    user: ctx.auth.uid,
  });

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

module.exports = router;
