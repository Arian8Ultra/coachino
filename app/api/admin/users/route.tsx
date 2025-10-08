import {
  User_Create,
  User_Delete,
  User_GetAll,
  User_GetById,
  User_Update,
} from "@/prisma/functions/User/UserFun";

export async function GET(request: Request) {
  // get all subscription options from the database of if in the search query there is an id return that
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (id) {
    try {
      const user = await User_GetById(id);
      return new Response(JSON.stringify(user), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "User not found", details: error }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }
  }

  const users = await User_GetAll();

  return new Response(JSON.stringify(users), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  // data: {
  // name: string;
  // password: string;
  // phone: string;
  // }
  const { name, password, phone } = body;
  if (!name || !password || !phone) {
    return new Response(
      JSON.stringify({
        error: "Missing required fields: name, password, phone",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  try {
    const newUser = await User_Create({ name, password, phone });
    return new Response(JSON.stringify(newUser), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error creating user", details: error }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}

export async function PUT(request: Request) {
  const body = await request.json();
  // data: {
  // id: string;
  // name?: string;
  // password?: string;
  // phone?: string;
  // }
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
    const updatedUser = await User_Update(id, data);
    return new Response(JSON.stringify(updatedUser), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error updating user", details: error }),
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
    const deletedUser = await User_Delete(id);
    return new Response(JSON.stringify(deletedUser), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Error deleting user", details: error }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}

