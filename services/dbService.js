// services/dbService.js
import sqlite3 from "sqlite3";
import path from "path";

const dbPath = path.resolve("./db/database.db");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS phone_codes (id INTEGER PRIMARY KEY AUTOINCREMENT, phoneNumber TEXT UNIQUE, code TEXT,codeStatus TEXT,phoneStatus TEXT,createTime TEXT,updateTime TEXT,desc TEXT)"
  );
});

// 获取所有数据
export const getAllPhoneNumbers = (callback) => {
  db.all(
    "SELECT id, code, phoneNumber,codeStatus,phoneStatus,createTime,updateTime,desc FROM phone_codes",
    (err, rows) => {
      if (err) {
        return callback(err);
      }
      console.log("Phone numbers:", rows);
      callback(null, rows);
    }
  );
};

// 根据phoneStatus获取相对应的所有的数据
export const getPhoneNumbersByStatus = (phoneStatus, callback) => {
  db.all(
    "SELECT id, code, phoneNumber,codeStatus,phoneStatus,createTime,updateTime,desc FROM phone_codes WHERE phoneStatus = ?",
    [phoneStatus],
    (err, rows) => {
      if (err) {
        return callback(err);
      }
      console.log("Phone numbers:", rows);
      callback(null, rows);
    }
  );
};

//输入手机号插入数据并更新phoneStatus
export const insertPhone = (phoneNumber, phoneStatus, callback) => {
  db.run(
    "INSERT INTO phone_codes (phoneNumber, phoneStatus,codeStatus,createTime) VALUES (?, ?,?,?)",
    [phoneNumber, phoneStatus, "0", new Date().toISOString()],
    function (err) {
      if (err) {
        if (err.code === "SQLITE_CONSTRAINT") {
          // 处理唯一性冲突
          return callback(new Error("Phone number already exists"));
        }
        return callback(err);
      }
      callback(null, this.lastID);
    }
  );
};

// 输入多个手机号插入数据并更新phoneStatus
export const insertMultiplePhone = (phoneRecords, callback) => {
  // 开始事务
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    const stmt = db.prepare(
      "INSERT INTO phone_codes (phoneNumber, phoneStatus,codeStatus,createTime) VALUES (?, ?,?,?)"
    );

    try {
      phoneRecords.forEach(({ phoneNumber, phoneStatus }) => {
        const createTime = new Date().toISOString();
        stmt.run([phoneNumber, phoneStatus, "0", createTime], function (err) {
          if (err) {
            if (err.code === "SQLITE_CONSTRAINT") {
              // 处理唯一性冲突
              throw new Error("Phone number already exists");
            } else {
              throw err;
            }
          }
        });
      });

      // 提交事务
      db.run("COMMIT", (err) => {
        if (err) {
          return callback(err);
        }
        callback(null, "All records inserted successfully");
      });
    } catch (e) {
      // 发生错误时回滚事务
      db.run("ROLLBACK", () => {
        callback(e);
      });
    } finally {
      stmt.finalize();
    }
  });
};

//根据phoneNumber来insert更新code
export const insertUpdateCode = (phoneNumber, code, callback) => {
  db.run(
    "UPDATE phone_codes SET code = ?, codeStatus = ?, phoneStatus = ?, updateTime = ? WHERE phoneNumber = ?",
    [code, "1", "2", new Date().toISOString(), phoneNumber],
    function (err) {
      if (err) {
        return callback(err);
      }
      callback(null, this.changes);
    }
  );
};

//根据phoneNumber来更新phoneStatus
export const updatePhoneStatus = (phoneNumber, phoneStatus, callback) => {
  db.run(
    "UPDATE phone_codes SET phoneStatus = ?, updateTime = ? WHERE phoneNumber = ?",
    [phoneStatus, new Date().toISOString(), phoneNumber],
    function (err) {
      if (err) {
        return callback(err);
      }
      callback(null, this.changes);
    }
  );
};

//根据phoneStatus的值为0来获取一个未使用的手机号
export const getOneUnusePhoneNumber = (callback) => {
  db.get(
    "SELECT id, phoneNumber FROM phone_codes WHERE phoneStatus = ? ORDER BY id LIMIT 1",
    ["0"],
    (err, row) => {
      if (err) {
        return callback(err);
      }
      if (!row) {
        return callback(new Error("No available phone number"));
      }
      updatePhoneStatus(row.phoneNumber, "1", (err, changes) => {
        if (err) {
          return callback(err);
        }
        console.log(`Updated ${changes} row`);
      });
      callback(null, row);
    }
  );
};
//根据phoneNumber来获取code
export const getCodeByPhoneNumber = (phoneNumber, callback) => {
  db.get(
    "SELECT code FROM phone_codes WHERE phoneNumber = ?",
    [phoneNumber],
    (err, row) => {
      if (err) {
        return callback(err);
      }
      if (!row) {
        return callback(new Error("Phone number not found"));
      }
      callback(null, row);
    }
  );
};

//获取指定id的数据
export const getCodeByPhoneNumberOrId = (phoneNumberOrId, callback) => {
  db.get(
    "SELECT code FROM phone_codes WHERE phoneNumber = ? OR id = ?",
    [phoneNumberOrId, phoneNumberOrId],
    callback
  );
};

export const getPhoneNumberById = (id, callback) => {
  db.get("SELECT phoneNumber FROM phone_codes WHERE id = ?", [id], callback);
};

export const insertPhoneCode = (phoneNumber, code, callback) => {
  db.run(
    "INSERT INTO phone_codes (phoneNumber, code) VALUES (?, ?)",
    [phoneNumber, code],
    function (err) {
      callback(err, this.lastID);
    }
  );
};

export const updatePhoneCode = (id, phoneNumber, code, callback) => {
  db.run(
    "UPDATE phone_codes SET phoneNumber = ?, code = ? WHERE id = ?",
    [phoneNumber, code, id],
    function (err) {
      if (err) {
        if (err.code === "SQLITE_CONSTRAINT") {
          // 处理唯一性冲突
          return callback(new Error("Phone number already exists"));
        }
        return callback(err);
      }
      callback(null, this.lastID);
    }
  );
};

export const deletePhoneCode = (id, callback) => {
  db.run("DELETE FROM phone_codes WHERE id = ?", [id], function (err) {
    callback(err, this.changes);
  });
};

// 新增删除所有数据的函数
export const deleteAllPhoneCodes = (callback) => {
  db.run("DELETE FROM phone_codes", function (err) {
    callback(err, this.changes);
  });
};
