import * as Fs from "fs";

export interface FsPath {
  path: string;
  rootPath?: string;
  fs: typeof Fs;
}
