FROM python:3.12-alpine
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.1 /lambda-adapter /opt/extensions/lambda-adapter
ENV PORT=8000
WORKDIR /var/task
COPY requirements.txt ./
RUN python -m pip install -r requirements.txt
COPY main.py ./
COPY class_types ./class_types
COPY routes ./routes
COPY prompts ./prompts
CMD exec uvicorn main:app --port=$PORT --host=0.0.0.0 --limit-concurrency=100
