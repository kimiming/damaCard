import { message } from "antd";
// import { getPhoneNumbersByStatus } from "../../services/dbService";
import { getPhoneNumbersByStatus } from "../../services/pgService";
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

// 辅助函数：包装 getPhoneNumbersByStatus 为 Promise
function getPhoneNumbersByStatusPromise(phoneStatus) {
  return new Promise((resolve, reject) => {
    getPhoneNumbersByStatus(phoneStatus, (err, rows) => {
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

  const { method, query } = req;
  const { phoneStatus } = query;

  switch (method) {
    case "GET":
      try {
        // 等待 getPhoneNumbersByStatus 完成
        const rows = await getPhoneNumbersByStatusPromise(phoneStatus);
        res.status(200).json({ rows, message: "success" });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
      break;
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
