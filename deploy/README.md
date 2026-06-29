# Deploying UniViz Graphviz

The application listens on `127.0.0.1:3003`. A reverse proxy such as Caddy can
forward the public domain to that address; see `Caddyfile.example`.

The container image is public, so no registry login is required. Run these
commands as a user with `sudo` access:

```bash
sudo mkdir -p /opt/graph-app
cd /opt/graph-app

sudo curl -fsSL -o docker-compose.yml \
  https://raw.githubusercontent.com/SSW-JKU/univiz-graphviz/HEAD/deploy/docker-compose.yml

sudo docker compose pull
sudo docker compose up -d --remove-orphans
sudo docker compose ps
```

The `HEAD` segment in the download URL resolves to the repository's current
default branch, including after a future rename from `master` to `main`.

To deploy a newer image later, rerun:

```bash
cd /opt/graph-app
sudo curl -fsSL -o docker-compose.yml https://raw.githubusercontent.com/SSW-JKU/univiz-graphviz/HEAD/deploy/docker-compose.yml
sudo docker compose pull
sudo docker compose up -d --remove-orphans
sudo docker compose ps
```
