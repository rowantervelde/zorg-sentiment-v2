declare module "sentiment" {
  interface SentimentResult {
    score: number;
    comparative: number;
    positive: string[];
    negative: string[];
    tokens: string[];
    words: string[];
    calculation: Array<{ [word: string]: number }>;
  }

  export default class Sentiment {
    constructor();
    analyze(phrase: string, options?: object, callback?: Function): SentimentResult;
  }
}
