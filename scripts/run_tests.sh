#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

# Executes cleanup function at script exit.
trap "pkill ganache" EXIT

ganache_port=8545

ganache_running() {
  nc -z localhost "$ganache_port"
}

start_ganache() {
  npx ganache-cli -d --db ../blockchain -i 123 --gasLimit 0x1fffffffffffff --gasPrice 0x1 --port "$ganache_port" > /dev/null &

  echo "Waiting for Ganache to launch on port "$ganache_port"..."
  while ! ganache_running; do sleep 0.1; done

}


if ganache_running; then
  echo "Using existing Ganache instance"
else
  echo "Starting Ganache instance"
  start_ganache
fi


npx truffle test