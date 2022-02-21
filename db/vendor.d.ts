declare namespace NodeJS {
  interface ProcessEnv {
    INFLUX_URL: string
    INFLUX_ORG: string
    INFLUX_BUCKET: string
    INFLUX_TOKEN: string
  }
}
