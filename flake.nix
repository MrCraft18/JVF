{
    inputs = {
        nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
        nixpkgs-scikit.url = "github:nixos/nixpkgs/5eeca5bbd4fe6e75e3460c6335f2c852526e4f06";
    };

    outputs = { self, nixpkgs, nixpkgs-scikit }: 
    let
        pkgs = nixpkgs.legacyPackages."x86_64-linux"; 
        scikit-pkgs = nixpkgs-scikit.legacyPackages."x86_64-linux";
    in {
        devShells."x86_64-linux".default = pkgs.mkShell {
            packages = [
                pkgs.nodejs
                pkgs.python310
                (pkgs.python310.withPackages (ps: with ps; [
                    unidecode
                    numpy
                ] ++ [
                   scikit-pkgs.python310Packages.scikit-learn 
                ]))
            ];

            shellHook = ''
                export NPM_CONFIG_PREFIX="$HOME/.npm"
            '';
        };
    };
}
