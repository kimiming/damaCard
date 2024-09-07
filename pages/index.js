"use client";

import { useEffect, useState } from "react";
import PhoneTable from "./components/PhoneTable";
import PhoneAndCodeTable from "./components/PhoneAndCodeTable";
import Summary from "./components/Summary";
import { Tabs } from "antd";

export default function Home() {
  const [loading, setLoading] = useState(true);
  let [curKey, setCurKey] = useState("1");

  useEffect(() => {
    // 模拟数据加载过程
    setTimeout(() => {
      setLoading(false);
    }, 1000); // 2秒后完成加载
  }, []);

  const onChange = (key) => {
    setCurKey(key);
  };

  const items = [
    {
      key: "1",
      label: "INPUT PHONE",
      children: <PhoneTable curKey={curKey} />,
    },
    {
      key: "2",
      label: "INPUT CODE",
      children: <PhoneAndCodeTable curKey={curKey} />,
    },
    {
      key: "3",
      label: "SUMMARY",
      children: <Summary curKey={curKey} />,
    },
  ];

  return (
    <div>
      {loading ? (
        <div>
          <h1>Loading...</h1>
          <p>Please wait while the page is loading.</p>
        </div>
      ) : (
        <>
          <h1>Welcome to Dama Card Input page!</h1>
          <div>
            <Tabs defaultActiveKey={curKey} items={items} onChange={onChange} />
          </div>
        </>
      )}
    </div>
  );
}
