"""本地开发服务器：同时提供前端静态文件和 API。

用法：
  pip install flask requests
  python server.py
"""
import os
import sys

# 把 api/ 加入模块搜索路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from api.index import app

if __name__ == "__main__":
    print("启动本地开发服务器: http://localhost:5173")
    print("API 端点: http://localhost:5173/api/...")
    print("环境变量从 .env 文件读取（如果安装了 python-dotenv）")
    print()

    try:
        from dotenv import load_dotenv
        load_dotenv()
        print("已加载 .env 文件")
    except ImportError:
        print("未安装 python-dotenv，从系统环境变量读取")
        print("提示: pip install python-dotenv")

    app.run(host="0.0.0.0", port=5173, debug=True)
