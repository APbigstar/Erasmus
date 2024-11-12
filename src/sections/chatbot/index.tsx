"use client";

import { useEffect, useState, useRef, useContext } from "react";
import Image from "next/image";

import { ArcwarePixeclStreamingManager } from "@/lib/webrtcClient";

import ChatbotComponent from "./components/ChatbotComponent";


const ChatbotView = () => {
    const { initialize, sendCommand, getPixelStreaming } = ArcwarePixeclStreamingManager();
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [knowledge, setknowledge] = useState(`My name is Erasmus.I am based on a combination of a digital avatar and chatbot agent technology. I am trained with a lot of data via a large language model. Here I translate voice to text prompts and vice versa. My gestures and their animation are synchronized with my response, and I learn from the interaction with my users. As Digiderius, a digital human, I will interact and collaborate with our students, staff and researchers at the Erasmus University Rotterdam, with our city and with other partners in our community. Together we will experiment and research how humans interact with avatars such as myself, to learn and study how we can provide a contribution to our society, responsibly and effectively. Of course, with an eye for social, ethical, legal and philosophical questions and challenges.`)
    const videoContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initializeArcware = async () => {
            try {
                if (videoContainerRef.current) {
                    await initialize(videoContainerRef.current);
                    const pixelStreaming = getPixelStreaming();
                    if (pixelStreaming) {
                        pixelStreaming.videoInitializedHandler.add(async () => {
                            setIsLoaded(true)
                            setTimeout(() => {
                                sendCommand({ personas: knowledge });
                            }, 0);
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to initialize Arcware:", error);
            }
        };

        initializeArcware();

    }, []);

    return (
        <>
            <div id="sizeContainer" className="relative" ref={videoContainerRef} />
            {isLoaded && <ChatbotComponent chatbotName="Erasmus" />}
        </>

    );
};


export default ChatbotView;