{
  description = "Material Color Utilities Wrapper CLI Flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs { inherit system; };
        mcuc = pkgs.callPackage ./default.nix { inherit pkgs; };
      in
      {
        packages = {
          default = mcuc;
          mcuc = mcuc;
        };

        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_20
          ];
        };
      }
    );
}
