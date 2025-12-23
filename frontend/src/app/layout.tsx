import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeLens AI - Minimal Code Reviewer",
  description: "Upload a repo, embed code, and generate automated code review insights."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100">
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-5">
          <header className="sticky top-0 z-20 mb-6 flex items-center justify-between bg-slate-900/90 px-3 py-3 rounded-xl border border-slate-800 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 grid place-items-center font-extrabold border border-blue-200">
                AI
              </div>
              <div>
                <div className="text-lg font-semibold">CodeLens AI</div>
                <p className="text-sm text-slate-400">Upload, embed, review · file & repo scope</p>
              </div>
            </div>
            <nav className="flex gap-3 text-sm">
              <a className="rounded-lg px-3 py-2 hover:bg-slate-800/60" href="/upload">
                Repo upload
              </a>
              <a className="rounded-lg px-3 py-2 hover:bg-slate-800/60" href="/files">
                File tree
              </a>
              <a className="rounded-lg px-3 py-2 hover:bg-slate-800/60" href="/repo-review">
                Repo review
              </a>
              <a className="rounded-lg px-3 py-2 hover:bg-slate-800/60" href="/code">
                Code + AI comments
              </a>
            </nav>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
