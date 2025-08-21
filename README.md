# mcuc

A command-line tool for Material Color Utilities, packaged with npm and Nix flakes.  
Quickly access Material Color Utilities from the terminal.  
Reproducible builds using [Nix flakes](https://nixos.org/manual/nix/unstable/command-ref/new-cli/nix3-flake.html).

## Installation

### As a Node.js/npm project

```sh
git clone https://github.com/hoppxi/mcu-cli.git
cd mcu-cli
npm install
npm run build

./dist/bin/mcuc.js [options] <command>
```

### With Nix flakes

```sh
nix build
# or
nix run github:hoppxi/mcu-cli
```

The resulting binary will be in `./result/bin/mcuc`.

## Usage

```sh
./result/bin/mcuc [options] <command>
```

## Development

To enter a development shell with Node.js and npm available:

```sh
nix develop
```

`
Using in other flake projects

You can add mcuc as an input in another flake. For example:

```nix
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    mcuc.url = "github:hoppxi/mcu-cli";
  };

  outputs = { self, nixpkgs, mcuc, ... }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs { inherit system; };
    in {
      packages.default = pkgs.mkShell {
        buildInputs = [
          mcuc.packages.${system}.default
        ];
      };
    };
}
```

```sh
nix develop
mcuc --help
```

```sh
# example ouput
❯ mcuc generate "#abcdef" -p my-app- -f yaml -C kebab -T both
[INFO] Generating theme...
[OK] Theme output:
light:
  my-app-primary: '#006399'
  my-app-on-primary: '#ffffff'
  my-app-primary-container: '#cde5ff'
  my-app-on-primary-container: '#001d32'
  my-app-secondary: '#51606f'
  my-app-on-secondary: '#ffffff'
  my-app-secondary-container: '#d4e4f6'
  my-app-on-secondary-container: '#0d1d2a'
  my-app-tertiary: '#67587a'
  my-app-on-tertiary: '#ffffff'
  my-app-tertiary-container: '#eedcff'
  my-app-on-tertiary-container: '#221533'
  my-app-error: '#ba1a1a'
  my-app-on-error: '#ffffff'
  my-app-error-container: '#ffdad6'
  my-app-on-error-container: '#410002'
  my-app-background: '#fcfcff'
  my-app-on-background: '#1a1c1e'
  my-app-surface: '#fcfcff'
  my-app-on-surface: '#1a1c1e'
  my-app-surface-variant: '#dee3eb'
  my-app-on-surface-variant: '#42474e'
  my-app-outline: '#72787e'
  my-app-outline-variant: '#c2c7cf'
  my-app-shadow: '#000000'
  my-app-scrim: '#000000'
  my-app-inverse-surface: '#2f3033'
  my-app-inverse-on-surface: '#f0f0f4'
  my-app-inverse-primary: '#94ccff'
  my-app-surface-dim: '#d9dadd'
  my-app-surface-bright: '#f9f9fc'
  my-app-surface-container-lowest: '#ffffff'
  my-app-surface-container-low: '#f3f3f6'
  my-app-surface-container: '#eeedf1'
  my-app-surface-container-high: '#e8e8eb'
  my-app-surface-container-highest: '#e2e2e5'
dark:
  my-app-primary: '#94ccff'
  my-app-on-primary: '#003352'
  my-app-primary-container: '#004b74'
  my-app-on-primary-container: '#cde5ff'
  my-app-secondary: '#b9c8da'
  my-app-on-secondary: '#233240'
  my-app-secondary-container: '#394857'
  my-app-on-secondary-container: '#d4e4f6'
  my-app-tertiary: '#d2bfe7'
  my-app-on-tertiary: '#382a4a'
  my-app-tertiary-container: '#4f4061'
  my-app-on-tertiary-container: '#eedcff'
  my-app-error: '#ffb4ab'
  my-app-on-error: '#690005'
  my-app-error-container: '#93000a'
  my-app-on-error-container: '#ffb4ab'
  my-app-background: '#1a1c1e'
  my-app-on-background: '#e2e2e5'
  my-app-surface: '#1a1c1e'
  my-app-on-surface: '#e2e2e5'
  my-app-surface-variant: '#42474e'
  my-app-on-surface-variant: '#c2c7cf'
  my-app-outline: '#8c9198'
  my-app-outline-variant: '#42474e'
  my-app-shadow: '#000000'
  my-app-scrim: '#000000'
  my-app-inverse-surface: '#e2e2e5'
  my-app-inverse-on-surface: '#2f3033'
  my-app-inverse-primary: '#006399'
  my-app-surface-dim: '#111416'
  my-app-surface-bright: '#37393c'
  my-app-surface-container-lowest: '#0c0e11'
  my-app-surface-container-low: '#1a1c1e'
  my-app-surface-container: '#1e2022'
  my-app-surface-container-high: '#282a2d'
  my-app-surface-container-highest: '#333538'
```

## License

MIT (see [LICENSE](LICENSE))
