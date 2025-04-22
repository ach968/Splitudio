import Link from "next/link";

export default function Footer() {
  const d = new Date();

  return (
    <footer className="bg-black py-10 flex text-sm w-full text-[#BCBCBC] justify-center text-center">
      <div className="container">
        <nav className="flex flex-col md:flex-row md:justify-center gap-6 mt-6">
          <Link href="/home">About</Link>
          <Link href="/home">Features</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/editor">Editor</Link>
          <Link href="/help">Help</Link>
        </nav>
        <div className="mt-6">
          Made By{" "}
          <Link className="hover:underline" href="https://github.com/ach968">
            Andrew
          </Link>
          ,{" "}
          <Link
            className="hover:underline"
            href="https://github.com/Slava-code"
          >
            Slava
          </Link>
          , and{" "}
          <Link className="hover:underline" href="https://github.com/njyeung">
            Nick
          </Link>
        </div>
        <p className="mt-6">{d.getFullYear()} Splitudio.</p>
      </div>
    </footer>
  );
}
