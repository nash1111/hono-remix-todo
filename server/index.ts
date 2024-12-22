import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const app = new Hono()

app.get('/', (c) => c.text('Hello from Hono!'))

app.get('/todos', async (c) => {
    const todos = await prisma.todo.findMany()
    return c.json(todos)
})

app.post('/todos', async (c) => {
    const { title } = await c.req.json<{ title: string }>()
    const newTodo = await prisma.todo.create({
        data: { title },
    })
    return c.json(newTodo)
})

app.put('/todos/:id', async (c) => {
    const id = parseInt(c.req.param('id'), 10)
    const { completed } = await c.req.json<{ completed: boolean }>()
    const updated = await prisma.todo.update({
        where: { id },
        data: { completed },
    })
    return c.json(updated)
})

app.delete('/todos/:id', async (c) => {
    const id = parseInt(c.req.param('id'), 10)
    await prisma.todo.delete({ where: { id } })
    return c.text(`Deleted todo id: ${id}`)
})

serve({
    fetch: app.fetch,
    port: 3000
})
