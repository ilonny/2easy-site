/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  compiler: {
    removeConsole: true,
  },
  env: {
    BASE_URL: process.env.BASE_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
  // async headers() {
  //   return [
  //     {
  //       source: "/(.*)",
  //       headers: [
  //         {
  //           key: "Content-Security-Policy",
  //           value: `default-src 'self'; connect-src 'self' https://widget.cloudpayments.ru https://api2.amplitude.com/ https://static.cloudpayments.ru https://static-stage.cloudpayments.ru https://pay.google.com https://google.com https://www.google.com https://pay.yandex.ru https://api-statist.dev-tcsgroup.io https://api-statist.tinkoff.ru https://forma.tinkoff.ru https://intent-api.cloudpayments.ru;`,
  //         },
  //       ],
  //     },
  //   ];
  // },
};

export default nextConfig;
