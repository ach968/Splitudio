

import { twMerge } from 'tailwind-merge';

export default function Track({className} : {className? : string}) {

    return (
    <div className={twMerge(className, "bg-black w-full border-2 border-neutral-500 p-2 lg:p-4 rounded-md lg:rounded-xl")}>

        <div className="flex items-center">
            {/* Left cluster */}
            <div className="mr-4 flex flex-col gap-3 items-center animate-pulse">
                <div className='w-[70px] h-4 bg-neutral-500 rounded-md'></div>
                <div className='w-20 h-4 bg-neutral-500 rounded-md'></div>
                <div className="flex gap-2">
                    <div className='w-7 h-7 bg-neutral-500 rounded-md'></div>
                    <div className='w-7 h-7 bg-neutral-500 rounded-md'></div>
                </div>
            </div>
    
            {/* Waveform Display */}
            
            <div className="flex-grow select-none animate-pulse delay-200">
                <div className='w-full h-[50px] bg-neutral-500 rounded-md'></div>
            </div>
    
            {/* Action Buttons */}
            <div className="ml-4 flex flex-col gap-2 animate-pulse delay-700">
                <div className="w-9 h-9 rounded-full group bg-neutral-500"></div>
                <div className="w-9 h-9 rounded-full group bg-neutral-500"></div>
            </div>
        </div>
    </div>
    );
  }