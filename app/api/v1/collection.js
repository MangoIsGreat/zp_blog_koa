/**
 * author: zp
 * description: 收藏集模块
 * date: 2021/7/31
 */
const Router = require("koa-router");
const { Collection } = require("../../models/collection");
const { CollectHistory } = require("../../models/collectHistory");
const { Auth } = require("../../../middlewares/auth");
const {
  CreateCollectionValidator,
  CollectionListValidator,
  CollectBlogValidator
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
  const result = await Collection.getCollection({
    userId: ctx.auth.uid,
  });

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
router.post("/blog/list", new Auth().m, async (ctx, next) => {
  const v = await new CollectionListValidator().validate(ctx);

  const result = await CollectHistory.getCollectionBlog({
    userId: ctx.auth.uid,
    collectionId: v.get("body.collectionId"),
    pageIndex: ctx.request.body.pageIndex,
    pageSize: ctx.request.body.pageSize,
  });

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

module.exports = router;
