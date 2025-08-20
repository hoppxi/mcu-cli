{
  pkgs ? import <nixpkgs> { },
}:

pkgs.stdenv.mkDerivation {
  pname = "mcu-cli";
  version = "1.0.0";

  src = ./.;

  buildInputs = with pkgs; [
    nodejs_20
    yarn
  ];

  yarnOfflineCache = pkgs.fetchYarnDeps {
    yarnLock = ./yarn.lock;
    ssha256 = "sha256-ijfalMn9FO/KvpDUj7zWtl6wcmOzQHwZ5wNqamdISYg=";
  };

  installPhase = ''
    yarn install --offline --frozen-lockfile --ignore-scripts --cache-folder=$yarnOfflineCache
    yarn build
    mkdir -p $out/bin
    cp dist/bin/muc-cli.js $out/bin/muc-cli
    chmod +x $out/bin/muc-cli
  '';

  meta = with pkgs.lib; {
    description = "Material Color Utilities Wrapper CLI";
    license = licenses.mit;
    maintainers = with maintainers; [ hoppxi ];
    platforms = platforms.all;
    mainProgram = "mcu-cli";
  };
}
