"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from '@/components/ui/input'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Footer from "@/components/footer"
import PremiumText from "@/components/premium-text"
import { useState } from "react"
import { motion } from "framer-motion"
import Topbar from "@/components/topbar"
import EditorNav from "@/components/loggedin-nav"
export default function Profile() {

    const subscriptionStatus: number = 1;

    // username tab
    const [password_1, setPassword_1] = useState("");
    const [username_1, setUsername_1] = useState("user123");
    // password tab
    const [currpassword_2, setCurrpassword_2] = useState("");
    const [newpassword_2, setNewpassword_2] = useState("");

    const [disableButtons, setDisableButtons] = useState(false);

    const saveUsername = () => {
        setDisableButtons(true);

        // fetch logic

        setTimeout(()=> {
            // finally
            setDisableButtons(false);
        }, 300)
    }
    const savePassword = () => {
        setDisableButtons(true);

        // fetch logic

        setTimeout(()=> {
            // finally
            setDisableButtons(false);
        }, 300)
    }


    return <section>
        <div className="flex flex-col items-center w-full min-h-screen bg-black">
            <EditorNav />
            
            {/* Username and password */}
            <motion.div 
            initial={{opacity: 0, y:5}}
            animate={{opacity: 1, y:0}}
            transition={{duration: 0.5}}
            className="container pt-28 flex justify-center items-center">

                <Tabs defaultValue="username" className="px-3 lg:px-5 max-w-[700px] w-full">
                    <TabsList className="flex w-full">
                        <TabsTrigger value="username" className="w-full py-2">
                            <p>
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
                                    <p className="text-neutral-400 leading-8">Current password</p>
                                    <Input 
                                    placeholder="********" 
                                    type="password" 
                                    className="border-neutral-500 text-white"
                                    value={password_1}
                                    required
                                    onChange={(e:any)=>setPassword_1(e.target.value)}></Input>
                                </span>
                                
                                <span>
                                    <p className="text-neutral-400 leading-8">Username</p>
                                    <Input 
                                    value={username_1}
                                    required
                                    onChange={(e:any)=>setUsername_1(e.target.value)} 
                                    className="border-neutral-500 text-white"></Input>
                                </span>
                                
                            </div>
                            
                            <Button 
                            variant="secondary" 
                            className="max-w-[200px]"
                            disabled={disableButtons}
                            onClick={saveUsername}>Save changes</Button>
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
                                    <p className="text-neutral-400 leading-8">Current password</p>
                                    <Input 
                                    placeholder="********" 
                                    type="password" 
                                    className="border-neutral-500 text-white"
                                    value={currpassword_2}
                                    required
                                    onChange={(e:any)=>setCurrpassword_2(e.target.value)}></Input>
                                </span>
                                
                                <span>
                                    <p className="text-neutral-400 leading-8">New password</p>
                                    <Input 
                                    placeholder="********" 
                                    type="password" 
                                    className="border-neutral-500 text-white"
                                    value={newpassword_2} 
                                    required
                                    onChange={(e:any)=>setNewpassword_2(e.target.value)}></Input>
                                </span>
                                
                            </div>
                            
                            <Button 
                            variant="secondary" 
                            className="max-w-[200px]"
                            disabled={disableButtons}
                            onClick={saveUsername}>Save changes</Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </motion.div>

            {/* Subscription */}
            <motion.div
            initial={{opacity: 0, y:7}}
            animate={{opacity: 1, y:0}}
            transition={{delay:0.2, duration: 0.5}}
            className="container mt-12 flex justify-center items-center">
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
                                    <p className="text-neutral-400 underline underline-offset-4 text-sm"> Manage my subscription</p>
                                </Link>
                            </div>
                        </>
                        }
                    </div>
                </div>
            </motion.div>
        </div>
        <Footer></Footer>
    </section>
}