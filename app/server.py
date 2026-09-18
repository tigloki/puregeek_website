#!/usr/bin/env python3
"""Real backend for the PureGeek OLNC design build: serves the static
pages and persists contact-form submissions to SQLite, with a
best-effort email notification per new submission.

Email requires SMTP credentials via environment variables (see
.env.example) — without them, submissions still save to the DB, but
no email is sent (logged, not fatal).
"""
import json
import os
import smtplib
import sqlite3
from datetime import datetime, timezone
from email.mime.text import MIMEText
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent / ".env")
except ImportError:
    pass  # fine locally when env vars are exported some other way; required on the live server

ROOT = Path(__file__).parent
STATIC_DIR = ROOT / "static"
DB_PATH = ROOT / "submissions.db"

app = Flask(__name__, static_folder=None)


def init_db():
    con = sqlite3.connect(DB_PATH)
    con.execute(
        """
        CREATE TABLE IF NOT EXISTS submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT NOT NULL,
            source_page TEXT,
            name TEXT NOT NULL,
            contact_method TEXT NOT NULL,
            interests TEXT,
            user_agent TEXT,
            ip TEXT
        )
        """
    )
    con.commit()
    con.close()


def send_notification(row: dict):
    host = os.environ.get("SMTP_HOST")
    port = os.environ.get("SMTP_PORT")
    user = os.environ.get("SMTP_USER")
    password = os.environ.get("SMTP_PASS")
    mail_to = os.environ.get("MAIL_TO", "puregeek@puregeek.net")
    mail_from = os.environ.get("MAIL_FROM", user or mail_to)

    if not (host and port and user and password):
        app.logger.warning(
            "SMTP not configured (SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS) — "
            "skipping email notification for submission id=%s", row.get("id")
        )
        return False

    body = (
        f"New PureGeek site lead\n\n"
        f"Name: {row['name']}\n"
        f"Contact: {row['contact_method']}\n"
        f"Interests: {row['interests']}\n"
        f"Source page: {row['source_page']}\n"
        f"When: {row['created_at']}\n"
        f"User agent: {row['user_agent']}\n"
        f"IP: {row['ip']}\n"
    )
    msg = MIMEText(body)
    msg["Subject"] = f"PureGeek lead: {row['name']}"
    msg["From"] = mail_from
    msg["To"] = mail_to

    try:
        with smtplib.SMTP(host, int(port), timeout=10) as smtp:
            smtp.starttls()
            smtp.login(user, password)
            smtp.sendmail(mail_from, [mail_to], msg.as_string())
        return True
    except Exception as exc:  # best-effort — form submission must still succeed
        app.logger.error("Email notification failed for submission id=%s: %s", row.get("id"), exc)
        return False


@app.route("/api/submit", methods=["POST"])
def submit():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    contact = (data.get("contact") or "").strip()
    interests = data.get("interests") or []
    source_page = (data.get("source_page") or "").strip()

    if not name or not contact or not interests:
        return jsonify({"ok": False, "error": "name, contact, and at least one interest are required"}), 400

    created_at = datetime.now(timezone.utc).isoformat()
    interests_str = ", ".join(interests)
    user_agent = request.headers.get("User-Agent", "")
    ip = request.headers.get("X-Forwarded-For", request.remote_addr or "")

    con = sqlite3.connect(DB_PATH)
    cur = con.execute(
        "INSERT INTO submissions (created_at, source_page, name, contact_method, interests, user_agent, ip) "
        "VALUES (?, ?, ?, ?, ?, ?, ?)",
        (created_at, source_page, name, contact, interests_str, user_agent, ip),
    )
    con.commit()
    row_id = cur.lastrowid
    con.close()

    row = {
        "id": row_id,
        "created_at": created_at,
        "source_page": source_page,
        "name": name,
        "contact_method": contact,
        "interests": interests_str,
        "user_agent": user_agent,
        "ip": ip,
    }
    emailed = send_notification(row)

    return jsonify({"ok": True, "id": row_id, "emailed": emailed})


@app.route("/api/submissions", methods=["GET"])
def list_submissions():
    """Local admin view — not linked from the site."""
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    rows = con.execute("SELECT * FROM submissions ORDER BY id DESC").fetchall()
    con.close()
    return jsonify([dict(r) for r in rows])


@app.route("/", defaults={"path": "index.html"})
@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(STATIC_DIR, path)


init_db()  # runs both under `python3 server.py` and under Passenger's import-only startup

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "1212"))
    print(f"PureGeek OLNC build running at http://0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
