import * as Fs from "fs";
import { Volume } from "memfs";
import resolvePkg from "resolve-pkg";
import {JSDOM} from "jsdom";
import { copy } from "./fs-util/copy";
import { EEXIST } from "constants";

export interface TimelineExportOptions {
  profile: string;
  queryable: boolean;
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

  const html = await fs.promises.readFile('/timeline_export_app.html', 'utf-8');
  const dom = new JSDOM(html);
  const {window} = dom;
  const document = window.document;

  if (options.queryable) {
    document.body.dataset.queryable = 'true';
  } else {
    document.head.innerHTML = `<link rel="preload" href="./profile.json" as ="fetch">${document.head.innerHTML}`;
  }
  
  // Rename entry point template
  await fs.promises.writeFile('/index.html', dom.serialize());

  // Inject the profile
  await fs.promises.writeFile('/profile.json', options.profile);

  return fs;
}
