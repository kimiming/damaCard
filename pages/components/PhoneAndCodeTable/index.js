"use client";

import React, { useState, useEffect } from "react";
import {
  Space,
  Table,
  Tag,
  Input,
  Divider,
  Button,
  message,
  Spin,
  Empty,
} from "antd";
import styles from "./index.module.less"; // 引入CSS Modules样式
import formatDate from "../../../utils/common";

const PhoneTable = (props) => {
  const { curKey } = props;
  const [messageApi, contextHolder] = message.useMessage();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState([]);
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
    try {
      setLoading(true);
      fetch(
        `https://dama-card.vercel.app/api/getPhoneNumbersByStatus?phoneStatus=1`
      )
        .then((response) => response.json())
        .then((data) => {
          // console.log("old", data.rows);
          //根据date.rows[0].updatetime排序
          if (data.rows.length === 0) {
            messageApi.warning("No phone number is using");
            return;
          }
          //选择出时间超过当前3分钟的过期的手机号码
          let curData = data.rows;
          let overTimeData = curData.filter(
            (item) =>
              new Date().getTime() - new Date(item.updatetime).getTime() >
              600000
          );
          curData = curData.filter(
            (item) => !overTimeData.some((item2) => item2.id === item.id)
          );
          //将过期的手机号码的状态改为3
          for (let i = 0; i < overTimeData.length; i++) {
            try {
              fetch(`https://dama-card.vercel.app/api/updatePhoneStatus`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  phonenumber: overTimeData[i].phonenumber,
                  codestatus: 2,
                  phonestatus: 3,
                  log: "time out for getting code",
                }),
              })
                .then((response) => response.json())
                .then((data) => {
                  console.log(data);
                });
            } catch (e) {
              setError(err);
              console.log(e);
            }
          }
          console.log("overTimeData", overTimeData);
          //将curdata中的overTimeData的数据过滤掉

          let newRows = curData.sort(
            (a, b) =>
              new Date(b.updatetime).getTime() -
              new Date(a.updatetime).getTime()
          );
          setData(newRows);
        });
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUnserPhone();
    // updateCodestatus();
  }, [curKey]);
  return (
    <div>
      <div className={styles.phoneTable}>
        <Table
          columns={columns}
          dataSource={data}
          rowClassName={getRowClassName}
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

export default PhoneTable;
