FROM alpine AS builder
ENV PYTHONUNBUFFERED=1

RUN apk update
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools

RUN apk add nodejs npm
RUN apk add make gcc g++

WORKDIR /dev/mnt
CMD ["./build.sh"]