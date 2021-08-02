/**
 * author: zp
 * description: 动态评论功能
 * date: 2021/8/1
 */
const Router = require("koa-router");
const { Auth } = require("../../../middlewares/auth");
const { DComment } = require("../../models/dComment");
const { DReply } = require("../../models/dReply");
const { CDLike } = require("../../models/cDLike");
const { RDLike } = require("../../models/rDLike");
const {
  DcommentValidator,
  DReplyValidator,
  DcommentListValidator,
} = require("../../validators/validator");
const router = new Router({
  prefix: "/v1/dcomment",
});

// 评论动态
router.post("/comment", new Auth().m, async (ctx, next) => {
  const v = await new DcommentValidator().validate(ctx);
  const content = {
    dynamicId: v.get("body.dynamic"),
    content: v.get("body.content"),
    fromId: ctx.auth.uid,
  };

  const result = await DComment.comment(content);

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

// 回复"动态评论"
router.post("/reply", new Auth().m, async (ctx, next) => {
  const v = await new DReplyValidator().validate(ctx);
  const content = {
    dynamicId: v.get("body.dynamicId"),
    commentId: v.get("body.commentId"),
    content: v.get("body.content"),
    toUid: v.get("body.toUid"),
    fromUid: ctx.auth.uid,
  };

  const result = await DReply.reply(content);

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

// 获取动态评论列表
router.get("/list", new Auth().getUID, async (ctx, next) => {
  const v = await new DcommentListValidator().validate(ctx);
  const content = {
    dynamicId: v.get("query.dynamicId"),
  };

  // 评论列表
  let result = await DComment.getList(content);

  // 评论点赞记录
  let records = null;
  if (ctx.auth && ctx.auth.uid) {
    records = await CDLike.getRecord({ userId: ctx.auth.uid });

    records = JSON.parse(JSON.stringify(records));
  }

  // 动态评论回复记录
  let replyRecord = null;
  if (ctx.auth && ctx.auth.uid) {
    replyRecord = await RDLike.getRecord({ userId: ctx.auth.uid });

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

    // 动态评论回复部分
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
