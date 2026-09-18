#!/home/dh_nbqx92/olnc.puregeek.net/venv/bin/python3
import os
import sys
from wsgiref.handlers import CGIHandler

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from server import app  # noqa: E402

CGIHandler().run(app)
