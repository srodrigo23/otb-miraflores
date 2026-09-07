#!/bin/bash

# cd service
# source .venv/bin/activate


#fastapi dev app/main.py #dev mode
uv run fastapi dev app/main.py --host 0.0.0.0
#uvicorn app.main:app --reload #for production
