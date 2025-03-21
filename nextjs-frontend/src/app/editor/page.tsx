"use client"

import DragDropSVG from "@/assets/drag-drop";
import EditorNav from "@/components/editor-nav";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import PremiumText from "@/components/premium-text";
import Link from "next/link";
export default function Upload() {
    return <section>
        <div className="w-screen flex h-screen bg-black">
            <div className="flex flex-col justify-start w-full h-full">
                <EditorNav></EditorNav>
                <div className="flex justify-center w-full mt-28">
                
                    <div className="container px-3 lg:px-5 flex justify-center">
                        <Tabs defaultValue="upload" className="w-[700px]">
                            <TabsList className="flex w-full bg-transparent justify-start border-neutral-500 border-b-4 rounded-none p-0 m-0">
                                <TabsTrigger
                                className="data-[state=active]:bg-transparent data-[state=active]:text-white border-b-4 data-[state=active]:border-white border-neutral-500 rounded-none"  
                                value="upload">
                                    <p className="text-base leading-7 mx-2">
                                        Upload
                                    </p>
                                </TabsTrigger>
                                <TabsTrigger 
                                className="data-[state=active]:bg-transparent data-[state=active]:text-white border-b-4 data-[state=active]:border-white border-neutral-500 rounded-none"  
                                value="youtube-link">
                                    <p className="text-base leading-7 mx-2">
                                        Youtube Link
                                    </p>
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="upload" className="pt-7">
                                <div onClick={()=>console.log("CLICK")} className="hover:cursor-pointer flex flex-col gap-3 w-full h-[300px] rounded-xl border-4 border-dashed border-neutral-500 justify-center items-center">
                                    <DragDropSVG className="w-16 h-16"></DragDropSVG>
                                    <p className="text-lg">
                                        <span className="text-neutral-400">Drag and drop or </span>
                                        <span className="text-white">select files</span>
                                    </p>
                                    <p className="text-sm text-neutral-400">
                                        Max song length 2 mins. Upgrade to <Link href="/profile"> <PremiumText></PremiumText> </Link> 
                                         
                                    </p>
                                    
                                </div>
                            </TabsContent>
                            <TabsContent value="youtube-link" className="pt-7">
                                
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
                
            </div>
        </div>
    </section>
}