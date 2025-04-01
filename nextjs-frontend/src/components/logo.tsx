export default function Logo() {

  return (
    <div className="group flex flex-col items-center justify-center w-[460px] h-[180px]">
      <div className="opacity-0 group-hover:opacity-100 items-center justify-center transition-all duration-500 text-transparent
      bg-clip-text delay-200 logo-gradient">
        <p className="text-6xl font-bold">
          Splitudio
        </p>
      </div>

      <div className="flex group relative -top-8 group-hover:top-0 flex-row group gap-2 items-center transition-all duration-500 ease-in-out">
        {/* Left side */}
        <div
          className="rounded-full h-[20px] group-hover:h-[40px] transition-all duration-500"
          style={{
            width: 20,
            background: "#ef4444"
          }}
        ></div>

        <div
          className="rounded-full h-[40px] group-hover:h-[20px] transition-all duration-500"
          style={{
            width: 20,
            background: "#f97316"
          }}
        ></div>

        <div
          className="rounded-full h-[80px] group-hover:h-[60px] transition-all duration-500"
          style={{
            width: 20,
            background: "#facc15"
          }}
        ></div>

        <div
          className="rounded-full h-[120px] group-hover:h-[80px] transition-all duration-500"
          style={{
            width: 20,
            background: "#22c55e"
          }}
        ></div>

        {/* Right side */}
        <div
          className="rounded-full h-[120px] group-hover:h-[40px] relative transition-all duration-500"
          style={{
            width: 20,
            background: "#38bdf8"
          }}
        ></div>

        <div
          className="rounded-full h-[80px] group-hover:h-[30px] transition-all duration-500"
          style={{
            width: 20,
            background: "#8b5cf6"
          }}
        ></div>

        <div
          className="rounded-full h-[40px] group-hover:h-[60px] transition-all duration-500"
          style={{
            width: 20,
            background: "#d946ef"
          }}
        ></div>

        <div
          className="rounded-full h-[20px] group-hover:h-[40px] transition-all duration-500"
          style={{
            width: 20,
            background: "#ec4899"
          }}
        ></div>
      
      </div>
    </div>
    
  );
}
