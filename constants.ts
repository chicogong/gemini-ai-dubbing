import { VoiceName, VoiceOption } from './types';

export const VOICES: VoiceOption[] = [
  {
    id: VoiceName.Puck,
    name: 'Puck',
    gender: 'Male',
    description: '充满活力，略带顽皮的语调。非常适合讲故事或轻松的内容。',
  },
  {
    id: VoiceName.Charon,
    name: 'Charon',
    gender: 'Male',
    description: '深沉、洪亮且具有权威感。非常适合纪录片旁白或新闻播报。',
  },
  {
    id: VoiceName.Kore,
    name: 'Kore',
    gender: 'Female',
    description: '冷静、舒缓且清晰。非常适合冥想引导、教育内容或解说。',
  },
  {
    id: VoiceName.Fenrir,
    name: 'Fenrir',
    gender: 'Male',
    description: '粗犷、激烈且具有号召力。适合游戏角色、广告或电影预告。',
  },
  {
    id: VoiceName.Zephyr,
    name: 'Zephyr',
    gender: 'Female',
    description: '轻快、空灵且亲切。非常适合虚拟助手或日常对话。',
  },
];

export const DEFAULT_VOICE = VoiceName.Kore;
export const SAMPLE_RATE = 24000;