#!/usr/bin/env python3
"""Send one predefined action to the in-memory Databricks OAuth broker."""

from __future__ import annotations

import argparse
import json
import socket


SOCKET_PATH = "/tmp/databricks-explore-oauth.sock"
ALLOWED_ACTIONS = ("status", "readonly_probe", "feature_probe", "genie_probe", "shutdown")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("action", choices=ALLOWED_ACTIONS)
    args = parser.parse_args()
    payload = (json.dumps({"action": args.action}) + "\n").encode()
    with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as client:
        client.connect(SOCKET_PATH)
        client.sendall(payload)
        client.shutdown(socket.SHUT_WR)
        chunks: list[bytes] = []
        while True:
            chunk = client.recv(65536)
            if not chunk:
                break
            chunks.append(chunk)
    response = json.loads(b"".join(chunks))
    print(json.dumps(response, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
