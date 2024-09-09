"use client";
import React, { useEffect, useState } from "react";
import { Table, Button, Spin, Empty, Tag } from "antd";
import formatDate from "../../utils/common";

const SummaryPhone = (props) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { curKey } = props;

  const getPhoenTable = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:3000/api/getAllPhoneNumbers"
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/deleteAllPhoneCodes",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const result = await response.json();
      // 确保 result 是一个数组
      setData(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    getPhoenTable();
  }, [curKey]);

  const columns = [
    // 定义你的列配置
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      align: "center",
      width: 50,
    },
    {
      title: "PhoneNumber",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      width: 250,

      render: (txt) => <div style={{ fontWeight: "bold" }}>{txt}</div>,
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      align: "center",
      width: 150,
    },
    {
      title: "PhoneStatus",
      width: 150,
      dataIndex: "phoneStatus",
      key: "phoneStatus",
      align: "center",
      render: (txt, record) => {
        return (
          <Tag
            color={
              record.phoneStatus === "0"
                ? "volcano"
                : record.phoneStatus === "1"
                ? "green"
                : record.phoneStatus === "2"
                ? "blue"
                : "red"
            }
          >
            {record.phoneStatus === "0"
              ? "unuse"
              : record.phoneStatus === "1"
              ? "using"
              : record.phoneStatus === "2"
              ? "used"
              : "ban"}
          </Tag>
        );
      },
    },
    {
      title: "CodeStatus",
      dataIndex: "codeStatus",
      key: "codeStatus",
      align: "center",
      width: 150,
      render: (txt, record) => {
        return (
          <Tag
            color={
              record.codeStatus === "0"
                ? "volcano"
                : record.codeStatus === "1"
                ? "green"
                : "red"
            }
          >
            {record.codeStatus === "0"
              ? "no input"
              : record.codeStatus === "1"
              ? "availble"
              : "unavailable"}
          </Tag>
        );
      },
    },
    {
      title: "CreateTime",
      dataIndex: "createTime",
      key: "createTime",
      align: "center",
      width: 200,
      render: (text) => formatDate(text),
    },
    {
      title: "UpdateTime",
      dataIndex: "updateTime",
      key: "updateTime",
      align: "center",
      width: 200,
      render: (text) => (text ? formatDate(text) : ""),
    },
    {
      title: "Log",
      dataIndex: "desc",
      key: "desc",
    },
  ];

  return (
    <div>
      <div style={{ marginRight: 20, marginLeft: 20 }}>
        <Table
          columns={columns}
          dataSource={data}
          bordered
          title={() => (
            <div style={{ fontWeight: "bold" }}>ALL PHONE DETAILS</div>
          )}
          locale={{
            emptyText: loading ? (
              <Spin />
            ) : error ? (
              <Empty description={error.message} />
            ) : (
              "No Data"
            ),
          }}
          loading={loading}
        />
      </div>
      <Button type="primary" onClick={handleDeleteAll}>
        删除所有
      </Button>
    </div>
  );
};

export default SummaryPhone;
