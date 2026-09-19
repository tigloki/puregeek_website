#!/usr/bin/python3
import os
import sys

APP_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, APP_DIR)

# The shebang above is the generic system Python, which doesn't have Flask
# installed. Re-exec under this app's own ./venv (relative to wherever it's
# actually deployed) so this file works unchanged across every account/domain
# it's checked out on, instead of hardcoding one server's absolute path.
INTERP = os.path.join(APP_DIR, "venv", "bin", "python3")
if os.path.exists(INTERP) and sys.executable != INTERP:
    os.execl(INTERP, INTERP, *sys.argv)

from wsgiref.handlers import CGIHandler  # noqa: E402
from server import app  # noqa: E402

CGIHandler().run(app)
