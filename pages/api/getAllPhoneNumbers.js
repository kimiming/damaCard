import { getAllPhoneNumbers } from "../../services/dbService";
import Cors from "cors";

// 初始化 CORS 中间件
const cors = Cors({
  methods: ["GET"],
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

// 辅助函数：包装 getAllPhoneNumbers 为 Promise
function getAllPhoneNumbersPromise(callback) {
  return new Promise((resolve, reject) => {
    getAllPhoneNumbers((err, rows) => {
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
    case "GET":
      try {
        // 等待 getAllPhoneNumbers 完成
        const rows = await getAllPhoneNumbersPromise();
        res.status(200).json(rows);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
      break;
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
