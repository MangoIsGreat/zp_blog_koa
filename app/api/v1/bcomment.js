/**
 * author: zp
 * description: 博客评论功能
 * date: 2021/7/29
 */
const Router = require("koa-router");
const { Auth } = require("../../../middlewares/auth");
const { BComment } = require("../../models/bComment");
const { BReply } = require("../../models/bReply");
const { CLike } = require("../../models/cLike");
const { RLike } = require("../../models/rLike");
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
router.get("/list", new Auth().getUID, async (ctx, next) => {
  const v = await new BcommentListValidator().validate(ctx);
  const content = {
    blogId: v.get("query.blog"),
  };

  // 评论列表
  let result = await BComment.getList(content);

  // 评论点赞记录
  let records = null;
  if (ctx.auth && ctx.auth.uid) {
    records = await CLike.getRecord({ userId: ctx.auth.uid });

    records = JSON.parse(JSON.stringify(records));
  }

  // 博客评论回复记录
  let replyRecord = null;
  if (ctx.auth && ctx.auth.uid) {
    replyRecord = await RLike.getRecord({ userId: ctx.auth.uid });

    replyRecord = JSON.parse(JSON.stringify(replyRecord));
  }

  result = JSON.parse(JSON.stringify(result));

  for (let i = 0; i < result.length; i++) {
    result[i].isLike = false;

    // 添加评论数量的字段信息
    // const data = await BComment.getCommentList(blogList.rows[i].id);
    // blogList.rows[i].commentNum = data.length;

    // 当前用户是否已经点赞该博客
    if (ctx.auth && ctx.auth.uid) {
      for (let j = 0; j < records.length; j++) {
        if (result[i].id === records[j].commentId) {
          result[i].isLike = true;
        }
      }
    }

    // 博客评论回复部分
    for (let m = 0; m < result[i].child.length; m++) {
      result[i].child[m].isLike = false;

      if (ctx.auth && ctx.auth.uid) {
        for (let n = 0; n < replyRecord.length; n++) {
          if (result[i].child[m].id === replyRecord[n].replyId) {
            result[i].child[m].isLike = true;
          }
        }
      }
    }
  }

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

module.exports = router;
