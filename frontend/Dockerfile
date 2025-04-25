FROM denoland/deno:2.2.9

WORKDIR /app

COPY package.json package-lock.json* ./
COPY deno.json deno.lock* ./

RUN deno install

COPY . .

EXPOSE 3000

CMD ["deno", "task", "serve:development", "--", "--host", "0.0.0.0", "--port", "3000"]
