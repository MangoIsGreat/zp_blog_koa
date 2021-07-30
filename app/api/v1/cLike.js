/**
 * author: zp
 * description: “博客评论”点赞功能(comment like)
 * date: 2021/7/30
 */
const Router = require("koa-router");
const { CLike } = require("../../models/cLike");
const { Auth } = require("../../../middlewares/auth");
const router = new Router({
  prefix: "/v1/clike",
});

// 点赞博客评论
router.post("/like", new Auth().m, async (ctx, next) => {
  const result = await CLike.likeComment({
    commentId: ctx.request.body.commentId,
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
