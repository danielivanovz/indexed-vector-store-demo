FROM golang:1.17 AS build

WORKDIR /app

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o server .

FROM scratch

WORKDIR /root/

COPY --from=build /app/server .
COPY --from=build /app/files ./files

EXPOSE 8080

CMD ["./server"]