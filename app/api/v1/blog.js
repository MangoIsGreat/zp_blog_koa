const Router = require("koa-router");
const { Blog } = require("../../models/blog");
const { BLike } = require("../../models/blike");
const { success } = require("../../lib/helper");
const { Auth } = require("../../../middlewares/auth");
const {
  BlogValidator,
  RecommendValidator,
} = require("../../validators/validator");
const router = new Router({
  prefix: "/v1/blog",
});

// 创建博客
router.post("/create", new Auth().m, async (ctx, next) => {
  const v = await new BlogValidator().validate(ctx);
  const content = {
    title: v.get("body.title"),
    content: v.get("body.content"),
    description: v.get("body.description"),
    tag: v.get("body.tag"),
    titlePic: v.get("body.titlePic"),
    author: ctx.auth.uid,
  };

  await new Blog().createBlog(content);

  success();
});

// 获取博客列表
router.get("/list", new Auth().getUID, async (ctx, next) => {
  let params = {};
  const { tag, rankingType, pageIndex, pageSize } = ctx.query;

  // 根据标签类型查找
  if (tag) {
    params["tag"] = tag * 1; //隐式类型转换
  }

  // 如果为推荐类型：
  if (tag * 1 === 10000) params = null;

  let blogList = await Blog.getHomePageBlogList(
    { where: params },
    rankingType,
    pageIndex,
    pageSize
  );

  let records = null;
  if (ctx.auth && ctx.auth.uid) {
    records = await BLike.getRecord({ user: ctx.auth.uid });

    records = JSON.parse(JSON.stringify(records));
  }

  blogList = JSON.parse(JSON.stringify(blogList));

  // 添加当前用户是否点赞的标记
  blogList.rows.map((item) => {
    item.isLike = false;

    ctx.auth &&
      ctx.auth.uid &&
      records.rows.forEach((t) => {
        if (item.id === t.blog) {
          item.isLike = true;
        }
      });
  });

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: blogList,
  };
});

// 相关推荐
router.get("/recommend", async (ctx, next) => {
  const v = await new RecommendValidator().validate(ctx);
  const content = {
    profession: v.get("query.profession"),
  };

  const recomBlogList = await new Blog().getRecomList(content);

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: recomBlogList,
  };
});

// 热门文章
router.get("/hot", async (ctx, next) => {
  const v = await new RecommendValidator().validate(ctx);
  const content = {
    profession: v.get("query.profession"),
  };

  const hotBlogList = await new Blog().getHotList(content);

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: hotBlogList,
  };
});

// 获取某一篇文章
router.get("/article", async (ctx, next) => {
  const hotBlogList = await Blog.getArticle(ctx.query.id);

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: hotBlogList,
  };
});

module.exports = router;
