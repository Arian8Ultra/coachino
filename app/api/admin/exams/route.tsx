import {
  Exam_Delete,
  Exam_GetAll,
  Exam_GetById,
  Exam_Update,
} from "@/prisma/functions/Exam/ExamFun";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (id) {
    try {
      const exam = await Exam_GetById(id);
      if (!exam) {
        return new Response(JSON.stringify({ error: "Exam not found" }), {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
      return new Response(JSON.stringify(exam), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Exam not found", details: error }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }
  }
  const exams = await Exam_GetAll();
  return new Response(JSON.stringify(exams), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function PUT(request: Request) {
  const body = await request.json();
  // Exam_Update
  const { id, ...data } = body;
  if (!id) {
    return new Response(
      JSON.stringify({ error: "Missing required field: id" }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  try {
    const updatedExam = await Exam_Update({ id, ...data });
    return new Response(JSON.stringify(updatedExam), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error updating exam", details: error }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return new Response(
      JSON.stringify({ error: "Missing required field: id" }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  try {
    const deletedExam = await Exam_Delete(id);
    return new Response(JSON.stringify(deletedExam), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error deleting exam", details: error }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}

