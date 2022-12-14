import { Client, Entity, EntityData, Schema } from 'redis-om'

export interface Group {
  id: string
  group: string
  createdAt: number
  updatedAt: number
  meta: string
}

export interface GroupData extends EntityData {
  id: string
  group: string
  createdAt: number
  updatedAt: number
  meta: string
}

export class Group extends Entity {}

export const GroupSchema = new Schema(Group, {
  id: { type: 'string' },
  group: { type: 'string' },
  createdAt: { type: 'number' },
  updatedAt: { type: 'number' },
  meta: { type: 'string' },
})

const client = new Client()

async function connect(url: string) {
  if (!client.isOpen()) {
    await client.open(url)
    console.log('Redis Connection established')
  }
}

async function createRepository() {
  const repository = client.fetchRepository<Group>(GroupSchema)
  await repository.createIndex()
}

export const setupRedis = async (url: string) => {
  await connect(url)
  await createRepository()
}

export async function closeRedis() {
  await client.close()
}

export async function createGroup(groupData: GroupData): Promise<Group> {
  const repository = client.fetchRepository<Group>(GroupSchema)

  const groupInstance = await repository.createAndSave(groupData)
  await repository.expire(
    groupInstance.entityId,
    parseInt(process.env.HEARTBEAT_EXPIRE!)
  )

  return groupInstance
}

export async function updateGroup(groupInstance: Group) {
  const repository = client.fetchRepository<Group>(GroupSchema)

  groupInstance.updatedAt = Date.now()

  await repository.save(groupInstance)
  await repository.expire(
    groupInstance.entityId,
    parseInt(process.env.HEARTBEAT_EXPIRE!)
  )
}

export async function searchGroupByField(field: string, value: string): Promise<Group | null>  {
  const repository = client.fetchRepository<Group>(GroupSchema)

  return await repository.search().where(field).equals(value).return.first()
}

export async function searchGroupsByField(field: string, value: string): Promise<Group[]> {
  const repository = client.fetchRepository<Group>(GroupSchema)

  return await repository.search().where(field).equals(value).return.all()
}

export async function deleteGroup(groupInstance: Group) {
  const repository = client.fetchRepository<Group>(GroupSchema)

  return await repository.remove(groupInstance.entityId)
}

export async function getAllGroups(): Promise<Group[]> {
  const repository = client.fetchRepository<Group>(GroupSchema)

  return await repository.search().return.all()
}
