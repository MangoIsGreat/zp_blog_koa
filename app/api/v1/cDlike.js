/**
 * author: zp
 * description: “动态评论”点赞功能(comment like)
 * date: 2021/8/2
 */
const Router = require("koa-router");
const { CDLike } = require("../../models/cDLike");
const { Auth } = require("../../../middlewares/auth");
const router = new Router({
  prefix: "/v1/cDlike",
});

// 点赞博客评论
router.post("/like", new Auth().m, async (ctx, next) => {
  const result = await CDLike.likeComment({
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
