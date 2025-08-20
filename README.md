# mcu-cli

A command-line tool for Material Color Utilities, packaged with Yarn and Nix flakes. Quickly access Material Color Utilities from the terminal. Reproducible builds using [Nix flakes](https://nixos.org/manual/nix/unstable/command-ref/new-cli/nix3-flake.html)

## Installation

### As a Node.js/Yarn project

```sh
git clone https://github.com/hoppxi/mcu-cli.git
cd mcu-cli
yarn install
yarn build
```

### With Nix flakes

```sh
nix build
```

The resulting binary will be in `./result/bin/mcu-cli`.

## Usage

```sh
./result/bin/mcu-cli [options] <command>
```

For help:

```sh
./result/bin/mcu-cli --help
```

## Development

To enter a development shell with Node.js and Yarn available:

```sh
nix develop
```

## License

MIT (see [LICENSE](LICENSE))
