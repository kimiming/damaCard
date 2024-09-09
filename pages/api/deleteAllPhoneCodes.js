// import { deleteAllPhoneCodes } from "../../services/dbService";
import { deleteAllPhoneNumbers } from "../../services/pgService";
import Cors from "cors";

// 初始化 CORS 中间件
const cors = Cors({
  methods: ["DELETE"],
});

// 辅助函数：处理 CORS 请求
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// 辅助函数：包装 deleteAllPhoneNumbers 为 Promise
function deleteAllPhoneNumbersPromise(callback) {
  return new Promise((resolve, reject) => {
    deleteAllPhoneNumbers((err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

export default async function handler(req, res) {
  // 运行 CORS 中间件
  await runMiddleware(req, res, cors);

  const { method } = req;

  switch (method) {
    case "DELETE":
      try {
        // 等待 deleteAllPhoneNumbers 完成
        await deleteAllPhoneNumbersPromise();
        res.status(200).json({ msg: "成功删除所有电话号码" });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
      break;
    default:
      res.setHeader("Allow", ["DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
