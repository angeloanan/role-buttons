/* eslint-disable no-var */
import type { InfluxDB } from '@influxdata/influxdb-client'
import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
  var influx: InfluxDB | undefined
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['error', 'info', 'warn']
  })

if (process.env.NODE_ENV !== 'production') global.prisma = prisma

export * from './influxdb.js'
