#!/usr/bin/env bash

NODE_VERSION="$1"

echo "Installing Node ${NODE_VERSION}..."
echo

set -eou pipefail

sudo apt-get update
sudo apt-get install --yes --no-install-recommends curl ca-certificates apt-transport-https
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
curl -sL https://deb.nodesource.com/setup_${NODE_VERSION} | sudo -E bash -
sudo apt-get install --yes --no-install-recommends nodejs yarn
