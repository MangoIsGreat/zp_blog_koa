function isThisType(val) {
  for (let key in this) {
    if (this[key] == val) {
      return true;
    }
  }
  return false;
}

const LoginType = {
  USER_MINI_PROGRAM: 100,
  USER_EMAIL: 101,
  USER_MOBILE: 102,
  ADMIN_EMAIL: 200,
  isThisType,
};

// const tagType = {
//   RECOMMEND: 10000, // 推荐
//   ATTENTION: 10001, // 关注
//   FE: 10002, // 前端
//   BE: 10003, // 后端
//   ANDROID: 10004, // 安卓
//   IOS: 10005, // ios
//   AI: 10006, // 人工智能
//   TOOLS: 10007, // 开发工具
//   TEST: 10008, // 测试
//   isThisType,
// };

module.exports = {
  LoginType,
  // tagType,
};
