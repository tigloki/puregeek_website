import sys
import os

APP_DIR = os.path.dirname(__file__)
sys.path.insert(0, APP_DIR)

# Passenger runs this under the system Python, which doesn't have Flask
# installed. Re-exec under the venv's interpreter (created alongside this
# file as ./venv) so the real app import below picks up its packages.
INTERP = os.path.join(APP_DIR, "venv", "bin", "python3")
if os.path.exists(INTERP) and sys.executable != INTERP:
    os.execl(INTERP, INTERP, *sys.argv)

from server import app as application  # noqa: E402  (Passenger imports this module and looks for `application`)
