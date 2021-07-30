/**
 * author: zp
 * description: “博客评论回复”点赞功能(reply like)
 * date: 2021/7/31
 */
const Router = require("koa-router");
const { RLike } = require("../../models/rLike");
const { Auth } = require("../../../middlewares/auth");
const router = new Router({
  prefix: "/v1/rlike",
});

// 点赞博客评论回复
router.post("/like", new Auth().m, async (ctx, next) => {
  const result = await RLike.likeReply({
    replyId: ctx.request.body.replyId,
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
