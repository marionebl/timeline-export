import * as Fs from "fs";
import * as Path from "path";
import { Volume } from "memfs";
import resolvePkg from "resolve-pkg";
import { copy } from "./fs-util/copy";

export interface TimelineExportOptions {
  profile: string;
}

export async function timelineExport(options: TimelineExportOptions) {
  const volume = new Volume();
  const fs = (volume as unknown) as typeof Fs;

  // Determine location of timeline-export-app
  const sourcePath = resolvePkg("timeline-export-app", { cwd: __dirname });

  if (!sourcePath) {
    throw new Error(
      `Could not resolve "timeline-export-app" from ${__filename}`
    );
  }

  // Copy required module sources into target fs
  await copy({ path: sourcePath, fs: Fs }, { path: "/", fs });

  // Rename entry point template
  await fs.promises.rename('/timeline_export_app.html', '/index.html');

  // Inject the profile
  await fs.promises.writeFile('/profile.json', options.profile);

  return fs;
}
