import {
  Subscription_Create,
  Subscription_Delete,
  Subscription_GetAll,
  Subscription_GetById,
  Subscription_Update,
} from "@/prisma/functions/Subscription/SubFun";

export async function GET(request: Request) {
  // return a list of subscription options from the database
  //   if the in the search params there is an id, return that specific subscription option
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (id) {
    try {
      const subscription = await Subscription_GetById(id);
      return new Response(JSON.stringify(subscription), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Subscription not found", details: error }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }
  }

  const subscriptions = await Subscription_GetAll();
  return new Response(JSON.stringify(subscriptions), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function POST(request: Request) {
  // create a new subscription option in the database
  // Subscription_Create
  // data: {
  //     name: string;
  //     id: string;
  //     createdAt: Date;
  //     updatedAt: Date;
  //     description: string | null;
  //     isActive: boolean;
  //     options: $Enums.SubscriptionOptionEnum[];
  //     duration: number;
  //     chatsPerMonth: number;
  //     tasksPerMonth: number;
  //     scenariosPerMonth: number;
  //     price: number;
  //     level: number;
  // }

  const body = await request.json();
  const {
    name,
    description,
    isActive,
    options,
    duration,
    chatsPerMonth,
    tasksPerMonth,
    scenariosPerMonth,
    price,
    level,
  } = body;

  if (
    !name ||
    !options ||
    !duration ||
    !chatsPerMonth ||
    !tasksPerMonth ||
    !scenariosPerMonth ||
    !level
  ) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const newSubscription = await Subscription_Create({
      name,
      description: description || null,
      isActive,
      options,
      duration,
      chatsPerMonth,
      tasksPerMonth,
      scenariosPerMonth,
      price,
      level,
    });
    return new Response(JSON.stringify(newSubscription), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to create subscription",
        details: error,
      }),
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
  // update a subscription option in the database
  const body = await request.json();
  const {
    id,
    name,
    description,
    isActive,
    options,
    duration,
    chatsPerMonth,
    tasksPerMonth,
    scenariosPerMonth,
    price,
    level,
  } = body;

  if (
    !id ||
    !name ||
    !options ||
    !duration ||
    !chatsPerMonth ||
    !tasksPerMonth ||
    !scenariosPerMonth ||
    !price ||
    !level
  ) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const updatedSubscription = await Subscription_Update(id, {
      name,
      description: description || null,
      isActive,
      options,
      duration,
      chatsPerMonth,
      tasksPerMonth,
      scenariosPerMonth,
      price,
      level,
    });
    return new Response(JSON.stringify(updatedSubscription), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to update subscription",
        details: error,
      }),
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
  // delete a subscription option from the database
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return new Response(JSON.stringify({ error: "Missing id parameter" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const deletedSubscription = await Subscription_Delete(id);
    return new Response(JSON.stringify(deletedSubscription), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Failed to delete subscription",
        details: error,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}

