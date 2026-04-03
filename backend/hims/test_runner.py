"""
Simple HIMS adapter test runner.

Usage (local): set environment variables for testing and run with Python.

Example:
  export HIMS_TEST_MODE=rest
  export HIMS_TEST_URL=https://staging-doctor247.example.com
  export HIMS_TEST_USERNAME=youruser
  export HIMS_TEST_PASSWORD=yourpass
  python backend/hims/test_runner.py

This script will attempt to authenticate using the `Doctor247Adapter` and report the result.
Do NOT store secrets in version control.
"""
import os
import sys
import logging
from backend.hims.adapters.doctor247 import Doctor247Adapter

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("hims_test")


def run_rest_test():
    url = os.getenv("HIMS_TEST_URL")
    username = os.getenv("HIMS_TEST_USERNAME")
    password = os.getenv("HIMS_TEST_PASSWORD")
    api_key = os.getenv("HIMS_TEST_API_KEY")

    if not url:
        print("HIMS_TEST_URL is required for REST mode")
        return 2

    adapter = Doctor247Adapter(api_key=api_key, base_url=url)
    try:
        creds = {"url": url, "username": username, "password": password, "api_key": api_key}
        session = adapter.authenticate(creds)
        print("Authentication succeeded:", {k: v for k, v in session.items() if k != 'bearer_token'})
        return 0
    except Exception as e:
        print("Authentication failed:", str(e))
        return 1


def run_db_test():
    host = os.getenv("HIMS_TEST_HOST")
    username = os.getenv("HIMS_TEST_DB_USERNAME")
    password = os.getenv("HIMS_TEST_DB_PASSWORD")
    database = os.getenv("HIMS_TEST_DB_NAME")

    if not host:
        print("HIMS_TEST_HOST is required for DB mode")
        return 2

    adapter = Doctor247Adapter()
    try:
        creds = {"host": host, "username": username, "password": password, "database": database}
        session = adapter.authenticate(creds)
        print("DB authentication succeeded:", session)
        return 0
    except Exception as e:
        print("DB authentication failed:", str(e))
        return 1


def main():
    mode = os.getenv("HIMS_TEST_MODE", "rest").lower()
    if mode == "rest":
        code = run_rest_test()
    elif mode == "db":
        code = run_db_test()
    else:
        print("Unknown HIMS_TEST_MODE. Use 'rest' or 'db'.")
        code = 2
    sys.exit(code)


if __name__ == "__main__":
    main()
