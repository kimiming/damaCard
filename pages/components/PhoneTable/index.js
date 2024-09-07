"use client";

import React, { useState } from "react";
import { Space, Table, Tag, Input, Divider, Button, message } from "antd";
import styles from "./index.module.less"; // 引入CSS Modules样式

const PhoneTable = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const initialData = [
    {
      key: "1",
      phoneNumber: "",
      code: "",
    },
    {
      key: "2",
      phoneNumber: "",
      code: "",
    },
    {
      key: "3",
      phoneNumber: "",
      code: "",
    },
    {
      key: "4",
      phoneNumber: "",
      code: "",
    },
    {
      key: "5",
      phoneNumber: "",
      code: "",
    },
    {
      key: "6",
      phoneNumber: "",
      code: "",
    },
    {
      key: "7",
      phoneNumber: "",
      code: "",
    },
    {
      key: "8",
      phoneNumber: "",
      code: "",
    },
    {
      key: "9",
      phoneNumber: "",
      code: "",
    },
    {
      key: "10",
      phoneNumber: "",
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
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      render: (text, record) => {
        return (
          <Input
            value={record.phoneNumber}
            placeholder="please input"
            onChange={(e) => handleInputChange(e, record, "phoneNumber")}
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
        ? { ...item, [dataIndex]: newValue, phoneStatus: "0" }
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
      phoneNumber: record.phoneNumber,
      phoneStatus: "0",
    };

    fetch("http://localhost:3000/api/insertPhone", {
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
    const filteredData = data.filter((item) => item.phoneNumber !== "");
    console.log("update all:", filteredData.length);
    fetch("http://localhost:3000/api/insertMultiplePhone", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phoneNumberTable: filteredData }),
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
