# Infra — VPS deploy

Push to `main` → CI (ruff, pytest, lint, tsc, build) → images pushed to GHCR
(`ghcr.io/gor1911/remember-us-{backend,frontend}:<sha>`) → `deploy` job copies
`infra/` to the VPS and runs `deploy.sh <sha>` (pre-deploy DB dump → pull → migrate → up → smoke check).

## First-time setup

1. CI key pair (local):
   ```bash
   ssh-keygen -t ed25519 -f remember-us-ci -N "" -C remember-us-ci
   ```
2. VPS (Ubuntu/Debian, as root):
   ```bash
   ssh root@<VPS_IP> "mkdir -p /opt/remember-us"
   scp -r infra root@<VPS_IP>:/opt/remember-us/
   ssh root@<VPS_IP> "bash /opt/remember-us/infra/bootstrap.sh '$(cat remember-us-ci.pub)'"
   ssh root@<VPS_IP> "nano /opt/remember-us/infra/.env.prod"   # fill CHANGE_ME / YOUR_VPS_IP
   ```
3. GitHub → Settings → Secrets and variables → Actions:
   - Secrets: `VPS_HOST` (IP), `VPS_USER` (`deploy`), `VPS_SSH_KEY` (contents of `remember-us-ci`),
     `VPS_KNOWN_HOSTS` (output of `ssh-keyscan <VPS_IP>`)
   - Variables: `PUBLIC_HOST` (IP now, domain later — baked into the frontend bundle)
4. Push to `main` (or Actions → CI → Run workflow on `main`). Then create the admin once:
   ```bash
   ssh deploy@<VPS_IP>
   cd /opt/remember-us/infra && docker compose --env-file .env.prod exec backend python manage.py createsuperuser
   ```

## Day to day

| Task | Command (on VPS, in `/opt/remember-us/infra`) |
|------|------|
| Rollback | `bash deploy.sh <previous-commit-sha>` (images must be pullable — `docker login ghcr.io` with a PAT if the package is private) |
| Logs | `docker compose --env-file .env.prod logs -f backend` |
| Manual backup | `bash backup.sh` (cron runs it daily at 03:00, keeps 7 days in `/opt/remember-us/backups`) |

## Not yet

- Domain + HTTPS (certbot, nginx 443, switch `config.settings.staging` → prod settings without S3) — required for live Stripe keys.
- Off-server backup copies.
