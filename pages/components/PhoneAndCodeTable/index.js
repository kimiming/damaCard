"use client";

import React, { useState, useEffect } from "react";
import { Space, Table, Tag, Input, Divider, Button, message } from "antd";
import styles from "./index.module.less"; // 引入CSS Modules样式

const PhoneTable = (props) => {
  const { curKey } = props;
  const [messageApi, contextHolder] = message.useMessage();
  const initialData = [
    {
      key: "1",
      id: "",
      phonenumber: "",
      code: "",
      phonestatus: "0",
    },
  ];
  const [data, setData] = useState(initialData);
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 50,
    },
    {
      title: "Phone",
      dataIndex: "phonenumber",
      key: "phonenumber",
      width: 250,
      render: (text, record) => {
        return (
          <Input
            disabled
            style={{ fontWeight: "bold" }}
            value={record.phonenumber}
            onChange={(e) => handleInputChange(e, record, "phonenumber")}
          />
        );
      },
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      width: 250,
      render: (text, record) => {
        return (
          <Input
            style={{ fontWeight: "bold" }}
            placeholder="please input code"
            value={record.code}
            onChange={(e) => handleNumberInputChange(e, record, "code")}
          />
        );
      },
    },
    {
      title: "PhoneStatus",
      dataIndex: "phonestatus",
      key: "phonestatus",
      //居中显示
      align: "center",
      width: 150,
      render: (text, record) => {
        return (
          <Tag
            color={
              record.phonestatus === "0"
                ? "blue"
                : record.phonestatus === "1"
                ? "green"
                : "red"
            }
          >
            {record.phonestatus === "0"
              ? "unuse"
              : record.phonestatus === "1"
              ? "using"
              : "ban"}
          </Tag>
        );
      },
    },

    {
      title: "Action",
      width: 150,
      align: "center",
      render: (text, record, index) => {
        return (
          <Space>
            {contextHolder}
            <Button type="primary" onClick={() => handleEdit(record)}>
              update
            </Button>
          </Space>
        );
      },
    },
  ];

  const handleInputChange = (e, record, dataIndex) => {
    const newValue = e.target.value.replace(/[^0-9]/g, "");
    const updatedData = data.map((item) =>
      item.key === record.key ? { ...item, [dataIndex]: newValue } : item
    );
    setData(updatedData);
  };

  const handleNumberInputChange = (e, record, dataIndex) => {
    const newValue = e.target.value.replace(/[^0-9]/g, ""); // 只允许数字字符
    const updatedData = data.map((item) =>
      item.id === record.id ? { ...item, [dataIndex]: newValue } : item
    );
    setData(updatedData);
  };
  const getRowClassName = (record, index) => {
    return index % 2 === 0 ? styles["even-row"] : styles["odd-row"];
  };
  // 编辑数据
  const handleEdit = (record) => {
    const newRecord = {
      phoneNumber: record.phonenumber,
      code: record.code,
    };

    fetch("https://dama-card.vercel.app/api/updataCode", {
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
        }
      })
      .catch((error) => console.error("Error:", error));

    console.log("edit", record);
  };
  const getUnserPhone = () => {
    fetch(
      `https://dama-card.vercel.app/api/getPhoneNumbersByStatus?phoneStatus=1`
    )
      .then((response) => response.json())
      .then((data) => {
        // console.log(data.rows);
        setData(data.rows);
      });
  };
  useEffect(() => {
    getUnserPhone();
  }, [curKey]);
  return (
    <div>
      <div className={styles.phoneTable}>
        <Table
          columns={columns}
          dataSource={data}
          rowClassName={getRowClassName}
        />
      </div>
    </div>
  );
};

export default PhoneTable;
