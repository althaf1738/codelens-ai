export default function Home() {
  const cards = [
    {
      title: "Upload",
      desc: "Push a repo archive and embed it to Qdrant or local store.",
      href: "/upload"
    },
    {
      title: "File tree",
      desc: "Browse ingested projects and their files.",
      href: "/files"
    },
    {
      title: "Code + AI comments",
      desc: "Open a file, view code, and request AI review notes.",
      href: "/code"
    }
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {cards.map((card) => (
        <a
          key={card.title}
          href={card.href}
          className="glass block p-6 hover:border-emerald-400/50 transition"
        >
          <div className="text-sm uppercase tracking-wide text-emerald-300">{card.title}</div>
          <div className="mt-2 text-lg font-semibold">{card.desc}</div>
        </a>
      ))}
    </div>
  );
}
