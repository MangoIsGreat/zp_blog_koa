const Router = require("koa-router");
const { Blog } = require("../../models/blog");
const { BLike } = require("../../models/blike");
const { BComment } = require("../../models/bComment");
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

  for (let i = 0; i < blogList.rows.length; i++) {
    blogList.rows[i].isLike = false;

    // 添加评论数量的字段信息
    const data = await BComment.getCommentList(blogList.rows[i].id);
    blogList.rows[i].commentNum = data.length;

    // 当前用户是否已经点赞该博客
    if (ctx.auth && ctx.auth.uid) {
      for (let j = 0; j < records.rows.length; j++) {
        if (blogList.rows[i].id === records.rows[j].blog) {
          blogList.rows[i].isLike = true;
        }
      }
    }
  }

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: blogList,
  };
});

// 热门文章
router.get("/hot", async (ctx, next) => {
  const v = await new RecommendValidator().validate(ctx);
  const content = {
    blog: v.get("query.id"),
  };

  const hotBlogList = await Blog.getHotList(content);

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: hotBlogList,
  };
});

// 相关文章推荐
router.get("/more", new Auth().getUID, async (ctx, next) => {
  const v = await new RecommendValidator().validate(ctx);
  const content = {
    blogID: v.get("query.id"),
    pageIndex: v.get("query.pageIndex"),
    pageSize: v.get("query.pageSize"),
  };

  let blogList = await Blog.relatedList(content);

  blogList = JSON.parse(JSON.stringify(blogList));

  let records = null;
  if (ctx.auth && ctx.auth.uid) {
    records = await BLike.getRecord({ user: ctx.auth.uid });

    records = JSON.parse(JSON.stringify(records));
  }

  for (let i = 0; i < blogList.rows.length; i++) {
    blogList.rows[i].isLike = false;

    // 添加评论数量的字段信息
    const data = await BComment.getCommentList(blogList.rows[i].id);
    blogList.rows[i].commentNum = data.length;

    // 当前用户是否已经点赞该博客
    if (ctx.auth && ctx.auth.uid) {
      for (let j = 0; j < records.rows.length; j++) {
        if (blogList.rows[i].id === records.rows[j].blog) {
          blogList.rows[i].isLike = true;
        }
      }
    }
  }

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: blogList,
  };
});

// 获取某一篇文章
router.get("/article", new Auth().getUID, async (ctx, next) => {
  let uid = "";
  if (ctx.auth && ctx.auth.uid) {
    uid = ctx.auth.uid;
  }

  const hotBlogList = await Blog.getArticle(ctx.query.id, uid);

  // const blogStatus = await BLike.findOne({
  //   where: {
  //     blog: ctx.query.id,
  //     user: ctx.auth.uid,
  //   },
  // });

  // console.log(blogStatus);

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: hotBlogList,
  };
});

module.exports = router;
