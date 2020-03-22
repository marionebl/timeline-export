# timeline-export

> Create a shareable timeline view for Chrome performance profiles

## Example

The timeline generated via `timeline-export -p example/profile.json -o example/dist`
can be found at [https://habitual-baseball.surge.sh/](https://habitual-baseball.surge.sh/).

## Usage

```
❯ node lib/timeline-export.bin.js --help
Options:
  --help         Show help                                             [boolean]
  --version      Show version number                                   [boolean]
  --profile, -p  The profile to display in timeline view     [string] [required]
  --out, -o      The directory to create the timeline view webroot at
                                                             [string] [required]
```

## License

MIT License - Copyright (c) 2020-present Mario Nebl