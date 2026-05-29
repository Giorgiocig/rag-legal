import Link from "next/link";

export default function Home() {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex gap-8">
        <Link
          href="/contract"
          className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
        >
          Analisi Contratti
        </Link>
        <Link
          href="/dossier"
          className="px-8 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition shadow-lg"
        >
          Analisi Fascicoli
        </Link>
      </div>
    </div>
  );
}
