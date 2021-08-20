/**
 * author: zp
 * description: 收藏集模块
 * date: 2021/7/31
 */
const Router = require("koa-router");
const { Collection } = require("../../models/collection");
const { Blog } = require("../../models/blog");
const { CollectHistory } = require("../../models/collectHistory");
const { Auth } = require("../../../middlewares/auth");
const {
  CreateCollectionValidator,
  CollectionListValidator,
  CollectBlogValidator,
} = require("../../validators/validator");
const router = new Router({
  prefix: "/v1/collect",
});

// 创建收藏集
router.post("/create", new Auth().m, async (ctx, next) => {
  const v = await new CreateCollectionValidator().validate(ctx);

  const result = await Collection.createCollection({
    userId: ctx.auth.uid,
    type: v.get("body.type"),
  });

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

// 获取收藏集列表
router.get("/list", new Auth().m, async (ctx, next) => {
  const v = await new CollectionListValidator().validate(ctx);
  // 获取用户的所有收藏集
  let result = await Collection.getCollection({
    userId: ctx.auth.uid,
  });

  result = JSON.parse(JSON.stringify(result));

  for (let i = 0; i < result.length; i++) {
    const his = await CollectHistory.findOne({
      where: {
        collectionId: result[i].id,
        userId: ctx.auth.uid,
      },
    });

    result[i].isCollection = false;

    if (his && his.collectionId === v.get("query.collectionId"))
      result[i].isCollection = true;
  }

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

// 收藏文章
router.post("/blog", new Auth().m, async (ctx, next) => {
  const v = await new CollectBlogValidator().validate(ctx);

  const result = await CollectHistory.collectBlog({
    userId: ctx.auth.uid,
    blogId: v.get("body.blogId"),
    collectionId: v.get("body.collectionId"),
    collectType: v.get("body.collectType"),
  });

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

// 获取用户已经收藏过的文章列表
router.get("/blog/list", new Auth().getUID, async (ctx, next) => {
  const v = await new CollectionListValidator().validate(ctx);

  let result = await CollectHistory.getCollectionBlog({
    collectionId: v.get("query.collectionId"),
    pageIndex: ctx.request.query.pageIndex,
    pageSize: ctx.request.query.pageSize,
  });

  result = JSON.parse(JSON.stringify(result));

  const collections = [];

  for (let i = 0; i < result.rows.length; i++) {
    const data = await Blog.getOneBlog(result.rows[i].blogId);

    result.rows[i].Blog = data;

    if (!data) continue;

    collections.push(result.rows[i]);
  }

  // 收藏夹的相关信息
  let collectionInfo = await Collection.getCollectionInfo(
    v.get("query.collectionId")
  );
  collectionInfo = JSON.parse(JSON.stringify(collectionInfo));

  // 标记当前用户是否是收藏夹主人
  collectionInfo.isSelf = false;

  if (ctx.auth && ctx.auth.uid) {
    collectionInfo.userId === ctx.auth.uid
      ? (collectionInfo.isSelf = true)
      : null;
  }

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: collections,
    count: result.count,
    info: collectionInfo,
  };
});

// 更新收藏夹的名字
router.post("/edit", new Auth().m, async (ctx, next) => {
  const v = await new CollectionListValidator().validate(ctx);

  const data = await Collection.updateName(
    v.get("body.collectionId"),
    ctx.auth.uid,
    v.get("body.name")
  );

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: data,
  };
});

// 删除收藏夹
router.post("/delete", new Auth().m, async (ctx, next) => {
  const v = await new CollectionListValidator().validate(ctx);

  const data = await Collection.deleteCollection(
    v.get("body.collectionId"),
    ctx.auth.uid
  );

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: data,
  };
});

module.exports = router;
