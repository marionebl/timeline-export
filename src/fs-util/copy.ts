import * as Fs from "fs";
import * as Path from "path";
import {FsPath} from "./types";

export async function copy(from: FsPath, to: FsPath): Promise<typeof Fs> {
  const stat = await from.fs.promises.stat(from.path);
  const relPath = Path.relative(from.rootPath || from.path, from.path);
  const targetPath = Path.join(to.rootPath || to.path, relPath);

  if (stat.isFile()) {
    await to.fs.promises.writeFile(
      targetPath,
      await from.fs.promises.readFile(from.path)
    );
  }

  if (stat.isDirectory()) {
    const list = await from.fs.promises.readdir(from.path);

    if (!to.fs.existsSync(targetPath)) {
      await to.fs.promises.mkdir(targetPath);
    }

    await Promise.all(
      list.map(path =>
        copy(
          {
            rootPath: from.rootPath || from.path,
            path: Path.join(from.path, path),
            fs: from.fs
          },
          {
            rootPath: to.rootPath || to.path,
            path: Path.join(to.path, path),
            fs: to.fs
          }
        )
      )
    );
  }

  return to.fs;
}
