"use";
import React, { useEffect, useState } from "react";
import { Table, Button, Spin, Empty, Tag } from "antd";
import formatDate from "../../../utils/common";

const SummaryPhone = (props) => {
  const [data, setData] = useState([]);
  const [totalPhone, setTotalPhone] = useState(0);
  const [invalidDate, setInvalid] = useState(0);
  const [successDate, setSuccess] = useState(0);
  const [unuseDate, setUnuse] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { curKey } = props;

  const getPhoenTable = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://dama-card.vercel.app/api/getAllPhoneNumbers"
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      let total = result?.length ? result.length : null;
      let success = result?.filter((item) => item.phonestatus === "2")
        ? result.filter((item) => item.phonestatus === "2").length
        : null;
      let unuse = result?.filter((item) => item.phonestatus === "0")
        ? result.filter((item) => item.phonestatus === "0").length
        : null;
      let invalid = result?.filter(
        (item) => item.phonestatus === "3" || item.phonestatus === "1"
      )
        ? result.filter(
            (item) => item.phonestatus === "3" || item.phonestatus === "1"
          ).length
        : null;
      setSuccess(success);
      setUnuse(unuse);
      setInvalid(invalid);
      setTotalPhone(total);
      let newRes = result.sort((a, b) => a.id - b.id);
      setData(newRes);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
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
      dataIndex: "phonenumber",
      key: "phonenumber",
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
      dataIndex: "phonestatus",
      key: "phonestatus",
      align: "center",
      render: (txt, record) => {
        return (
          <Tag
            color={
              record.phonestatus === "0"
                ? "volcano"
                : record.phonestatus === "1"
                ? "green"
                : record.phonestatus === "2"
                ? "blue"
                : "red"
            }
          >
            {record.phonestatus === "0"
              ? "unuse"
              : record.phonestatus === "1"
              ? "using"
              : record.phonestatus === "2"
              ? "used"
              : "ban"}
          </Tag>
        );
      },
    },
    {
      title: "CodeStatus",
      dataIndex: "codestatus",
      key: "codestatus",
      align: "center",
      width: 150,
      render: (txt, record) => {
        return (
          <Tag
            color={
              record.codestatus === "0"
                ? "volcano"
                : record.codestatus === "1"
                ? "green"
                : "red"
            }
          >
            {record.codestatus === "0"
              ? "no input"
              : record.codestatus === "1"
              ? "availble"
              : "unavailable"}
          </Tag>
        );
      },
    },
    {
      title: "CreateTime",
      dataIndex: "createtime",
      key: "createtime",
      align: "center",
      width: 200,
      render: (text) => (text ? formatDate(text) : ""),
    },
    {
      title: "UpdateTime",
      dataIndex: "updatetime",
      key: "updatetime",
      align: "center",
      width: 200,
      render: (text) => (text ? formatDate(text) : ""),
    },
    {
      title: "Log",
      dataIndex: "log",
      key: "log",
    },
  ];

  return (
    <div>
      <div style={{ marginRight: 20, marginLeft: 20 }}>
        <div style={{ margin: 10, fontSize: 20 }}>
          <span style={{ marginRight: 20 }}>TOTAL：{totalPhone} items,</span>
          <span style={{ marginRight: 20 }}>UNUSE：{unuseDate} items,</span>
          <span style={{ marginRight: 20 }}>SUCCESS：{successDate} items,</span>
          <span style={{ marginRight: 20 }}>Invalid：{invalidDate} items</span>
        </div>
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
    </div>
  );
};

export default SummaryPhone;
