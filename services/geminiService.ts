import { GoogleGenAI, Modality } from "@google/genai";
import { VoiceName } from '../types';
import { SAMPLE_RATE } from '../constants';
import { base64ToBytes, bytesToInt16, pcmToWavBlob } from '../utils/audioUtils';

// Initialize Gemini Client
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("缺少 API Key。请检查环境变量配置。");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * 使用 LLM (Gemini 2.5 Flash) 优化或生成脚本
 */
export const optimizeScript = async (
  currentText: string,
  systemInstruction: string,
  userPrompt: string
): Promise<string> => {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: `原文内容：\n"${currentText}"\n\n任务要求：${userPrompt}` }
          ]
        }
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const result = response.text;
    if (!result) throw new Error("AI 未返回内容");
    return result.trim();
  } catch (error) {
    console.error("Gemini LLM Error:", error);
    throw error;
  }
};

/**
 * 使用 TTS 模型生成语音
 */
export const generateSpeech = async (
  text: string,
  voiceName: VoiceName
): Promise<{ blob: Blob; duration: number }> => {
  const ai = getClient();
  
  try {
    console.log(`Starting generation for voice: ${voiceName}`);
    
    // Ensure text is not empty
    if (!text || !text.trim()) {
      throw new Error("生成文本不能为空");
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO], // Use the Enum strictly
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    // Check for inline data (audio)
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      // Try to find if there is a text refusal/error message from the model
      const textPart = response.candidates?.[0]?.content?.parts?.[0]?.text;
      const finishReason = response.candidates?.[0]?.finishReason;
      
      console.error("API Response structure (No Audio):", response);
      
      if (finishReason === 'SAFETY') {
        throw new Error("生成内容因安全原因被拦截。请修改文案后重试。");
      }
      
      if (textPart) {
        throw new Error(`生成失败，模型返回了文本而非音频: "${textPart.slice(0, 50)}..."`);
      }

      throw new Error("API 请求成功，但未返回音频数据。可能是暂时的服务问题。");
    }

    // Decode Base64 to Raw Bytes
    const audioBytes = base64ToBytes(base64Audio);
    
    // Convert Bytes to Int16 PCM
    const pcmData = bytesToInt16(audioBytes);

    // Convert PCM to WAV Blob for browser compatibility (playback & download)
    const wavBlob = pcmToWavBlob(pcmData, SAMPLE_RATE);

    // Calculate approximate duration
    // Duration = Total Samples / Sample Rate
    const duration = pcmData.length / SAMPLE_RATE;

    return { blob: wavBlob, duration };

  } catch (error: any) {
    console.error("Gemini TTS Error:", error);
    // Rethrow with a user-friendly message if possible
    throw new Error(error.message || "语音生成服务发生未知错误");
  }
};