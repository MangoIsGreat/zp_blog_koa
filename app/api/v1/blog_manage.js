const Router = require("koa-router");
const { Blog } = require("../../models/blog");
const { success } = require("../../lib/helper");
const { Auth } = require("../../../middlewares/auth");
const {
  BlogValidator,
  RecommendValidator,
} = require("../../validators/validator");
const router = new Router({
  prefix: "/v1/admin/blog",
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
  const { pageIndex, pageSize } = ctx.request.query;

  const blogList = await Blog.getAllBlogList(pageIndex, pageSize);

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

  const blogItem = await Blog.getArticle(ctx.query.id, uid);

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: blogItem,
  };
});

// 删除博客
router.post("/delete", new Auth().m, async (ctx, next) => {
  const v = await new RecommendValidator().validate(ctx);

  const result = await Blog.deleteBlog(v.get("body.id"), ctx.auth.uid);

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

// 获取某一篇博客
router.get("/findBlog", new Auth().m, async (ctx, next) => {
  const v = await new RecommendValidator().validate(ctx);

  const result = await Blog.getBlog(v.get("query.id"), ctx.auth.uid);

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: result,
  };
});

module.exports = router;
