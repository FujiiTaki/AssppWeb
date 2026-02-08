# AssppWeb

A web-based tool for acquiring and installing iOS apps outside the App Store. Authenticate with your Apple ID, search for apps, acquire licenses, and install IPAs directly to your device.

![preview](./resources/preview.png)

## Zero-Trust Architecture

AssppWeb uses a zero-trust design where the server **never sees your Apple credentials**. All Apple API communication happens directly in your browser via WebAssembly (libcurl.js with Mbed TLS 1.3). The server only acts as a blind TCP relay (Wisp protocol) and handles IPA compilation from public CDN downloads.

## Quick Start

### Docker Compose

```bash
curl -O https://raw.githubusercontent.com/Lakr233/AssppWeb/main/compose.yml
docker compose up -d
```

The app will be available at `http://localhost:8080`.

## Environment Variables

| Variable          | Default         | Description                                                                    |
| ----------------- | --------------- | ------------------------------------------------------------------------------ |
| `PORT`            | `8080`          | Server listen port                                                             |
| `DATA_DIR`        | `./data`        | Directory for storing compiled IPAs                                            |
| `PUBLIC_BASE_URL` | _(auto-detect)_ | Public URL for generating install manifests (e.g. `https://asspp.example.com`) |

## Reverse Proxy (Required for iOS)

iOS requires HTTPS for `itms-services://` install links. You must put AssppWeb behind a reverse proxy with a valid TLS certificate.

### Caddy

```
asspp.example.com {
    reverse_proxy 127.0.0.1:8080
}
```

## DDoS Protection

IPA files can be hundreds of megabytes. If your instance is publicly accessible, put it behind a CDN like Cloudflare to absorb bandwidth and prevent abuse.

## License

MIT License. See [LICENSE](LICENSE) for details.

## 🥰 Acknowledgments

For projects that was stolen and used heavily:

- [ipatool](https://github.com/majd/ipatool)
- [Asspp](https://github.com/Lakr233/Asspp)

For friends who helped with testing and feedback:

- [@lbr77](https://github.com/lbr77)
- [@akinazuki](https://github.com/akinazuki)
