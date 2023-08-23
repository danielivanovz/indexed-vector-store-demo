FROM python:3.11.4 as embeddings-builder

WORKDIR /embeddings

ARG HUGGINGFACE_API_KEY
ARG MODEL_NAME
ARG OUTPUT_DIR

COPY ./embeddings-generator/requirements.txt ./

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

ENV HUGGINGFACE_API_KEY=$HUGGINGFACE_API_KEY
ENV MODEL_NAME=$MODEL_NAME
ENV OUTPUT_DIR=$OUTPUT_DIR

COPY ./embeddings-generator ./
RUN python main.py

# ---- Golang Microservice ----
FROM golang:1.16 as golang-builder

WORKDIR /go/src/app
COPY ./embeddings-server/go.mod ./embeddings-server/go.sum ./
RUN go mod download

COPY ./embeddings-server ./
RUN go build -o app .

# ---- Final Stage ----
FROM golang:1.16

COPY --from=embeddings-builder /embeddings/files ./files
COPY --from=golang-builder /go/src/app/app /go/src/app/app

EXPOSE 8080

CMD ["/go/src/app/app"]

