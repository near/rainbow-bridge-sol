#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -aex

yarn

# Remove existing files.
rm -f dist/*.sol

unameOut="$(uname -s)"
case "${unameOut}" in
    Linux*)     machine=Linux;;
    Darwin*)    machine=Mac;;
    *)          machine="UNKNOWN:${unameOut}"
esac

# shellcheck disable=SC2045
for contract_path in $(ls ./contracts/*.sol)
do
  filename=$(basename -- "$contract_path")
  # Get contract name without extension and without directories.
  contract_name="${filename%.*}"
  node_modules/.bin/truffle-flattener "./contracts/${contract_name}.sol" > "dist/${contract_name}.full.sol"
  # Fix for https://github.com/nomiclabs/truffle-flattener/issues/55
  if [[ $machine == 'Linux' ]]
  then
    sed -i '/^\/\/ SPDX-License-Identifier:/d' "dist/${contract_name}.full.sol"
  elif [[ $machine == 'Mac' ]]
  then
    sed -i '' '/^\/\/ SPDX-License-Identifier:/d' "dist/${contract_name}.full.sol"
  else
    exit 1
  fi
  yarn run solcjs --bin --abi --optimize "dist/${contract_name}.full.sol" -o "dist"
  mv "dist/dist_${contract_name}_full_sol_${contract_name}.abi" "dist/${contract_name}.full.abi"
  mv "dist/dist_${contract_name}_full_sol_${contract_name}.bin" "dist/${contract_name}.full.bin"
  rm -f dist/*_sol_*
done
