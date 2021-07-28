/**
 * author: zp
 * description: 博客评论功能
 * date: 2021/7/29
 */
const Router = require("koa-router");
const { Auth } = require("../../../middlewares/auth");
const { BComment } = require("../../models/bComment");
const { BReply } = require("../../models/bReply");
const {
  BcommentValidator,
  BcommentListValidator,
  BReplyValidator,
} = require("../../validators/validator");
const router = new Router({
  prefix: "/v1/bcomment",
});

// 评论博客
router.post("/comment", new Auth().m, async (ctx, next) => {
  const v = await new BcommentValidator().validate(ctx);
  const content = {
    blogId: v.get("body.blog"),
    content: v.get("body.content"),
    fromId: ctx.auth.uid,
  };

  const result = await BComment.comment(content);

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

// 回复"博客评论"
router.post("/reply", new Auth().m, async (ctx, next) => {
  const v = await new BReplyValidator().validate(ctx);
  const content = {
    blogId: v.get("body.blog"),
    commentId: v.get("body.comment"),
    content: v.get("body.content"),
    toUid: v.get("body.toUid"),
    fromUid: ctx.auth.uid,
  };

  const result = await BReply.reply(content);

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

// 获取博客评论列表
router.get("/list", async (ctx, next) => {
  const v = await new BcommentListValidator().validate(ctx);
  const content = {
    blogId: v.get("query.blog"),
  };

  const result = await BComment.getList(content);

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

module.exports = router;
