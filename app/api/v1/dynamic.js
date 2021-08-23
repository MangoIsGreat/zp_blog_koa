const Router = require("koa-router");
const { Dynamic } = require("../../models/dynamic");
const { success } = require("../../lib/helper");
const { Auth } = require("../../../middlewares/auth");
const { Fans } = require("../../models/fans");
const { DLike } = require("../../models/dlike");
const { DynamicValidator, DcommentListValidator } = require("../../validators/validator");
const router = new Router({
  prefix: "/v1/dynamic",
});

// 创建动态
router.post("/create", new Auth().m, async (ctx, next) => {
  const v = await new DynamicValidator().validate(ctx);
  const content = {
    theme: v.get("body.theme") || "",
    content: v.get("body.content"),
    picUrl: v.get("body.picUrl"),
    author: ctx.auth.uid,
  };

  await new Dynamic().createDynamic(content);

  success();
});

// 获取动态列表
router.get("/list", new Auth().getUID, async (ctx, next) => {
  let dynamicList = [];
  if (ctx.request.query.type !== "attention") {
    // 如果“动态”类型不为“关注”
    dynamicList = await Dynamic.getDynamicList(ctx.request.query);
  } else if (
    ctx.request.query.type === "attention" &&
    ctx.auth &&
    ctx.auth.uid
  ) {
    // 如果“动态”类型为“关注”
    dynamicList = await Dynamic.getAttentionDynamic({
      uid: ctx.auth.uid,
      pageIndex: ctx.request.query.pageIndex,
      pageSize: ctx.request.query.pageSize,
    });
  }

  dynamicList = JSON.parse(JSON.stringify(dynamicList));

  for (let i = 0; i < dynamicList.length; i++) {
    // 标记是否已建立"关注关系"
    let isAttention = false;
    // 标记是否是用户本人
    let isSelf = false;
    if (ctx.auth && ctx.auth.uid) {
      const attention = await Fans.findOne({
        where: {
          byFollowers: dynamicList[i].author,
          followers: ctx.auth.uid,
        },
      });

      if (attention && attention.isFollower) {
        isAttention = true;
      }

      if (dynamicList[i].userInfo.id === ctx.auth.uid) {
        isSelf = true;
      }
    }

    dynamicList[i].isSelf = isSelf;

    dynamicList[i].isAttention = isAttention;
  }

  // 添加是否点赞标记
  let records = null;
  if (ctx.auth && ctx.auth.uid) {
    records = await DLike.getRecord({ user: ctx.auth.uid });

    records = JSON.parse(JSON.stringify(records));
  }

  for (let i = 0; i < dynamicList.length; i++) {
    dynamicList[i].isLike = false;

    // 当前用户是否已经点赞该博客
    if (ctx.auth && ctx.auth.uid) {
      for (let j = 0; j < records.rows.length; j++) {
        if (dynamicList[i].id === records.rows[j].dynamic) {
          dynamicList[i].isLike = true;
        }
      }
    }
  }

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: dynamicList,
  };
});

// 获取精选动态列表
router.get("/favlist", async (ctx, next) => {
  const dynamicList = await Dynamic.getFavDynamicList();

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: dynamicList,
  };
});

// 获取某一篇文章
router.get("/dynamic", new Auth().getUID, async (ctx, next) => {
  let uid = "";
  if (ctx.auth && ctx.auth.uid) {
    uid = ctx.auth.uid;
  }

  const hotBlogList = await Dynamic.getDynamic(ctx.query.id, uid);

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: hotBlogList,
  };
});

// 删除某一条动态
router.post("/delete", new Auth().m, async (ctx, next) => {
  const v = await new DcommentListValidator().validate(ctx);

  const result = await Dynamic.deleteDyn(v.get("body.dynamicId"), ctx.auth.uid);

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

module.exports = router;
