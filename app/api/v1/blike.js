/**
 * author: zp
 * description: “博客”点赞功能
 * date: 2021/6/23
 */
const Router = require("koa-router");
const { BLike } = require("../../models/blike");
const { Auth } = require("../../../middlewares/auth");
const router = new Router({
  prefix: "/v1/blike",
});

// 点赞博客
router.post("/like", new Auth().m, async (ctx, next) => {
  const result = await BLike.likeBlog({
    blog: ctx.request.body.blog,
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
