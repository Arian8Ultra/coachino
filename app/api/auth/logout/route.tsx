import { GetUser } from "@/auth/AuthFunctions";
import { prisma } from "@/prisma/prisma";
import { cookies } from "next/headers";


export async function POST() {
    const cookie = await cookies();
    // Clear the token cookie
    const user = GetUser(cookie.get("token")?.value || "");
    if (!user) {
        return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Delete the user session from the database
    await prisma.session.deleteMany({
        where: {
            userId: user.id,
        },
    });

    // Clear the token cookie
    cookie.delete("token");


    // Redirect to the home page
    return Response.json({ message: "Logout successful" }, { status: 200 });
}

