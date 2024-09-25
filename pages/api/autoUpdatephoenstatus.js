// import { getOneUnusePhoneNumber } from "../../services/dbService";

import { asPhonestatus1AndupdateTimeupdateCodeStatus } from "../../services/pgService";
import Cors from "cors";

// 初始化 CORS 中间件
const cors = Cors({
  methods: ["PUT"],
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

// 辅助函数：包装 getOneUnusePhoneNumber 为 Promise
function asPhonestatus1AndupdateTimeupdateCodeStatusPromise(callback) {
  return new Promise((resolve, reject) => {
    asPhonestatus1AndupdateTimeupdateCodeStatus((err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
}

export default async function handler(req, res) {
  // 运行 CORS 中间件
  await runMiddleware(req, res, cors);

  const { method } = req;

  switch (method) {
    case "PUT":
      try {
        // 等待 getAllPhoneNumbers 完成
        const rows = await asPhonestatus1AndupdateTimeupdateCodeStatusPromise();
        res.status(200).json({ ...rows, message: "success", codeStatus: 200 });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
      break;
    default:
      res.setHeader("Allow", ["PUT", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
