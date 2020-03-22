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
  const overlayPath = Path.resolve(__dirname, "../overlay");

  // Load config and get required modules list
  const { modules }: any = JSON.parse(
    await Fs.promises.readFile(
      Path.join(overlayPath, "timeline_viewer_app.json"),
      "utf-8"
    )
  );

  // Determine location of chrome devtool sources
  const sourcePath = resolvePkg("chrome-devtools-frontend", { cwd: __dirname });

  if (!sourcePath) {
    throw new Error(
      `Could not resolve "chrome-devtools-frontend" from ${__filename}`
    );
  }

  const frontendSourcePath = Path.join(sourcePath, "front_end");

  const baseSources = [
    "root.js",
    "Runtime.js",
    "InspectorBackendCommands.js",
    "SupportedCSSProperties.js",
    "platform",
    "dom_extension",
    "common",
    "host",
    "protocol",
    "sdk",
    "ui",
    "services",
    "workspace",
    "bindings",
    "components",
    "persistence",
    "browser_sdk",
    "extensions",
    "console_counters",
    "text_utils",
    "Images"
  ].map(p => Path.join(frontendSourcePath, p));

  const requiredSources = modules.map(({ name }: any) =>
    Path.join(frontendSourcePath, name)
  );

  const sources: string[] = [
    ...new Set<string>([...baseSources, ...requiredSources])
  ];

  // Copy required module sources into target fs
  await Promise.all(
    sources.map((path: string) =>
      copy(
        { path, fs: Fs },
        { path: Path.join("/", Path.relative(frontendSourcePath, path)), fs }
      )
    )
  );

  // Copy overlay to override frontend sources where needed
  await copy({ path: overlayPath, fs: Fs }, { path: "/", fs });

  // Inject the profile
  await fs.promises.writeFile('/profile.json', options.profile);

  return fs;
}
