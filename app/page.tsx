"use client";

import dynamic from "next/dynamic";

const MarkdownEditor = dynamic(() => import("@/components/MarkdownEditor"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Loading editor...</p>
    </div>
  ),
});

export default function Home() {
  return <MarkdownEditor />;
}
