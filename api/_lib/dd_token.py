import time
import requests
from . import dd_config

_token = None
_expire_at = 0

def get_access_token():
    global _token, _expire_at
    now = time.time()
    if _token and now < _expire_at:
        return _token
    resp = requests.get(
        "https://oapi.dingtalk.com/gettoken",
        params={"appkey": dd_config.APP_KEY, "appsecret": dd_config.APP_SECRET},
        timeout=10
    )
    body = resp.json()
    if body.get("errcode") != 0:
        raise RuntimeError(f"钉钉 token 刷新失败: {body.get('errmsg')}")
    _token = body["access_token"]
    _expire_at = now + body["expires_in"] - 60
    return _token
