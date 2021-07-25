// 生成随机字符串：
const randomString = () => {
  const str = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 10; i > 0; --i)
    result += str[Math.floor(Math.random() * str.length)];
  return result;
};

module.exports = {
  randomString,
};
