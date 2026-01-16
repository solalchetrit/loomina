#!/bin/bash
export PATH="$PWD/node-v20.11.0-darwin-arm64/bin:$PATH"
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
exec "$@"
