import { message } from "antd";
// import { getCodeByPhoneNumber } from "../../services/dbService";
import { getCodeByPhoneNumber } from "../../services/pgService";
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
function getCodeByPhoneNumberPromise(phonenumber) {
  return new Promise((resolve, reject) => {
    getCodeByPhoneNumber(phonenumber, (err, rows) => {
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
  const { phonenumber } = query;

  switch (method) {
    case "GET":
      try {
        // 等待 getPhoneNumbersByStatus 完成
        const rows = await getCodeByPhoneNumberPromise(phonenumber);
        console.log("getcodeRes:", rows);

        res.status(200).json({ rows, message: "success", codeStatus: 200 });
      } catch (err) {
        console.log("getPhoneNumbersByStatus", err);

        res.status(500).json({ error: err.message });
      }
      break;
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
