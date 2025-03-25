export default function Footer() {
    const d = new Date();

    return <footer className="bg-black py-10 flex text-sm w-full text-[#BCBCBC] justify-center text-center"> 
        <div className="container">
            <nav className='flex flex-col md:flex-row md:justify-center gap-6 mt-6'>
                <a href="/home">About</a>
                <a href="/home">Features</a>
                <a href="/pricing">Pricing</a>
                <a href="/editor">Editor</a>
                <a href="/help">Help</a>
            </nav>
            <p className='mt-6'>{d.getFullYear()} Splitudio.</p>
        </div>
  </footer>
}