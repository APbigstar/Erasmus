import { ArcwareInit } from "@arcware-cloud/pixelstreaming-websdk";
import { useMessageStore } from "@/store/messageStore";

export type ArcwareCommand = Record<string, string>;

interface PersonaData {
  Personas?: string;
  [key: string]: string | undefined;
}

class ArcwareManager {
  private static instance: ArcwareManager;
  private application: any = null;
  private pixelStreaming: any = null; 
  private isConnected: boolean = false;
  private latestLoadAvatarCommand: string | null = null;
  private isProcessingAIMessage: boolean = false;
  private onResponseCallbacks: ((response: string) => void)[] = [];

  private constructor() { }

  public static getInstance(): ArcwareManager {
    if (!ArcwareManager.instance) {
      ArcwareManager.instance = new ArcwareManager();
    }
    return ArcwareManager.instance;
  }

  public async initialize(containerRef: HTMLElement, onLoading?: (loading: boolean) => void): Promise<void> {
    try {
      onLoading?.(true);

      const { Config, PixelStreaming, Application } = ArcwareInit(
        {
          shareId: process.env.NEXT_PUBLIC_ARCWARE_SHARE_ID!,
        },
        {
          initialSettings: {
            StartVideoMuted: false,
            AutoConnect: true,
            AutoPlayVideo: true,
          },
          settings: {
            infoButton: true,
            micButton: false,
            audioButton: true,
            fullscreenButton: true,
            settingsButton: true,
            connectionStrengthIcon: true,
          },
        }
      );

      this.application = Application;
      this.pixelStreaming = PixelStreaming;
      this.application.getApplicationResponse((response: string) => {
        this.handleApplicationResponse(response);
      });
      containerRef.appendChild(this.application.rootElement);
      this.isConnected = true;
    } catch (error) {
      console.error("Failed to initialize Arcware:", error);
      onLoading?.(false);
      throw error;
    }
  }

  public isReady(): boolean {
    return this.isConnected;
  }

  private handleApplicationResponse = (response: string): void => {
    if (this.isProcessingAIMessage) {
      return;
    }

    console.log(response)

    if (response.startsWith("AI message :")) {
      const messageContent = response.replace("AI message :", "").trim();
      const messageStore = useMessageStore.getState();

      if (
        messageStore.isProcessingMessage &&
        messageContent !== messageStore.lastBotMessage &&
        Date.now() - messageStore.messageTimestamp < 5000
      ) {
        // Set flag to true to ignore subsequent messages
        this.isProcessingAIMessage = true;

        messageStore.setLastBotMessage(messageContent);
        messageStore.setIsProcessingMessage(false);

        // Reset the flag after a short delay to prepare for next user message
        setTimeout(() => {
          this.isProcessingAIMessage = false;
        }, 100);
      }
    }

    // Notify all response callbacks
    this.onResponseCallbacks.forEach(callback => callback(response));
  };

  public async loadAndSendAvatarData(jsonFilePath: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error("Arcware not connected");
    }

    try {
      const response = await fetch(jsonFilePath);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const jsonData: PersonaData = await response.json();

      // Store the avatar command for reset functionality
      this.latestLoadAvatarCommand = JSON.stringify(jsonData);

      // Send the reset avatar command
      this.sendCommand({ resetavatar: this.latestLoadAvatarCommand });

      // Handle persona info if present
      const personaInfo = jsonData["Personas"];
      if (personaInfo && typeof window !== "undefined") {
        const personaInput = document.getElementById(
          "personaInput"
        ) as HTMLInputElement | null;
        if (personaInput) {
          personaInput.value = personaInfo;
        }
      }
    } catch (error) {
      console.error("Error loading JSON:", error);
      throw error;
    }
  }

  public handleResetButtonClick(): void {
    if (this.latestLoadAvatarCommand && this.isConnected) {
      this.sendCommand({ resetavatar: this.latestLoadAvatarCommand });
    }
  }

  public sendCommand(command: ArcwareCommand): void {
    if (!this.isConnected) {
      console.error("Arcware not connected");
      return;
    }
    try {
      if ("usermessege" in command) {
        this.isProcessingAIMessage = false;
      }
      if ("resetavatar" in command) {
        this.latestLoadAvatarCommand = command.resetavatar;
      }

      this.application?.emitUIInteraction(command);
      console.log("Command sent:", command);
    } catch (error) {
      console.error("Error sending command:", error);
    }
  }

  public getPixelStreaming(): any {
    return this.pixelStreaming;
  }

  public onResponse(callback: (response: string) => void): void {
    this.onResponseCallbacks.push(callback);
  }

  public removeResponse(callback: (response: string) => void): void {
    this.onResponseCallbacks = this.onResponseCallbacks.filter(cb => cb !== callback);
  }

  public cleanup(): void {
    this.isConnected = false;
    this.onResponseCallbacks = [];
    this.latestLoadAvatarCommand = null;
    this.isProcessingAIMessage = false;
    if (this.application?.stream) {
      this.application.stream.disconnect();
    }
  }
}

export const arcwareManager = ArcwareManager.getInstance();

export function ArcwarePixeclStreamingManager() {
  return {
    initialize: (containerRef: HTMLElement, onLoading?: (loading: boolean) => void) =>
      arcwareManager.initialize(containerRef, onLoading),
    sendCommand: (command: ArcwareCommand) => arcwareManager.sendCommand(command),
    loadAndSendAvatarData: (jsonFilePath: string) => arcwareManager.loadAndSendAvatarData(jsonFilePath),
    handleResetButtonClick: () => arcwareManager.handleResetButtonClick(),
    onResponse: (callback: (response: string) => void) => arcwareManager.onResponse(callback),
    removeResponse: (callback: (response: string) => void) => arcwareManager.removeResponse(callback),
    cleanup: () => arcwareManager.cleanup(),
    isReady: () => arcwareManager.isReady(),
    getPixelStreaming: () => arcwareManager.getPixelStreaming(), // Export the getter
  };
}