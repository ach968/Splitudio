import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from '@/components/ui/input'
import { Button } from "@/components/ui/button"
import EditorNav from "@/components/editor-nav"
import Link from "next/link"
import PremiumText from "@/components/premium-text"
import { Check } from "lucide-react"
export default function Profile() {

    const subscriptionStatus: number = 0;

    return <div className="w-screen flex min-h-screen bg-black">
                <div className="flex flex-col justify-center items-center w-full h-full">
                    <EditorNav />
                    
                    {/* Username and password */}
                    <div className="container pt-28 flex justify-center items-center">
                        <Tabs defaultValue="username" className="px-3 lg:px-5 max-w-[700px] w-full">
                            <TabsList className="flex w-full">
                                <TabsTrigger value="username" className="w-full py-2">
                                    <p className="">
                                        Username
                                    </p>
                                </TabsTrigger>
                                <TabsTrigger value="password" className="w-full py-2">
                                    <p className="font-medium">
                                        Password
                                    </p>
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="username">
                                <div className="border gap-7 flex flex-col p-6 justify-center rounded-lg border-neutral-500">
                                    <div>
                                        <p className="text-white text-2xl font-semibold">Username</p>
                                        <p className="text-neutral-400">Confirm your password to make changes to your username</p>
                                    </div>
                                    

                                    <div className="flex flex-col gap-3">
                                        <span>
                                            <p className="text-white leading-8">Current password</p>
                                            <Input className="border-neutral-500 text-white"></Input>
                                        </span>
                                        
                                        <span>
                                            <p className="text-white leading-8">New username</p>
                                            <Input className="border-neutral-500 text-white"></Input>
                                        </span>
                                        
                                    </div>
                                    
                                    <Button variant="secondary" className=" max-w-[200px]">Save changes</Button>
                                </div>
                            </TabsContent>
                            <TabsContent value="password">
                            <div className="border gap-7 flex flex-col p-6 justify-center rounded-lg border-neutral-500">
                                    <div>
                                        <p className="text-white text-2xl font-semibold">Password</p>
                                        <p className="text-neutral-400">Confirm your existing password to make changes</p>
                                    </div>
                                    

                                    <div className="flex flex-col gap-3">
                                        <span>
                                            <p className="text-white leading-8">Current password</p>
                                            <Input className="border-neutral-500 text-white"></Input>
                                        </span>
                                        
                                        <span>
                                            <p className="text-white leading-8">New password</p>
                                            <Input className="border-neutral-500 text-white"></Input>
                                        </span>
                                        
                                    </div>
                                    
                                    <Button variant="secondary" className=" max-w-[200px]">Save changes</Button>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Subscription */}
                    <div className="container mt-12 flex justify-center items-center">
                        <div className="w-full max-w-[700px] px-3 lg:px-5">
                            <div className="border gap-7 flex flex-col p-6 rounded-lg border-neutral-500 bg-black">
                                {subscriptionStatus == 0 ?
                                <>
                                    <div>
                                        <p className="text-white text-2xl font-semibold">Subscription</p>
                                        <p className="text-neutral-400">
                                            Your current subscription plan is{" "}
                                            <span className="text-white">Free</span>,{" "} 
                                            which limits the number of projects and actions available. Upgrade to <PremiumText/> {" "}
                                            <span className="text-white">($5/month)</span>,{" "} 
                                            for unlimited projects.
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <p className="text-white">Current Plan: Free</p>
                                        
                                        <Button variant="secondary" className="max-w-[200px]">
                                            Upgrade to Premium
                                        </Button>
                                    </div>
                                </>
                                :
                                <>
                                    <div>
                                        <p className="text-white text-2xl font-semibold">Subscription</p>
                                        <p className="text-neutral-400">
                                            Your current subscription plan is <PremiumText/>. You have access to unlimited projects.
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <p className="text-white">Current Plan: <PremiumText/></p>
                                        <Link href="/">
                                            <p className="text-neutral-400 underline underline-offset-4"> Manage my subscription</p>
                                        </Link>
                                    </div>
                                </>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
}