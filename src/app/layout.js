import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import './font.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: '부산 203번 가이드',
  description: '부산 203번 버스의 실시간 위치, 정류장 유래 및 역대 차량 현황 등을 제공하는 가이드입니다.',
  keywords: ['부산 203', '부산 버스 203', '203번 버스', '산성교통', '산성버스', '금정산', '온천장역', '산성마을'],
  verification: {
    google: 'BtCWRwrlx5Q853WJFhPYc6UjB2zIz6PJHtQr-lEP3Mo',
  },
  openGraph: {
    title: '부산 203번 가이드',
    description: '부산 203번 버스 실시간 위치, 정류장 유래 및 역대 차량 현황 등을 제공하는 가이드입니다.',
    url: 'https://203-nu.vercel.app',
    siteName: '부산 203 가이드',
    locale: 'ko_KR',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
