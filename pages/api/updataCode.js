import { insertUpdateCode } from "../../services/dbService";
import Cors from "cors";

// 初始化 CORS 中间件
const cors = Cors({
  methods: ["POST"],
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

// 辅助函数：包装 insertPhone 为 Promise
function insertUpdateCodePromise(phoneNumber, code) {
  return new Promise((resolve, reject) => {
    insertUpdateCode(phoneNumber, code, (err, rows) => {
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

  const { method, body } = req;

  switch (method) {
    case "POST":
      try {
        const { phoneNumber, code } = body;
        if (!phoneNumber || !code) {
          return res.status(400).json({
            error: "Missing required parameters: phoneNumber and phoneStatus",
          });
        }

        // 等待 insertPhone 完成
        const rows = await insertUpdateCodePromise(phoneNumber, code);
        res
          .status(200)
          .json({ rows, message: "Insert code success", code: 200 });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
      break;
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
