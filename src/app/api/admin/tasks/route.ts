import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: {
        order: 'asc'
      }
    });
    return NextResponse.json(tasks);
  } catch (error: any) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

  export async function POST(req: Request) {
    try {
      const body = await req.json();
      const { title, description, status, assignee, deadline } = body;
  
      if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Get the highest order for the given status to place at the bottom
    const lastTask = await prisma.task.findFirst({
      where: { status: status || "NEW" },
      orderBy: { order: 'desc' }
    });

    const newOrder = lastTask ? lastTask.order + 1000 : 1000;

      const newTask = await prisma.task.create({
        data: {
          title,
          description,
          status: status || "NEW",
          assignee,
          deadline: deadline ? new Date(deadline) : null,
          subTasks: [],
          order: newOrder
        }
      });

    return NextResponse.json(newTask);
  } catch (error: any) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
