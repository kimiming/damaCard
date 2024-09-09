// import { insertMultiplePhone } from "../../services/dbService";
import { insertMultiplePhone } from "../../services/pgService";
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

// 辅助函数：包装 insertMultiplePhone 为 Promise
function insertMultiplePhonePromise(phoneRecords) {
  return new Promise((resolve, reject) => {
    insertMultiplePhone(phoneRecords, (err, rows) => {
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
        const { phoneNumberTable } = body;
        if (phoneNumberTable.length <= 0) {
          return res.status(400).json({
            error: "Missing required parameters: phoneNumber and phoneStatus",
          });
        }

        // 等待 insertMultiplePhone 完成
        const rows = await insertMultiplePhonePromise(phoneNumberTable);
        res.status(200).json({ rows, message: "Insert All phone success" });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
      break;
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
