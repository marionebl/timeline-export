#!/usr/bin/env node
import * as Path from "path";
import * as Fs from "fs";
import yargs from "yargs";
import { timelineExport } from "./timeline-export.main";
import { copy } from "./fs-util/copy";

const cli = yargs
  .option("profile", {
    alias: "p",
    type: "string",
    description: "The profile to display in timeline view",
    required: true,
  })
  .option("out", {
    alias: "o",
    type: "string",
    description: "The directory to create the timeline view webroot at",
    required: true,
  })
  .option("queryable", {
    alias: "q",
    type: "boolean",
    description:
      "Whether the devtools accept a profile url to load as query parameter",
    default: false,
    required: false,
  });

async function main(flags: {
  profile: string;
  out: string;
  queryable: boolean;
}) {
  const targetPath = Path.join(process.cwd(), flags.out);
  const profilePath = Path.join(process.cwd(), flags.profile);

  const fs = await timelineExport({
    profile: await Fs.promises.readFile(profilePath, "utf-8"),
    queryable: flags.queryable,
  });

  await copy({ path: "/", fs }, { path: targetPath, fs: Fs });
}

main(cli.argv).catch((error) => {
  console.error(error);
  process.exit(1);
});
