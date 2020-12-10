#!/usr/bin/env bash

set -e

case "$(uname -s)" in
  Linux)
    sudo apt-get install --yes mono-devel wine-stable
    ;;
  Darwin)
    brew install --cask xquartz wine-stable
    wine64 hostname
    ;;
esac
