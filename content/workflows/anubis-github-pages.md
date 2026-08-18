---
title: anubis in front of github pages
description: how to put anubis in front of a github pages site with a real reverse proxy and no proxy-loop nonsense.
section: workflows
date: 2026-03-29
tags: [hosting, github-pages, ops]
draft: false
---

github pages serves static files. anubis is a filter proxy. those are different jobs, and pretending otherwise is how you end up debugging a loop at 1:30am.

the working shape is boring and correct: github pages stays the origin, your custom domain points at infrastructure you control, and that infrastructure runs the reverse proxy plus anubis.

### architecture

```
browser
  -> caddy or nginx on your server
  -> anubis
  -> github pages origin

example:
  stayfresh.dev
    -> vps
    -> anubis
    -> https://evoke4350.github.io/stayfresh.dev/
```

### the non-negotiables

- github pages cannot execute anubis. it can only host the site files.
- the public dns for the custom domain points to the proxy layer, not directly to github pages.
- the anubis **target** is the github pages origin url, not the public custom domain, or traffic proxies back into itself.
- explicit allow rules let search engines and feed readers survive. anubis defaults to being heavy-handed.

### minimal docker compose

this is the shortest useful version: caddy terminates tls, anubis sits behind it, and github pages is the upstream.

```
services:
  caddy:
    image: caddy:2
    ports:
      - "80:80"
      - "443:443"
      - "443:443/udp"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - anubis

  anubis:
    image: ghcr.io/techarohq/anubis:latest
    pull_policy: always
    environment:
      BIND: ":8923"
      TARGET: "https://evoke4350.github.io/stayfresh.dev/"
      TARGET_HOST: "evoke4350.github.io"
      DIFFICULTY: "4"
      SERVE_ROBOTS_TXT: "true"
      POLICY_FNAME: "/data/cfg/botPolicy.yaml"
    volumes:
      - ./botPolicy.yaml:/data/cfg/botPolicy.yaml:ro

volumes:
  caddy_data:
  caddy_config:
```

### minimal caddyfile

```
stayfresh.dev, www.stayfresh.dev {
  encode gzip zstd

  reverse_proxy http://anubis:8923 {
    header_up X-Real-Ip {remote_host}
    header_up X-Http-Version {http.request.proto}
  }
}
```

### minimal policy file

the policy starts small. the obvious utility paths are allowed, then browser-looking traffic is challenged.

```
bots:
  - name: well-known
    path_regex: ^/.well-known/.*$
    action: ALLOW
  - name: favicon
    path_regex: ^/favicon.ico$
    action: ALLOW
  - name: robots
    path_regex: ^/robots.txt$
    action: ALLOW
  - name: feeds
    path_regex: ^/(rss.xml|atom.xml|feed.json|sitemap.xml)$
    action: ALLOW
  - name: generic-browser
    user_agent_regex: Mozilla
    action: CHALLENGE
```

### rollout order

1. github pages keeps publishing the site exactly as it does now.
2. caddy and anubis run on a vps or similar box.
3. anubis targets the github pages origin url.
4. the custom domain dns moves to the vps.
5. testing covers the challenge flow, feed urls, and a direct content fetch with javascript enabled.
6. allow rules cover anything that needs to keep working.

### why this beats faking it

because it respects the deployment boundary. pages stays static and cheap. the proxy layer does the dynamic work. that split is not glamorous, but it is solid.

### references

- [TecharoHQ/anubis](https://github.com/TecharoHQ/anubis)
- [Anubis installation docs](https://anubis.techaro.lol/docs/admin/installation)
- [Anubis Caddy docs](https://anubis.techaro.lol/docs/admin/environments/caddy)
- [Anubis policy docs](https://anubis.techaro.lol/docs/admin/policies)
