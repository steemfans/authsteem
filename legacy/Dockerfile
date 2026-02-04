FROM node:18-alpine AS builder
ARG TAG=master
WORKDIR /app
ADD . /app
RUN cd /app && \
  git checkout ${TAG} && \
  npm install && \
  npm run build

FROM nginx:latest
WORKDIR /app
EXPOSE 80
COPY --from=0 /app/docker_config/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=0 /app/www /app
STOPSIGNAL SIGINT
CMD ["nginx", "-g", "daemon off;"]
