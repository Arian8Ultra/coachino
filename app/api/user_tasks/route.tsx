import { GetCurrentUser } from "@/auth/AuthFunctions";
import { prisma } from "@/prisma/prisma";

export async function GET() {
    const user = await GetCurrentUser();
    if (!user) {
        return new Response("Unauthorized", { status: 401 });
    }

    const tasks = await prisma.userTask.findMany({
        where: { userId: user.id },
        include: {
            user: true,
            Scenario:true
        },
    });

    if (!tasks) {
        return new Response("No tasks found", { status: 404 });
    }
    return new Response(JSON.stringify(tasks), {
        headers: { "Content-Type": "application/json" },
    });
}

export async function PUT(request: Request) {
    const user = await GetCurrentUser();
    if (!user) {
        return new Response("Unauthorized", { status: 401 });
    }

    const data = await request.json();
    const { id, ...updateData } = data;

    const updatedTask = await prisma.userTask.update({
        where: { id, userId: user.id },
        data: updateData,
        include: {
            user: true,
            Scenario:true
        },
    });

    if (!updatedTask) {
        return new Response("Task not found or update failed", { status: 404 });
    }
    return new Response(JSON.stringify(updatedTask), {
        headers: { "Content-Type": "application/json" },
    });
}

export async function DELETE(request: Request) {
    const user = await GetCurrentUser();
    if (!user) {
        return new Response("Unauthorized", { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
        return new Response("Missing task ID", { status: 400 });
    }

    const deletedTask = await prisma.userTask.delete({
        where: { id, userId: user.id },
        include: {
            user: true,
            Scenario:true
        },
    });

    if (!deletedTask) {
        return new Response("Task not found or delete failed", { status: 404 });
    }
    return new Response(JSON.stringify(deletedTask), {
        headers: { "Content-Type": "application/json" },
    });
}

