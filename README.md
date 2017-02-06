# autocannon-ci

run your [autocannon][] benchmarks as part of your CI/dev flow, for Node.js

## Usage

```sh
perf-ci -c config.yml --job 245
```

## Configuration Example

```yaml
server: ./server.js
benchmarks:
  root:
    connections: 100
    duration: 5
    url: localhost:3000
  b:
    connections: 100
    duration: 5
    url: localhost:3000/b
storage:
  type: fs
  path: perf-results
flamegraphs: true
notify:
  type: github
  key: ABCDEFGH
```

## Acknowledgements

This project was kindly sponsored by [nearForm](http://nearform.com).

## License

MIT

[autocannon]: https://github.com/mcollina/autocannon
