![banner](https://raw.githubusercontent.com/mcollina/autocannon/master/autocannon-banner.png)

# autocannon-ci

**autocannon-ci** can store the results and generate the flamegraphs of
a HTTP/1.1 benchmark for Node.js
Run your [autocannon][] benchmarks as part of your CI/dev flow, for Node.js.

It can also generate a little website containing all the result of your
benchmarking, including [flamegraphs with 0x](https://github.com/davidmarkclements/0://github.com/davidmarkclements/0x):

* [Dashboard](https://s3-us-west-2.amazonaws.com/autocannon-ci-test/index.html)
* [Job page](https://s3-us-west-2.amazonaws.com/autocannon-ci-test/run-2/index.html)

## Install

```sh
npm i autocannon-ci -g
```

## Usage

```sh
autocannon-ci -c autocannon.yml
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
```

## Available commands and full options

autocannon-ci is a tool to run multiple HTTP/1.1 benchmarks, and generate the relative
flamegraphs, with the help of 0x.

Available commands:

  * run (default)
  * compare
  * help

### Run

```
Usage: autocannon-ci run [OPTS]

Runs the benchmarks configured in the autocannon-ci configuration file, and
save them according to the storage configured in the config file. The job id
is used to identify the single run.

Options:

  --config/-c CONFIG      Use the given config file; default: `autocannon.yml`.
  --job/-j ID             Use the specific job id.
  --flamegrah/-F          Generate and store flamegraphs.
```

### Compare

```
Usage: autocannon-ci compare [OPTS] [A] [B]

Compare the job with id A against the job id B. A and B are defaulted to the
latest two jobs.

Options:

  --config/-c CONFIG      Use the given config file; default: `autocannon.yml`.
Launch 'autocannon-ci help [command]' to know more about the commands.
```

## Storage

**autocannon-ci** can store the results and flamegraphs within a
storage, which is configured in the config file.

### type: fs

```yaml
storage:
  type: fs
  path: perf-results
```

### type: s3

```yaml
storage:
  type: s3
  bucket: autocannon-ci-test
  region: us-west-2
```

This will also require the environment variables `S3_ACCESS_KEY` and `S3_SECRET_KEY`
containing the proper credentials to access S3. It uses the
[aws-sdk](http://npm.im/aws-sdk), so any other way of configuring the
credential for that will work for **autocannon-ci** as well.

## Acknowledgements

This project was kindly sponsored by [nearForm](http://nearform.com).

## License

MIT

[autocannon]: https://github.com/mcollina/autocannon
