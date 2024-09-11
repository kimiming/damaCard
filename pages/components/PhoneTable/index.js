"use client";

import React, { useState } from "react";
import { Space, Table, Tag, Input, Divider, Button, message } from "antd";
import styles from "./index.module.less"; // 引入CSS Modules样式

const PhoneTable = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const initialData = [
    {
      key: "1",
      phonenumber: "",
      code: "",
    },
    {
      key: "2",
      phonenumber: "",
      code: "",
    },
    {
      key: "3",
      phonenumber: "",
      code: "",
    },
    {
      key: "4",
      phonenumber: "",
      code: "",
    },
    {
      key: "5",
      phonenumber: "",
      code: "",
    },
    {
      key: "6",
      phonenumber: "",
      code: "",
    },
    {
      key: "7",
      phonenumber: "",
      code: "",
    },
    {
      key: "8",
      phonenumber: "",
      code: "",
    },
    {
      key: "9",
      phonenumber: "",
      code: "",
    },
    {
      key: "10",
      phonenumber: "",
      code: "",
    },
  ];
  const [data, setData] = useState(initialData);
  const columns = [
    {
      title: "Index",
      dataIndex: "key",
      key: "key",
      align: "center",
    },
    {
      title: "Phone",
      dataIndex: "phonenumber",
      key: "phonenumber",
      render: (text, record) => {
        return (
          <Input
            value={record.phonenumber}
            placeholder="please input"
            onChange={(e) => handleInputChange(e, record, "phonenumber")}
          />
        );
      },
    },
    {
      title: "Action",
      align: "center",
      render: (text, record, index) => {
        return (
          <Space>
            {contextHolder}
            <Button type="primary" onClick={() => handleEdit(record)}>
              UP
            </Button>
          </Space>
        );
      },
    },
  ];
  // 输入框值变化
  const handleInputChange = (e, record, dataIndex) => {
    const newValue = e.target.value.replace(/[^0-9]/g, "");
    const updatedData = data.map((item) =>
      item.key === record.key
        ? { ...item, [dataIndex]: newValue, phonestatus: "0" }
        : item
    );
    setData(updatedData);
  };

  //奇偶行样式
  const getRowClassName = (record, index) => {
    return index % 2 === 0 ? styles["even-row"] : styles["odd-row"];
  };

  // 编辑数据
  const handleEdit = (record) => {
    const newRecord = {
      phonenumber: record.phonenumber,
      code: "",
      codestatus: "0",
      phonestatus: "0",
      log: "First insert for user",
    };

    fetch("https://dama-card.vercel.app/api/insertPhone", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newRecord),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.code === 200) {
          messageApi.success("Update Success");
          setData(initialData);
        }
      })
      .catch((error) => messageApi.error("Update Failed"));
  };

  const handleAllBtn = () => {
    const filteredData = data.filter((item) => item.phonenumber !== "");
    const allData = filteredData.map((item) => ({
      ...item,
      log: "First insert for user",
    }));
    console.log("update all:", filteredData.length);
    fetch("https://dama-card.vercel.app/api/insertMultiplePhone", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phoneNumberTable: allData }),
    })
      .then((response) => response.json())
      .then((data) => {
        messageApi.success("Update All Success");
        setData(initialData);
      })
      .catch((error) => console.error("Error:", error));
  };

  return (
    <div>
      <div className={styles.phoneTable}>
        <Table
          columns={columns}
          dataSource={data}
          rowClassName={getRowClassName}
          pagination={false}
        />
      </div>
      <div className={styles.button}>
        <Button type="primary" onClick={() => handleAllBtn()}>
          UPDATE All
        </Button>
      </div>
    </div>
  );
};

export default PhoneTable;
