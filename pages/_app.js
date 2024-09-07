// pages/_app.js
import { ConfigProvider } from "antd";

function MyApp({ Component, pageProps }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#fa541c", // 自定义主题色

          // 其他主题变量...
        },
      }}
    >
      <Component {...pageProps} />
    </ConfigProvider>
  );
}

export default MyApp;
