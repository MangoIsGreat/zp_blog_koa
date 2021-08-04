const Router = require("koa-router");
const { News } = require("../../models/news");
const { NewsLike } = require("../../models/newsLike");
// const { BComment } = require("../../models/bComment");
const { success } = require("../../lib/helper");
const { Auth } = require("../../../middlewares/auth");
const {
  NewsValidator,
  RecommendNewsValidator,
} = require("../../validators/validator");
const router = new Router({
  prefix: "/v1/news",
});

// 创建资讯
router.post("/create", new Auth().m, async (ctx, next) => {
  const v = await new NewsValidator().validate(ctx);
  const content = {
    title: v.get("body.title"),
    content: v.get("body.content"),
    description: v.get("body.description"),
    tag: v.get("body.tag"),
    titlePic: v.get("body.titlePic"),
    author: ctx.auth.uid,
  };

  await News.createNews(content);

  success();
});

// 获取资讯列表
router.get("/list", new Auth().getUID, async (ctx, next) => {
  let params = {};
  const { tagType, rankingType, pageIndex, pageSize } = ctx.query;

  // 根据标签类型查找
  if (tagType) {
    params["tag"] = tagType * 1; //隐式类型转换
  }

  // 如果为"全部"类型：
  if (tagType * 1 === 20000) params = null;

  let newsList = await News.getHomePageNewsList(
    { where: params },
    rankingType,
    pageIndex,
    pageSize
  );

  let records = null;
  if (ctx.auth && ctx.auth.uid) {
    records = await NewsLike.getRecord({ user: ctx.auth.uid });

    records = JSON.parse(JSON.stringify(records));
  }

  newsList = JSON.parse(JSON.stringify(newsList));

  for (let i = 0; i < newsList.rows.length; i++) {
    newsList.rows[i].isLike = false;

    // 添加评论数量的字段信息
    // const data = await BComment.getCommentList(blogList.rows[i].id);
    // blogList.rows[i].commentNum = data.length;

    // 当前用户是否已经点赞该博客
    if (ctx.auth && ctx.auth.uid) {
      for (let j = 0; j < records.rows.length; j++) {
        if (newsList.rows[i].id === records.rows[j].newsId) {
          newsList.rows[i].isLike = true;
        }
      }
    }
  }

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: newsList,
  };
});

// 热门资讯
router.get("/hot", new Auth().getUID, async (ctx, next) => {
  const v = await new RecommendNewsValidator().validate(ctx);
  const content = {
    newsId: v.get("query.id"),
  };

  let hotNewsList = await News.getHotList(content);

  hotNewsList = JSON.parse(JSON.stringify(hotNewsList));

  let records = null;
  if (ctx.auth && ctx.auth.uid) {
    records = await NewsLike.getRecord({ user: ctx.auth.uid });

    records = JSON.parse(JSON.stringify(records));
  }

  for (let i = 0; i < hotNewsList.rows.length; i++) {
    hotNewsList.rows[i].isLike = false;

    // 添加评论数量的字段信息
    // const data = await BComment.getCommentList(hotBlogList.rows[i].id);
    // hotBlogList.rows[i].commentNum = data.length;

    // 当前用户是否已经点赞该博客
    if (ctx.auth && ctx.auth.uid) {
      for (let j = 0; j < records.rows.length; j++) {
        if (
          hotNewsList.rows[i].id === records.rows[j].newsId &&
          records.rows[j].isLike
        ) {
          hotNewsList.rows[i].isLike = true;
        }
      }
    }
  }

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: hotNewsList,
  };
});

// 相关资讯推荐
router.get("/more", new Auth().getUID, async (ctx, next) => {
  const v = await new RecommendNewsValidator().validate(ctx);
  const content = {
    newsID: v.get("query.id"),
    pageIndex: v.get("query.pageIndex"),
    pageSize: v.get("query.pageSize"),
  };

  let newsList = await News.relatedList(content);

  newsList = JSON.parse(JSON.stringify(newsList));

  let records = null;
  if (ctx.auth && ctx.auth.uid) {
    records = await NewsLike.getRecord({ user: ctx.auth.uid });

    records = JSON.parse(JSON.stringify(records));
  }

  for (let i = 0; i < newsList.rows.length; i++) {
    newsList.rows[i].isLike = false;

    // 添加评论数量的字段信息
    // const data = await BComment.getCommentList(blogList.rows[i].id);
    // blogList.rows[i].commentNum = data.length;

    // 当前用户是否已经点赞该博客
    if (ctx.auth && ctx.auth.uid) {
      for (let j = 0; j < records.rows.length; j++) {
        if (newsList.rows[i].id === records.rows[j].newsId) {
          newsList.rows[i].isLike = true;
        }
      }
    }
  }

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: newsList,
  };
});

// 获取某一篇资讯
router.get("/article", new Auth().getUID, async (ctx, next) => {
  let uid = "";
  if (ctx.auth && ctx.auth.uid) {
    uid = ctx.auth.uid;
  }

  const newsItem = await News.getNews(ctx.query.id, uid);

  ctx.body = {
    code: 200,
    error_code: 0,
    msg: "ok",
    data: newsItem,
  };
});

module.exports = router;
