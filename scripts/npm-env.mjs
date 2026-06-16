/** Clear sandbox-injected npm config that npm 11+ no longer recognizes. */
export function npmEnv(env = process.env) {
  const next = { ...env };
  delete next.npm_config_devdir;
  return next;
}
