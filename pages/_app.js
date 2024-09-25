import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ConfigProvider } from "antd";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkUserAuthentication = async () => {
      const token = localStorage.getItem("token");
      // console.log("Token:", token); // 添加调试信息
      if (token) {
        try {
          // 你可以在这里添加一个简单的验证逻辑，例如检查token是否为空字符串
          if (token.trim() !== "") {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
            router.push("/Login");
          }
        } catch (error) {
          console.error("Token validation failed:", error);
          setIsAuthenticated(false);
          router.push("/Login");
        }
      } else {
        setIsAuthenticated(false);
        router.push("/Login");
      }
      setIsCheckingAuth(false);
    };

    const debounceCheck = setTimeout(() => {
      checkUserAuthentication();
    }, 500);

    return () => clearTimeout(debounceCheck);
  }, [router]);

  // if (isCheckingAuth) {
  //   return <div>Loading...</div>;
  // }

  // if (!isAuthenticated) {
  //   return <div>Redirecting...</div>;
  // }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#fa541c",
        },
      }}
    >
      <Component {...pageProps} />
    </ConfigProvider>
  );
}

export default MyApp;
