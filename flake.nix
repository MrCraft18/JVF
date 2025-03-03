{
    inputs = {
        nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    };

    outputs = { self, nixpkgs }: 
    let
        pkgs = nixpkgs.legacyPackages."x86_64-linux"; 
    in {
        devShells."x86_64-linux".default = pkgs.mkShell {
            packages = with pkgs; [
                nodejs
                python310
                pipenv
            ];

            env.LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
                pkgs.stdenv.cc.cc.lib
                pkgs.libz
            ];

            shellHook = ''
                export NPM_CONFIG_PREFIX="$HOME/.npm"
            '';
        };
    };
}
