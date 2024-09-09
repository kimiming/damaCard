import { insertPhone } from "../../services/pgService";
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
function insertPhonePromise(
  phonenumber,
  code,
  codestatus,
  phonestatus,
  log,
  createTime
) {
  return new Promise((resolve, reject) => {
    insertPhone(
      phonenumber,
      code,
      codestatus,
      phonestatus,
      log,
      createTime,
      (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      }
    );
  });
}

export default async function handler(req, res) {
  // 运行 CORS 中间件
  await runMiddleware(req, res, cors);

  const { method, body } = req;

  switch (method) {
    case "POST":
      try {
        const { phonenumber, code, codestatus, phonestatus, log, createtime } =
          body;
        if (!phonenumber || !phonestatus) {
          return res.status(400).json({
            error: "Missing required parameters: phoneNumber and phoneStatus",
          });
        }

        // 等待 insertPhone 完成
        const rows = await insertPhonePromise(
          phonenumber,
          code,
          codestatus,
          phonestatus,
          log,
          createtime
        );
        res
          .status(200)
          .json({ rows, message: "Insert phone success", code: 200 });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
      break;
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
