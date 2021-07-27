/**
 * author: zp
 * description: “博客”点赞功能
 * date: 2021/6/23
 */
const Router = require("koa-router");
const { BLike } = require("../../models/blike");
const { success } = require("../../lib/helper");
const { Auth } = require("../../../middlewares/auth");
// const { BLikeValidator } = require("../../validators/validator");
const router = new Router({
  prefix: "/v1/blike",
});

// 点赞动态
router.post("/like", new Auth().m, async (ctx, next) => {
  const result = await BLike.likeBlog({
    blog: ctx.request.body.blog,
    user: ctx.auth.uid,
  });

  // if (!result) {
  //   throw new global.errs.ForbidOperate("您已经点过赞了！");
  // }

  // success();

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

module.exports = router;
