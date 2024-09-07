// pages/api/db.js
import {
  getAllPhoneNumbers,
  getCodeByPhoneNumberOrId,
  getPhoneNumberById,
  insertPhoneCode,
  updatePhoneCode,
  deletePhoneCode,
} from "../../services/dbService";
import Cors from "cors";

// 初始化 CORS 中间件
const cors = Cors({
  methods: ["GET", "POST", "PUT", "DELETE"],
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

export default async function handler(req, res) {
  // 运行 CORS 中间件
  await runMiddleware(req, res, cors);

  const { method, query, body } = req;

  switch (method) {
    case "GET":
      if (query.phoneNumber) {
        // 根据号码或 ID 查询 code
        getCodeByPhoneNumberOrId(query.phoneNumber, (err, row) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.status(200).json(row);
        });
      } else if (query.single) {
        // 获取单个号码
        getPhoneNumberById(query.single, (err, row) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.status(200).json(row);
        });
      } else {
        // 查询所有号码
        getAllPhoneNumbers((err, rows) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.status(200).json(rows);
        });
      }
      break;
    case "POST":
      // 插入新记录
      const { phoneNumber, code } = body;
      insertPhoneCode(phoneNumber, code, (err, id) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.status(201).json({ id });
      });
      break;
    case "PUT":
      // 更新记录
      const { id, phoneNumber: newPhoneNumber, code: newCode } = body;
      updatePhoneCode(id, newPhoneNumber, newCode, (err, changes) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.status(200).json({ changes });
      });
      break;
    case "DELETE":
      // 删除记录
      const { deleteId } = body;
      deletePhoneCode(deleteId, (err, changes) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.status(200).json({ changes });
      });
      break;
    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
