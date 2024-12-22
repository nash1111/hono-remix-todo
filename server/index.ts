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

app.get('/users', async (c) => {
    const users = await prisma.user.findMany({
        include: { todos: true },
    })
    return c.json(users)
})

app.post('/users', async (c) => {
    const { name } = await c.req.json<{ name: string }>()
    const newUser = await prisma.user.create({
        data: { name },
    })
    return c.json(newUser)
})

app.get('/users/:id', async (c) => {
    const userId = parseInt(c.req.param('id'), 10)
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { todos: true },
    })
    if (!user) {
        return c.text(`User id:${userId} not found`, 404)
    }
    return c.json(user)
})

app.delete('/users/:id', async (c) => {
    const userId = parseInt(c.req.param('id'), 10)
    const existing = await prisma.user.findUnique({ where: { id: userId } })
    if (!existing) {
        return c.text(`User id:${userId} not found`, 404)
    }
    await prisma.user.delete({ where: { id: userId } })
    return c.text(`Deleted user id: ${userId}`)
})

app.get('/users/:id/todos', async (c) => {
    const userId = parseInt(c.req.param('id'), 10)
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { todos: true },
    })
    if (!user) {
        return c.text(`User id:${userId} not found`, 404)
    }
    return c.json(user.todos)
})

app.post('/users/:id/todos', async (c) => {
    const userId = parseInt(c.req.param('id'), 10)
    const { title } = await c.req.json<{ title: string }>()
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
        return c.text(`User id:${userId} not found`, 404)
    }
    const newTodo = await prisma.todo.create({
        data: { title, userId },
    })
    return c.json(newTodo)
})

serve({
    fetch: app.fetch,
    port: 3000
})
