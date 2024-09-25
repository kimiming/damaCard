// services/dbService.js
import { Pool } from "pg";

// 创建一个连接池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// 初始化数据库
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS phone_codes (
        id SERIAL PRIMARY KEY,
        phoneNumber TEXT UNIQUE,
        code TEXT,
        codeStatus TEXT,
        phoneStatus TEXT,
        createTime TEXT,
        updateTime TEXT,
        log TEXT
      )
    `);
  } finally {
    client.release();
  }
}

initializeDatabase().catch((err) =>
  console.error("Database initialization error:", err)
);

// 获取所有数据
export const getAllPhoneNumbers = async (callback) => {
  try {
    const result = await pool.query(`
      SELECT id, code, phoneNumber, codeStatus, phoneStatus, createTime, updateTime, log FROM phone_codes
    `);
    callback(null, result.rows);
  } catch (err) {
    callback(err);
  }
};

// 其他数据库操作类似，只需将 SQLite 的 `db.run` 替换为 `pool.query`

//输入手机号插入数据并更新phoneStatus
export const insertPhone = async (
  phonenumber,
  code,
  codestatus,
  phonestatus,
  log,
  callback
) => {
  try {
    const createtime = new Date().toISOString();
    const result = await pool.query(
      `
      INSERT INTO phone_codes (phonenumber, code, codestatus, phonestatus, log,createtime)
      VALUES ($1, $2, $3, $4, $5,$6)
      ON CONFLICT (phonenumber) DO UPDATE SET code=$2, codestatus=$3, phonestatus=$4, log=$5,createtime=$6
      RETURNING id
    `,

      [phonenumber, code, codestatus, phonestatus, log, createtime]
    );
    callback(null, result.rows[0].id);
  } catch (err) {
    callback(err);
  }
};
// 输入多个手机号插入数据并更新phoneStatus
export const insertMultiplePhone = async (phoneRecords, callback) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN"); // 开始事务

    const insertQuery = `
        INSERT INTO phone_codes (phonenumber, phonestatus, codestatus, createtime,log)
        VALUES ($1, $2, $3, $4,$5)
        ON CONFLICT (phoneNumber) DO NOTHING
      `;

    for (const { phonenumber, phonestatus, log } of phoneRecords) {
      const createtime = new Date().toISOString();
      await client.query(insertQuery, [
        phonenumber,
        phonestatus,
        "0",
        createtime,
        log,
      ]);
    }

    await client.query("COMMIT"); // 提交事务
    callback(null, "All records inserted successfully");
  } catch (e) {
    await client.query("ROLLBACK"); // 发生错误时回滚事务
    callback(e);
  } finally {
    client.release(); // 释放数据库连接
  }
};

//删除全部数据
export const deleteAllPhoneNumbers = async (callback) => {
  try {
    const result = await pool.query(`
      DELETE FROM phone_codes
    `);
    callback(null, result.rowCount);
  } catch (err) {
    callback(err);
  }
};

//根据phoneNumber来insert更新code
export const insertUpdateCode = (phonenumber, code, callback) => {
  const updateTime = new Date(); // 假设使用当前时间
  pool.query(
    "UPDATE phone_codes SET code = $1, codestatus = $2, phonestatus = $3, updatetime = $4 WHERE phonenumber = $5",
    [code, "1", "2", updateTime, phonenumber],
    function (err, result) {
      if (err) {
        return callback(err);
      }
      callback(null, result.rowCount); // 假设使用`pg`，调整为使用`result.rowCount`
    }
  );
};

//根据判断phoneStatus为1的时候并且updateTime和当前的时间超过三分钟后更新codeStatus为2和phoneStatus为3
export const asPhonestatus1AndupdateTimeupdateCodeStatus = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN"); // 开始事务

    const updateQuery = `
      UPDATE phone_codes 
      SET phoneStatus = $1, codeStatus = $2, updateTime = $3
      WHERE phoneStatus = $4 AND updateTime < NOW() - INTERVAL '3 minutes'
    `;

    const result = await client.query(updateQuery, [
      "3",
      "2",
      new Date().toISOString(),
      1,
    ]);

    await client.query("COMMIT"); // 提交事务
    console.log(`更新了 ${result.rowCount} 行`); // 输出更新的行数
    callback(null, `更新成功：${result.rowCount} 行被更新`);
  } catch (e) {
    await client.query("ROLLBACK"); // 发生错误时回滚事务
    console.error("更新错误:", e); // 输出错误信息
    callback(e);
  } finally {
    client.release(); // 释放数据库连接
  }
};

//根据phoneNumber来更新phoneStatus
export const updatePhoneStatus = async (
  phonenumber,
  phonestatus,
  codestatus,
  log
) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `
        UPDATE phone_codes 
        SET phonestatus = $1, updatetime = $2 ,codestatus=$3,log=$4
        WHERE phonenumber = $5
      `,
      [phonestatus, new Date().toISOString(), codestatus, log, phonenumber]
    );

    return result.rowCount;
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
};

//根据phoneStatus的值为0来获取一个未使用的手机号
export const getOneUnusePhoneNumber = async (callback) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `
        SELECT id, phoneNumber FROM phone_codes 
        WHERE phonestatus = $1 
        ORDER BY id 
        LIMIT 1
      `,
      ["0"]
    );

    if (result.rows.length === 0) {
      return callback(new Error("No available phone number"));
    }

    const { phonenumber } = result.rows[0];
    await updatePhoneStatus(phonenumber, "1");

    callback(null, result.rows[0]);
  } catch (err) {
    callback(err);
  } finally {
    client.release();
  }
};
//根据phoneNumber来获取code
// 根据phoneNumber来获取code
export const getCodeByPhoneNumber = (phonenumber, callback) => {
  pool.query(
    "SELECT code FROM phone_codes WHERE phoneNumber = $1",
    [phonenumber],
    (err, result) => {
      if (err) {
        return callback(err);
      }
      if (result.rows.length === 0) {
        return callback(new Error("Phone number not found"));
      }
      callback(null, result.rows);
    }
  );
};

// 根据phoneStatus获取相对应的所有的数据
export const getPhoneNumbersByStatus = (phoneStatus, callback) => {
  pool.query(
    "SELECT id, code, phoneNumber, codeStatus, phoneStatus, createTime, updateTime, log FROM phone_codes WHERE phoneStatus = $1",
    [phoneStatus],
    (err, result) => {
      if (err) {
        return callback(err);
      }
      const rawData = result.rows; // 确保 rawData 是数组
      if (Array.isArray(rawData)) {
        const hasValidData = rawData.some((item) => item.isValid); // 假设 isValid 是你要检查的属性
        console.log("Has valid data:", hasValidData);
      } else {
        console.error("rawData is not an array");
      }
      callback(null, rawData);
    }
  );
};

//用完之后关闭数据库
// 在应用程序退出时关闭连接池
process.on("SIGINT", () => {
  pool.end(() => {
    console.log("Database pool has been closed");
    process.exit(0);
  });
});
