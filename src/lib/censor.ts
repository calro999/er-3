export const EXPLICIT_WORDS = [
  "中出し", "フェラ", "手コキ", "パイズリ", "素股", "イラマチオ", "潮吹き", "顔射", "口内射精", "飲尿", 
  "レイプ", "強姦", "輪姦", "乱交", "近親相姦", "寝取られ", "NTR", "痴漢", "盗撮", "援交", "パパ活",
  "ロリ", "ペド", "ショタ", "スカトロ", "アナル", "オナニー", "自慰", "絶頂", "アクメ", "イク", "イッ", 
  "クリトリス", "マンコ", "おまんこ", "ちんこ", "おちんちん", "ペニス", "ヴァギナ", "処女", "童貞", "巨乳", 
  "爆乳", "貧乳", "微乳", "無修正", "モザイク破壊", "裏ビデオ", "流出", "本番", "ハメ", "セックス"
];

export function censorText(text: string): string {
  if (!text) return text;
  let censored = text;
  
  EXPLICIT_WORDS.forEach(word => {
    if (word.length === 1) {
      const regex = new RegExp(word, 'g');
      censored = censored.replace(regex, '🔴');
    } else {
      const replacement = word.charAt(0) + '🔴' + word.slice(2);
      const regex = new RegExp(word, 'g');
      censored = censored.replace(regex, replacement);
    }
  });
  
  return censored;
}
