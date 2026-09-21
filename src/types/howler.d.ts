declare module 'howler' {
  export interface HowlOptions {
    src: string[];
    format?: string[];
    volume?: number;
    preload?: boolean;
  }

  export class Howl {
    constructor(options: HowlOptions);
    volume(value?: number): number | Howl;
    play(): number;
    stop(): Howl;
  }
}