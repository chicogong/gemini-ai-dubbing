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
        temperature: 0.7, // 稍微有点创造力，但也保持准确
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
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error("未收到 Gemini API 返回的音频数据。");
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

  } catch (error) {
    console.error("Gemini TTS Error:", error);
    throw error;
  }
};