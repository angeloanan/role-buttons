/* eslint-disable no-var */
import { InfluxDB, Point } from '@influxdata/influxdb-client'

declare global {
  var influx: InfluxDB | undefined
}

const influxdb =
  global.influx ||
  new InfluxDB({
    url: process.env.INFLUX_URL,
    token: process.env.INFLUX_TOKEN
  })

if (process.env.NODE_ENV !== 'production') global.influx = influxdb

const writeApi = influxdb.getWriteApi(process.env.INFLUX_ORG, process.env.INFLUX_BUCKET, 'ms')

process.on('exit', () => {
  void writeApi.close()
})

// -----------------------------------------------------------------------------

const gatewayPingLog = (pingMs: number, shardNo = -1) => {
  writeApi.writePoint(
    new Point('gateway_ping').tag('shard', shardNo.toString()).uintField('latency', pingMs)
  )
}

const gatewayEventsLog = () => {
  writeApi.writePoint(new Point('gateway_events'))
}

const guildCountLog = (count: number) => {
  writeApi.writePoint(new Point('guild_count').uintField('count', count))
}

// -----------------------------------------------------------------------------

enum RoleAssignMode {
  Add = 'add',
  Remove = 'remove'
}

interface roleAssignProps {
  serverId: string
}

const roleAssignLog = (mode: RoleAssignMode, { serverId }: roleAssignProps) => {
  writeApi.writePoint(
    new Point('role_assign').tag('assign', mode).stringField('server_id', serverId)
  )
}

// -----------------------------------------------------------------------------

enum RoleGroupMode {
  Add = 'add',
  Remove = 'remove',
  Modify = 'modify'
}

interface roleGroupProps {
  serverId: string
}

const roleGroupLog = (mode: RoleGroupMode, { serverId }: roleGroupProps) => {
  writeApi.writePoint(new Point('role_group').tag('group', mode).stringField('server_id', serverId))
}

// -----------------------------------------------------------------------------

enum DisplayMode {
  Add = 'add'
}

interface displayProps {
  serverId: string
}

const displayLog = (mode: DisplayMode, { serverId }: displayProps) => {
  writeApi.writePoint(new Point('display').tag('display', mode).stringField('server_id', serverId))
}

// -----------------------------------------------------------------------------

enum PresetMode {
  Apply = 'apply'
}

interface presetProps {
  serverId: string
}

const presetLog = (mode: PresetMode, { serverId }: presetProps) => {
  writeApi.writePoint(new Point('preset').tag('apply', mode).stringField('server_id', serverId))
}

export const influx = {
  _writeApi: writeApi,

  gatewayPingLog,
  gatewayEventsLog,
  guildCountLog,

  roleAssignLog,
  roleGroupLog,
  displayLog,

  presetLog,

  RoleAssignMode,
  RoleGroupMode,
  DisplayMode,
  PresetMode
}
