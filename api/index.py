import hashlib
import hmac
import json
import os
import time
import secrets

import requests
from flask import Flask, request, jsonify

from ._lib.dd_config import CORP_ID, AGENT_ID, APP_KEY, APP_SECRET
from ._lib.dd_token import get_access_token

app = Flask(__name__)


# ─── 免登 ───────────────────────────────────────────────
@app.post("/api/dd-sso")
def dd_sso():
    body = request.get_json(silent=True) or {}
    code = body.get("code")
    if not code:
        return jsonify({"errcode": -1, "errmsg": "Missing code"}), 400

    try:
        token = get_access_token()
        resp = requests.post(
            "https://oapi.dingtalk.com/topapi/v2/user/getuserinfo",
            params={"access_token": token},
            json={"code": code},
            timeout=10
        )
        data = resp.json()
        if data.get("errcode") != 0:
            return jsonify({"errcode": data["errcode"], "errmsg": data.get("errmsg")}), 500

        user = data.get("result", {})
        return jsonify({
            "userid": user.get("userid"),
            "name": user.get("name", ""),
            "corpId": CORP_ID
        })
    except Exception as e:
        return jsonify({"errcode": -1, "errmsg": str(e)}), 500


# ─── JSAPI 签名 ─────────────────────────────────────────
@app.post("/api/dd-jsapi-sign")
def dd_jsapi_sign():
    body = request.get_json(silent=True) or {}
    url = body.get("url")
    if not url:
        return jsonify({"errcode": -1, "errmsg": "Missing url"}), 400

    try:
        token = get_access_token()
        resp = requests.get(
            "https://oapi.dingtalk.com/get_jsapi_ticket",
            params={"access_token": token, "type": "jsapi"},
            timeout=10
        )
        data = resp.json()
        if data.get("errcode") != 0:
            return jsonify({"errcode": data["errcode"], "errmsg": data.get("errmsg")}), 500

        ticket = data["ticket"]
        ts = str(int(time.time() * 1000))
        nonce = secrets.token_hex(8)
        plain = f"jsapi_ticket={ticket}&noncestr={nonce}&timestamp={ts}&url={url}"
        signature = hashlib.sha256(plain.encode()).hexdigest()

        return jsonify({
            "agentId": AGENT_ID,
            "corpId": CORP_ID,
            "timeStamp": ts,
            "nonceStr": nonce,
            "signature": signature
        })
    except Exception as e:
        return jsonify({"errcode": -1, "errmsg": str(e)}), 500


# ─── 工作通知 ───────────────────────────────────────────
@app.post("/api/dd-notify")
def dd_notify():
    body = request.get_json(silent=True) or {}
    userid_list = body.get("useridList")
    title = body.get("title")
    content = body.get("content")
    jump_url = body.get("jumpUrl", "")

    if not userid_list or not title or not content:
        return jsonify({"errcode": -1, "errmsg": "Missing required fields"}), 400

    try:
        token = get_access_token()
        resp = requests.post(
            "https://oapi.dingtalk.com/topapi/message/corpconversation/asyncsend_v2",
            params={"access_token": token},
            json={
                "agent_id": int(AGENT_ID),
                "userid_list": ",".join(userid_list),
                "msg": {
                    "msgtype": "action_card",
                    "action_card": {
                        "title": title,
                        "markdown": content,
                        "btn_orientation": "1",
                        "btn_json_list": [
                            {"title": "查看详情", "action_url": jump_url}
                        ]
                    }
                }
            },
            timeout=10
        )
        data = resp.json()
        if data.get("errcode") != 0:
            return jsonify({"errcode": data["errcode"], "errmsg": data.get("errmsg")}), 500

        return jsonify({"taskId": data.get("task_id")})
    except Exception as e:
        return jsonify({"errcode": -1, "errmsg": str(e)}), 500


# ─── 通讯录用户列表 ─────────────────────────────────────
@app.get("/api/dd-users")
def dd_users():
    try:
        token = get_access_token()
        resp = requests.post(
            "https://oapi.dingtalk.com/topapi/v2/user/list",
            params={"access_token": token},
            json={"dept_id": 1, "cursor": 0, "size": 100, "fetch_child": True},
            timeout=10
        )
        data = resp.json()
        if data.get("errcode") != 0:
            return jsonify({"errcode": data["errcode"], "errmsg": data.get("errmsg")}), 500

        raw_list = data.get("result", {}).get("list", [])
        users = [
            {"userid": u["userid"], "name": u.get("name", ""), "title": u.get("title", "")}
            for u in raw_list
        ]
        return jsonify({"errcode": 0, "users": users})
    except Exception as e:
        return jsonify({"errcode": -1, "errmsg": str(e)}), 500
