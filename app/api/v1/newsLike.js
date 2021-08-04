/**
 * author: zp
 * description: “资讯”点赞功能
 * date: 2021/8/4
 */
const Router = require("koa-router");
const { NewsLike } = require("../../models/newsLike");
const { Auth } = require("../../../middlewares/auth");
const router = new Router({
  prefix: "/v1/newslike",
});

// 点赞博客
router.post("/like", new Auth().m, async (ctx, next) => {
  const result = await NewsLike.likeNews({
    newsId: ctx.request.body.newsId,
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
